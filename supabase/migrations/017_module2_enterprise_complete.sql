-- 017_module2_enterprise_complete.sql
-- Module 2 Enterprise Governance, Permission Expiry, Student Privacy RLS & Audit System

-- 1. Permission Logs Table
CREATE TABLE IF NOT EXISTS public.permission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) REFERENCES public.permissions(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- REQUESTED, GRANTED, REVOKED, EXPIRED, DENIED
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Permission Expiry Tracking Table
CREATE TABLE IF NOT EXISTS public.permission_expiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_permission_id UUID REFERENCES public.user_permissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Privacy Policy: RLS Policies for Student Profiles & Resumes
-- Student profiles visible only to: Self (Student), Placement Cell, HOD (own dept), Principal, College Admin, Super Admin
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_can_view_student_profile(target_student_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_role VARCHAR(50);
  current_dept UUID;
  target_dept UUID;
BEGIN
  -- 1. Self viewing
  IF auth.uid() = target_student_id THEN
    RETURN TRUE;
  END IF;

  SELECT role, department_id INTO current_role, current_dept
  FROM public.users WHERE id = auth.uid();

  -- 2. Super Admin, College Admin, Principal, Placement Cell
  IF current_role IN ('super_admin', 'college_admin', 'principal', 'placement_cell') THEN
    RETURN TRUE;
  END IF;

  -- 3. HOD (own department)
  IF current_role = 'hod' THEN
    SELECT department_id INTO target_dept FROM public.users WHERE id = target_student_id;
    IF current_dept IS NOT NULL AND current_dept = target_dept THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_permission_requests_status ON public.permission_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_expires ON public.user_permissions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_online ON public.user_sessions(is_online, last_active);
