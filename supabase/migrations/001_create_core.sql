-- ============================================================
-- PLACE@ASET Database Migration 001: Core Tables
-- Creates: colleges, departments, custom types
-- ============================================================

-- Custom enum types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'college_admin',
  'host',
  'faculty',
  'student'
);

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE challenge_status AS ENUM (
  'draft',
  'published',
  'active',
  'ended',
  'cancelled',
  'archived'
);

CREATE TYPE question_type AS ENUM (
  'mcq_single',
  'mcq_multiple',
  'true_false'
);

CREATE TYPE question_category AS ENUM (
  'quantitative_aptitude',
  'logical_reasoning',
  'verbal_aptitude',
  'technical_aptitude'
);

CREATE TYPE resource_type AS ENUM (
  'notes',
  'placement_paper',
  'pdf',
  'cheat_sheet',
  'interview_questions',
  'company_material'
);

CREATE TYPE community_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'merged'
);

CREATE TYPE notification_type AS ENUM (
  'challenge_reminder',
  'challenge_result',
  'achievement_unlocked',
  'badge_earned',
  'resource_added',
  'community_approved',
  'community_rejected',
  'announcement',
  'streak_warning',
  'level_up'
);

CREATE TYPE bookmark_type AS ENUM (
  'question',
  'resource',
  'challenge'
);

-- ============================================================
-- Colleges (Multi-tenant root)
-- ============================================================
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  branding JSONB DEFAULT '{}',
  description TEXT,
  website VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_colleges_slug ON colleges(slug);
CREATE INDEX idx_colleges_active ON colleges(is_active);

-- ============================================================
-- Departments
-- ============================================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, code)
);

CREATE INDEX idx_departments_college ON departments(college_id);

-- ============================================================
-- Users (Extended profile — auth handled by Supabase Auth)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  year VARCHAR(20),
  section VARCHAR(10),
  roll_number VARCHAR(50),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_college ON users(college_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_xp ON users(xp DESC);

-- ============================================================
-- Updated at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_colleges_updated
  BEFORE UPDATE ON colleges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed default college (ASET)
-- ============================================================
INSERT INTO colleges (name, slug, description) VALUES (
  'Ahalia School of Engineering and Technology',
  'aset',
  'Ahalia School of Engineering and Technology (ASET)'
) ON CONFLICT (slug) DO NOTHING;
