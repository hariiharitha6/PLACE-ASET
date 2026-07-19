-- ============================================================
-- PLACE@ASET Database Migration 003: Challenges & Submissions
-- ============================================================

-- ============================================================
-- Challenges
-- ============================================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status challenge_status DEFAULT 'draft',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_participants INTEGER,
  randomize_questions BOOLEAN DEFAULT true,
  randomize_options BOOLEAN DEFAULT true,
  show_results_after BOOLEAN DEFAULT true,
  allow_review BOOLEAN DEFAULT true,
  negative_marking BOOLEAN DEFAULT false,
  negative_marks_value FLOAT DEFAULT 0,
  passing_percentage FLOAT DEFAULT 0,
  instructions TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_college ON challenges(college_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_start ON challenges(start_time);
CREATE INDEX idx_challenges_end ON challenges(end_time);
CREATE INDEX idx_challenges_created_by ON challenges(created_by);

CREATE TRIGGER trigger_challenges_updated
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Challenge Questions (M2M with ordering and points)
-- ============================================================
CREATE TABLE challenge_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 1,
  UNIQUE(challenge_id, question_id)
);

CREATE INDEX idx_cq_challenge ON challenge_questions(challenge_id);
CREATE INDEX idx_cq_question ON challenge_questions(question_id);

-- ============================================================
-- Challenge Registrations
-- ============================================================
CREATE TABLE challenge_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_creg_challenge ON challenge_registrations(challenge_id);
CREATE INDEX idx_creg_user ON challenge_registrations(user_id);

-- ============================================================
-- Submissions (per question per user per challenge)
-- ============================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  time_spent_seconds INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id, question_id)
);

CREATE INDEX idx_sub_challenge ON submissions(challenge_id);
CREATE INDEX idx_sub_user ON submissions(user_id);
CREATE INDEX idx_sub_question ON submissions(question_id);
CREATE INDEX idx_sub_challenge_user ON submissions(challenge_id, user_id);

-- ============================================================
-- Leaderboard Entries (computed after challenge ends)
-- ============================================================
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  unanswered_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  rank INTEGER,
  percentage FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_lb_challenge ON leaderboard_entries(challenge_id);
CREATE INDEX idx_lb_user ON leaderboard_entries(user_id);
CREATE INDEX idx_lb_college ON leaderboard_entries(college_id);
CREATE INDEX idx_lb_rank ON leaderboard_entries(challenge_id, rank);
CREATE INDEX idx_lb_score ON leaderboard_entries(challenge_id, total_score DESC);

-- ============================================================
-- Anti-Cheat Events
-- ============================================================
CREATE TABLE anti_cheat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ace_challenge ON anti_cheat_events(challenge_id);
CREATE INDEX idx_ace_user ON anti_cheat_events(user_id);
CREATE INDEX idx_ace_challenge_user ON anti_cheat_events(challenge_id, user_id);
