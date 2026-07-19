import { getSupabase } from '../config/database';
import logger from '../utils/logger';
import { OCRService } from './ocr.service';

export interface SubmissionData {
  title: string;
  type: 'question' | 'resource';
  department?: string;
  topic?: string;
  difficulty?: string;
  company?: string;
  tags?: string[];
  question_type?: string;
  correct_answer?: string;
  explanation?: string;
  source?: string;
  reference_link?: string;
  file?: {
    name: string;
    path: string;
    type: string;
    size: number;
  };
}

export class CommunityRepoService {
  /**
   * Submits a community upload/resource/question.
   */
  static async submitSubmission(userId: string, collegeId: string, data: SubmissionData) {
    const supabase = getSupabase();

    // 1. Insert into community_submissions
    const { data: sub, error: subErr } = await supabase
      .from('community_submissions')
      .insert({
        user_id: userId,
        college_id: collegeId,
        title: data.title,
        type: data.type,
        department: data.department || null,
        topic: data.topic || null,
        difficulty: data.difficulty || 'medium',
        company: data.company || null,
        tags: data.tags || [],
        question_type: data.question_type || 'mcq',
        correct_answer: data.correct_answer || null,
        explanation: data.explanation || null,
        source: data.source || null,
        reference_link: data.reference_link || null,
        status: 'submitted'
      })
      .select()
      .single();

    if (subErr) {
      logger.error('Failed to create community submission', { error: subErr.message });
      throw new Error(subErr.message);
    }

    let attachment = null;
    // 2. Insert attachment if present
    if (data.file) {
      const { data: att, error: attErr } = await supabase
        .from('submission_attachments')
        .insert({
          submission_id: sub.id,
          file_name: data.file.name,
          file_path: data.file.path,
          file_type: data.file.type,
          file_size: data.file.size
        })
        .select()
        .single();

      if (attErr) {
        logger.error('Failed to attach file metadata', { error: attErr.message });
        throw new Error(attErr.message);
      }
      attachment = att;

      // 3. Trigger OCR Job
      const { data: job, error: jobErr } = await supabase
        .from('ocr_jobs')
        .insert({
          user_id: userId,
          attachment_id: attachment.id,
          status: 'pending'
        })
        .select()
        .single();

      if (jobErr) {
        logger.error('Failed to trigger OCR job', { error: jobErr.message });
      } else {
        // Trigger async execution
        this.processOCRJob(job.id).catch(err => {
          logger.error('OCR processing background job failed', { jobId: job.id, error: err.message });
        });
      }
    } else {
      // Auto-trigger duplicate detection for typed questions
      this.runDuplicateDetection(sub.id).catch(err => {
        logger.error('Duplicate detection failed', { submissionId: sub.id, error: err.message });
      });
    }

    return { submission: sub, attachment };
  }

  /**
   * Processes OCR task asynchronously.
   */
  static async processOCRJob(jobId: string) {
    const supabase = getSupabase();

    // Set to processing
    await supabase.from('ocr_jobs').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', jobId);

    // Fetch job details
    const { data: job } = await supabase.from('ocr_jobs').select('*, submission_attachments(file_path, submission_id)').eq('id', jobId).single();
    if (!job) throw new Error('OCR Job not found');

    try {
      const filePath = (job as any).submission_attachments?.file_path || '';
      const submissionId = (job as any).submission_attachments?.submission_id;

      // Call mock OCR extraction
      const extracted = await OCRService.processImage(filePath);

      // Save OCR Results
      await supabase.from('ocr_results').insert({
        ocr_job_id: jobId,
        raw_text: `Extracted ${extracted.length} questions from ${filePath}`,
        extracted_data: { questions: extracted }
      });

      // Update OCR job status
      await supabase.from('ocr_jobs').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', jobId);

      // Update submission status to 'under_review' or 'ocr_complete'
      await supabase.from('community_submissions').update({ status: 'under_review' }).eq('id', submissionId);

      // Run duplicate checks
      await this.runDuplicateDetection(submissionId);
    } catch (err: any) {
      await supabase.from('ocr_jobs').update({
        status: 'failed',
        error_message: err.message || 'Unknown OCR Error',
        updated_at: new Date().toISOString()
      }).eq('id', jobId);
      throw err;
    }
  }

  /**
   * Duplicate detection check using clean similarity overlap foundation.
   */
  static async runDuplicateDetection(submissionId: string) {
    const supabase = getSupabase();

    const { data: sub } = await supabase.from('community_submissions').select('*').eq('id', submissionId).single();
    if (!sub) return;

    // Fetch official question bank questions
    const { data: questions } = await supabase.from('questions').select('id, statement').limit(100);

    if (!questions || questions.length === 0) return;

    const statement = (sub.title || '') + ' ' + (sub.explanation || '');

    // Similarity checker helper (Jaccard similarity coefficient)
    const getTokens = (txt: string) => new Set(txt.toLowerCase().split(/\W+/).filter(t => t.length > 2));
    const subTokens = getTokens(statement);

    for (const q of questions) {
      const qTokens = getTokens(q.statement || '');
      const intersectCount: string[] = [];
      subTokens.forEach(x => {
        if (qTokens.has(x)) intersectCount.push(x);
      });
      const unionSize = subTokens.size + qTokens.size - intersectCount.length;
      const score = unionSize > 0 ? intersectCount.length / unionSize : 0;

      // If score threshold is met (> 0.25), log duplicate suggestion
      if (score > 0.25) {
        await supabase.from('duplicate_checks').insert({
          submission_id: submissionId,
          similarity_score: Math.round(score * 100) / 100,
          matching_question_id: q.id,
          check_type: 'text',
          review_notes: `Token overlap matching with question ID: ${q.id}`
        });
      }
    }
  }

  /**
   * Withdraws a submission before review.
   */
  static async withdrawSubmission(submissionId: string, userId: string) {
    const supabase = getSupabase();

    const { data: sub } = await supabase.from('community_submissions').select('status').eq('id', submissionId).eq('user_id', userId).single();
    if (!sub) throw new Error('Submission not found');

    if (sub.status === 'approved' || sub.status === 'rejected') {
      throw new Error('Cannot withdraw submission after review');
    }

    const { error } = await supabase
      .from('community_submissions')
      .update({ status: 'archived' })
      .eq('id', submissionId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  /**
   * Admin/Host moderation action.
   */
  static async reviewSubmission(submissionId: string, reviewerId: string, action: 'approve' | 'reject' | 'merge', notes?: string) {
    const supabase = getSupabase();

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      merge: 'merged'
    };

    const targetStatus = statusMap[action];
    if (!targetStatus) throw new Error('Invalid review action');

    // Update status
    const { data: sub, error: updateErr } = await supabase
      .from('community_submissions')
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    // Save to review_history
    await supabase.from('review_history').insert({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      action,
      notes: notes || `Admin performed action: ${action}`
    });

    // If approved, create official question or resource
    if (action === 'approve') {
      if (sub.type === 'question') {
        const { data: officialQ } = await supabase
          .from('questions')
          .insert({
            college_id: sub.college_id,
            created_by: sub.user_id,
            statement: sub.title,
            type: sub.question_type || 'mcq',
            difficulty: sub.difficulty || 'medium',
            explanation: sub.explanation || '',
            source: sub.source || 'community',
            approval_status: 'approved'
          })
          .select()
          .single();

        if (officialQ) {
          // If options exist in metadata, parse them
          const mockOptions = [
            { label: 'A', content: 'Option A', is_correct: sub.correct_answer === 'A' },
            { label: 'B', content: 'Option B', is_correct: sub.correct_answer === 'B' },
            { label: 'C', content: 'Option C', is_correct: sub.correct_answer === 'C' },
            { label: 'D', content: 'Option D', is_correct: sub.correct_answer === 'D' }
          ];
          await supabase.from('question_options').insert(mockOptions.map(o => ({
            question_id: officialQ.id,
            label: o.label,
            content: o.content,
            is_correct: o.is_correct
          })));

          // Link official question id
          await supabase.from('community_submissions').update({ approved_question_id: officialQ.id }).eq('id', submissionId);
        }
      } else if (sub.type === 'resource') {
        // Fetch attachments
        const { data: att } = await supabase.from('submission_attachments').select('*').eq('submission_id', submissionId).maybeSingle();
        if (att) {
          await supabase.from('resources').insert({
            college_id: sub.college_id,
            title: sub.title,
            description: sub.explanation || 'Resource file',
            file_url: att.file_path,
            file_type: att.file_type || 'pdf',
            uploaded_by: sub.user_id,
            status: 'approved'
          });
        }
      }

      // Log XP transaction for the student
      await supabase.from('user_xp_log').insert({
        user_id: sub.user_id,
        amount: sub.type === 'question' ? 25 : 30,
        source: 'community_approved',
        source_id: submissionId,
        description: `Your community ${sub.type} submission was approved!`
      });
    }

    return sub;
  }

  /**
   * Retrieves submissions list for the review dashboard queue.
   */
  static async getReviewQueue(collegeId: string, page = 1, limit = 20) {
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('community_submissions')
      .select('*, users!user_id(full_name, avatar_url)', { count: 'exact' })
      .eq('college_id', collegeId)
      .in('status', ['submitted', 'under_review'])
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      submissions: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Retrieves user submission history.
   */
  static async getUserHistory(userId: string, page = 1, limit = 20) {
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('community_submissions')
      .select('*, submission_attachments(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      history: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Gets duplicates check suggestions.
   */
  static async getDuplicatesList(submissionId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('duplicate_checks')
      .select('*, questions(statement, difficulty)')
      .eq('submission_id', submissionId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}
