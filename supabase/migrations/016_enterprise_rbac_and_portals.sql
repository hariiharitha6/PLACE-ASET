-- 016_enterprise_rbac_and_portals.sql
-- Enterprise RBAC, Permission Engine, Designations & Portal Schemas

-- 1. Roles & Hierarchy Table
CREATE TABLE IF NOT EXISTS public.roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hierarchy_level INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (id, name, hierarchy_level, description) VALUES
  ('super_admin', 'Super Admin', 8, 'Full Unrestricted System Governance'),
  ('college_admin', 'College Admin', 7, 'Campus Administration & User Management'),
  ('principal', 'Principal', 6, 'Executive Academic & Placement Oversight'),
  ('hod', 'Head of Department', 5, 'Departmental Leadership & Progress Analytics'),
  ('placement_cell', 'Placement Cell', 4, 'Placement Drives, Resumes & Readiness Reports'),
  ('host', 'Host & Organizer', 3, 'Events, Contests, Discussion Moderation'),
  ('faculty', 'Faculty Member', 2, 'Course Management & Department Student Oversight'),
  ('student', 'Student Candidate', 1, 'Assessment, Learning & Challenge Participant')
ON CONFLICT (id) DO UPDATE SET hierarchy_level = EXCLUDED.hierarchy_level;

-- 2. Faculty Designations Table
CREATE TABLE IF NOT EXISTS public.designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL UNIQUE,
  mapped_role VARCHAR(50) NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.designations (title, mapped_role, description) VALUES
  ('Assistant Professor', 'faculty', 'Teaching Faculty Member'),
  ('Associate Professor', 'faculty', 'Senior Academic Faculty'),
  ('Professor', 'faculty', 'Lead Academic Faculty'),
  ('Lab Instructor', 'faculty', 'Practical & Laboratory Instructor'),
  ('Guest Faculty', 'faculty', 'Visiting Educator'),
  ('Placement Officer', 'placement_cell', 'Placement Cell Director'),
  ('Placement Assistant', 'placement_cell', 'Placement Executive'),
  ('Head of Department', 'hod', 'Department Chair'),
  ('Principal', 'principal', 'College Principal')
ON CONFLICT (title) DO NOTHING;

-- 3. Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.permissions (id, name, category, description) VALUES
  ('create_event', 'Create Event', 'Events', 'Ability to create placement events and workshops'),
  ('delete_event', 'Delete Event', 'Events', 'Ability to delete placement events'),
  ('upload_questions', 'Upload Questions', 'Question Bank', 'Ability to ingest question datasets'),
  ('approve_questions', 'Approve Questions', 'Question Bank', 'Ability to review and publish questions'),
  ('manage_datasets', 'Manage Datasets', 'Datasets', 'Ability to manage dataset repositories'),
  ('view_student_profiles', 'View Student Profiles', 'Students', 'Access to student profiles and resumes'),
  ('export_reports', 'Export Reports', 'Analytics', 'Ability to export system and placement reports'),
  ('manage_ai', 'Manage AI Engine', 'AI Engine', 'Ability to configure AI models and prompts'),
  ('manage_users', 'Manage Users', 'Governance', 'Ability to modify users, status, and credentials'),
  ('manage_departments', 'Manage Departments', 'Governance', 'Ability to create and manage academic departments'),
  ('manage_companies', 'Manage Companies', 'Repository', 'Ability to edit company hiring profiles'),
  ('manage_permissions', 'Manage Permissions', 'Governance', 'Ability to approve temporary permission grants')
ON CONFLICT (id) DO NOTHING;

-- 4. Role Permission Mapping
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id VARCHAR(50) REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  ('super_admin', 'create_event'), ('super_admin', 'delete_event'), ('super_admin', 'upload_questions'), ('super_admin', 'approve_questions'), ('super_admin', 'manage_datasets'), ('super_admin', 'view_student_profiles'), ('super_admin', 'export_reports'), ('super_admin', 'manage_ai'), ('super_admin', 'manage_users'), ('super_admin', 'manage_departments'), ('super_admin', 'manage_companies'), ('super_admin', 'manage_permissions'),
  ('college_admin', 'create_event'), ('college_admin', 'upload_questions'), ('college_admin', 'approve_questions'), ('college_admin', 'manage_datasets'), ('college_admin', 'view_student_profiles'), ('college_admin', 'export_reports'), ('college_admin', 'manage_users'), ('college_admin', 'manage_departments'), ('college_admin', 'manage_companies'),
  ('principal', 'view_student_profiles'), ('principal', 'export_reports'),
  ('hod', 'view_student_profiles'), ('hod', 'export_reports'), ('hod', 'approve_questions'),
  ('placement_cell', 'create_event'), ('placement_cell', 'view_student_profiles'), ('placement_cell', 'export_reports'), ('placement_cell', 'manage_companies'),
  ('host', 'create_event'), ('host', 'upload_questions'),
  ('faculty', 'upload_questions')
ON CONFLICT DO NOTHING;

-- 5. User Specific & Temporary Permission Overrides
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, permission_id)
);

-- 6. Temporary Permission Requests
CREATE TABLE IF NOT EXISTS public.permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  duration_days INT DEFAULT 7,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Live User Sessions Table for User Monitor
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50) DEFAULT 'Desktop',
  browser VARCHAR(50) DEFAULT 'Chrome',
  is_online BOOLEAN DEFAULT true,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read to roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Allow public read to designations" ON public.designations FOR SELECT USING (true);
CREATE POLICY "Allow public read to permissions" ON public.permissions FOR SELECT USING (true);
