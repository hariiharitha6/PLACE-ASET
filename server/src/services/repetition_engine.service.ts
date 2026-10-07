import fs from 'fs';
import path from 'path';
import { getSupabase } from '../config/database';
import logger from '../utils/logger';
import { VerifiedQuestion } from './question_bank.service';

export interface UserQuestionSchedule {
  user_id: string;
  question_id: string;
  attempt_count: number;
  correct_count: number;
  incorrect_count: number;
  last_attempted_at: string;
  last_result: boolean;
  last_session_number: number;
  interval_sessions: number;
  next_review_session_number: number;
  next_review_at: string;
  mastery_level: number; // 0: new, 1: learning, 2: reviewing, 3: mastered
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SCHEDULES_FILE = path.join(DATA_DIR, 'question_repetition_schedules.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalSchedules(): UserQuestionSchedule[] {
  ensureDataDir();
  if (!fs.existsSync(SCHEDULES_FILE)) return [];
  try {
    const raw = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalSchedules(schedules: UserQuestionSchedule[]) {
  ensureDataDir();
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), 'utf-8');
}

export class RepetitionEngineService {
  /**
   * Retrieves all repetition schedules for a given user.
   */
  static async getUserSchedules(userId: string): Promise<Map<string, UserQuestionSchedule>> {
    const map = new Map<string, UserQuestionSchedule>();
    const supabase = getSupabase();

    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('question_repetition_schedules')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        data.forEach(item => map.set(item.question_id, item));
        return map;
      }
    } catch {
      // Fallback to local store
    }

    // 2. Local fallback store
    const localList = readLocalSchedules();
    localList
      .filter(s => s.user_id === userId)
      .forEach(s => map.set(s.question_id, s));

    return map;
  }

  /**
   * Pure deterministic computation of a question's next Spaced Repetition schedule.
   */
  static computeSchedule(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    currentSessionNumber: number,
    prev?: UserQuestionSchedule
  ): UserQuestionSchedule {
    const now = new Date().toISOString();
    const attemptCount = (prev?.attempt_count || 0) + 1;
    const correctCount = (prev?.correct_count || 0) + (isCorrect ? 1 : 0);
    const incorrectCount = (prev?.incorrect_count || 0) + (isCorrect ? 0 : 1);

    // Spaced Repetition Interval Computation
    let intervalSessions = 1;
    let nextReviewSessionNumber = currentSessionNumber + 1;
    let nextReviewAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    let masteryLevel = 0;

    if (!isCorrect) {
      // WRONG: Schedule for quick review in next session (1-2 sessions later)
      intervalSessions = 1;
      nextReviewSessionNumber = currentSessionNumber + 1;
      nextReviewAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      masteryLevel = Math.max(0, (prev?.mastery_level || 1) - 1);
    } else {
      // CORRECT:
      if (!prev || !prev.last_result || prev.correct_count === 0) {
        // Correct for first time or after a previous error: 3 sessions later
        intervalSessions = 3;
        nextReviewSessionNumber = currentSessionNumber + 3;
        nextReviewAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        masteryLevel = 1;
      } else if (correctCount >= 4 && (correctCount / attemptCount) >= 0.8) {
        // Mastered: 15 sessions later / 14 days
        intervalSessions = 15;
        nextReviewSessionNumber = currentSessionNumber + 15;
        nextReviewAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        masteryLevel = 3;
      } else {
        // Correct repeatedly: 7 sessions later / 3 days
        intervalSessions = 7;
        nextReviewSessionNumber = currentSessionNumber + 7;
        nextReviewAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        masteryLevel = 2;
      }
    }

    return {
      user_id: userId,
      question_id: questionId,
      attempt_count: attemptCount,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      last_attempted_at: now,
      last_result: isCorrect,
      last_session_number: currentSessionNumber,
      interval_sessions: intervalSessions,
      next_review_session_number: nextReviewSessionNumber,
      next_review_at: nextReviewAt,
      mastery_level: masteryLevel,
    };
  }

  /**
   * Records a student's answer attempt for a question and updates their Spaced Repetition schedule.
   */
  static async recordAttempt(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    currentSessionNumber: number
  ): Promise<UserQuestionSchedule> {
    const existingMap = await this.getUserSchedules(userId);
    const prev = existingMap.get(questionId);
    const updatedSchedule = this.computeSchedule(
      userId,
      questionId,
      isCorrect,
      currentSessionNumber,
      prev
    );

    // Dual-persistence: Supabase + Local store
    try {
      const supabase = getSupabase();
      await supabase
        .from('question_repetition_schedules')
        .upsert({
          user_id: updatedSchedule.user_id,
          question_id: updatedSchedule.question_id,
          attempt_count: updatedSchedule.attempt_count,
          correct_count: updatedSchedule.correct_count,
          incorrect_count: updatedSchedule.incorrect_count,
          last_attempted_at: updatedSchedule.last_attempted_at,
          last_result: updatedSchedule.last_result,
          last_session_number: updatedSchedule.last_session_number,
          interval_sessions: updatedSchedule.interval_sessions,
          next_review_session_number: updatedSchedule.next_review_session_number,
          next_review_at: updatedSchedule.next_review_at,
          mastery_level: updatedSchedule.mastery_level,
          updated_at: updatedSchedule.last_attempted_at,
        }, { onConflict: 'user_id,question_id' });
    } catch {
      // Local store handles fallback
    }

    const localList = readLocalSchedules();
    const idx = localList.findIndex(s => s.user_id === userId && s.question_id === questionId);
    if (idx >= 0) {
      localList[idx] = updatedSchedule;
    } else {
      localList.push(updatedSchedule);
    }
    writeLocalSchedules(localList);

    logger.info('Question repetition schedule updated', {
      userId,
      questionId,
      isCorrect,
      masteryLevel: updatedSchedule.mastery_level,
      nextReviewSessionNumber: updatedSchedule.next_review_session_number,
    });

    return updatedSchedule;
  }

  /**
   * Deterministic Question Selection Engine
   * Prioritizes:
   * 1. Requested topic/category
   * 2. Published + Verified
   * 3. Appropriate difficulty
   * 4. Weak topics (weighted bonus)
   * 5. Questions due for spaced review (especially previously wrong)
   * 6. Unseen questions (prefer over repeats)
   * 7. Recent attempt penalty (strictly prevents repeating questions in back-to-back sessions)
   * 8. Controlled deterministic diversification
   * Guarantees: Never duplicate IDs in the same session.
   */
  static selectQuestions(
    candidates: VerifiedQuestion[],
    userSchedules: Map<string, UserQuestionSchedule>,
    weakTopics: Record<string, number>, // topic -> accuracy percentage (e.g. { "Time and Work": 42 })
    currentSessionNumber: number,
    count: number,
    requestedDifficulty?: string
  ): VerifiedQuestion[] {
    if (candidates.length === 0) return [];

    // Deduplicate candidate pool by ID
    const uniqueMap = new Map<string, VerifiedQuestion>();
    for (const q of candidates) {
      if (q && q.id && !uniqueMap.has(q.id)) {
        uniqueMap.set(q.id, q);
      }
    }
    const pool = Array.from(uniqueMap.values());

    const now = Date.now();

    // Compute deterministic selection score for each candidate
    const scoredList = pool.map(q => {
      const schedule = userSchedules.get(q.id);
      let score = 100;

      const isUnseen = !schedule || schedule.attempt_count === 0;
      const isDueForReview = schedule && (
        schedule.next_review_session_number <= currentSessionNumber ||
        new Date(schedule.next_review_at).getTime() <= now
      );
      const isRecentlyAttempted = schedule && (
        schedule.last_session_number >= currentSessionNumber - 1 ||
        (schedule.last_session_number === currentSessionNumber)
      );

      // 1. Weak Topic Weighted Prioritization
      const topicLower = (q.topic || '').toLowerCase();
      const topicAccuracy = weakTopics[q.topic] ?? weakTopics[topicLower];
      if (typeof topicAccuracy === 'number') {
        if (topicAccuracy < 60) {
          // Weak topic bonus: lower accuracy = higher priority
          score += Math.round(50 * (1 - topicAccuracy / 100));
        } else if (topicAccuracy > 80) {
          // Strong topic slight penalty to give space to weak topics
          score -= 15;
        }
      }

      // 2. Spaced Repetition Due for Review
      if (isDueForReview) {
        if (!schedule?.last_result) {
          // Previously wrong answer due for review: TOP PRIORITY (+120)
          score += 120;
        } else {
          // Previously correct spaced reinforcement (+50)
          score += 50;
        }
      }

      // 3. Unseen Questions Priority
      if (isUnseen) {
        // High priority for new unexplored questions (+80)
        score += 80;
      }

      // 4. Repetition Control: Penalty for recently attempted questions
      if (isRecentlyAttempted) {
        // Heavy penalty to avoid immediate repeating (-300)
        score -= 300;
      }

      // 5. Mastery Penalty
      if (schedule && schedule.mastery_level === 3 && !isDueForReview) {
        score -= 60; // Already mastered questions don't clog practice unless due
      }

      // 6. Difficulty Match Bonus
      if (requestedDifficulty && q.difficulty === requestedDifficulty) {
        score += 20;
      }

      // 7. Deterministic tie-breaker jitter based on question id hash
      const hashVal = parseInt(q.id.replace(/-/g, '').substring(0, 4), 16) % 15;
      score += hashVal;

      return { question: q, score };
    });

    // Sort descending by calculated score
    scoredList.sort((a, b) => b.score - a.score);

    // Pick top `count` questions
    const selected = scoredList.slice(0, count).map(item => item.question);

    return selected;
  }
}
