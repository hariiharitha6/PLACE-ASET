-- ============================================================
-- PLACE@ASET Database Migration 007: Question Bank Extensions
-- ============================================================

-- Extend PostgreSQL enums for new question types and difficulties
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'fill_in_the_blank';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'descriptive';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'image_based';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'code_snippet_mcq';

ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'expert';

-- Add approval_status and visibility to questions table
ALTER TABLE questions 
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'college'));

CREATE INDEX IF NOT EXISTS idx_questions_approval ON questions(approval_status);
CREATE INDEX IF NOT EXISTS idx_questions_visibility ON questions(visibility);

-- Create question_departments table for mapping questions to academic departments
CREATE TABLE IF NOT EXISTS question_departments (
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_qdepts_question ON question_departments(question_id);
CREATE INDEX IF NOT EXISTS idx_qdepts_department ON question_departments(department_id);

-- Enable RLS
ALTER TABLE question_departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_departments
CREATE POLICY "Allow read access for question_departments" ON question_departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access for admins and hosts in question_departments" ON question_departments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'college_admin', 'host')
    )
  );

-- Update RLS policies on questions table to enforce approval status and visibility
DROP POLICY IF EXISTS "Allow select for authenticated users on questions" ON questions;
CREATE POLICY "Allow select for authenticated users on questions" ON questions
  FOR SELECT TO authenticated USING (
    -- Admins/hosts can see any question
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'college_admin', 'host')
    )
    OR
    -- Students/faculty can see approved questions that are public or match their college
    (
      approval_status = 'approved'
      AND (
        visibility = 'public'
        OR (visibility = 'college' AND college_id = (SELECT college_id FROM users WHERE id = auth.uid()))
      )
    )
  );
