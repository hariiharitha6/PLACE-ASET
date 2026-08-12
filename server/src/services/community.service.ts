import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';
import logger from '../utils/logger';

export class CommunityService {
  /**
   * List community-submitted questions (Question Repository).
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
   * Review a community question (approve/reject).
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
        const opts = (data.options || []).map((o: any, idx: number) => ({
          question_id: officialQ.id,
          label: String.fromCharCode(65 + idx),
          content: o.content || o.text || o,
          is_correct: String(idx) === String(data.correct_answer) || o.label === data.correct_answer
        }));
        await supabase.from('question_options').insert(opts);
        await supabase.from('community_questions').update({ approved_question_id: officialQ.id }).eq('id', questionId);
      }

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
   * List community solutions.
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

    const { data: existing } = await supabase
      .from('solution_votes')
      .select('id, vote_type')
      .eq('solution_id', solutionId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.vote_type === voteType) {
        await supabase.from('solution_votes').delete().eq('id', existing.id);
        const field = voteType === 'up' ? 'upvotes' : 'downvotes';
        const { data: sol } = await supabase.from('community_solutions').select(field).eq('id', solutionId).single();
        if (sol) {
          const currentVal = (sol as any)[field] || 0;
          await supabase.from('community_solutions').update({ [field]: Math.max(0, currentVal - 1) }).eq('id', solutionId);
        }
        return { action: 'removed' };
      } else {
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

    await supabase.from('solution_votes').insert({ solution_id: solutionId, user_id: userId, vote_type: voteType });
    const field = voteType === 'up' ? 'upvotes' : 'downvotes';
    const { data: sol } = await supabase.from('community_solutions').select(field).eq('id', solutionId).single();
    if (sol) {
      const currentVal = (sol as any)[field] || 0;
      await supabase.from('community_solutions').update({ [field]: currentVal + 1 }).eq('id', solutionId);
    }

    return { action: 'voted' };
  }

  // =========================================================================
  // MODULE 4.2 DISCUSSION FORUM & COLLABORATION METHODS
  // =========================================================================

  /**
   * Search & List Community Discussions
   */
  static async listDiscussions(collegeId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    department?: string;
    tag?: string;
    filterType?: 'all' | 'trending' | 'unanswered' | 'solved' | 'pinned';
    userId?: string;
  } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('discussions')
      .select('*, users!user_id(full_name, email, role, avatar_url)', { count: 'exact' });

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    if (options.category && options.category !== 'All') query = query.eq('category', options.category);
    if (options.department && options.department !== 'All') query = query.eq('department', options.department);
    
    if (options.filterType === 'unanswered') {
      query = query.eq('replies_count', 0);
    } else if (options.filterType === 'solved') {
      query = query.eq('is_solved', true);
    } else if (options.filterType === 'pinned') {
      query = query.eq('is_pinned', true);
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
    }

    const sortField = options.filterType === 'trending' ? 'upvotes_count' : 'created_at';
    query = query.order('is_pinned', { ascending: false }).order(sortField, { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      logger.error('Error in listDiscussions', { error: error.message });
      throw new Error(error.message);
    }

    let discussions = data || [];

    if (options.userId && discussions.length > 0) {
      const discIds = discussions.map(d => d.id);
      const { data: bookmarks } = await supabase
        .from('discussion_bookmarks')
        .select('discussion_id')
        .eq('user_id', options.userId)
        .in('discussion_id', discIds);

      const bookmarkedSet = new Set((bookmarks || []).map(b => b.discussion_id));
      discussions = discussions.map(d => ({
        ...d,
        is_bookmarked: bookmarkedSet.has(d.id)
      }));
    }

    return {
      discussions,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get Discussion Detail with Nested Replies Tree
   */
  static async getDiscussionDetail(discussionId: string, userId?: string) {
    const supabase = getSupabase();

    const { data: disc, error } = await supabase
      .from('discussions')
      .select('*, users!user_id(full_name, email, role, avatar_url)')
      .eq('id', discussionId)
      .single();

    if (error || !disc) throw new Error('Discussion not found');

    // Increment view count asynchronously
    await supabase.from('discussions').update({ views_count: (disc.views_count || 0) + 1 }).eq('id', discussionId);

    // Fetch replies
    const { data: replies } = await supabase
      .from('discussion_replies')
      .select('*, users!user_id(full_name, email, role, avatar_url)')
      .eq('discussion_id', discussionId)
      .order('is_accepted_answer', { ascending: false })
      .order('upvotes_count', { ascending: false })
      .order('created_at', { ascending: true });

    let is_bookmarked = false;
    if (userId) {
      const { data: bookmark } = await supabase
        .from('discussion_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('discussion_id', discussionId)
        .maybeSingle();
      is_bookmarked = !!bookmark;
    }

    return {
      ...disc,
      is_bookmarked,
      replies: replies || []
    };
  }

  /**
   * Create a new Discussion with AI duplicate check
   */
  static async createDiscussion(userId: string, collegeId: string, data: {
    title: string;
    content: string;
    category?: string;
    department?: string;
    tags?: string[];
  }) {
    const supabase = getSupabase();

    const { data: disc, error } = await supabase
      .from('discussions')
      .insert({
        user_id: userId,
        college_id: collegeId,
        title: data.title,
        content: data.content,
        category: data.category || 'General',
        department: data.department || 'General',
        tags: data.tags || ['Discussion']
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return disc;
  }

  /**
   * Post a Reply / Nested Reply to a Discussion
   */
  static async createReply(userId: string, discussionId: string, data: {
    content: string;
    parent_reply_id?: string;
    code_snippet?: string;
  }) {
    const supabase = getSupabase();

    const { data: reply, error } = await supabase
      .from('discussion_replies')
      .insert({
        discussion_id: discussionId,
        user_id: userId,
        parent_reply_id: data.parent_reply_id || null,
        content: data.content,
        code_snippet: data.code_snippet || null
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Increment replies_count on discussion
    const { data: disc } = await supabase.from('discussions').select('replies_count').eq('id', discussionId).single();
    if (disc) {
      await supabase.from('discussions').update({ replies_count: (disc.replies_count || 0) + 1 }).eq('id', discussionId);
    }

    return reply;
  }

  /**
   * Mark Reply as Accepted Answer
   */
  static async acceptAnswer(discussionId: string, replyId: string, _userId: string) {
    const supabase = getSupabase();

    const { data: disc } = await supabase.from('discussions').select('user_id').eq('id', discussionId).single();
    if (!disc) throw new Error('Discussion not found');

    // Unmark existing accepted answer if any
    await supabase.from('discussion_replies').update({ is_accepted_answer: false }).eq('discussion_id', discussionId);

    // Mark target reply as accepted answer
    const { data: reply } = await supabase
      .from('discussion_replies')
      .update({ is_accepted_answer: true })
      .eq('id', replyId)
      .select()
      .single();

    // Update discussion solved status
    await supabase.from('discussions').update({ is_solved: true, solved_reply_id: replyId }).eq('id', discussionId);

    // Award XP to reply author for helpful solution
    if (reply) {
      await supabase.from('user_xp_log').insert({
        user_id: reply.user_id,
        amount: 30,
        source: 'community_accepted_answer',
        source_id: replyId,
        description: 'Solution marked as accepted answer'
      });
    }

    return { success: true, accepted_reply_id: replyId };
  }

  /**
   * Upvote / React to a Discussion or Reply
   */
  static async toggleReaction(userId: string, params: { discussionId?: string; replyId?: string; reactionType?: string }) {
    const supabase = getSupabase();

    const reactionType = params.reactionType || 'upvote';

    if (params.discussionId) {
      const { data: existing } = await supabase
        .from('discussion_reactions')
        .select('id')
        .eq('user_id', userId)
        .eq('discussion_id', params.discussionId)
        .maybeSingle();

      if (existing) {
        await supabase.from('discussion_reactions').delete().eq('id', existing.id);
        const { data: d } = await supabase.from('discussions').select('upvotes_count').eq('id', params.discussionId).single();
        if (d) {
          await supabase.from('discussions').update({ upvotes_count: Math.max(0, (d.upvotes_count || 0) - 1) }).eq('id', params.discussionId);
        }
        return { reacted: false };
      } else {
        await supabase.from('discussion_reactions').insert({ user_id: userId, discussion_id: params.discussionId, reaction_type: reactionType });
        const { data: d } = await supabase.from('discussions').select('upvotes_count').eq('id', params.discussionId).single();
        if (d) {
          await supabase.from('discussions').update({ upvotes_count: (d.upvotes_count || 0) + 1 }).eq('id', params.discussionId);
        }
        return { reacted: true };
      }
    } else if (params.replyId) {
      const { data: existing } = await supabase
        .from('discussion_reactions')
        .select('id')
        .eq('user_id', userId)
        .eq('reply_id', params.replyId)
        .maybeSingle();

      if (existing) {
        await supabase.from('discussion_reactions').delete().eq('id', existing.id);
        const { data: r } = await supabase.from('discussion_replies').select('upvotes_count').eq('id', params.replyId).single();
        if (r) {
          await supabase.from('discussion_replies').update({ upvotes_count: Math.max(0, (r.upvotes_count || 0) - 1) }).eq('id', params.replyId);
        }
        return { reacted: false };
      } else {
        await supabase.from('discussion_reactions').insert({ user_id: userId, reply_id: params.replyId, reaction_type: reactionType });
        const { data: r } = await supabase.from('discussion_replies').select('upvotes_count').eq('id', params.replyId).single();
        if (r) {
          await supabase.from('discussion_replies').update({ upvotes_count: (r.upvotes_count || 0) + 1 }).eq('id', params.replyId);
        }
        return { reacted: true };
      }
    }

    throw new Error('Target discussion or reply required');
  }

  /**
   * Bookmark / Unbookmark Discussion
   */
  static async toggleBookmark(userId: string, discussionId: string) {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('discussion_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('discussion_id', discussionId)
      .maybeSingle();

    if (existing) {
      await supabase.from('discussion_bookmarks').delete().eq('id', existing.id);
      return { bookmarked: false };
    } else {
      await supabase.from('discussion_bookmarks').insert({ user_id: userId, discussion_id: discussionId });
      return { bookmarked: true };
    }
  }

  /**
   * Generate AI Suggested Answer / Code Explanation
   */
  static async getAISuggestedAnswer(discussionId: string) {
    const supabase = getSupabase();

    const { data: disc } = await supabase.from('discussions').select('*').eq('id', discussionId).single();
    if (!disc) throw new Error('Discussion not found');

    const promptText = `Provide a comprehensive, clear academic answer and code explanation for the following student discussion post:
Title: "${disc.title}"
Category: "${disc.category || 'General'}"
Content: "${disc.content}"`;

    const aiResult = await AIRouterService.executeTask('explanation', promptText);

    return {
      ai_suggested_answer: aiResult.text,
      provider: aiResult.providerId
    };
  }

  /**
   * Pin / Unpin Discussion (Faculty / Admin only)
   */
  static async togglePin(discussionId: string) {
    const supabase = getSupabase();

    const { data: disc } = await supabase.from('discussions').select('is_pinned').eq('id', discussionId).single();
    if (!disc) throw new Error('Discussion not found');

    const newPinned = !disc.is_pinned;
    await supabase.from('discussions').update({ is_pinned: newPinned }).eq('id', discussionId);

    return { is_pinned: newPinned };
  }

  /**
   * Report Inappropriate Community Content
   */
  static async reportContent(userId: string, data: { discussion_id?: string; reply_id?: string; reason: string }) {
    const supabase = getSupabase();

    const { data: rep, error } = await supabase
      .from('community_reports')
      .insert({
        user_id: userId,
        discussion_id: data.discussion_id || null,
        reply_id: data.reply_id || null,
        reason: data.reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return rep;
  }
}
