-- ============================================================
-- PLACE@ASET Migration 004: Practice, Companies, Resources,
-- Community, Gamification, Notifications, Logs
-- ============================================================

-- ============================================================
-- Practice Sessions
-- ============================================================
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  difficulty difficulty_level,
  mode VARCHAR(50) DEFAULT 'topic',
  total_questions INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_ps_user ON practice_sessions(user_id);
CREATE INDEX idx_ps_college ON practice_sessions(college_id);
CREATE INDEX idx_ps_category ON practice_sessions(category_id);

-- ============================================================
-- Practice Answers
-- ============================================================
CREATE TABLE practice_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pa_session ON practice_answers(session_id);
CREATE INDEX idx_pa_question ON practice_answers(question_id);

-- ============================================================
-- Companies (Placement Preparation)
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_active ON companies(is_active);

CREATE TABLE company_questions (
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_type VARCHAR(50) DEFAULT 'aptitude',
  PRIMARY KEY (company_id, question_id)
);

CREATE INDEX idx_compq_company ON company_questions(company_id);



-- ============================================================
-- Resources
-- ============================================================

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type resource_type DEFAULT 'notes',
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_college
ON resources(college_id);

CREATE INDEX idx_resources_type
ON resources(type);

CREATE INDEX idx_resources_category
ON resources(category_id);

CREATE INDEX idx_resources_global
ON resources(is_global);

CREATE TRIGGER trigger_resources_updated
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Company Resources
-- ============================================================

CREATE TABLE company_resources (
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, resource_id)
);

CREATE TABLE resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rd_resource ON resource_downloads(resource_id);
CREATE INDEX idx_rd_user ON resource_downloads(user_id);

-- ============================================================
-- Community Questions (Student submissions)
-- ============================================================
CREATE TABLE community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  difficulty difficulty_level DEFAULT 'medium',
  statement TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer VARCHAR(5),
  explanation TEXT,
  image_url TEXT,
  status community_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  merged_into UUID REFERENCES questions(id),
  approved_question_id UUID REFERENCES questions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communityq_college ON community_questions(college_id);
CREATE INDEX idx_communityq_user ON community_questions(user_id);
CREATE INDEX idx_communityq_status ON community_questions(status);

-- ============================================================
-- Community Solutions
-- ============================================================
CREATE TABLE community_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  content TEXT,
  image_url TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communitys_question ON community_solutions(question_id);
CREATE INDEX idx_communitys_user ON community_solutions(user_id);

CREATE TABLE solution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES community_solutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(solution_id, user_id)
);

-- ============================================================
-- Badges & Achievements
-- ============================================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(50),
  criteria JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_ua_user ON user_achievements(user_id);

CREATE TABLE user_xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source VARCHAR(100) NOT NULL,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xplog_user ON user_xp_log(user_id);
CREATE INDEX idx_xplog_created ON user_xp_log(created_at);

-- ============================================================
-- Bookmarks & Recently Viewed
-- ============================================================
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bookmark_type bookmark_type NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bookmark_type, target_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  item_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rv_user ON recently_viewed(user_id);
CREATE INDEX idx_rv_viewed ON recently_viewed(viewed_at DESC);

-- ============================================================
-- Notifications
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notif_college ON notifications(college_id);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_reminders BOOLEAN DEFAULT true,
  challenge_results BOOLEAN DEFAULT true,
  achievement_alerts BOOLEAN DEFAULT true,
  resource_alerts BOOLEAN DEFAULT true,
  community_updates BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- ============================================================
-- Activity & Audit Logs
-- ============================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  college_id UUID REFERENCES colleges(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_college ON activity_logs(college_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_college ON audit_logs(college_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- Seed companies
-- ============================================================
INSERT INTO companies (name, slug, sort_order) VALUES
  ('TCS', 'tcs', 1),
  ('Infosys', 'infosys', 2),
  ('Wipro', 'wipro', 3),
  ('Cognizant', 'cognizant', 4),
  ('Accenture', 'accenture', 5),
  ('Capgemini', 'capgemini', 6),
  ('IBM', 'ibm', 7),
  ('Deloitte', 'deloitte', 8),
  ('EY', 'ey', 9),
  ('KPMG', 'kpmg', 10),
  ('Amazon', 'amazon', 11),
  ('Google', 'google', 12),
  ('Microsoft', 'microsoft', 13);

-- ============================================================
-- Seed badges
-- ============================================================
INSERT INTO badges (name, slug, description, category, criteria, xp_reward, sort_order) VALUES
  ('First Challenge', 'first-challenge', 'Completed your first weekly challenge', 'challenge', '{"challenges_completed": 1}', 50, 1),
  ('Challenge Veteran', 'challenge-veteran', 'Completed 10 weekly challenges', 'challenge', '{"challenges_completed": 10}', 200, 2),
  ('Perfect Score', 'perfect-score', 'Scored 100% in a challenge', 'challenge', '{"perfect_scores": 1}', 100, 3),
  ('Speed Demon', 'speed-demon', 'Finished a challenge in under 50% of allowed time', 'challenge', '{"speed_finish": true}', 75, 4),
  ('Century', 'century', 'Solved 100 practice questions', 'practice', '{"questions_solved": 100}', 100, 5),
  ('Half Millennium', 'half-millennium', 'Solved 500 practice questions', 'practice', '{"questions_solved": 500}', 250, 6),
  ('Topic Master', 'topic-master', 'Achieved 90%+ accuracy in a topic', 'practice', '{"topic_accuracy": 90}', 150, 7),
  ('All-Rounder', 'all-rounder', 'Practiced in all 4 categories', 'practice', '{"categories_practiced": 4}', 100, 8),
  ('Week Warrior', 'week-warrior', '7-day practice streak', 'streak', '{"streak_days": 7}', 75, 9),
  ('Month Master', 'month-master', '30-day practice streak', 'streak', '{"streak_days": 30}', 300, 10),
  ('Century Streak', 'century-streak', '100-day practice streak', 'streak', '{"streak_days": 100}', 500, 11),
  ('First Contribution', 'first-contribution', 'First approved community question', 'contributor', '{"approved_questions": 1}', 50, 12),
  ('Top Contributor', 'top-contributor', '10 approved community questions', 'contributor', '{"approved_questions": 10}', 300, 13),
  ('Resource Explorer', 'resource-explorer', 'Downloaded 10 resources', 'resource', '{"downloads": 10}', 50, 14),
  ('Bookworm', 'bookworm', 'Downloaded 50 resources', 'resource', '{"downloads": 50}', 150, 15);
