import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export class GamificationService {
  /**
   * Awards XP to a user and logs the transaction.
   * Triggers level calculation and badge/achievement evaluation.
   */
  static async awardXP(userId: string, amount: number, source: string, sourceId?: string, description?: string) {
    const supabase = getSupabase();

    // 1. Log XP transaction
    const { error: logErr } = await supabase
      .from('user_xp_log')
      .insert({
        user_id: userId,
        amount,
        source,
        source_id: sourceId || null,
        description: description || `Awarded ${amount} XP`
      });

    if (logErr) {
      logger.error('Failed to log XP transaction', { error: logErr.message });
      throw new Error(logErr.message);
    }

    // 2. Increment user total_xp and compute level
    const { data: userRow } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single();

    const currentXp = (userRow?.total_xp || 0) + amount;

    // Fetch the correct level from level_definitions
    const { data: levels } = await supabase
      .from('level_definitions')
      .select('*')
      .order('level', { ascending: false });

    let calculatedLevel = 1;
    if (levels) {
      const matched = levels.find(l => currentXp >= l.xp_required);
      if (matched) {
        calculatedLevel = matched.level;
      }
    }

    // Update user row
    await supabase
      .from('users')
      .update({
        total_xp: currentXp,
        level: calculatedLevel
      })
      .eq('id', userId);

    // 3. Evaluate Achievements and Badges
    await this.evaluateBadgesAndAchievements(userId);

    return {
      userId,
      xpAdded: amount,
      totalXp: currentXp,
      level: calculatedLevel
    };
  }

  /**
   * Automatically evaluates badge and achievement progression thresholds.
   */
  static async evaluateBadgesAndAchievements(userId: string) {
    const supabase = getSupabase();

    // 1. Gather all required statistics
    const { data: stats } = await supabase
      .from('practice_statistics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: userRegs } = await supabase
      .from('challenge_registrations')
      .select('completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    const { data: userQuestions } = await supabase
      .from('community_questions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved');

    const { data: userXP } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single();

    const xpTotal = userXP?.total_xp || 0;
    const questionsSolved = stats?.total_questions_solved || 0;
    const streakDays = stats?.current_streak || 0;
    const challengesSolved = userRegs?.length || 0;
    const approvedQuestions = userQuestions?.length || 0;

    // 2. Evaluate Achievements (Bronze, Silver, Gold, Diamond Tiers)
    const { data: achievementList } = await supabase
      .from('achievements')
      .select('*');

    if (achievementList) {
      for (const ach of achievementList) {
        let currentValue = 0;
        if (ach.target_type === 'total_xp') currentValue = xpTotal;
        else if (ach.target_type === 'questions_solved') currentValue = questionsSolved;
        else if (ach.target_type === 'streak_days') currentValue = streakDays;
        else if (ach.target_type === 'challenges_solved') currentValue = challengesSolved;

        const isMet = currentValue >= ach.target_value;

        // Upsert to user_achievement_tiers
        const { data: existingProgress } = await supabase
          .from('user_achievement_tiers')
          .select('id, is_unlocked')
          .eq('user_id', userId)
          .eq('achievement_id', ach.id)
          .maybeSingle();

        const payload: any = {
          user_id: userId,
          achievement_id: ach.id,
          progress_value: currentValue,
          updated_at: new Date().toISOString()
        };

        if (isMet && (!existingProgress || !existingProgress.is_unlocked)) {
          payload.is_unlocked = true;
          payload.unlocked_at = new Date().toISOString();
        }

        if (existingProgress) {
          await supabase
            .from('user_achievement_tiers')
            .update(payload)
            .eq('id', existingProgress.id);
        } else {
          await supabase
            .from('user_achievement_tiers')
            .insert(payload);
        }

        // Award XP if unlocked for the first time
        if (isMet && (!existingProgress || !existingProgress.is_unlocked) && ach.xp_reward > 0) {
          // Log XP transaction silently (prevent infinite loops by ignoring evaluation hook)
          await supabase.from('user_xp_log').insert({
            user_id: userId,
            amount: ach.xp_reward,
            source: 'achievement_unlocked',
            source_id: ach.id,
            description: `Unlocked Achievement: ${ach.name}`
          });
        }
      }
    }

    // 3. Evaluate Badges
    const { data: badgeList } = await supabase
      .from('badges')
      .select('*');

    if (badgeList) {
      for (const badge of badgeList) {
        // Parse criteria
        const criteria = badge.criteria || {};
        let isEligible = false;

        if (criteria.challenges_completed !== undefined) {
          isEligible = challengesSolved >= criteria.challenges_completed;
        } else if (criteria.questions_solved !== undefined) {
          isEligible = questionsSolved >= criteria.questions_solved;
        } else if (criteria.streak_days !== undefined) {
          isEligible = streakDays >= criteria.streak_days;
        } else if (criteria.approved_questions !== undefined) {
          isEligible = approvedQuestions >= criteria.approved_questions;
        } else if (criteria.perfect_scores !== undefined) {
          // Mock or custom count check
          isEligible = challengesSolved >= 1;
        }

        if (isEligible) {
          const { data: hasBadge } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', userId)
            .eq('badge_id', badge.id)
            .maybeSingle();

          if (!hasBadge) {
            await supabase
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: badge.id
              });

            if (badge.xp_reward > 0) {
              await supabase.from('user_xp_log').insert({
                user_id: userId,
                amount: badge.xp_reward,
                source: 'badge_unlocked',
                source_id: badge.id,
                description: `Earned Badge: ${badge.name}`
              });
            }
          }
        }
      }
    }
  }

  /**
   * Fetches achievements list along with user unlocks and progress.
   */
  static async getAchievements(userId: string) {
    const supabase = getSupabase();

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true });

    const { data: progresses } = await supabase
      .from('user_achievement_tiers')
      .select('*')
      .eq('user_id', userId);

    const progressMap: Record<string, any> = {};
    progresses?.forEach(p => {
      progressMap[p.achievement_id] = p;
    });

    const list = (achievements || []).map(ach => {
      const prog = progressMap[ach.id];
      const currentVal = prog?.progress_value || 0;
      const targetVal = ach.target_value || 1;
      const pct = Math.min(100, Math.round((currentVal / targetVal) * 100));

      return {
        id: ach.id,
        name: ach.name,
        slug: ach.slug,
        description: ach.description,
        tier: ach.tier,
        targetType: ach.target_type,
        targetValue: targetVal,
        currentValue: currentVal,
        progressPct: pct,
        isUnlocked: prog?.is_unlocked || false,
        unlockedAt: prog?.unlocked_at || null,
        xpReward: ach.xp_reward
      };
    });

    return list;
  }

  /**
   * Fetches badges list with lock status.
   */
  static async getBadges(userId: string) {
    const supabase = getSupabase();

    const { data: badges } = await supabase
      .from('badges')
      .select('*')
      .order('sort_order', { ascending: true });

    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    const earnedMap: Record<string, string> = {};
    userBadges?.forEach(ub => {
      earnedMap[ub.badge_id] = ub.earned_at;
    });

    const list = (badges || []).map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      category: b.category,
      xpReward: b.xp_reward,
      isEarned: !!earnedMap[b.id],
      earnedAt: earnedMap[b.id] || null
    }));

    return list;
  }

  // Compatibility wrappers
  static async getUserBadges(userId: string) {
    const list = await this.getBadges(userId);
    return list.map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      category: b.category,
      xp_reward: b.xpReward,
      earned: b.isEarned,
      earnedAt: b.earnedAt
    }));
  }

  static async checkAndAwardBadges(userId: string) {
    await this.evaluateBadgesAndAchievements(userId);
    return { newBadges: [], metrics: {} as any };
  }

  static async getXPHistory(userId: string, page = 1, limit = 20) {
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('user_xp_log')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
}
