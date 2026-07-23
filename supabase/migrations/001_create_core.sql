-- ============================================================
-- PLACE@ASET Database Migration 001: Core Tables
-- Creates: colleges, departments, custom types
-- ============================================================

-- Custom enum types (Idempotent creation)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'super_admin',
      'college_admin',
      'host',
      'faculty',
      'student'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_status') THEN
    CREATE TYPE challenge_status AS ENUM (
      'draft',
      'published',
      'active',
      'ended',
      'cancelled',
      'archived'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
    CREATE TYPE question_type AS ENUM (
      'mcq_single',
      'mcq_multiple',
      'true_false'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_category') THEN
    CREATE TYPE question_category AS ENUM (
      'quantitative_aptitude',
      'logical_reasoning',
      'verbal_aptitude',
      'technical_aptitude'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
    CREATE TYPE resource_type AS ENUM (
      'notes',
      'placement_paper',
      'pdf',
      'cheat_sheet',
      'interview_questions',
      'company_material'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'community_status') THEN
    CREATE TYPE community_status AS ENUM (
      'pending',
      'approved',
      'rejected',
      'merged'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookmark_type') THEN
    CREATE TYPE bookmark_type AS ENUM (
      'question',
      'resource',
      'challenge'
    );
  END IF;
END $$;

-- ============================================================
-- Colleges (Multi-tenant root)
-- ============================================================
CREATE TABLE IF NOT EXISTS colleges (
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

CREATE INDEX IF NOT EXISTS idx_colleges_slug ON colleges(slug);
CREATE INDEX IF NOT EXISTS idx_colleges_active ON colleges(is_active);

-- ============================================================
-- Departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, code)
);

CREATE INDEX IF NOT EXISTS idx_departments_college ON departments(college_id);

-- ============================================================
-- Users (Extended profile — auth handled by Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
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

CREATE INDEX IF NOT EXISTS idx_users_college ON users(college_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);

-- ============================================================
-- Updated at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_colleges_updated ON colleges;
CREATE TRIGGER trigger_colleges_updated
  BEFORE UPDATE ON colleges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_users_updated ON users;
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

