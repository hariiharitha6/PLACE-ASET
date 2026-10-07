-- ============================================================
-- PLACE@ASET Database Migration 027: Question Intelligence & Spaced Repetition (SAFE AUDITED VERSION)
-- ============================================================

-- 1. Extend questions table with safe defaults:
--    - source_type defaults to 'UNKNOWN' to prevent misclassifying legacy/unknown questions
--    - verified defaults to false to ensure questions must be verified explicitly
--    - status defaults to 'review' so unverified rows are not auto-published
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'UNKNOWN' CHECK (source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL', 'AI_GENERATED', 'PERSONAL', 'UNKNOWN')),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'review' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived', 'rejected')),
  ADD COLUMN IF NOT EXISTS normalized_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_questions_source_type ON public.questions(source_type);
CREATE INDEX IF NOT EXISTS idx_questions_verified ON public.questions(verified);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_normalized_hash ON public.questions(normalized_hash);

-- 2. Create question repetition and spaced repetition tracking table
CREATE TABLE IF NOT EXISTS public.question_repetition_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  attempt_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  last_result BOOLEAN,
  last_session_number INTEGER DEFAULT 0,
  interval_sessions INTEGER DEFAULT 1,
  next_review_session_number INTEGER DEFAULT 1,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  mastery_level INTEGER DEFAULT 0, -- 0: new, 1: learning, 2: reviewing, 3: mastered
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_question_rep UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_qrep_user ON public.question_repetition_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_qrep_review_session ON public.question_repetition_schedules(user_id, next_review_session_number);
CREATE INDEX IF NOT EXISTS idx_qrep_next_at ON public.question_repetition_schedules(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_qrep_last_result ON public.question_repetition_schedules(user_id, last_result);

-- 3. Enable RLS on question_repetition_schedules
ALTER TABLE public.question_repetition_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own question repetition schedule" ON public.question_repetition_schedules;
CREATE POLICY "Users can read own question repetition schedule" ON public.question_repetition_schedules
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own question repetition schedule" ON public.question_repetition_schedules;
CREATE POLICY "Users can manage own question repetition schedule" ON public.question_repetition_schedules
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 4. Update Questions RLS policy for Verified & Published questions
--    - Ensures unclassified/UNKNOWN questions remain invisible to students
--    - Ensures PERSONAL questions remain strictly owner-scoped
--    - Requires verified=true and approved/published for institutional & core questions
DROP POLICY IF EXISTS "Allow select for authenticated users on questions" ON public.questions;
CREATE POLICY "Allow select for authenticated users on questions" ON public.questions
  FOR SELECT TO authenticated USING (
    -- Admins/hosts/faculty can see all questions
    public.current_user_role() IN ('super_admin', 'college_admin', 'host', 'faculty')
    OR
    -- Students see:
    -- A) Official verified + published questions (VERIFIED_CORE or INSTITUTIONAL)
    (
      source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL')
      AND verified = true
      AND (status = 'published' OR approval_status = 'approved')
      AND (is_global = true OR college_id = public.current_college_id())
    )
    OR
    -- B) Their own personal questions
    (
      source_type = 'PERSONAL'
      AND created_by = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_repetition_schedules TO authenticated;
