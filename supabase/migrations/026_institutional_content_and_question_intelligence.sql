-- ============================================================
-- PLACE@ASET Database Migration 026: Institutional Content & Question Intelligence
-- Extends: questions & resources for enterprise academic tracking & review states
-- ============================================================

-- 1. Extend questions table with full academic & institutional metadata
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS subject VARCHAR(150) DEFAULT 'Computer Science & Engineering',
  ADD COLUMN IF NOT EXISTS module VARCHAR(100),
  ADD COLUMN IF NOT EXISTS topic VARCHAR(150),
  ADD COLUMN IF NOT EXISTS subtopic VARCHAR(150),
  ADD COLUMN IF NOT EXISTS semester VARCHAR(50) DEFAULT 'All',
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50) DEFAULT '2025-2026',
  ADD COLUMN IF NOT EXISTS marks INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT 'ASET Question Bank',
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS concepts TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS quality_score INT DEFAULT 90;

-- Ensure indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_module ON public.questions(module);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_semester ON public.questions(semester);
CREATE INDEX IF NOT EXISTS idx_questions_academic_year ON public.questions(academic_year);
CREATE INDEX IF NOT EXISTS idx_questions_is_published ON public.questions(is_published);

-- 2. Extend resources table with module, year, and publishing status
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS module VARCHAR(100),
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50) DEFAULT '2025-2026',
  ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT 'Faculty Upload',
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'processing', 'review_required', 'published', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_module ON public.resources(module);

-- 3. Update RLS policies to strictly separate published vs unpublished items
DROP POLICY IF EXISTS "Read own college or global questions" ON public.questions;
DROP POLICY IF EXISTS "Allow select for authenticated users on questions" ON public.questions;
CREATE POLICY "Allow select for authenticated users on questions" ON public.questions
  FOR SELECT TO authenticated USING (
    -- Admins/hosts/faculty can see all questions in their college
    public.current_user_role() IN ('super_admin', 'college_admin', 'host', 'faculty')
    OR
    -- Students only see published, approved questions
    (
      is_published = true
      AND approval_status IN ('approved', 'published')
      AND (is_global = true OR college_id = public.current_college_id())
    )
  );

-- 4. RLS for Resources: Students only see published resources
DROP POLICY IF EXISTS "Resources readable by own college or global" ON public.resources;
CREATE POLICY "Resources readable by own college or global" ON public.resources
  FOR SELECT TO authenticated USING (
    public.current_user_role() IN ('super_admin', 'college_admin', 'faculty')
    OR
    (
      is_published = true
      AND status = 'published'
      AND (is_global = true OR college_id = public.current_college_id())
    )
  );
