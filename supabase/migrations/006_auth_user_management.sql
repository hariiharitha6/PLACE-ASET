-- ============================================================
-- PLACE@ASET Database Migration 006: Auth & User Management
-- Creates: roles, permissions, role_permissions, user_roles, sessions
-- ============================================================

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions Table (Junction Table)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User Roles Table (Junction Table)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(255) UNIQUE,
  user_agent TEXT,
  ip_address INET,
  is_blocked BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance optimization
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token);

-- ============================================================
-- Triggers for automatic updated_at timestamp updates
-- ============================================================
CREATE TRIGGER trigger_roles_updated
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_permissions_updated
  BEFORE UPDATE ON permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_sessions_updated
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================
-- Roles: readable by authenticated, managed by super_admin
DROP POLICY IF EXISTS "Roles readable by authenticated users" ON roles;
CREATE POLICY "Roles readable by authenticated users" ON roles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Super admin manages roles" ON roles;
CREATE POLICY "Super admin manages roles" ON roles
  FOR ALL TO authenticated USING (public.current_user_role() = 'super_admin');

-- Permissions: readable by authenticated, managed by super_admin
DROP POLICY IF EXISTS "Permissions readable by authenticated users" ON permissions;
CREATE POLICY "Permissions readable by authenticated users" ON permissions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Super admin manages permissions" ON permissions;
CREATE POLICY "Super admin manages permissions" ON permissions
  FOR ALL TO authenticated USING (public.current_user_role() = 'super_admin');

-- Role Permissions: readable by authenticated, managed by super_admin
DROP POLICY IF EXISTS "Role permissions readable by authenticated users" ON role_permissions;
CREATE POLICY "Role permissions readable by authenticated users" ON role_permissions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Super admin manages role permissions" ON role_permissions;
CREATE POLICY "Super admin manages role permissions" ON role_permissions
  FOR ALL TO authenticated USING (public.current_user_role() = 'super_admin');

-- User Roles: readable by own college users, managed by college/super admins
DROP POLICY IF EXISTS "User roles readable by same college users" ON user_roles;
CREATE POLICY "User roles readable by same college users" ON user_roles
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = user_roles.user_id 
      AND (u.college_id = public.current_college_id() OR public.current_user_role() = 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins manage user roles" ON user_roles;
CREATE POLICY "Admins manage user roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    public.current_user_role() IN ('super_admin', 'college_admin')
    AND EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = user_roles.user_id 
      AND (u.college_id = public.current_college_id() OR public.current_user_role() = 'super_admin')
    )
  );

-- Sessions: readable/deletable by own user or college/super admins
DROP POLICY IF EXISTS "Users manage own sessions" ON sessions;
CREATE POLICY "Users manage own sessions" ON sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins read sessions" ON sessions;
CREATE POLICY "Admins read sessions" ON sessions
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('super_admin', 'college_admin')
    AND EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = sessions.user_id 
      AND (u.college_id = public.current_college_id() OR public.current_user_role() = 'super_admin')
    )
  );

-- ============================================================
-- Seed default roles and permissions
-- ============================================================
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Global platform administrator with unrestricted access'),
  ('college_admin', 'Administrator for a specific college tenant'),
  ('host', 'Organizer and moderator of weekly placement challenges'),
  ('faculty', 'Academic user who can view analytics and resource logs'),
  ('student', 'Primary candidate completing weekly challenges and practice questions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
  ('users:read', 'View user profiles and list users within the college'),
  ('users:write', 'Update user profiles, change statuses or deactivate accounts'),
  ('users:role_manage', 'Assign or revoke roles from users'),
  ('challenges:create', 'Create placement preparation challenges'),
  ('challenges:update', 'Update details and questions of scheduled challenges'),
  ('challenges:delete', 'Cancel or delete challenges'),
  ('questions:create', 'Create practice questions and options'),
  ('questions:delete', 'Delete practice questions'),
  ('resources:create', 'Upload learning materials and resources'),
  ('community:moderate', 'Approve or reject student-contributed content'),
  ('analytics:read', 'Access college-level performance reports and metrics')
ON CONFLICT (name) DO NOTHING;

-- Map permissions to roles
DO $$
DECLARE
  role_super UUID;
  role_cadmin UUID;
  role_h UUID;
  role_f UUID;
  role_s UUID;
  perm_u_read UUID;
  perm_u_write UUID;
  perm_u_role UUID;
  perm_c_create UUID;
  perm_c_update UUID;
  perm_c_delete UUID;
  perm_q_create UUID;
  perm_q_delete UUID;
  perm_r_create UUID;
  perm_comm_mod UUID;
  perm_a_read UUID;
BEGIN
  -- Get Roles IDs
  SELECT id INTO role_super FROM roles WHERE name = 'super_admin';
  SELECT id INTO role_cadmin FROM roles WHERE name = 'college_admin';
  SELECT id INTO role_h FROM roles WHERE name = 'host';
  SELECT id INTO role_f FROM roles WHERE name = 'faculty';
  SELECT id INTO role_s FROM roles WHERE name = 'student';

  -- Get Permission IDs
  SELECT id INTO perm_u_read FROM permissions WHERE name = 'users:read';
  SELECT id INTO perm_u_write FROM permissions WHERE name = 'users:write';
  SELECT id INTO perm_u_role FROM permissions WHERE name = 'users:role_manage';
  SELECT id INTO perm_c_create FROM permissions WHERE name = 'challenges:create';
  SELECT id INTO perm_c_update FROM permissions WHERE name = 'challenges:update';
  SELECT id INTO perm_c_delete FROM permissions WHERE name = 'challenges:delete';
  SELECT id INTO perm_q_create FROM permissions WHERE name = 'questions:create';
  SELECT id INTO perm_q_delete FROM permissions WHERE name = 'questions:delete';
  SELECT id INTO perm_r_create FROM permissions WHERE name = 'resources:create';
  SELECT id INTO perm_comm_mod FROM permissions WHERE name = 'community:moderate';
  SELECT id INTO perm_a_read FROM permissions WHERE name = 'analytics:read';

  -- Map Permissions to Super Admin (all permissions)
  IF role_super IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) VALUES
      (role_super, perm_u_read),
      (role_super, perm_u_write),
      (role_super, perm_u_role),
      (role_super, perm_c_create),
      (role_super, perm_c_update),
      (role_super, perm_c_delete),
      (role_super, perm_q_create),
      (role_super, perm_q_delete),
      (role_super, perm_r_create),
      (role_super, perm_comm_mod),
      (role_super, perm_a_read)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Map Permissions to College Admin
  IF role_cadmin IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) VALUES
      (role_cadmin, perm_u_read),
      (role_cadmin, perm_u_write),
      (role_cadmin, perm_u_role),
      (role_cadmin, perm_c_create),
      (role_cadmin, perm_c_update),
      (role_cadmin, perm_c_delete),
      (role_cadmin, perm_q_create),
      (role_cadmin, perm_r_create),
      (role_cadmin, perm_comm_mod),
      (role_cadmin, perm_a_read)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Map Permissions to Host
  IF role_h IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) VALUES
      (role_h, perm_u_read),
      (role_h, perm_c_create),
      (role_h, perm_c_update),
      (role_h, perm_q_create),
      (role_h, perm_r_create),
      (role_h, perm_comm_mod)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Map Permissions to Faculty
  IF role_f IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) VALUES
      (role_f, perm_u_read),
      (role_f, perm_r_create),
      (role_f, perm_a_read)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Map Permissions to Student
  IF role_s IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) VALUES
      (role_s, perm_u_read)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
