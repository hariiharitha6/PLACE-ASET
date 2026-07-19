-- ============================================================
-- PLACE@ASET Migration 010: Practice Extensions
-- Creates tables for practice statistics and recommendations
-- ============================================================

-- Practice Statistics Table
CREATE TABLE IF NOT EXISTS practice_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_questions_solved INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  weak_topics JSONB DEFAULT '{}',
  topic_accuracy JSONB DEFAULT '{}',
  difficulty_accuracy JSONB DEFAULT '{}',
  average_response_times JSONB DEFAULT '{}',
  mastery_scores JSONB DEFAULT '{}',
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  last_practice_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_stats_user ON practice_statistics(user_id);

-- Practice Recommendations Table
CREATE TABLE IF NOT EXISTS practice_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  score FLOAT DEFAULT 0,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_rec_user ON practice_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_rec_category ON practice_recommendations(category_id);

-- RLS Policies
ALTER TABLE practice_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own practice stats" ON practice_statistics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users manage own practice stats" ON practice_statistics
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users read own practice recommendations" ON practice_recommendations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users manage own practice recommendations" ON practice_recommendations
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Grants
GRANT SELECT ON practice_statistics TO authenticated;
GRANT SELECT ON practice_recommendations TO authenticated;
