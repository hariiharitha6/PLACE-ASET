  -- ============================================================
  -- PLACE@ASET Migration 005: Row Level Security Policies
  -- Multi-tenant isolation using college_id from JWT claims
  -- ============================================================

  -- ============================================================
  -- Helper functions: Extract college_id and user_role from JWT claims in public schema
  -- ============================================================
  CREATE OR REPLACE FUNCTION public.current_college_id()
  RETURNS UUID
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $$
    SELECT COALESCE(
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'college_id',
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb -> 'app_metadata' ->> 'college_id',
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb -> 'user_metadata' ->> 'college_id'
    )::uuid;
  $$;

  CREATE OR REPLACE FUNCTION public.current_user_role()
  RETURNS TEXT
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $$
    SELECT COALESCE(
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'user_role',
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb -> 'app_metadata' ->> 'user_role',
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb -> 'user_metadata' ->> 'user_role',
      (NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'role',
      'student'
    );
  $$;

  GRANT EXECUTE ON FUNCTION public.current_college_id() TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon;

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
  DROP POLICY IF EXISTS "Categories are readable by all" ON categories;
  CREATE POLICY "Categories are readable by all" ON categories
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Tags are readable by all" ON tags;
  CREATE POLICY "Tags are readable by all" ON tags
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Companies are readable by all" ON companies;
  CREATE POLICY "Companies are readable by all" ON companies
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Badges are readable by all" ON badges;
  CREATE POLICY "Badges are readable by all" ON badges
    FOR SELECT TO authenticated USING (true);

  -- ============================================================
  -- Colleges
  -- ============================================================
  DROP POLICY IF EXISTS "Users can read their own college" ON colleges;
  CREATE POLICY "Users can read their own college" ON colleges
    FOR SELECT TO authenticated
    USING (id = public.current_college_id() OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Super admin manages colleges" ON colleges;
  CREATE POLICY "Super admin manages colleges" ON colleges
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'super_admin');

  -- ============================================================
  -- Users — college-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Users can read own college users" ON users;
  CREATE POLICY "Users can read own college users" ON users
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Users can update own profile" ON users;
  CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

  DROP POLICY IF EXISTS "Admins can manage users" ON users;
  CREATE POLICY "Admins can manage users" ON users
    FOR ALL TO authenticated
    USING (
      public.current_user_role() IN ('super_admin', 'college_admin')
      AND (college_id = public.current_college_id() OR public.current_user_role() = 'super_admin')
    );

  -- ============================================================
  -- Questions — college-scoped + global
  -- ============================================================
  DROP POLICY IF EXISTS "Read own college or global questions" ON questions;
  CREATE POLICY "Read own college or global questions" ON questions
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR is_global = true OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Hosts+ create questions" ON questions;
  CREATE POLICY "Hosts+ create questions" ON questions
    FOR INSERT TO authenticated
    WITH CHECK (
      public.current_user_role() IN ('super_admin', 'college_admin', 'host')
      AND college_id = public.current_college_id()
    );

  DROP POLICY IF EXISTS "Hosts+ update questions" ON questions;
  CREATE POLICY "Hosts+ update questions" ON questions
    FOR UPDATE TO authenticated
    USING (
      public.current_user_role() IN ('super_admin', 'college_admin', 'host')
      AND college_id = public.current_college_id()
    );

  DROP POLICY IF EXISTS "Admins delete questions" ON questions;
  CREATE POLICY "Admins delete questions" ON questions
    FOR DELETE TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin'));

  -- Question options follow parent question's access
  DROP POLICY IF EXISTS "Read question options" ON question_options;
  CREATE POLICY "Read question options" ON question_options
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Question tags readable" ON question_tags;
  CREATE POLICY "Question tags readable" ON question_tags
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Question versions readable by hosts" ON question_versions;
  CREATE POLICY "Question versions readable by hosts" ON question_versions
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin', 'host'));

  -- ============================================================
  -- Challenges — college-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Read own college challenges" ON challenges;
  CREATE POLICY "Read own college challenges" ON challenges
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Hosts+ manage challenges" ON challenges;
  CREATE POLICY "Hosts+ manage challenges" ON challenges
    FOR ALL TO authenticated
    USING (
      public.current_user_role() IN ('super_admin', 'college_admin', 'host')
      AND college_id = public.current_college_id()
    );

  DROP POLICY IF EXISTS "Read challenge questions" ON challenge_questions;
  CREATE POLICY "Read challenge questions" ON challenge_questions
    FOR SELECT TO authenticated USING (true);

  -- ============================================================
  -- Registrations & Submissions — user-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Users manage own registrations" ON challenge_registrations;
  CREATE POLICY "Users manage own registrations" ON challenge_registrations
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Admins read registrations" ON challenge_registrations;
  CREATE POLICY "Admins read registrations" ON challenge_registrations
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin', 'host'));

  DROP POLICY IF EXISTS "Users manage own submissions" ON submissions;
  CREATE POLICY "Users manage own submissions" ON submissions
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Admins read submissions" ON submissions;
  CREATE POLICY "Admins read submissions" ON submissions
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin', 'host'));

  -- ============================================================
  -- Leaderboard — college-scoped (readable by all in college)
  -- ============================================================
  DROP POLICY IF EXISTS "Read own college leaderboard" ON leaderboard_entries;
  CREATE POLICY "Read own college leaderboard" ON leaderboard_entries
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR public.current_user_role() = 'super_admin');

  -- ============================================================
  -- Practice — user-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Users manage own practice" ON practice_sessions;
  CREATE POLICY "Users manage own practice" ON practice_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users manage own practice answers" ON practice_answers;
  CREATE POLICY "Users manage own practice answers" ON practice_answers
    FOR ALL TO authenticated USING (true);

  -- ============================================================
  -- Resources — college-scoped + global
  -- ============================================================
  DROP POLICY IF EXISTS "Read own college or global resources" ON resources;
  CREATE POLICY "Read own college or global resources" ON resources
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR is_global = true OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Hosts+ manage resources" ON resources;
  CREATE POLICY "Hosts+ manage resources" ON resources
    FOR ALL TO authenticated
    USING (
      public.current_user_role() IN ('super_admin', 'college_admin', 'host')
      AND college_id = public.current_college_id()
    );

  -- ============================================================
  -- Community — college-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Read own college community questions" ON community_questions;
  CREATE POLICY "Read own college community questions" ON community_questions
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Students submit community questions" ON community_questions;
  CREATE POLICY "Students submit community questions" ON community_questions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() AND college_id = public.current_college_id());

  DROP POLICY IF EXISTS "Community solutions readable" ON community_solutions;
  CREATE POLICY "Community solutions readable" ON community_solutions
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Users manage own solutions" ON community_solutions;
  CREATE POLICY "Users manage own solutions" ON community_solutions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users manage own votes" ON solution_votes;
  CREATE POLICY "Users manage own votes" ON solution_votes
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  -- ============================================================
  -- Gamification — user-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Users read own achievements" ON user_achievements;
  CREATE POLICY "Users read own achievements" ON user_achievements
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'college_admin'));

  DROP POLICY IF EXISTS "Users read own xp log" ON user_xp_log;
  CREATE POLICY "Users read own xp log" ON user_xp_log
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  -- ============================================================
  -- Bookmarks & Recently Viewed — user-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Users manage own bookmarks" ON bookmarks;
  CREATE POLICY "Users manage own bookmarks" ON bookmarks
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users manage own recently viewed" ON recently_viewed;
  CREATE POLICY "Users manage own recently viewed" ON recently_viewed
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  -- ============================================================
  -- Notifications — user-scoped
  -- ============================================================
  DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
  CREATE POLICY "Users read own notifications" ON notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
  CREATE POLICY "Users update own notifications" ON notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users manage own notification preferences" ON notification_preferences;
  CREATE POLICY "Users manage own notification preferences" ON notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

  -- ============================================================
  -- Logs — admin-only
  -- ============================================================
  DROP POLICY IF EXISTS "Admins read activity logs" ON activity_logs;
  CREATE POLICY "Admins read activity logs" ON activity_logs
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin'));

  DROP POLICY IF EXISTS "System writes activity logs" ON activity_logs;
  CREATE POLICY "System writes activity logs" ON activity_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
  CREATE POLICY "Admins read audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin'));

  DROP POLICY IF EXISTS "Anti-cheat readable by hosts" ON anti_cheat_events;
  CREATE POLICY "Anti-cheat readable by hosts" ON anti_cheat_events
    FOR SELECT TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin', 'host'));

  DROP POLICY IF EXISTS "Students log anti-cheat events" ON anti_cheat_events;
  CREATE POLICY "Students log anti-cheat events" ON anti_cheat_events
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

  -- ============================================================
  -- Departments
  -- ============================================================
  DROP POLICY IF EXISTS "Read own college departments" ON departments;
  CREATE POLICY "Read own college departments" ON departments
    FOR SELECT TO authenticated
    USING (college_id = public.current_college_id() OR public.current_user_role() = 'super_admin');

  DROP POLICY IF EXISTS "Admins manage departments" ON departments;
  CREATE POLICY "Admins manage departments" ON departments
    FOR ALL TO authenticated
    USING (public.current_user_role() IN ('super_admin', 'college_admin'));

  -- Resource downloads
  DROP POLICY IF EXISTS "Users manage own downloads" ON resource_downloads;
  CREATE POLICY "Users manage own downloads" ON resource_downloads
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

