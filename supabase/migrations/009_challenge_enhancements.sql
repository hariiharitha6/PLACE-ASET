-- ============================================================
-- PLACE@ASET Migration 009: Challenge Enhancements
-- Adds banner, difficulty, visibility, department targeting,
-- archive support, and anti-cheat summary view
-- ============================================================

-- Add 'archived' status to challenge_status enum if not exists
ALTER TYPE challenge_status ADD VALUE IF NOT EXISTS 'archived';

-- Add additional columns to challenges table
ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'all' CHECK (visibility IN ('all', 'department', 'private')),
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_participants INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_score FLOAT DEFAULT 0;

-- Index for department-scoped challenges
CREATE INDEX IF NOT EXISTS idx_challenges_department ON challenges(department_id);
CREATE INDEX IF NOT EXISTS idx_challenges_visibility ON challenges(visibility);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_archived ON challenges(archived_at) WHERE archived_at IS NULL;

-- ============================================================
-- Challenge Analytics View (host/admin read)
-- ============================================================
CREATE OR REPLACE VIEW challenge_analytics AS
SELECT
  c.id AS challenge_id,
  c.title,
  c.status,
  c.start_time,
  c.end_time,
  c.duration_minutes,
  c.difficulty,
  c.college_id,
  COUNT(DISTINCT cr.user_id) AS total_registrations,
  COUNT(DISTINCT CASE WHEN cr.started_at IS NOT NULL THEN cr.user_id END) AS total_started,
  COUNT(DISTINCT CASE WHEN cr.completed_at IS NOT NULL THEN cr.user_id END) AS total_completed,
  COUNT(DISTINCT cq.question_id) AS total_questions,
  COALESCE(AVG(le.total_score), 0)::FLOAT AS avg_score,
  COALESCE(MAX(le.total_score), 0) AS max_score,
  COALESCE(MIN(le.total_score), 0) AS min_score,
  COALESCE(AVG(le.percentage), 0)::FLOAT AS avg_percentage,
  COUNT(DISTINCT ace.user_id) AS flagged_users_count,
  COUNT(ace.id) AS total_anticheat_events
FROM challenges c
LEFT JOIN challenge_registrations cr ON cr.challenge_id = c.id
LEFT JOIN challenge_questions cq ON cq.challenge_id = c.id
LEFT JOIN leaderboard_entries le ON le.challenge_id = c.id
LEFT JOIN anti_cheat_events ace ON ace.challenge_id = c.id
GROUP BY c.id, c.title, c.status, c.start_time, c.end_time, c.duration_minutes, c.difficulty, c.college_id;

-- ============================================================
-- Question Analytics View (per-question performance in a challenge)
-- ============================================================
CREATE OR REPLACE VIEW challenge_question_analytics AS
SELECT
  cq.challenge_id,
  cq.question_id,
  q.statement,
  q.difficulty,
  q.type,
  cq.points,
  COUNT(s.id) AS total_attempts,
  COUNT(CASE WHEN s.is_correct = true THEN 1 END) AS correct_count,
  COUNT(CASE WHEN s.is_correct = false AND s.selected_option_id IS NOT NULL THEN 1 END) AS wrong_count,
  COUNT(CASE WHEN s.selected_option_id IS NULL THEN 1 END) AS unanswered_count,
  CASE 
    WHEN COUNT(s.id) > 0 
    THEN ROUND(
    (
        COUNT(CASE WHEN s.is_correct = true THEN 1 END)::NUMERIC
        / COUNT(s.id)::NUMERIC
    ) * 100,
    2
)
    ELSE 0 
  END AS correct_rate
FROM challenge_questions cq
JOIN questions q ON q.id = cq.question_id
LEFT JOIN submissions s ON s.challenge_id = cq.challenge_id AND s.question_id = cq.question_id
GROUP BY cq.challenge_id, cq.question_id, q.statement, q.difficulty, q.type, cq.points;

-- ============================================================
-- Anti-Cheat Events Summary View
-- ============================================================
CREATE OR REPLACE VIEW anticheat_summary AS
SELECT
  ace.challenge_id,
  ace.user_id,
  u.full_name,
  COUNT(*) AS total_events,
  COUNT(CASE WHEN ace.event_type = 'tab_hidden' THEN 1 END) AS tab_hidden_count,
  COUNT(CASE WHEN ace.event_type = 'window_blur' THEN 1 END) AS window_blur_count,
  MIN(ace.created_at) AS first_event_at,
  MAX(ace.created_at) AS last_event_at
FROM anti_cheat_events ace
JOIN users u ON u.id = ace.user_id
GROUP BY ace.challenge_id, ace.user_id, u.full_name;

-- ============================================================
-- RLS Policies for new columns (views are accessible via existing policies)
-- ============================================================

-- Ensure analytics view is accessible to admins/hosts
GRANT SELECT ON challenge_analytics TO authenticated;
GRANT SELECT ON challenge_question_analytics TO authenticated;
GRANT SELECT ON anticheat_summary TO authenticated;
