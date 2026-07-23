-- ============================================================
-- PLACE@ASET Database Migration 002: Questions & Categories
-- Creates: categories, tags, questions, question_options, question_tags
-- ============================================================

-- ============================================================
-- Categories (hierarchical — parent_id for sub-categories)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================
-- Tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- ============================================================
-- Questions
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  type question_type DEFAULT 'mcq_single',
  difficulty difficulty_level DEFAULT 'medium',
  statement TEXT NOT NULL,
  explanation TEXT,
  image_url TEXT,
  is_global BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_college ON questions(college_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_global ON questions(is_global);
CREATE INDEX IF NOT EXISTS idx_questions_archived ON questions(is_archived);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);

DROP TRIGGER IF EXISTS trigger_questions_updated ON questions;
CREATE TRIGGER trigger_questions_updated
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Question Options
-- ============================================================
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label VARCHAR(5) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_correct BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);

-- ============================================================
-- Question Tags (M2M)
-- ============================================================
CREATE TABLE IF NOT EXISTS question_tags (
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_qtags_question ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_qtags_tag ON question_tags(tag_id);

-- ============================================================
-- Question Version History
-- ============================================================
CREATE TABLE IF NOT EXISTS question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  statement TEXT NOT NULL,
  options JSONB NOT NULL,
  explanation TEXT,
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qversions_question ON question_versions(question_id);

-- ============================================================
-- Seed categories
-- ============================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Quantitative Aptitude', 'quantitative-aptitude', '🔢', 1),
  ('Logical Reasoning', 'logical-reasoning', '🧩', 2),
  ('Verbal Aptitude', 'verbal-aptitude', '📝', 3),
  ('Technical Aptitude', 'technical-aptitude', '💻', 4)
ON CONFLICT (slug) DO NOTHING;

-- Technical sub-categories
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT sub.name, sub.slug, c.id, sub.sort_order
FROM categories c,
(VALUES
  ('C Programming', 'c-programming', 1),
  ('C++ Programming', 'cpp-programming', 2),
  ('Java', 'java', 3),
  ('Python', 'python', 4),
  ('DBMS', 'dbms', 5),
  ('Operating Systems', 'operating-systems', 6),
  ('Computer Networks', 'computer-networks', 7),
  ('OOP Concepts', 'oop-concepts', 8),
  ('Data Structures & Algorithms', 'dsa', 9)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'technical-aptitude'
ON CONFLICT (slug) DO NOTHING;

