-- ============================================================
-- PLACE@ASET Database Migration 024: Personal Learning Mode & Document Intelligence
-- Supports: Independent learner mode, personal documents, private RLS, flashcards, study plans
-- ============================================================

-- 1. Extend users table for learning mode & goals
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS learning_mode VARCHAR(30) DEFAULT 'institute',
  ADD COLUMN IF NOT EXISTS learning_goals TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_companies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weekly_target_hours INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS daily_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_topics TEXT[] DEFAULT '{}';

-- 2. Create personal_documents table for private learner uploads (PDF, Notes, Code, etc.)
CREATE TABLE IF NOT EXISTS public.personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100) DEFAULT 'document',
  file_size BIGINT DEFAULT 0,
  storage_path TEXT,
  extracted_text TEXT,
  ai_summary TEXT,
  flashcards JSONB DEFAULT '[]'::jsonb,
  quiz_questions JSONB DEFAULT '[]'::jsonb,
  key_takeaways JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_indexed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create personal_collections table for organizing private & public resources
CREATE TABLE IF NOT EXISTS public.personal_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#6366f1',
  resource_ids UUID[] DEFAULT '{}',
  document_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create personal_study_plans table
CREATE TABLE IF NOT EXISTS public.personal_study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  topics JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(30) DEFAULT 'active',
  target_date DATE,
  completion_pct INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_personal_documents_user ON public.personal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_documents_created ON public.personal_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_collections_user ON public.personal_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_study_plans_user ON public.personal_study_plans(user_id);

-- 6. Enable Row Level Security (Strict Privacy Isolation)
ALTER TABLE public.personal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_study_plans ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Owner-only access - strictly isolated)
DROP POLICY IF EXISTS "Users have full access to own personal documents" ON public.personal_documents;
CREATE POLICY "Users have full access to own personal documents" ON public.personal_documents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users have full access to own personal collections" ON public.personal_collections;
CREATE POLICY "Users have full access to own personal collections" ON public.personal_collections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users have full access to own personal study plans" ON public.personal_study_plans;
CREATE POLICY "Users have full access to own personal study plans" ON public.personal_study_plans
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Grants
GRANT ALL ON public.personal_documents TO authenticated;
GRANT ALL ON public.personal_collections TO authenticated;
GRANT ALL ON public.personal_study_plans TO authenticated;
