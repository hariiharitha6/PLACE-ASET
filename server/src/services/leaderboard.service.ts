import { getSupabase } from '../config/database';

export class LeaderboardService {
  /**
   * Get practice XP leaderboard across a college.
   */
  static async getPracticeLeaderboard(collegeId: string, options: { page?: number; limit?: number; timeframe?: string; department?: string } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('practice_sessions')
      .select('user_id, users!inner(full_name, department, year, avatar_url)')
      .eq('college_id', collegeId)
      .not('ended_at', 'is', null);

    if (options.timeframe === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('ended_at', today.toISOString());
    } else if (options.timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('ended_at', weekAgo.toISOString());
    } else if (options.timeframe === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('ended_at', monthAgo.toISOString());
    }

    if ((options as any).department) {
      query = query.eq('users.department', (options as any).department);
    }

    const { data: sessions } = await query;

    // Aggregate XP per user
    const userMap: Record<string, {
      userId: string; fullName: string; department: string; year: number;
      avatarUrl: string; totalXP: number; totalSessions: number; totalCorrect: number; totalQuestions: number;
    }> = {};

    for (const s of (sessions || [])) {
      const uid = s.user_id;
      const u = (s as any).users;
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid, fullName: u?.full_name || 'Unknown', department: u?.department || '',
          year: u?.year || 0, avatarUrl: u?.avatar_url || '', totalXP: 0,
          totalSessions: 0, totalCorrect: 0, totalQuestions: 0
        };
      }
      userMap[uid].totalSessions += 1;
    }

    // Get actual XP from user_xp_log
    const userIds = Object.keys(userMap);
    if (userIds.length > 0) {
      let xpQuery = supabase
        .from('user_xp_log')
        .select('user_id, amount')
        .eq('source', 'practice_session')
        .in('user_id', userIds);

      if (options.timeframe === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        xpQuery = xpQuery.gte('created_at', today.toISOString());
      } else if (options.timeframe === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        xpQuery = xpQuery.gte('created_at', weekAgo.toISOString());
      } else if (options.timeframe === 'monthly') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        xpQuery = xpQuery.gte('created_at', monthAgo.toISOString());
      }

      const { data: xpLogs } = await xpQuery;
      for (const log of (xpLogs || [])) {
        if (userMap[log.user_id]) {
          userMap[log.user_id].totalXP += log.amount;
        }
      }
    }

    // Sort by XP descending
    const ranked = Object.values(userMap)
      .sort((a, b) => b.totalXP - a.totalXP)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));

    const total = ranked.length;
    const paginated = ranked.slice(offset, offset + limit);

    return { leaderboard: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get weekly challenge leaderboard for a specific challenge or overall.
   */
  static async getChallengeLeaderboard(collegeId: string, options: { challengeId?: string; page?: number; limit?: number } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('challenge_attempts')
      .select('user_id, score, total_score, time_spent_seconds, submitted_at, users!inner(full_name, department, year, avatar_url), challenges!inner(college_id)')
      .eq('challenges.college_id', collegeId)
      .not('submitted_at', 'is', null);

    if (options.challengeId) {
      query = query.eq('challenge_id', options.challengeId);
    }

    const { data: attempts } = await query;

    // Map: best attempt per user
    const bestMap: Record<string, any> = {};
    for (const a of (attempts || [])) {
      const uid = a.user_id;
      if (!bestMap[uid] || a.score > bestMap[uid].score) {
        bestMap[uid] = a;
      }
    }

    const ranked = Object.values(bestMap)
      .sort((a: any, b: any) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_spent_seconds - b.time_spent_seconds; // tie-break: faster wins
      })
      .map((a: any, idx: number) => ({
        rank: idx + 1,
        userId: a.user_id,
        fullName: a.users?.full_name || 'Unknown',
        department: a.users?.department || '',
        year: a.users?.year || 0,
        avatarUrl: a.users?.avatar_url || '',
        score: a.score,
        totalScore: a.total_score,
        percentage: a.total_score > 0 ? Math.round((a.score / a.total_score) * 100) : 0,
        timeSpent: a.time_spent_seconds,
        submittedAt: a.submitted_at
      }));

    const total = ranked.length;
    const paginated = ranked.slice(offset, offset + limit);

    return { leaderboard: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get contributor leaderboard based on approved community questions.
   */
  static async getContributorLeaderboard(collegeId: string, options: { page?: number; limit?: number } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const { data: contributions } = await supabase
      .from('community_questions')
      .select('user_id, status, users!inner(full_name, department, year, avatar_url)')
      .eq('college_id', collegeId)
      .eq('status', 'approved');

    const userMap: Record<string, { userId: string; fullName: string; department: string; year: number; avatarUrl: string; approvedCount: number }> = {};
    for (const c of (contributions || [])) {
      const uid = c.user_id;
      const u = (c as any).users;
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid, fullName: u?.full_name || 'Unknown', department: u?.department || '',
          year: u?.year || 0, avatarUrl: u?.avatar_url || '', approvedCount: 0
        };
      }
      userMap[uid].approvedCount += 1;
    }

    const ranked = Object.values(userMap)
      .sort((a, b) => b.approvedCount - a.approvedCount)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));

    const total = ranked.length;
    const paginated = ranked.slice(offset, offset + limit);

    return { leaderboard: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
import { GamificationService } from './gamification.service';
export { GamificationService };

