-- ============================================================
-- PLACE@ASET Migration 005: Row Level Security Policies
-- Multi-tenant isolation using college_id from JWT claims
-- ============================================================

-- ============================================================
-- Helper function: Extract college_id from JWT
-- ============================================================
CREATE OR REPLACE FUNCTION auth.college_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'college_id')::uuid,
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'college_id')::uuid
  );
$$;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'user_role',
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'user_role',
    'student'
  );
$$;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_cheat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Global tables (readable by all authenticated users)
-- ============================================================
CREATE POLICY "Categories are readable by all" ON categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tags are readable by all" ON tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Companies are readable by all" ON companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Badges are readable by all" ON badges
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Colleges
-- ============================================================
CREATE POLICY "Users can read their own college" ON colleges
  FOR SELECT TO authenticated
  USING (id = auth.college_id() OR auth.user_role() = 'super_admin');

CREATE POLICY "Super admin manages colleges" ON colleges
  FOR ALL TO authenticated
  USING (auth.user_role() = 'super_admin');

-- ============================================================
-- Users — college-scoped
-- ============================================================
CREATE POLICY "Users can read own college users" ON users
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR auth.user_role() = 'super_admin');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated
  USING (
    auth.user_role() IN ('super_admin', 'college_admin')
    AND (college_id = auth.college_id() OR auth.user_role() = 'super_admin')
  );

-- ============================================================
-- Questions — college-scoped + global
-- ============================================================
CREATE POLICY "Read own college or global questions" ON questions
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR is_global = true OR auth.user_role() = 'super_admin');

CREATE POLICY "Hosts+ create questions" ON questions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.user_role() IN ('super_admin', 'college_admin', 'host')
    AND college_id = auth.college_id()
  );

CREATE POLICY "Hosts+ update questions" ON questions
  FOR UPDATE TO authenticated
  USING (
    auth.user_role() IN ('super_admin', 'college_admin', 'host')
    AND college_id = auth.college_id()
  );

CREATE POLICY "Admins delete questions" ON questions
  FOR DELETE TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin'));

-- Question options follow parent question's access
CREATE POLICY "Read question options" ON question_options
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Question tags readable" ON question_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Question versions readable by hosts" ON question_versions
  FOR SELECT TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin', 'host'));

-- ============================================================
-- Challenges — college-scoped
-- ============================================================
CREATE POLICY "Read own college challenges" ON challenges
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR auth.user_role() = 'super_admin');

CREATE POLICY "Hosts+ manage challenges" ON challenges
  FOR ALL TO authenticated
  USING (
    auth.user_role() IN ('super_admin', 'college_admin', 'host')
    AND college_id = auth.college_id()
  );

CREATE POLICY "Read challenge questions" ON challenge_questions
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Registrations & Submissions — user-scoped
-- ============================================================
CREATE POLICY "Users manage own registrations" ON challenge_registrations
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins read registrations" ON challenge_registrations
  FOR SELECT TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin', 'host'));

CREATE POLICY "Users manage own submissions" ON submissions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins read submissions" ON submissions
  FOR SELECT TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin', 'host'));

-- ============================================================
-- Leaderboard — college-scoped (readable by all in college)
-- ============================================================
CREATE POLICY "Read own college leaderboard" ON leaderboard_entries
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR auth.user_role() = 'super_admin');

-- ============================================================
-- Practice — user-scoped
-- ============================================================
CREATE POLICY "Users manage own practice" ON practice_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own practice answers" ON practice_answers
  FOR ALL TO authenticated USING (true);

-- ============================================================
-- Resources — college-scoped + global
-- ============================================================
CREATE POLICY "Read own college or global resources" ON resources
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR is_global = true OR auth.user_role() = 'super_admin');

CREATE POLICY "Hosts+ manage resources" ON resources
  FOR ALL TO authenticated
  USING (
    auth.user_role() IN ('super_admin', 'college_admin', 'host')
    AND college_id = auth.college_id()
  );

-- ============================================================
-- Community — college-scoped
-- ============================================================
CREATE POLICY "Read own college community questions" ON community_questions
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR auth.user_role() = 'super_admin');

CREATE POLICY "Students submit community questions" ON community_questions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND college_id = auth.college_id());

CREATE POLICY "Community solutions readable" ON community_solutions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users manage own solutions" ON community_solutions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own votes" ON solution_votes
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- Gamification — user-scoped
-- ============================================================
CREATE POLICY "Users read own achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.user_role() IN ('super_admin', 'college_admin'));

CREATE POLICY "Users read own xp log" ON user_xp_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- Bookmarks & Recently Viewed — user-scoped
-- ============================================================
CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own recently viewed" ON recently_viewed
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- Notifications — user-scoped
-- ============================================================
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own notification preferences" ON notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- Logs — admin-only
-- ============================================================
CREATE POLICY "Admins read activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin'));

CREATE POLICY "System writes activity logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin'));

CREATE POLICY "Anti-cheat readable by hosts" ON anti_cheat_events
  FOR SELECT TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin', 'host'));

CREATE POLICY "Students log anti-cheat events" ON anti_cheat_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Departments
-- ============================================================
CREATE POLICY "Read own college departments" ON departments
  FOR SELECT TO authenticated
  USING (college_id = auth.college_id() OR auth.user_role() = 'super_admin');

CREATE POLICY "Admins manage departments" ON departments
  FOR ALL TO authenticated
  USING (auth.user_role() IN ('super_admin', 'college_admin'));

-- Resource downloads
CREATE POLICY "Users manage own downloads" ON resource_downloads
  FOR ALL TO authenticated
  USING (user_id = auth.uid());
