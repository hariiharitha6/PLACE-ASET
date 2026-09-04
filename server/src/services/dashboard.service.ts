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

  /**
   * Generates prioritized "Your Next Step" recommendations based on REAL user data.
   * 
   * Each recommendation contains:
   *   - title: WHAT to do (plain language)
   *   - reason: WHY it matters (based on real metrics)
   *   - ctaText: button label
   *   - ctaHref: link destination
   *   - type: icon hint (profile | practice | weak_topic | challenge | personal | calendar | streak | community)
   *   - priority: numeric (lower = higher priority)
   * 
   * Rules:
   *   - NEVER expose database column names or technical IDs
   *   - NEVER invent or default statistics
   *   - NEVER return more than 3 recommendations
   *   - The first recommendation is the ONE dominant primary action
   */
  static async getNextSteps(userId: string, collegeId: string) {
    const supabase = getSupabase();
    const steps: Array<{
      title: string;
      reason: string;
      ctaText: string;
      ctaHref: string;
      type: string;
      priority: number;
    }> = [];

    try {
      // 1. Check if profile is incomplete
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name, college_id, roll_number, department_id')
        .eq('id', userId)
        .single();

      if (userProfile && (!userProfile.college_id || !userProfile.roll_number || !userProfile.department_id)) {
        steps.push({
          title: 'Complete Your Profile',
          reason: 'Your profile is missing important details like your department or roll number. Completing it helps us personalise your learning experience.',
          ctaText: 'Complete Profile',
          ctaHref: '/profile-setup',
          type: 'profile',
          priority: 1
        });
      }

      // 2. Check for incomplete practice sessions
      const { data: incompleteSessions } = await supabase
        .from('practice_sessions')
        .select('id, mode, created_at')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (incompleteSessions && incompleteSessions.length > 0) {
        steps.push({
          title: 'Continue Your Practice Session',
          reason: 'You have an unfinished practice session. Pick up where you left off to keep your progress going.',
          ctaText: 'Continue Practice',
          ctaHref: `/practice/arena/${incompleteSessions[0].id}`,
          type: 'practice',
          priority: 2
        });
      }

      // 3. Check total practice history
      const { count: totalSessions } = await supabase
        .from('practice_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if ((totalSessions || 0) === 0 && !incompleteSessions?.length) {
        steps.push({
          title: 'Start Your First Practice',
          reason: 'You haven\'t practiced any questions yet. Starting a practice session is the best way to begin your preparation.',
          ctaText: 'Start Practice',
          ctaHref: '/practice',
          type: 'practice',
          priority: 2
        });
      }

      // 4. Check for weak topics (real data from practice_statistics)
      const { data: practiceStats } = await supabase
        .from('practice_statistics')
        .select('weak_topics, topic_accuracy')
        .eq('user_id', userId)
        .maybeSingle();

      if (practiceStats?.weak_topics && Object.keys(practiceStats.weak_topics).length > 0) {
        // Resolve category names for the weakest topic
        const weakEntries = Object.entries(practiceStats.weak_topics as Record<string, number>);
        const sortedWeak = weakEntries.sort(([, a], [, b]) => (a as number) - (b as number));
        const [weakestCatId, weakestAccuracy] = sortedWeak[0];

        // Get category name
        const { data: category } = await supabase
          .from('categories')
          .select('name')
          .eq('id', weakestCatId)
          .maybeSingle();

        const topicName = category?.name || null;
        const accuracyPct = Math.round(weakestAccuracy as number);

        // Only show if we resolved a real topic name
        if (topicName) {
          steps.push({
            title: `Review: ${topicName}`,
            reason: `Your recent accuracy in ${topicName} is ${accuracyPct}%. Practising this topic now will strengthen your weakest area.`,
            ctaText: `Practice ${topicName}`,
            ctaHref: '/practice',
            type: 'weak_topic',
            priority: 3
          });
        }
      }

      // 5. Check for upcoming challenges the user hasn't registered for
      if (collegeId) {
        const now = new Date().toISOString();
        const { data: upcomingChallenges } = await supabase
          .from('challenges')
          .select('id, title, start_time')
          .eq('college_id', collegeId)
          .in('status', ['published', 'active'])
          .gt('start_time', now)
          .order('start_time', { ascending: true })
          .limit(3);

        if (upcomingChallenges && upcomingChallenges.length > 0) {
          // Check user registrations
          const challengeIds = upcomingChallenges.map(c => c.id);
          const { data: regs } = await supabase
            .from('challenge_registrations')
            .select('challenge_id')
            .eq('user_id', userId)
            .in('challenge_id', challengeIds);

          const registeredIds = new Set(regs?.map(r => r.challenge_id) || []);
          const unregistered = upcomingChallenges.find(c => !registeredIds.has(c.id));

          if (unregistered) {
            const startDate = new Date(unregistered.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            steps.push({
              title: `Join: ${unregistered.title}`,
              reason: `This challenge starts on ${startDate}. Register now so you don't miss it.`,
              ctaText: 'View Challenge',
              ctaHref: `/challenges`,
              type: 'challenge',
              priority: 4
            });
          }
        }
      }

      // 6. Check if user has any personal study documents
      const { count: personalDocCount } = await supabase
        .from('personal_documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if ((personalDocCount || 0) === 0) {
        steps.push({
          title: 'Upload Study Material',
          reason: 'Upload your notes or textbook content. Our AI will create summaries, flashcards, and quizzes from your material.',
          ctaText: 'Go to Personal Studio',
          ctaHref: '/personal',
          type: 'personal',
          priority: 6
        });
      }

      // 7. Check for unread notifications
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if ((unreadCount || 0) >= 5) {
        steps.push({
          title: 'Check Your Notifications',
          reason: `You have ${unreadCount} unread notifications. There may be important updates about assignments, events, or results.`,
          ctaText: 'View Notifications',
          ctaHref: '/notifications',
          type: 'notifications',
          priority: 5
        });
      }

      // 8. Streak encouragement (only if user has practiced before)
      if (practiceStats?.topic_accuracy && Object.keys(practiceStats.topic_accuracy as object).length > 0) {
        const { data: userXP } = await supabase
          .from('users')
          .select('current_streak')
          .eq('id', userId)
          .single();

        const streak = userXP?.current_streak || 0;
        if (streak >= 2) {
          steps.push({
            title: `Keep Your ${streak}-Day Streak`,
            reason: `You've been practising for ${streak} days in a row. A short session today will keep your streak alive.`,
            ctaText: 'Quick Practice',
            ctaHref: '/practice',
            type: 'streak',
            priority: 7
          });
        }
      }

      // 9. If user is doing well and nothing urgent, suggest community
      if (steps.length === 0) {
        steps.push({
          title: 'You\'re All Caught Up!',
          reason: 'Great job keeping up with your learning. Try helping others in the community or exploring new topics.',
          ctaText: 'Visit Community',
          ctaHref: '/community',
          type: 'community',
          priority: 10
        });
      }

      // Sort by priority and return max 3
      steps.sort((a, b) => a.priority - b.priority);
      return steps.slice(0, 3);

    } catch (error: any) {
      logger.error('Failed to generate next steps', { userId, error: error.message });
      // Graceful fallback — never crash the dashboard for this
      return [{
        title: 'Start Practising',
        reason: 'Head to the Practice Arena to begin answering questions and tracking your progress.',
        ctaText: 'Go to Practice',
        ctaHref: '/practice',
        type: 'practice',
        priority: 1
      }];
    }
  }
}
