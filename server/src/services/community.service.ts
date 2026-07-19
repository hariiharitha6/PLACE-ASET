import { getSupabase } from '../config/database';

export class CommunityService {
  /**
   * List community-submitted questions.
   */
  static async listQuestions(collegeId: string, options: {
    page?: number; limit?: number; status?: string; category_id?: string;
  } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('community_questions')
      .select('*, categories(name), users!user_id(full_name, avatar_url)', { count: 'exact' })
      .eq('college_id', collegeId);

    if (options.status) query = query.eq('status', options.status);
    if (options.category_id) query = query.eq('category_id', options.category_id);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return { questions: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  /**
   * Submit a new community question.
   */
  static async submitQuestion(userId: string, collegeId: string, data: {
    statement: string; options: any[]; correct_answer: string;
    explanation?: string; category_id?: string; difficulty?: string; image_url?: string;
  }) {
    const supabase = getSupabase();

    const { data: question, error } = await supabase
      .from('community_questions')
      .insert({
        user_id: userId,
        college_id: collegeId,
        statement: data.statement,
        options: data.options,
        correct_answer: data.correct_answer,
        explanation: data.explanation || '',
        category_id: data.category_id || null,
        difficulty: data.difficulty || 'medium',
        image_url: data.image_url || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return question;
  }

  /**
   * Review a community question (approve/reject). Admin/Host only.
   */
  static async reviewQuestion(questionId: string, reviewerId: string, action: 'approved' | 'rejected', reviewNotes?: string) {
    const supabase = getSupabase();

    const update: Record<string, any> = {
      status: action,
      reviewed_by: reviewerId,
      review_notes: reviewNotes || ''
    };

    const { data, error } = await supabase
      .from('community_questions')
      .update(update)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If approved, create an official question from the community submission
    if (action === 'approved') {
      const { data: officialQ } = await supabase
        .from('questions')
        .insert({
          college_id: data.college_id,
          category_id: data.category_id,
          created_by: data.user_id,
          statement: data.statement,
          type: 'mcq',
          difficulty: data.difficulty,
          explanation: data.explanation,
          image_url: data.image_url,
          source: 'community',
          approval_status: 'approved'
        })
        .select()
        .single();

      if (officialQ) {
        // Insert options
        const opts = (data.options || []).map((o: any, idx: number) => ({
          question_id: officialQ.id,
          label: String.fromCharCode(65 + idx),
          content: o.content || o.text || o,
          is_correct: String(idx) === String(data.correct_answer) || o.label === data.correct_answer
        }));
        await supabase.from('question_options').insert(opts);

        // Link back
        await supabase.from('community_questions').update({ approved_question_id: officialQ.id }).eq('id', questionId);
      }

      // Award XP for contribution
      await supabase.from('user_xp_log').insert({
        user_id: data.user_id,
        amount: 25,
        source: 'community_approved',
        source_id: questionId,
        description: 'Community question approved'
      });
    }

    return data;
  }

  /**
   * List community solutions for a question or challenge.
   */
  static async listSolutions(questionId: string, options: { page?: number; limit?: number } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('community_solutions')
      .select('*, users!user_id(full_name, avatar_url)', { count: 'exact' })
      .eq('question_id', questionId)
      .order('upvotes', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return { solutions: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  /**
   * Submit a solution.
   */
  static async submitSolution(userId: string, data: {
    question_id: string; challenge_id?: string; content: string; image_url?: string;
  }) {
    const supabase = getSupabase();

    const { data: sol, error } = await supabase
      .from('community_solutions')
      .insert({
        user_id: userId,
        question_id: data.question_id,
        challenge_id: data.challenge_id || null,
        content: data.content,
        image_url: data.image_url || null
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return sol;
  }

  /**
   * Vote on a solution.
   */
  static async voteSolution(solutionId: string, userId: string, voteType: 'up' | 'down') {
    const supabase = getSupabase();

    // Check existing vote
    const { data: existing } = await supabase
      .from('solution_votes')
      .select('id, vote_type')
      .eq('solution_id', solutionId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote
        await supabase.from('solution_votes').delete().eq('id', existing.id);
        const field = voteType === 'up' ? 'upvotes' : 'downvotes';
        const { data: sol } = await supabase.from('community_solutions').select(field).eq('id', solutionId).single();
        if (sol) {
          const currentVal = (sol as any)[field] || 0;
          await supabase.from('community_solutions').update({ [field]: Math.max(0, currentVal - 1) }).eq('id', solutionId);
        }
        return { action: 'removed' };
      } else {
        // Change vote
        await supabase.from('solution_votes').update({ vote_type: voteType }).eq('id', existing.id);
        const incField = voteType === 'up' ? 'upvotes' : 'downvotes';
        const decField = voteType === 'up' ? 'downvotes' : 'upvotes';
        const { data: sol } = await supabase.from('community_solutions').select(`${incField}, ${decField}`).eq('id', solutionId).single();
        if (sol) {
          const incVal = (sol as any)[incField] || 0;
          const decVal = (sol as any)[decField] || 0;
          await supabase.from('community_solutions').update({
            [incField]: incVal + 1,
            [decField]: Math.max(0, decVal - 1)
          }).eq('id', solutionId);
        }
        return { action: 'changed' };
      }
    }

    // New vote
    await supabase.from('solution_votes').insert({ solution_id: solutionId, user_id: userId, vote_type: voteType });
    const field = voteType === 'up' ? 'upvotes' : 'downvotes';
    const { data: sol } = await supabase.from('community_solutions').select(field).eq('id', solutionId).single();
    if (sol) {
      const currentVal = (sol as any)[field] || 0;
      await supabase.from('community_solutions').update({ [field]: currentVal + 1 }).eq('id', solutionId);
    }

    return { action: 'voted' };
  }
}
