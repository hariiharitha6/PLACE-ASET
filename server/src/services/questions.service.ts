import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export interface QuestionFilterQuery {
  search?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  type?: string;
  department?: string;
  company?: string;
  status?: 'pending' | 'approved' | 'rejected';
  visibility?: 'public' | 'private' | 'college';
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class QuestionsService {
  /**
   * Search and filter questions with pagination.
   */
  static async searchAndFilter(filter: QuestionFilterQuery, collegeId: string, role: string) {
    const supabase = getSupabase();
    const {
      search,
      category,
      difficulty,
      type,
      department,
      company,
      status,
      visibility,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filter;

    const offset = (page - 1) * limit;

    // Start building query
    let query = supabase
      .from('questions')
      .select(`
        *,
        categories!left (id, name, icon),
        question_options (id, label, content, is_correct),
        question_tags!left (tag_id, tags!inner(name)),
        question_departments!left (department_id),
        company_questions!left (company_id)
      `, { count: 'exact' });

    // 1. Role-based RLS enforcement in service level (supplemental to DB policies)
    const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(role);
    if (!isAdminOrHost) {
      // Students/faculty can only view approved questions
      query = query.eq('approval_status', 'approved');
      // Students can view public questions OR questions scoped to their college
      query = query.or(`visibility.eq.public,and(visibility.eq.college,college_id.eq.${collegeId})`);
    } else {
      // Admin filter constraints
      if (status) query = query.eq('approval_status', status);
      if (visibility) query = query.eq('visibility', visibility);
    }

    // Default filters
    query = query.eq('is_archived', false);

    // Apply specific filters
    if (category) query = query.eq('category_id', category);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (type) query = query.eq('type', type);

    if (search) {
      query = query.ilike('statement', `%${search}%`);
    }

    // Filters that require junction checks
    if (department) {
      query = query.eq('question_departments.department_id', department);
    }
    if (company) {
      query = query.eq('company_questions.company_id', company);
    }

    // Execute sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      logger.error('Failed to filter questions from service', { filter, error: error.message });
      throw new Error(error.message);
    }

    return {
      questions: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Creates a new question, inserting options, tags, departments, and companies.
   */
  static async createQuestion(data: any, userId: string, collegeId: string) {
    const supabase = getSupabase();
    const {
      category_id,
      type,
      difficulty,
      statement,
      explanation,
      image_url,
      is_global = false,
      approval_status = 'approved',
      visibility = 'public',
      options = [],
      departments = [],
      companies = [],
      tags = [],
    } = data;

    // 1. Insert question base
    const { data: question, error: questionErr } = await supabase
      .from('questions')
      .insert({
        college_id: collegeId,
        category_id,
        created_by: userId,
        type,
        difficulty,
        statement,
        explanation,
        image_url,
        is_global,
        approval_status,
        visibility,
        version: 1,
      })
      .select()
      .single();

    if (questionErr || !question) {
      logger.error('Failed to create question base entry', { error: questionErr?.message });
      throw new Error(questionErr?.message || 'Could not insert question');
    }

    const questionId = question.id;

    // 2. Insert Options
    if (options && options.length > 0) {
      const optionsToInsert = options.map((opt: any) => ({
        question_id: questionId,
        label: opt.label,
        content: opt.content,
        image_url: opt.image_url,
        is_correct: opt.is_correct || false,
        sort_order: opt.sort_order || 0,
      }));

      const { error: optErr } = await supabase
        .from('question_options')
        .insert(optionsToInsert);

      if (optErr) {
        logger.error('Failed to insert options for question', { questionId, error: optErr.message });
        // Cleanup created question to maintain atomic consistency
        await supabase.from('questions').delete().eq('id', questionId);
        throw new Error(optErr.message);
      }
    }

    // 3. Insert Departments M2M
    if (departments && departments.length > 0) {
      const deptsToInsert = departments.map((deptId: string) => ({
        question_id: questionId,
        department_id: deptId,
      }));
      await supabase.from('question_departments').insert(deptsToInsert);
    }

    // 4. Insert Companies M2M
    if (companies && companies.length > 0) {
      const compsToInsert = companies.map((compId: string) => ({
        question_id: questionId,
        company_id: compId,
      }));
      await supabase.from('company_questions').insert(compsToInsert);
    }

    // 5. Insert Tags (find or create tags first)
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!tag) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName, slug })
            .select('id')
            .single();
          tag = newTag;
        }

        if (tag) {
          await supabase.from('question_tags').insert({
            question_id: questionId,
            tag_id: tag.id,
          });
        }
      }
    }

    return this.getQuestionById(questionId, userId, 'super_admin', collegeId);
  }

  /**
   * Retrieves a question by ID with all loaded options, tags, and relations.
   */
  static async getQuestionById(id: string, userId: string, role: string, collegeId: string) {
    const supabase = getSupabase();

    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        *,
        categories (id, name, icon),
        question_options (*),
        question_tags (tag_id, tags (name)),
        question_departments (department_id),
        company_questions (company_id)
      `)
      .eq('id', id)
      .single();

    if (error || !question) {
      logger.error('Failed to retrieve question details', { id, error: error?.message });
      throw new Error(error?.message || 'Question not found');
    }

    // Validate visibility RLS at service level
    const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(role);
    if (!isAdminOrHost) {
      if (question.approval_status !== 'approved') {
        throw new Error('Unauthorized access to pending question');
      }
      if (question.visibility === 'college' && question.college_id !== collegeId) {
        throw new Error('Question not visible for your college');
      }
      if (question.visibility === 'private' && question.created_by !== userId) {
        throw new Error('Access denied to private question');
      }
    }

    return question;
  }

  /**
   * Updates an existing question. Records the prior state in `question_versions` first.
   */
  static async updateQuestion(id: string, data: any, userId: string) {
    const supabase = getSupabase();

    // 1. Fetch current question and options to log version history
    const current = await this.getQuestionById(id, userId, 'super_admin', '');

    // Log to question_versions
    await supabase.from('question_versions').insert({
      question_id: id,
      version: current.version,
      statement: current.statement,
      options: current.question_options,
      explanation: current.explanation,
      changed_by: userId,
      change_reason: data.change_reason || 'Updated via Question Bank Editor',
    });

    const nextVersion = (current.version || 1) + 1;

    const {
      category_id,
      type,
      difficulty,
      statement,
      explanation,
      image_url,
      is_global,
      approval_status,
      visibility,
      is_archived,
      options,
      departments,
      companies,
      tags,
    } = data;

    // 2. Update core question fields
    const { error: updateErr } = await supabase
      .from('questions')
      .update({
        category_id: category_id !== undefined ? category_id : current.category_id,
        type: type !== undefined ? type : current.type,
        difficulty: difficulty !== undefined ? difficulty : current.difficulty,
        statement: statement !== undefined ? statement : current.statement,
        explanation: explanation !== undefined ? explanation : current.explanation,
        image_url: image_url !== undefined ? image_url : current.image_url,
        is_global: is_global !== undefined ? is_global : current.is_global,
        approval_status: approval_status !== undefined ? approval_status : current.approval_status,
        visibility: visibility !== undefined ? visibility : current.visibility,
        is_archived: is_archived !== undefined ? is_archived : current.is_archived,
        version: nextVersion,
      })
      .eq('id', id);

    if (updateErr) {
      logger.error('Failed to update question details', { id, error: updateErr.message });
      throw new Error(updateErr.message);
    }

    // 3. Update Options if provided
    if (options !== undefined) {
      // Clear current options and insert new ones
      await supabase.from('question_options').delete().eq('question_id', id);
      if (options.length > 0) {
        const newOptions = options.map((opt: any) => ({
          question_id: id,
          label: opt.label,
          content: opt.content,
          image_url: opt.image_url,
          is_correct: opt.is_correct || false,
          sort_order: opt.sort_order || 0,
        }));
        await supabase.from('question_options').insert(newOptions);
      }
    }

    // 4. Update Departments if provided
    if (departments !== undefined) {
      await supabase.from('question_departments').delete().eq('question_id', id);
      if (departments.length > 0) {
        const depts = departments.map((d: string) => ({ question_id: id, department_id: d }));
        await supabase.from('question_departments').insert(depts);
      }
    }

    // 5. Update Companies if provided
    if (companies !== undefined) {
      await supabase.from('company_questions').delete().eq('question_id', id);
      if (companies.length > 0) {
        const comps = companies.map((c: string) => ({ question_id: id, company_id: c }));
        await supabase.from('company_questions').insert(comps);
      }
    }

    // 6. Update Tags if provided
    if (tags !== undefined) {
      await supabase.from('question_tags').delete().eq('question_id', id);
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let { data: tag } = await supabase.from('tags').select('id').eq('slug', slug).maybeSingle();
        if (!tag) {
          const { data: nTag } = await supabase.from('tags').insert({ name: tagName, slug }).select('id').single();
          tag = nTag;
        }
        if (tag) {
          await supabase.from('question_tags').insert({ question_id: id, tag_id: tag.id });
        }
      }
    }

    return this.getQuestionById(id, userId, 'super_admin', '');
  }

  /**
   * Deletes a question completely.
   */
  static async deleteQuestion(id: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete question', { id, error: error.message });
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Archives a question.
   */
  static async archiveQuestion(id: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('questions')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      logger.error('Failed to archive question', { id, error: error.message });
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Restores an archived question.
   */
  static async restoreQuestion(id: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('questions')
      .update({ is_archived: false })
      .eq('id', id);

    if (error) {
      logger.error('Failed to restore question', { id, error: error.message });
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Clones a question and returns the new cloned copy.
   */
  static async cloneQuestion(id: string, userId: string) {
    const current = await this.getQuestionById(id, userId, 'super_admin', '');
    const clonedData = {
      category_id: current.category_id,
      type: current.type,
      difficulty: current.difficulty,
      statement: `${current.statement} (Copy)`,
      explanation: current.explanation,
      image_url: current.image_url,
      is_global: current.is_global,
      approval_status: 'approved',
      visibility: current.visibility,
      options: current.question_options,
      departments: current.question_departments.map((d: any) => d.department_id),
      companies: current.company_questions.map((c: any) => c.company_id),
      tags: current.question_tags.map((t: any) => t.tags.name),
    };

    return this.createQuestion(clonedData, userId, current.college_id);
  }

  /**
   * Retrieves version history entries.
   */
  static async getVersionHistory(questionId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('question_versions')
      .select('*, changed_by_user:users(full_name)')
      .eq('question_id', questionId)
      .order('version', { ascending: false });

    if (error) {
      logger.error('Failed to retrieve versions logs', { questionId, error: error.message });
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Pulls a list of random questions based on filters.
   */
  static async getRandomQuestions(params: { category?: string; difficulty?: string; type?: string; limit: number }, collegeId: string) {
    const supabase = getSupabase();
    const { category, difficulty, type, limit = 5 } = params;

    let query = supabase
      .from('questions')
      .select(`
        *,
        question_options (id, label, content, is_correct)
      `)
      .eq('approval_status', 'approved')
      .eq('is_archived', false)
      .eq('college_id', collegeId);

    if (category) query = query.eq('category_id', category);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to get random questions base list', { error: error.message });
      throw new Error(error.message);
    }

    if (!data || data.length === 0) return [];

    // Shuffle in memory to get random selection
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  /**
   * Computes bank statistics.
   */
  static async getStatistics(collegeId: string) {
    const supabase = getSupabase();

    const { data: allQuestions } = await supabase
      .from('questions')
      .select('type, difficulty, approval_status')
      .eq('college_id', collegeId)
      .eq('is_archived', false);

    const total = allQuestions?.length || 0;
    
    // Compute breakdown counts
    const typeBreakdown: Record<string, number> = {};
    const difficultyBreakdown: Record<string, number> = {};
    const approvalBreakdown: Record<string, number> = {};

    allQuestions?.forEach((q) => {
      typeBreakdown[q.type] = (typeBreakdown[q.type] || 0) + 1;
      difficultyBreakdown[q.difficulty] = (difficultyBreakdown[q.difficulty] || 0) + 1;
      approvalBreakdown[q.approval_status] = (approvalBreakdown[q.approval_status] || 0) + 1;
    });

    return {
      totalQuestions: total,
      types: typeBreakdown,
      difficulties: difficultyBreakdown,
      statuses: approvalBreakdown,
    };
  }
}
