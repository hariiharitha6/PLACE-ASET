-- ============================================================
-- PLACE@ASET Migration 013: AI Engine & Recommendations Schema
-- ============================================================

-- Learning Profiles
CREATE TABLE IF NOT EXISTS learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  mastery_score INTEGER DEFAULT 10,
  weak_topics JSONB DEFAULT '[]',
  strong_topics JSONB DEFAULT '[]',
  learning_velocity FLOAT DEFAULT 1.0,
  practice_frequency FLOAT DEFAULT 0.0,
  average_response_time FLOAT DEFAULT 0.0,
  preferred_difficulty VARCHAR(50) DEFAULT 'medium',
  preferred_companies JSONB DEFAULT '[]',
  preferred_departments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lp_user ON learning_profiles(user_id);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('question', 'resource', 'practice_session', 'challenge')),
  item_id UUID NOT NULL,
  reason TEXT,
  confidence_score FLOAT DEFAULT 0.0,
  is_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_air_user ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_air_type ON ai_recommendations(item_type);

-- Question Embeddings (Placeholder)
CREATE TABLE IF NOT EXISTS question_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
  embedding_vector FLOAT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation History
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('click', 'ignore', 'complete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rhist_user ON recommendation_history(user_id);

-- Prediction Logs
CREATE TABLE IF NOT EXISTS prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  task_type VARCHAR(100) NOT NULL,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plog_task ON prediction_logs(task_type);

-- RLS Policies
ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own learning profile" ON learning_profiles;
CREATE POLICY "Users read own learning profile" ON learning_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own learning profile" ON learning_profiles;
CREATE POLICY "Users manage own learning profile" ON learning_profiles FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own recommendations" ON ai_recommendations;
CREATE POLICY "Users read own recommendations" ON ai_recommendations FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own recommendations" ON ai_recommendations;
CREATE POLICY "Users update own recommendations" ON ai_recommendations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow read access to embeddings" ON question_embeddings;
CREATE POLICY "Allow read access to embeddings" ON question_embeddings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users manage recommendation history" ON recommendation_history;
CREATE POLICY "Users manage recommendation history" ON recommendation_history FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow select on prediction logs for admins" ON prediction_logs;
CREATE POLICY "Allow select on prediction logs for admins" ON prediction_logs FOR SELECT TO authenticated USING (public.current_user_role() IN ('super_admin', 'college_admin', 'host'));


DROP POLICY IF EXISTS "Allow insert on prediction logs for all" ON prediction_logs;
CREATE POLICY "Allow insert on prediction logs for all" ON prediction_logs FOR INSERT TO authenticated WITH CHECK (true);


-- Grants
GRANT ALL ON learning_profiles TO authenticated;
GRANT ALL ON ai_recommendations TO authenticated;
GRANT ALL ON question_embeddings TO authenticated;
GRANT ALL ON recommendation_history TO authenticated;
GRANT ALL ON prediction_logs TO authenticated;
