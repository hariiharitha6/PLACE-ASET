import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export class ChallengesService {
  /**
   * Lists challenges with status filter and pagination.
   */
  static async listChallenges(collegeId: string, role: string, status?: string, page = 1, limit = 10) {
    const supabase = getSupabase();
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('challenges')
      .select('*', { count: 'exact' })
      .eq('college_id', collegeId);

    const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(role);
    if (!isAdminOrHost) {
      // Students can only see published, active, or ended challenges
      query = query.in('status', ['published', 'active', 'ended']);
    } else if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      logger.error('Failed to list challenges', { error: error.message });
      throw new Error(error.message);
    }

    return {
      challenges: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Creates a new challenge.
   */
  static async createChallenge(data: any, userId: string, collegeId: string) {
    const supabase = getSupabase();
    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        college_id: collegeId,
        created_by: userId,
        title: data.title,
        description: data.description,
        status: data.status || 'draft',
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes || 60,
        max_participants: data.max_participants,
        randomize_questions: data.randomize_questions ?? true,
        randomize_options: data.randomize_options ?? true,
        show_results_after: data.show_results_after ?? true,
        allow_review: data.allow_review ?? true,
        negative_marking: data.negative_marking ?? false,
        negative_marks_value: data.negative_marks_value || 0,
        passing_percentage: data.passing_percentage || 0,
        instructions: data.instructions,
        settings: data.settings || {}
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create challenge', { error: error.message });
      throw new Error(error.message);
    }
    return challenge;
  }

  /**
   * Updates an existing challenge.
   */
  static async updateChallenge(id: string, data: any) {
    const supabase = getSupabase();
    const { data: challenge, error } = await supabase
      .from('challenges')
      .update({
        title: data.title,
        description: data.description,
        status: data.status,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes,
        max_participants: data.max_participants,
        randomize_questions: data.randomize_questions,
        randomize_options: data.randomize_options,
        show_results_after: data.show_results_after,
        allow_review: data.allow_review,
        negative_marking: data.negative_marking,
        negative_marks_value: data.negative_marks_value,
        passing_percentage: data.passing_percentage,
        instructions: data.instructions,
        settings: data.settings
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update challenge', { id, error: error.message });
      throw new Error(error.message);
    }
    return challenge;
  }

  /**
   * Deletes a challenge.
   */
  static async deleteChallenge(id: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete challenge', { id, error: error.message });
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Clones a challenge base configurations and links duplicate questions.
   */
  static async cloneChallenge(id: string, userId: string) {
    const supabase = getSupabase();
    
    // Fetch original challenge details
    const { data: original, error: fetchErr } = await supabase
      .from('challenges')
      .select('*, challenge_questions(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !original) {
      throw new Error('Original challenge not found');
    }

    // Insert cloned challenge base
    const cloned = await this.createChallenge({
      ...original,
      title: `${original.title} (Clone)`,
      status: 'draft'
    }, userId, original.college_id);

    // Copy associated questions
    if (original.challenge_questions && original.challenge_questions.length > 0) {
      const clonedQuestions = original.challenge_questions.map((q: any) => ({
        challenge_id: cloned.id,
        question_id: q.question_id,
        sort_order: q.sort_order,
        points: q.points
      }));
      await supabase.from('challenge_questions').insert(clonedQuestions);
    }

    return cloned;
  }

  /**
   * Assigns a list of questions to the challenge.
   */
  static async assignQuestions(challengeId: string, questions: Array<{ question_id: string; sort_order: number; points: number }>) {
    const supabase = getSupabase();
    
    // Clear current mappings
    await supabase.from('challenge_questions').delete().eq('challenge_id', challengeId);

    if (questions && questions.length > 0) {
      const inserts = questions.map(q => ({
        challenge_id: challengeId,
        question_id: q.question_id,
        sort_order: q.sort_order,
        points: q.points || 1
      }));
      const { error } = await supabase.from('challenge_questions').insert(inserts);
      if (error) throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Student starts the challenge: marks start timestamp and loads questions list.
   */
  static async startChallenge(challengeId: string, userId: string) {
    const supabase = getSupabase();
    
    // 1. Fetch challenge details
    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge) throw new Error('Challenge not found');
    if (challenge.status !== 'active') throw new Error('Challenge is not currently active');

    const now = new Date();
    if (now < new Date(challenge.start_time) || now > new Date(challenge.end_time)) {
      throw new Error('Challenge is outside its active schedule window');
    }

    // 2. Fetch or create registration log
    const { data: reg, error: regErr } = await supabase
      .from('challenge_registrations')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (regErr) throw new Error(regErr.message);

    let startedAt = reg?.started_at;

    if (!reg) {
      // First time starting
      const { data: newReg } = await supabase
        .from('challenge_registrations')
        .insert({ challenge_id: challengeId, user_id: userId, started_at: now.toISOString() })
        .select()
        .single();
      startedAt = newReg?.started_at;
    } else if (!reg.started_at) {
      // User registered earlier, but is starting only now
      const { data: updatedReg } = await supabase
        .from('challenge_registrations')
        .update({ started_at: now.toISOString() })
        .eq('id', reg.id)
        .select()
        .single();
      startedAt = updatedReg?.started_at;
    } else if (reg.completed_at) {
      throw new Error('You have already completed and finalized this challenge');
    }

    // 3. Load question items but HIDE correct choices
    const { data: questions, error: qErr } = await supabase
      .from('challenge_questions')
      .select(`
        sort_order,
        points,
        questions!inner (
          id,
          statement,
          type,
          difficulty,
          image_url,
          question_options (id, label, content)
        )
      `)
      .eq('challenge_id', challengeId)
      .order('sort_order', { ascending: true });

    if (qErr) throw new Error(qErr.message);

    // 4. Load previous submissions for resumption
    const { data: submissions } = await supabase
      .from('submissions')
      .select('question_id, selected_option_id')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);

    // Shuffle helper function
    const shuffleArray = (array: any[]): any[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    let finalQuestions = (questions || []).map((q: any) => {
      let opts = q.questions?.question_options || [];
      if (challenge.randomize_options && opts.length > 0) {
        opts = shuffleArray(opts);
      }
      return {
        ...q,
        questions: {
          ...q.questions,
          question_options: opts
        }
      };
    });

    if (challenge.randomize_questions && finalQuestions.length > 0) {
      finalQuestions = shuffleArray(finalQuestions);
    }

    return {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        duration_minutes: challenge.duration_minutes,
        started_at: startedAt,
      },
      questions: finalQuestions,
      submissions: submissions || []
    };
  }

  /**
   * Saves candidate progress during test run. Evaluates option correctness on the server.
   */
  static async saveProgress(
    challengeId: string, 
    userId: string, 
    answers: Array<{ question_id: string; selected_option_id: string; time_spent_seconds?: number }>
  ) {
    const supabase = getSupabase();

    // Verify registration status
    const { data: reg } = await supabase
      .from('challenge_registrations')
      .select('completed_at')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (!reg) throw new Error('Student is not registered for challenge');
    if (reg.completed_at) throw new Error('Attempt is already finalized');

    // Load correct answers for points evaluations
    const { data: challengeQuestions } = await supabase
      .from('challenge_questions')
      .select('question_id, points')
      .eq('challenge_id', challengeId);

    const pointsMap = new Map(challengeQuestions?.map(q => [q.question_id, q.points]) || []);

    for (const ans of answers) {
      if (!pointsMap.has(ans.question_id)) continue; // ignore if question is not in challenge

      // Query if option is correct
      let isCorrect = false;
      if (ans.selected_option_id) {
        const { data: opt } = await supabase
          .from('question_options')
          .select('is_correct')
          .eq('id', ans.selected_option_id)
          .single();
        isCorrect = opt?.is_correct || false;
      }

      const points = pointsMap.get(ans.question_id) || 1;
      const pointsEarned = isCorrect ? points : 0;

      // Upsert submission answer
      await supabase
        .from('submissions')
        .upsert({
          challenge_id: challengeId,
          user_id: userId,
          question_id: ans.question_id,
          selected_option_id: ans.selected_option_id || null,
          is_correct: ans.selected_option_id ? isCorrect : null,
          points_earned: pointsEarned,
          time_spent_seconds: ans.time_spent_seconds || 0
        }, { onConflict: 'challenge_id,user_id,question_id' });
    }

    return { success: true };
  }

  /**
   * Finalizes the attempt: computes score, logs result, and recalculates leaderboards ranks.
   */
  static async finalizeAttempt(challengeId: string, userId: string) {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    // 1. Mark registration as completed
    const { data: reg, error: regErr } = await supabase
      .from('challenge_registrations')
      .update({ completed_at: now })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .select('id, started_at, completed_at, users(college_id)')
      .single();

    if (regErr || !reg) {
      throw new Error(regErr?.message || 'Attempt registration not found');
    }

    const collegeId = (reg as any).users?.college_id;

    // 2. Fetch all student submissions for this challenge
    const { data: subs } = await supabase
      .from('submissions')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);

    // Fetch total challenge questions
    const { data: challengeQuestions } = await supabase
      .from('challenge_questions')
      .select('points')
      .eq('challenge_id', challengeId);

    const totalQuestions = challengeQuestions?.length || 0;
    const maxScore = challengeQuestions?.reduce((acc, curr) => acc + (curr.points || 0), 0) || 0;

    // Calculate score metrics
    const totalScore = subs?.reduce((acc, curr) => acc + (curr.points_earned || 0), 0) || 0;
    const correctCount = subs?.filter(s => s.is_correct === true).length || 0;
    const wrongCount = subs?.filter(s => s.is_correct === false && s.selected_option_id).length || 0;
    const unansweredCount = totalQuestions - (correctCount + wrongCount);
    
    // Time taken calculation
    const started = new Date(reg.started_at);
    const completed = new Date(reg.completed_at);
    const totalTimeSeconds = Math.round((completed.getTime() - started.getTime()) / 1000);

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // 3. Upsert results into leaderboard_entries
    await supabase
      .from('leaderboard_entries')
      .upsert({
        challenge_id: challengeId,
        user_id: userId,
        college_id: collegeId,
        total_score: totalScore,
        total_time_seconds: totalTimeSeconds,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        total_questions: totalQuestions,
        percentage
      }, { onConflict: 'challenge_id,user_id' });

    // 4. Recalculate rankings for this challenge within the college
    const { data: rankingList } = await supabase
      .from('leaderboard_entries')
      .select('id')
      .eq('challenge_id', challengeId)
      .order('total_score', { ascending: false })
      .order('total_time_seconds', { ascending: true });

    if (rankingList && rankingList.length > 0) {
      for (let i = 0; i < rankingList.length; i++) {
        await supabase
          .from('leaderboard_entries')
          .update({ rank: i + 1 })
          .eq('id', rankingList[i].id);
      }
    }

    return {
      score: totalScore,
      correctCount,
      percentage,
      totalTimeSeconds
    };
  }

  /**
   * Logs tab-switches or visibility blur events.
   */
  static async logActivity(challengeId: string, userId: string, eventType: string, details: any = {}) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('anti_cheat_events')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        event_type: eventType,
        details
      });

    if (error) {
      logger.error('Failed to log anti cheat event', { error: error.message });
      throw new Error(error.message);
    }
    return { success: true };
  }

  /**
   * Retrieves results for release.
   */
  static async getResults(challengeId: string, userId: string) {
    const supabase = getSupabase();
    
    // Confirm results visibility release status
    const { data: challenge } = await supabase
      .from('challenges')
      .select('show_results_after, status')
      .eq('id', challengeId)
      .single();

    if (!challenge) throw new Error('Challenge not found');
    if (challenge.status !== 'ended' && !challenge.show_results_after) {
      throw new Error('Leaderboard results have not been released yet.');
    }

    // Load leaderboard ranking entries
    const { data: entries } = await supabase
      .from('leaderboard_entries')
      .select('*, users(full_name, avatar_url, departments(code))')
      .eq('challenge_id', challengeId)
      .order('rank', { ascending: true });

    // Load user personal score details
    const { data: userScore } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .maybeSingle();

    return {
      leaderboard: entries || [],
      personalResult: userScore || null
    };
  }

  /**
   * Discussion board fetch.
   */
  static async getDiscussions(challengeId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('challenge_discussions')
      .select('*, users(full_name, avatar_url)')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Discussion board post comment.
   */
  static async addComment(challengeId: string, userId: string, comment: string, parentId?: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('challenge_discussions')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        comment,
        parent_id: parentId || null
      })
      .select('*, users(full_name, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Fetches challenge parameters by ID.
   */
  static async getChallengeById(id: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Publishes a challenge (sets status to 'published').
   */
  static async publishChallenge(id: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('challenges')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to publish challenge', { id, error: error.message });
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Unpublishes a challenge (reverts status back to 'draft').
   */
  static async unpublishChallenge(id: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('challenges')
      .update({ status: 'draft', published_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to unpublish challenge', { id, error: error.message });
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Archives a challenge (hides from public listing, marks archived_at timestamp).
   */
  static async archiveChallenge(id: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('challenges')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to archive challenge', { id, error: error.message });
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Returns aggregated analytics for a challenge (host/admin view).
   * Includes participation stats, score distribution, and anti-cheat summary.
   */
  static async getChallengeAnalytics(id: string, collegeId: string) {
    const supabase = getSupabase();

    // Challenge basic info
    const { data: challenge, error: cErr } = await supabase
      .from('challenges')
      .select('id, title, status, start_time, end_time, duration_minutes, difficulty, college_id')
      .eq('id', id)
      .single();

    if (cErr || !challenge) throw new Error('Challenge not found');
    if (challenge.college_id !== collegeId) throw new Error('Unauthorized: college mismatch');

    // Participation stats
    const { data: registrations } = await supabase
      .from('challenge_registrations')
      .select('started_at, completed_at')
      .eq('challenge_id', id);

    const totalRegistrations = registrations?.length || 0;
    const totalStarted = registrations?.filter(r => r.started_at).length || 0;
    const totalCompleted = registrations?.filter(r => r.completed_at).length || 0;

    // Leaderboard entries (score distribution)
    const { data: leaderboard } = await supabase
      .from('leaderboard_entries')
      .select('total_score, percentage, total_time_seconds, correct_count, wrong_count, unanswered_count, rank, users(full_name, avatar_url, departments(code))')
      .eq('challenge_id', id)
      .order('rank', { ascending: true });

    // Score distribution buckets (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
    const scoreBuckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    leaderboard?.forEach(entry => {
      const pct = entry.percentage || 0;
      if (pct <= 20) scoreBuckets['0-20']++;
      else if (pct <= 40) scoreBuckets['21-40']++;
      else if (pct <= 60) scoreBuckets['41-60']++;
      else if (pct <= 80) scoreBuckets['61-80']++;
      else scoreBuckets['81-100']++;
    });

    // Per-question analytics
    const { data: questionStats } = await supabase
      .from('challenge_questions')
      .select(`
        question_id,
        points,
        sort_order,
        questions!inner(id, statement, difficulty, type)
      `)
      .eq('challenge_id', id)
      .order('sort_order');

    const questionAnalytics = await Promise.all(
      (questionStats || []).map(async (cq) => {
        const { data: subs } = await supabase
          .from('submissions')
          .select('is_correct, selected_option_id')
          .eq('challenge_id', id)
          .eq('question_id', cq.question_id);

        const total = subs?.length || 0;
        const correct = subs?.filter(s => s.is_correct === true).length || 0;
        const wrong = subs?.filter(s => s.is_correct === false && s.selected_option_id).length || 0;
        const unanswered = subs?.filter(s => !s.selected_option_id).length || 0;
        const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;

        return {
          question_id: cq.question_id,
          sort_order: cq.sort_order,
          points: cq.points,
          statement: (cq.questions as any)?.statement,
          difficulty: (cq.questions as any)?.difficulty,
          type: (cq.questions as any)?.type,
          total_attempts: total,
          correct_count: correct,
          wrong_count: wrong,
          unanswered_count: unanswered,
          correct_rate: correctRate,
        };
      })
    );

    // Anti-cheat summary
    const { data: antiCheatEvents } = await supabase
      .from('anti_cheat_events')
      .select('user_id, event_type, created_at, users(full_name)')
      .eq('challenge_id', id)
      .order('created_at', { ascending: false });

    const antiCheatByUser: Record<string, any> = {};
    antiCheatEvents?.forEach(event => {
      const uid = event.user_id;
      if (!antiCheatByUser[uid]) {
        antiCheatByUser[uid] = {
          user_id: uid,
          full_name: (event.users as any)?.full_name,
          total_events: 0,
          tab_hidden_count: 0,
          window_blur_count: 0,
        };
      }
      antiCheatByUser[uid].total_events++;
      if (event.event_type === 'tab_hidden') antiCheatByUser[uid].tab_hidden_count++;
      if (event.event_type === 'window_blur') antiCheatByUser[uid].window_blur_count++;
    });

    const avgScore = leaderboard?.length
      ? Math.round(leaderboard.reduce((a, b) => a + (b.total_score || 0), 0) / leaderboard.length)
      : 0;

    const avgPercentage = leaderboard?.length
      ? Math.round(leaderboard.reduce((a, b) => a + (b.percentage || 0), 0) / leaderboard.length)
      : 0;

    return {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        status: challenge.status,
        start_time: challenge.start_time,
        end_time: challenge.end_time,
        duration_minutes: challenge.duration_minutes,
        difficulty: challenge.difficulty,
      },
      participation: {
        total_registrations: totalRegistrations,
        total_started: totalStarted,
        total_completed: totalCompleted,
        completion_rate: totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0,
      },
      scores: {
        avg_score: avgScore,
        avg_percentage: avgPercentage,
        max_score: leaderboard?.[0]?.total_score || 0,
        score_distribution: scoreBuckets,
      },
      question_analytics: questionAnalytics,
      anti_cheat_summary: Object.values(antiCheatByUser),
      leaderboard: leaderboard || [],
    };
  }

  /**
   * Fetches challenge questions with correct answers for solution display.
   * Only accessible after challenge has ended.
   */
  static async getChallengeQuestionsWithSolutions(challengeId: string, role: string) {
    const supabase = getSupabase();

    // Verify challenge is ended (solutions only visible after end)
    const { data: challenge } = await supabase
      .from('challenges')
      .select('status, allow_review')
      .eq('id', challengeId)
      .single();

    const isAdminOrHost = ['super_admin', 'college_admin', 'host'].includes(role);
    
    if (!challenge) throw new Error('Challenge not found');
    if (!isAdminOrHost && challenge.status !== 'ended') {
      throw new Error('Solutions are only available after the challenge has ended');
    }
    if (!isAdminOrHost && !challenge.allow_review) {
      throw new Error('Solution review is not enabled for this challenge');
    }

    const { data, error } = await supabase
      .from('challenge_questions')
      .select(`
        sort_order,
        points,
        questions!inner (
          id,
          statement,
          type,
          difficulty,
          explanation,
          image_url,
          question_options (id, label, content, is_correct)
        )
      `)
      .eq('challenge_id', challengeId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
