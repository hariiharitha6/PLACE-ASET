import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export class DashboardService {
  /**
   * Generates a complete summary of data needed for the student dashboard.
   * @param userId The ID of the authenticated user
   * @param collegeId The college ID the user belongs to
   */
  static async getSummary(userId: string, collegeId: string) {
    const supabase = getSupabase();

    // 1. Fetch user profile & calculate rank within college
    const { data: userProfile, error: profileErr } = await supabase
      .from('users')
      .select('xp, level, current_streak, longest_streak, roll_number')
      .eq('id', userId)
      .single();

    if (profileErr || !userProfile) {
      logger.error('Failed to fetch user profile for dashboard summary', { userId, error: profileErr?.message });
      throw new Error(profileErr?.message || 'User profile not found');
    }

    const xp = userProfile.xp || 0;

    // Count how many users in the same college have more XP to determine college rank
    const { count: higherXpCount, error: rankErr } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('college_id', collegeId)
      .gt('xp', xp);

    const rank = rankErr ? 0 : (higherXpCount || 0) + 1;

    // 2. Fetch the current active challenge (if any) in the college
    const now = new Date().toISOString();
    const { data: activeChallenge } = await supabase
      .from('challenges')
      .select('id, title, start_time, end_time, duration_minutes')
      .eq('college_id', collegeId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    // If active challenge exists, check if user is registered for it
    let activeChallengeRegistration = null;
    if (activeChallenge) {
      const { data: reg } = await supabase
        .from('challenge_registrations')
        .select('registered_at, started_at, completed_at')
        .eq('challenge_id', activeChallenge.id)
        .eq('user_id', userId)
        .maybeSingle();
      activeChallengeRegistration = reg;
    }

    // 3. Fetch practice arena stats (sessions, total answers, etc.)
    const { data: practiceSessions } = await supabase
      .from('practice_sessions')
      .select('id, score, is_completed')
      .eq('user_id', userId);

    const practiceCompleted = practiceSessions?.filter(s => s.is_completed).length || 0;
    const totalPracticeXP = practiceSessions?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;

    // 4. Fetch upcoming challenges/events (published but not yet started)
    const { data: upcomingEvents } = await supabase
      .from('challenges')
      .select('id, title, start_time, duration_minutes')
      .eq('college_id', collegeId)
      .eq('status', 'published')
      .gt('start_time', now)
      .order('start_time', { ascending: true })
      .limit(3);

    // 5. Fetch leaderboard preview (Top 5 students in the college by XP)
    const { data: leaderboard } = await supabase
      .from('users')
      .select('id, full_name, xp, level, avatar_url')
      .eq('college_id', collegeId)
      .eq('is_active', true)
      .order('xp', { ascending: false })
      .limit(5);

    // 6. Fetch latest learning resources (college-scoped or global)
    const { data: resources } = await supabase
      .from('resources')
      .select('id, title, type, file_url, created_at')
      .or(`college_id.eq.${collegeId},is_global.eq.true`)
      .order('created_at', { ascending: false })
      .limit(4);

    // 7. Fetch community contributions from candidate
    const { count: contributionCount } = await supabase
      .from('community_questions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      profile: {
        xp,
        level: userProfile.level || 1,
        streak: userProfile.current_streak || 0,
        longestStreak: userProfile.longest_streak || 0,
        rollNumber: userProfile.roll_number || '',
        collegeRank: rank,
      },
      weeklyChallenge: activeChallenge ? {
        ...activeChallenge,
        isRegistered: !!activeChallengeRegistration,
        started: activeChallengeRegistration ? !!activeChallengeRegistration.started_at : false,
        completed: activeChallengeRegistration ? !!activeChallengeRegistration.completed_at : false,
      } : null,
      practiceProgress: {
        totalSessions: practiceSessions?.length || 0,
        completedSessions: practiceCompleted,
        totalScore: totalPracticeXP,
      },
      leaderboardPreview: leaderboard || [],
      upcomingEvents: upcomingEvents || [],
      latestResources: resources || [],
      contributionsCount: contributionCount || 0,
    };
  }

  /**
   * Fetches detailed practice stats and XP logs.
   * @param userId The ID of the authenticated user
   */
  static async getStats(userId: string) {
    const supabase = getSupabase();

    // Fetch the recent XP changes log
    const { data: xpLogs } = await supabase
      .from('user_xp_log')
      .select('amount, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch practice stats details
    const { data: answers } = await supabase
      .from('practice_answers')
      .select('is_correct, practice_sessions!inner(user_id)')
      .eq('practice_sessions.user_id', userId);

    const totalQuestionsAnswered = answers?.length || 0;
    const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
    const accuracy = totalQuestionsAnswered > 0 
      ? Math.round((correctAnswers / totalQuestionsAnswered) * 100) 
      : 0;

    return {
      xpHistory: xpLogs || [],
      totalAnswers: totalQuestionsAnswered,
      accuracy,
      correctAnswers,
    };
  }

  /**
   * Retrieves the candidate's recent activity logs.
   * @param userId The ID of the authenticated user
   */
  static async getActivityLogs(userId: string) {
    const supabase = getSupabase();

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('id, action, target_type, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('Failed to retrieve user activity logs', { userId, error: error.message });
      throw new Error(error.message);
    }

    return logs || [];
  }

  /**
   * Retrieves the candidate's notifications.
   * @param userId The ID of the authenticated user
   */
  static async getNotifications(userId: string) {
    const supabase = getSupabase();

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, action_url, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      logger.error('Failed to retrieve user notifications', { userId, error: error.message });
      throw new Error(error.message);
    }

    return notifications || [];
  }

  /**
   * Marks a specific notification as read.
   */
  static async markNotificationRead(userId: string, notificationId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to mark notification as read', { userId, notificationId, error: error.message });
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Marks all candidate's notifications as read.
   */
  static async markAllNotificationsRead(userId: string) {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      logger.error('Failed to mark all notifications as read', { userId, error: error.message });
      throw new Error(error.message);
    }

    return { success: true };
  }
}
