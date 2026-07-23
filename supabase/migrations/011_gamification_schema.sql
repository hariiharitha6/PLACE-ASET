-- ============================================================
-- PLACE@ASET Migration 011: Gamification Schema
-- Defines Level Definitions, Achievements, User Achievements progress,
-- and User Badges mapping tables.
-- ============================================================

-- Level Definitions Table
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  reward_title VARCHAR(100),
  reward_description TEXT
);

-- Seed Level Definitions (Levels 1 to 30)
INSERT INTO level_definitions (level, xp_required, reward_title, reward_description) VALUES
  (1, 0, 'Novice Solver', 'Welcome to PLACE@ASET! Begin your placement preparation journey.'),
  (2, 100, 'Apprentice', 'You earned 100 XP. Keep practicing to build confidence.'),
  (3, 250, 'Consistent Learner', 'You earned 250 XP. Consistency is key.'),
  (4, 500, 'Skilled Solver', 'You earned 500 XP. Skill level is rising.'),
  (5, 800, 'Aptitude Ace', 'You earned 800 XP. Level 5 achieved!'),
  (6, 1200, 'Problem Solver', 'You earned 1200 XP. You are getting faster.'),
  (7, 1700, 'Code Explorer', 'You earned 1700 XP. Technical aptitude is improving.'),
  (8, 2300, 'Logic Master', 'You earned 2300 XP. Logical reasoning skills are sharp.'),
  (9, 3000, 'Quant Specialist', 'You earned 3000 XP. Numbers are your friends.'),
  (10, 3800, 'Elite Aptitude', 'You earned 3800 XP. Level 10 Milestone!'),
  (11, 4700, 'Placement Ready', 'You earned 4700 XP. Ready for basic mock tests.'),
  (12, 5700, 'Speed demon', 'You earned 5700 XP. Fast response times in mock tests.'),
  (13, 6800, 'Tech Lead', 'You earned 6800 XP. Highly proficient in coding MCQs.'),
  (14, 8000, 'Logic Wizard', 'You earned 8000 XP. Logical questions are trivial now.'),
  (15, 9300, 'Math Genius', 'You earned 9300 XP. Level 15 Milestone!'),
  (16, 10700, 'ASET Expert', 'You earned 10700 XP. One of the top scorers in your year.'),
  (17, 12200, 'Grandmaster Solver', 'You earned 12200 XP. Solving challenges effortlessly.'),
  (18, 13800, 'Placement Veteran', 'You earned 13800 XP. Companies are starting to notice.'),
  (19, 15500, 'Aptitude Hero', 'You earned 15500 XP. Amazing dedication.'),
  (20, 17300, 'Platform Legend', 'You earned 17300 XP. Level 20 Milestone!'),
  (21, 19200, 'Elite Contributor', 'You earned 19200 XP. Helping others with solutions.'),
  (22, 21200, 'Top Percentile', 'You earned 21200 XP. Top tier ranking.'),
  (23, 23300, 'Interview Ready', 'You earned 23300 XP. Pre-placement mocks are a breeze.'),
  (24, 25500, 'Logic Mastermind', 'You earned 25500 XP. Unstoppable logic reasoning.'),
  (25, 27800, 'Quant Champion', 'You earned 27800 XP. Perfect quantitative score potential.'),
  (26, 30200, 'Technical Wizard', 'You earned 30200 XP. Coding master.'),
  (27, 32700, 'ASET Scholar', 'You earned 32700 XP. Perfect knowledge base.'),
  (28, 35300, 'Aptitude Overlord', 'You earned 35300 XP. Trivializing mock exams.'),
  (29, 38000, 'Ultimate Contributor', 'You earned 38000 XP. Community pillar.'),
  (30, 40800, 'Absolute Champion', 'You earned 40800 XP. Level 30! Ultimate Legend.')
ON CONFLICT (level) DO UPDATE SET
  xp_required = EXCLUDED.xp_required,
  reward_title = EXCLUDED.reward_title,
  reward_description = EXCLUDED.reward_description;

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond')),
  target_type VARCHAR(50) NOT NULL, -- e.g. 'total_xp', 'questions_solved', 'streak_days', 'challenges_solved'
  target_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Achievements
INSERT INTO achievements (name, slug, description, tier, target_type, target_value, xp_reward) VALUES
  ('Bronze XP Milestone', 'xp-bronze', 'Earned a total of 100 XP', 'bronze', 'total_xp', 100, 20),
  ('Silver XP Milestone', 'xp-silver', 'Earned a total of 500 XP', 'silver', 'total_xp', 500, 50),
  ('Gold XP Milestone', 'xp-gold', 'Earned a total of 2000 XP', 'gold', 'total_xp', 2000, 100),
  ('Diamond XP Milestone', 'xp-diamond', 'Earned a total of 10000 XP', 'diamond', 'total_xp', 10000, 250),
  ('Bronze Solver', 'solved-bronze', 'Solved 10 practice questions', 'bronze', 'questions_solved', 10, 10),
  ('Silver Solver', 'solved-silver', 'Solved 100 practice questions', 'silver', 'questions_solved', 100, 50),
  ('Gold Solver', 'solved-gold', 'Solved 500 practice questions', 'gold', 'questions_solved', 500, 150),
  ('Diamond Solver', 'solved-diamond', 'Solved 2000 practice questions', 'diamond', 'questions_solved', 2000, 400),
  ('Bronze Streak', 'streak-bronze', 'Achieved a 3-day practice streak', 'bronze', 'streak_days', 3, 15),
  ('Silver Streak', 'streak-silver', 'Achieved a 7-day practice streak', 'silver', 'streak_days', 7, 30),
  ('Gold Streak', 'streak-gold', 'Achieved a 30-day practice streak', 'gold', 'streak_days', 30, 100),
  ('Diamond Streak', 'streak-diamond', 'Achieved a 100-day practice streak', 'diamond', 'streak_days', 100, 300)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tier = EXCLUDED.tier,
  target_type = EXCLUDED.target_type,
  target_value = EXCLUDED.target_value,
  xp_reward = EXCLUDED.xp_reward;

-- User Achievements Progress / Unlock Table
CREATE TABLE IF NOT EXISTS user_achievement_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress_value INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_uat_user ON user_achievement_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_uat_achievement ON user_achievement_tiers(achievement_id);

-- User Badges Mapping Table (Explicitly linking users to badges table)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_ub_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_ub_badge ON user_badges(badge_id);

-- Enable RLS
ALTER TABLE level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Select Policies
DROP POLICY IF EXISTS "Allow read access to levels for all" ON level_definitions;
CREATE POLICY "Allow read access to levels for all" ON level_definitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow read access to achievements for all" ON achievements;
CREATE POLICY "Allow read access to achievements for all" ON achievements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users read own achievement tiers" ON user_achievement_tiers;
CREATE POLICY "Users read own achievement tiers" ON user_achievement_tiers FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own achievement tiers" ON user_achievement_tiers;
CREATE POLICY "Users manage own achievement tiers" ON user_achievement_tiers FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own badges" ON user_badges;
CREATE POLICY "Users read own badges" ON user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own badges" ON user_badges;
CREATE POLICY "Users manage own badges" ON user_badges FOR ALL TO authenticated USING (auth.uid() = user_id);


-- Grants
GRANT SELECT ON level_definitions TO authenticated;
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT ON user_achievement_tiers TO authenticated;
GRANT SELECT ON user_badges TO authenticated;
