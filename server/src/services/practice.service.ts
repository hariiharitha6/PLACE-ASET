import { getSupabase } from '../config/database';
import logger from '../utils/logger';
import { QuestionBankService, VerifiedQuestion } from './question_bank.service';
import { RepetitionEngineService } from './repetition_engine.service';
import { PersonalDocumentService } from './personal_document.service';

export class PracticeService {
  /**
   * Starts a new practice session for a student using the deterministic Selection Engine.
   */
  static async startSession(userId: string, collegeId: string, data: {
    category_id?: string;
    category_slug?: string;
    topic?: string;
    difficulty?: string;
    mode: string;
    questionCount: number;
    department_id?: string;
    company_id?: string;
    tags?: string[];
    question_type?: string;
    solved_status?: 'all' | 'solved' | 'unsolved' | 'incorrect';
    bookmarked_only?: boolean;
    weak_topics_only?: boolean;
    recently_added_only?: boolean;
    source?: 'official' | 'personal' | 'combined';
  }) {
    const supabase = getSupabase();
    const targetSource = data.source || 'official';
    const targetCount = Math.max(1, Math.min(data.questionCount || 10, 50));

    // 1. Create the session record
    const effectiveCollegeId = (collegeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(collegeId))
      ? collegeId
      : '13d4decc-75fd-4138-8145-6a9fcff454ad';

    const { data: session, error: sessionErr } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        college_id: effectiveCollegeId,
        category_id: data.category_id || null,
        difficulty: data.difficulty || null,
        mode: data.mode,
        total_questions: targetCount
      })
      .select()
      .single();

    if (sessionErr) {
      logger.error('Failed to create practice session', { error: sessionErr.message });
      throw new Error(sessionErr.message);
    }

    // 2. Determine student's session sequence number for Spaced Repetition scheduling
    let currentSessionNumber = 1;
    try {
      const { count } = await supabase
        .from('practice_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      currentSessionNumber = Math.max(1, count || 1);
    } catch {
      currentSessionNumber = 1;
    }

    // 3. Load user's weak topics accuracy map from practice statistics
    const weakTopicAccuracies: Record<string, number> = {};
    try {
      const { data: stats } = await supabase
        .from('practice_statistics')
        .select('weak_topics, topic_accuracy')
        .eq('user_id', userId)
        .maybeSingle();

      if (stats?.topic_accuracy && typeof stats.topic_accuracy === 'object') {
        for (const [k, v] of Object.entries(stats.topic_accuracy)) {
          if (typeof v === 'object' && v !== null && (v as any).total > 0) {
            weakTopicAccuracies[k] = Math.round(((v as any).correct / (v as any).total) * 100);
          }
        }
      }
      if (stats?.weak_topics && typeof stats.weak_topics === 'object') {
        for (const [k, v] of Object.entries(stats.weak_topics)) {
          weakTopicAccuracies[k] = typeof v === 'number' ? v : 40;
        }
      }
    } catch {
      // Telemetry lookup is resilient
    }

    // 4. Retrieve user's spaced repetition schedules
    const userSchedules = await RepetitionEngineService.getUserSchedules(userId);

    // 5. Gather candidate questions based on requested source
    const candidates: VerifiedQuestion[] = [];

    // 5A. OFFICIAL VERIFIED SOURCE (Core & Institutional)
    if (targetSource === 'official' || targetSource === 'combined') {
      const officialQuestions = await QuestionBankService.getVerifiedQuestions({
        category_slug: data.category_slug,
        topic: data.topic,
        difficulty: data.difficulty,
        source_type: 'official',
        userId,
      });
      candidates.push(...officialQuestions);
    }

    // 5B. PERSONAL SOURCE (Student's private documents & uploads)
    if (targetSource === 'personal' || targetSource === 'combined') {
      try {
        const userDocs = await PersonalDocumentService.listUserDocuments(userId);
        for (const doc of userDocs) {
          for (const q of (doc.extracted_questions || [])) {
            const deterministicId = QuestionBankService.generateDeterministicUuid(
              `personal-${doc.id}-${q.questionNumber}-${q.statement.substring(0, 30)}`
            );
            candidates.push({
              id: deterministicId,
              category_slug: q.categorySlug || 'personal-learning',
              topic: q.topic || doc.title,
              statement: q.statement,
              explanation: q.explanation || 'Extracted from your uploaded study material.',
              difficulty: (q.difficulty as any) || 'medium',
              type: 'mcq_single',
              source: doc.title,
              source_type: 'PERSONAL',
              verified: false,
              status: 'published',
              approval_status: 'approved',
              normalized_hash: QuestionBankService.computeHash(q.statement),
              quality_score: 85,
              options: (q.options || []).map((opt, idx) => ({
                id: `${deterministicId}-opt-${idx}`,
                label: opt.label,
                content: opt.content,
                is_correct: opt.label.toUpperCase() === (q.correctLetter || '').toUpperCase(),
              })),
              created_at: doc.created_at,
              updated_at: doc.updated_at,
            });
          }
        }
      } catch (docErr: any) {
        logger.warn('Error reading personal questions for practice', { error: docErr.message });
      }
    }

    // 6. Handle user filters (Bookmarks, Weak topics only, Solved status)
    let filteredCandidates = candidates;

    if (data.bookmarked_only) {
      const { data: bms } = await supabase
        .from('bookmarks')
        .select('target_id')
        .eq('user_id', userId)
        .eq('bookmark_type', 'question');
      const bmIds = new Set(bms?.map(b => b.target_id) || []);
      filteredCandidates = filteredCandidates.filter(q => bmIds.has(q.id));
    }

    if (data.weak_topics_only) {
      filteredCandidates = filteredCandidates.filter(q => {
        const acc = weakTopicAccuracies[q.topic] ?? weakTopicAccuracies[q.category_slug];
        return typeof acc === 'number' && acc < 60;
      });
    }

    if (data.solved_status === 'solved') {
      filteredCandidates = filteredCandidates.filter(q => {
        const sch = userSchedules.get(q.id);
        return sch && sch.attempt_count > 0;
      });
    } else if (data.solved_status === 'unsolved') {
      filteredCandidates = filteredCandidates.filter(q => {
        const sch = userSchedules.get(q.id);
        return !sch || sch.attempt_count === 0;
      });
    } else if (data.solved_status === 'incorrect') {
      filteredCandidates = filteredCandidates.filter(q => {
        const sch = userSchedules.get(q.id);
        return sch && sch.last_result === false;
      });
    }

    // If filter produced no questions, fall back to full verified candidate pool
    if (filteredCandidates.length === 0 && candidates.length > 0) {
      filteredCandidates = candidates;
    }

    // 7. Deterministic Selection Engine Execution
    const selected = RepetitionEngineService.selectQuestions(
      filteredCandidates,
      userSchedules,
      weakTopicAccuracies,
      currentSessionNumber,
      targetCount,
      data.difficulty
    );

    // 8. Format questions with options for client practice interface
    const formattedQuestions = selected.map(q => ({
      id: q.id,
      statement: q.statement,
      type: q.type || 'mcq_single',
      difficulty: q.difficulty || 'medium',
      topic: q.topic || 'General Practice',
      source: q.source || 'ASET Question Bank',
      source_type: q.source_type,
      verified: q.verified,
      question_options: q.options.map(opt => ({
        id: opt.id || `${q.id}-${opt.label}`,
        label: opt.label,
        content: opt.content,
      })),
    }));

    return { session, questions: formattedQuestions };
  }

  /**
   * Submits an answer for a practice question and records Spaced Repetition progress.
   */
  static async submitAnswer(sessionId: string, questionId: string, selectedOptionId: string, timeSpent: number) {
    const supabase = getSupabase();

    // Check if the selected option is correct
    let isCorrect = false;
    if (selectedOptionId) {
      // 1. Check in database question_options
      const { data: opt } = await supabase
        .from('question_options')
        .select('is_correct')
        .eq('id', selectedOptionId)
        .maybeSingle();

      if (opt) {
        isCorrect = opt.is_correct || false;
      } else {
        // 2. Check in verified core questions bank
        QuestionBankService.init();
        const coreStats = await QuestionBankService.getVerifiedQuestions({ limit: 1000 });
        for (const q of coreStats) {
          const matchOpt = q.options.find(o => o.id === selectedOptionId || o.label === selectedOptionId);
          if (matchOpt) {
            isCorrect = Boolean(matchOpt.is_correct);
            break;
          }
        }
      }
    }

    // Upsert answer to support resume/overwriting
    const { data: existing } = await supabase
      .from('practice_answers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('practice_answers')
        .update({
          selected_option_id: selectedOptionId || null,
          is_correct: selectedOptionId ? isCorrect : null,
          time_spent_seconds: timeSpent || 0
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('practice_answers')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          selected_option_id: selectedOptionId || null,
          is_correct: selectedOptionId ? isCorrect : null,
          time_spent_seconds: timeSpent || 0
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = inserted;
    }

    // Record into Repetition & Spaced Repetition Engine
    try {
      const { data: session } = await supabase
        .from('practice_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (session?.user_id) {
        const { count: sessionCount } = await supabase
          .from('practice_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user_id);

        await RepetitionEngineService.recordAttempt(
          session.user_id,
          questionId,
          isCorrect,
          sessionCount || 1
        );
      }
    } catch (repErr: any) {
      logger.warn('Failed to record repetition attempt', { error: repErr.message });
    }

    return { answer: result, isCorrect };
  }

  /**
   * Ends a practice session and calculates XP earned.
   */
  static async endSession(sessionId: string, userId: string) {
    const supabase = getSupabase();

    // 1. Get session details to find category and question count
    const { data: session } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (!session) throw new Error('Session not found');

    // 2. Aggregate answer stats
    const { data: answers } = await supabase
      .from('practice_answers')
      .select('is_correct, time_spent_seconds, question_id, questions(category_id, difficulty)')
      .eq('session_id', sessionId);

    const totalAnswered = answers?.length || 0;
    const correctCount = answers?.filter(a => a.is_correct === true).length || 0;
    const skippedCount = Math.max(0, session.total_questions - totalAnswered);

    // XP calculation: 10 per correct, 2 per attempt
    const xpEarned = (correctCount * 10) + (totalAnswered * 2);

    // 3. Update session
    const { error: updateErr } = await supabase
      .from('practice_sessions')
      .update({
        correct_count: correctCount,
        total_questions: session.total_questions,
        xp_earned: xpEarned,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateErr) throw new Error(updateErr.message);

    // 4. Log XP earned
    if (xpEarned > 0) {
      await supabase.from('user_xp_log').insert({
        user_id: userId,
        amount: xpEarned,
        source: 'practice_session',
        source_id: sessionId,
        description: `Practice session: ${correctCount}/${session.total_questions} correct`
      });

      // Update user total_xp
      try {
        await supabase.rpc('increment_user_xp', { user_id_param: userId, xp_amount: xpEarned });
      } catch {
        logger.warn('increment_user_xp RPC not available, skipping XP update on user row');
      }
    }

    // 5. Update practice_statistics (Adaptive foundation)
    await this.updateUserStatistics(userId, answers || [], xpEarned);

    return {
      sessionId,
      totalQuestions: session.total_questions,
      totalAnswered,
      correctCount,
      wrongCount: totalAnswered - correctCount,
      skippedCount,
      accuracy: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
      xpEarned
    };
  }

  /**
   * Helper to update user practice statistics & streaks & weak topics
   */
  private static async updateUserStatistics(userId: string, answers: any[], xpEarned: number) {
    const supabase = getSupabase();

    const { data: stats } = await supabase
      .from('practice_statistics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const totalSolvedInSession = answers.length;
    const totalCorrectInSession = answers.filter(a => a.is_correct === true).length;

    const totalSolved = (stats?.total_questions_solved || 0) + totalSolvedInSession;
    const totalCorrect = (stats?.total_correct_answers || 0) + totalCorrectInSession;
    const totalXP = (stats?.total_xp || 0) + xpEarned;
    const nextLevel = Math.floor(totalXP / 100) + 1;

    // Streak calculation
    let currentStreak = stats?.current_streak || 0;
    let maxStreak = stats?.max_streak || 0;
    const now = new Date();

    if (stats?.last_practice_at) {
      const lastPractice = new Date(stats.last_practice_at);
      const diffTime = Math.abs(now.getTime() - lastPractice.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        // Practiced today or yesterday, keep/increment streak
        if (lastPractice.toDateString() !== now.toDateString()) {
          currentStreak += 1;
        }
      } else {
        // Streak broken
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    // Topic & Difficulty accuracy aggregations
    const topicAccuracy = stats?.topic_accuracy || {};
    const difficultyAccuracy = stats?.difficulty_accuracy || {};
    const averageResponseTimes = stats?.average_response_times || {};
    const masteryScores = stats?.mastery_scores || {};

    answers.forEach(a => {
      const categoryId = a.questions?.category_id || 'unknown';
      const difficulty = a.questions?.difficulty || 'medium';
      const isCorrect = a.is_correct === true;
      const timeSpent = a.time_spent_seconds || 0;

      // Update topic stats
      if (!topicAccuracy[categoryId]) {
        topicAccuracy[categoryId] = { correct: 0, total: 0, total_time: 0, attempt_count: 0 };
      }
      topicAccuracy[categoryId].total += 1;
      topicAccuracy[categoryId].attempt_count += 1;
      topicAccuracy[categoryId].total_time += timeSpent;
      if (isCorrect) topicAccuracy[categoryId].correct += 1;

      // Update difficulty stats
      if (!difficultyAccuracy[difficulty]) {
        difficultyAccuracy[difficulty] = { correct: 0, total: 0 };
      }
      difficultyAccuracy[difficulty].total += 1;
      if (isCorrect) difficultyAccuracy[difficulty].correct += 1;
    });

    // Compute Mastery Scores and average response times
    const weakTopics: Record<string, number> = {};
    Object.keys(topicAccuracy).forEach(catId => {
      const item = topicAccuracy[catId];
      const accuracy = item.total > 0 ? (item.correct / item.total) * 100 : 0;
      averageResponseTimes[catId] = item.total > 0 ? Math.round(item.total_time / item.total) : 0;
      
      // Mastery score: combination of accuracy and question volume (max 100)
      const mastery = Math.min(100, Math.round(accuracy * 0.7 + Math.min(item.total, 50) * 0.6));
      masteryScores[catId] = mastery;

      if (accuracy < 60 && item.total >= 3) {
        weakTopics[catId] = accuracy;
      }
    });

    const payload = {
      user_id: userId,
      total_questions_solved: totalSolved,
      total_correct_answers: totalCorrect,
      current_streak: currentStreak,
      max_streak: maxStreak,
      weak_topics: weakTopics,
      topic_accuracy: topicAccuracy,
      difficulty_accuracy: difficultyAccuracy,
      average_response_times: averageResponseTimes,
      mastery_scores: masteryScores,
      level: nextLevel,
      total_xp: totalXP,
      last_practice_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    if (stats) {
      await supabase
        .from('practice_statistics')
        .update(payload)
        .eq('id', stats.id);
    } else {
      await supabase
        .from('practice_statistics')
        .insert(payload);
    }

    // 6. Suggest recommendations for weak categories
    await this.generatePracticeRecommendations(userId, weakTopics);
  }

  /**
   * Helper to write recommendations to recommendations table
   */
  private static async generatePracticeRecommendations(userId: string, weakTopics: Record<string, number>) {
    const supabase = getSupabase();

    // Clear old recommendations first
    await supabase.from('practice_recommendations').delete().eq('user_id', userId);

    const recs = Object.entries(weakTopics).map(([catId, accuracy]) => ({
      user_id: userId,
      category_id: catId,
      reason: `Accuracy is low (${Math.round(accuracy)}%) in this topic. Practice more questions to improve.`,
      score: 100 - accuracy,
    }));

    if (recs.length > 0) {
      await supabase.from('practice_recommendations').insert(recs);
    }
  }

  /**
   * Gets practice session history for a user.
   */
  static async getSessionHistory(userId: string, page = 1, limit = 10) {
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('practice_sessions')
      .select('*, categories(name)', { count: 'exact' })
      .eq('user_id', userId)
      .not('ended_at', 'is', null)
      .order('ended_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      sessions: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Gets detailed session results with individual answers.
   */
  static async getSessionResults(sessionId: string) {
    const supabase = getSupabase();

    const { data: session } = await supabase
      .from('practice_sessions')
      .select('*, categories(name)')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Session not found');

    const { data: answers } = await supabase
      .from('practice_answers')
      .select('*, questions(id, statement, type, explanation, question_options(id, label, content, is_correct))')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    return { session, answers: answers || [] };
  }

  /**
   * Gets aggregate practice statistics for a user.
   */
  static async getUserStats(userId: string) {
    const supabase = getSupabase();

    const { data: stats } = await supabase
      .from('practice_statistics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!stats) {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalXP: 0,
        accuracy: 0,
        streak: 0,
        level: 1,
        weakAreas: [],
        suggestedNextTopics: []
      };
    }

    // Get category names for topic accuracy (filter to valid UUIDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const catIds = Object.keys(stats.topic_accuracy || {}).filter(id => uuidRegex.test(id));
    let categoryNames: Record<string, string> = {};
    if (catIds.length > 0) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', catIds);
      if (cats) {
        cats.forEach(c => {
          categoryNames[c.id] = c.name;
        });
      }
    }

    // Format topic-wise and difficulty-wise lists
    const topicAnalysis = Object.entries(stats.topic_accuracy || {}).map(([catId, val]: any) => ({
      category_id: catId,
      name: categoryNames[catId] || 'Unknown Topic',
      solved: val.total,
      correct: val.correct,
      accuracy: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
      avg_time: stats.average_response_times?.[catId] || 0,
      mastery: stats.mastery_scores?.[catId] || 0
    }));

    const difficultyAnalysis = Object.entries(stats.difficulty_accuracy || {}).map(([diff, val]: any) => ({
      difficulty: diff,
      solved: val.total,
      correct: val.correct,
      accuracy: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
    }));

    const weakAreas = topicAnalysis.filter(t => t.accuracy < 60);

    // Suggested next topics are categories with low solved counts or low accuracy
    const suggestedNextTopics = topicAnalysis
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return {
      totalSessions: stats.total_questions_solved > 0 ? Math.ceil(stats.total_questions_solved / 10) : 0,
      totalQuestions: stats.total_questions_solved,
      totalCorrect: stats.total_correct_answers,
      totalXP: stats.total_xp,
      accuracy: stats.total_questions_solved > 0 ? Math.round((stats.total_correct_answers / stats.total_questions_solved) * 100) : 0,
      streak: stats.current_streak,
      maxStreak: stats.max_streak,
      level: stats.level,
      topicAnalysis,
      difficultyAnalysis,
      weakAreas,
      suggestedNextTopics
    };
  }

  /**
   * Fetches suggestions/recommendations for a student.
   */
  static async getRecommendations(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('practice_recommendations')
      .select('*, categories(id, name)')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('score', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Toggles question bookmark.
   */
  static async toggleBookmark(userId: string, questionId: string) {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('bookmark_type', 'question')
      .eq('target_id', questionId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id);
      if (error) throw new Error(error.message);
      return { bookmarked: false };
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          bookmark_type: 'question',
          target_id: questionId
        });
      if (error) throw new Error(error.message);
      return { bookmarked: true };
    }
  }

  /**
   * Get all bookmark question IDs for current user.
   */
  static async getBookmarks(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('bookmarks')
      .select('target_id')
      .eq('user_id', userId)
      .eq('bookmark_type', 'question');
    if (error) throw new Error(error.message);
    return data?.map(b => b.target_id) || [];
  }
}
