-- ============================================================
-- PLACE@ASET Database Migration 014: Performance & Optimization
-- Adds safe indexes (Composite, GIN) for slow queries and pagination.
-- ============================================================

-- 1. Composite Indexes for Dashboard & Pagination Queries
-- Queries often filter by college and sort by creation date.
CREATE INDEX IF NOT EXISTS idx_users_college_created ON users(college_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_college_created ON questions(college_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_college_created ON challenges(college_id, created_at DESC);

-- 2. Composite Indexes for Active Filtering
-- Queries filtering active users by role/department
CREATE INDEX IF NOT EXISTS idx_users_active_role ON users(is_active, role);
CREATE INDEX IF NOT EXISTS idx_users_active_college ON users(is_active, college_id);

-- 3. GIN Indexes for Full-Text Search (Question Bank & Community)
-- Optimizes "search by keyword" in question statements
CREATE INDEX IF NOT EXISTS idx_questions_statement_fts 
  ON questions USING GIN (to_tsvector('english', statement));

CREATE INDEX IF NOT EXISTS idx_community_submissions_statement_fts 
  ON community_submissions USING GIN (to_tsvector('english', statement));

-- 4. Practice Arena Optimizations
-- Optimizes looking up historical practice sessions by user sorted by time
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_time 
  ON practice_sessions(user_id, start_time DESC);

-- Optimizes finding answers for a specific session quickly
CREATE INDEX IF NOT EXISTS idx_practice_answers_session_question 
  ON practice_answers(session_id, question_id);

-- 5. Leaderboard Optimizations
-- Optimizes ranking queries sorting by XP/Score within a college
CREATE INDEX IF NOT EXISTS idx_users_college_xp 
  ON users(college_id, xp DESC);

CREATE INDEX IF NOT EXISTS idx_practice_stats_user_score 
  ON practice_statistics(user_id, total_correct_answers DESC);

-- 6. Notifications
-- Optimizes fetching unread notifications for a user
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id) WHERE is_read = false;
