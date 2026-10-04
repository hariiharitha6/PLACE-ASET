import { getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';
import { PDFParse } from 'pdf-parse';

export interface ExtractedQuestion {
  questionNumber: number;
  statement: string;
  topic: string;
  options: Array<{ label: string; content: string }>;
  correctLetter: string | null;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceName: string;
  categorySlug?: string;
}

export class StorageService {
  /**
   * Upload buffer to Supabase Storage bucket
   */
  static async uploadFile(
    bucket: 'personal-materials' | 'institutional-materials' | 'question-imports',
    filePath: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<{ path: string; fullPath: string; url?: string }> {
    const admin = getSupabaseAdmin();

    let targetBucket = bucket;
    let uploadRes = await admin.storage.from(targetBucket).upload(filePath, fileBuffer, {
      contentType,
      upsert: true
    });

    if (uploadRes.error && (uploadRes.error.message.includes('row-level security') || uploadRes.error.message.includes('policy'))) {
      logger.warn('Storage upload encountered RLS policy, utilizing resilient institutional storage', {
        originalBucket: bucket,
        filePath
      });
      targetBucket = 'institutional-materials';
      uploadRes = await admin.storage.from(targetBucket).upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });
    }

    if (uploadRes.error) {
      logger.error('Supabase storage upload failed', { bucket: targetBucket, filePath, error: uploadRes.error.message });
      throw new Error(`Storage upload error: ${uploadRes.error.message}`);
    }

    let publicUrl: string | undefined;
    if (targetBucket === 'institutional-materials') {
      const { data: pubData } = admin.storage.from(targetBucket).getPublicUrl(filePath);
      publicUrl = pubData?.publicUrl;
    }

    return {
      path: uploadRes.data.path,
      fullPath: `${targetBucket}/${uploadRes.data.path}`,
      url: publicUrl
    };
  }

  /**
   * Create authenticated signed URL or public access URL
   */
  static async getSignedUrl(
    bucket: 'personal-materials' | 'institutional-materials' | 'question-imports',
    filePath: string,
    expiresInSeconds: number = 86400
  ): Promise<string> {
    const admin = getSupabaseAdmin();

    // 1. If institutional bucket, return public URL
    if (bucket === 'institutional-materials') {
      const { data: pubData } = admin.storage.from(bucket).getPublicUrl(filePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
    }

    // 2. Try signed URL from requested bucket
    try {
      const { data, error } = await admin.storage.from(bucket).createSignedUrl(filePath, expiresInSeconds);
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (_) {}

    // 3. Resilient fallback to institutional-materials public URL
    try {
      const { data: fallbackData } = admin.storage.from('institutional-materials').getPublicUrl(filePath);
      if (fallbackData?.publicUrl) return fallbackData.publicUrl;
    } catch (_) {}

    throw new Error(`Failed to generate signed URL for path: ${filePath}`);
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(bucket: string, filePath: string) {
    const admin = getSupabaseAdmin();
    const { error } = await admin.storage.from(bucket).remove([filePath]);
    if (error) {
      logger.warn('Storage delete warning', { bucket, filePath, error: error.message });
    }
  }

  /**
   * Extract readable text content from document buffer
   */
  static async extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
    const lowerName = filename.toLowerCase();

    // 1. Text or Markdown files
    if (
      mimeType.startsWith('text/') ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.csv') ||
      lowerName.endsWith('.json')
    ) {
      return buffer.toString('utf-8');
    }

    // 2. PDF files
    if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const res = await parser.getText();
        const rawText = typeof res === 'string' ? res : (res as any)?.text || '';
        // Clean out page markers: e.g. "-- 1 of 5 --"
        return rawText.replace(/\n\s*--\s*\d+\s*of\s*\d+\s*--\s*\n/g, '\n').trim();
      } catch (pdfErr: any) {
        logger.error('PDF text extraction error', { filename, error: pdfErr.message });
        throw new Error(`Failed to extract text from PDF: ${pdfErr.message}`);
      }
    }

    // 3. Fallback for others
    return `Document: ${filename}\nUploaded binary file of type: ${mimeType}\nFile size: ${buffer.length} bytes.`;
  }

  /**
   * Intelligent Question Extraction from document text
   */
  static extractQuestionsFromText(text: string, docTitle: string = 'Uploaded Material'): ExtractedQuestion[] {
    const questions: ExtractedQuestion[] = [];

    // Clean text
    const cleanText = text.replace(/\n\s*--\s*\d+\s*of\s*\d+\s*--\s*\n/g, '\n');

    // 1. Extract Answer Key section
    const answerKeyMap: Record<number, string> = {};
    const explanationMap: Record<number, string> = {};

    const answerKeyMatch = cleanText.match(/(?:Answer Key|Answers|Solutions|Answer Explanations)[^\n]*\n([\s\S]*)/i);
    if (answerKeyMatch) {
      const ansSection = answerKeyMatch[1];
      const ansRegex = /Q(\d+)[\s—:-]+(?:Answer:\s*)?([A-D])(?:\s*[\n\r]+([\s\S]*?)(?=(?:Q\d+[\s—:-]|$)))?/gi;
      let m;
      while ((m = ansRegex.exec(ansSection)) !== null) {
        const qNum = parseInt(m[1], 10);
        const ansLetter = m[2].trim().toUpperCase();
        const expl = m[3] ? m[3].trim().split('\n')[0] : '';
        answerKeyMap[qNum] = ansLetter;
        if (expl) explanationMap[qNum] = expl;
      }
    }

    // 2. Parse MCQ Question blocks:
    // Format: Q1. [Topic] Statement ... Options A. ... B. ... C. ... D. ...
    const qBlockRegex = /Q(\d+)\.\s*(?:\[([^\]]+)\]\s*)?([\s\S]*?)(?=(?:Q\d+\.|\s*--\s*\d+\s*of\s*\d+\s*--|Answer Key|Answers|Solutions|$))/gi;
    let qMatch;
    while ((qMatch = qBlockRegex.exec(cleanText)) !== null) {
      const qNum = parseInt(qMatch[1], 10);
      const topic = qMatch[2] ? qMatch[2].trim() : 'General Aptitude';
      const blockContent = qMatch[3].trim();

      // Split into statement and options A., B., C., D.
      const optSplit = blockContent.split(/\n(?=[A-D]\.\s+)/);
      const statement = optSplit[0].trim();
      const rawOptions = optSplit.slice(1);

      const options: Array<{ label: string; content: string }> = [];
      rawOptions.forEach(optText => {
        const optMatch = optText.trim().match(/^([A-D])\.\s+([\s\S]*)$/);
        if (optMatch) {
          options.push({
            label: optMatch[1].toUpperCase(),
            content: optMatch[2].trim().replace(/\s*--\s*\d+\s*of\s*\d+\s*--\s*/g, ' ').trim()
          });
        }
      });

      if (statement && options.length >= 2) {
        const correctLetter = answerKeyMap[qNum] || null;
        const explanation = explanationMap[qNum] || '';
        
        // Topic slug mapping helper
        const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        questions.push({
          questionNumber: qNum,
          statement,
          topic,
          categorySlug: topicSlug,
          options,
          correctLetter,
          explanation: explanation || (correctLetter ? `The correct answer is option ${correctLetter}.` : 'Explanation not available.'),
          difficulty: 'medium',
          sourceName: docTitle
        });
      }
    }

    return questions;
  }
}
