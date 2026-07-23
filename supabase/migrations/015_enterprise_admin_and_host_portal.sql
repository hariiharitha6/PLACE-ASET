-- ============================================================
-- PLACE@ASET Database Migration 015: Enterprise Admin & Host Portal
-- Companies repository, Host Department assignments, Audit Trail logs
-- ============================================================

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  website VARCHAR(255),
  pattern_info JSONB DEFAULT '{}',
  previous_questions_count INTEGER DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- Seed Target Top Tier Companies
INSERT INTO companies (name, logo_url, description, website, difficulty, previous_questions_count) VALUES
('Google', 'https://images.unsplash.com/photo-1573804633927-bf7713b29185?auto=format&fit=crop&w=200&q=80', 'Search, Cloud, Machine Learning & Systems Architecture', 'https://careers.google.com', 'hard', 185),
('Microsoft', 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?auto=format&fit=crop&w=200&q=80', 'Software Engineering, Azure Cloud & Enterprise Solutions', 'https://careers.microsoft.com', 'hard', 160),
('Amazon', 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=200&q=80', 'SDE 1/2, AWS Cloud, Distributed Systems & Leadership Principles', 'https://amazon.jobs', 'hard', 210),
('Infosys', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80', 'System Engineer, Specialist Programmer & Power Programmer Roles', 'https://www.infosys.com/careers.html', 'medium', 140),
('TCS', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', 'Ninja & Digital Recruitment Drives, National Qualifier Test (NQT)', 'https://www.tcs.com/careers', 'medium', 250),
('UST', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=200&q=80', 'Digital Transformation & Software Engineering Solutions', 'https://www.ust.com/en/careers', 'medium', 85),
('EY', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&q=80', 'Technology Consulting, Advisory & Data Engineering', 'https://www.ey.com/careers', 'medium', 75),
('IBM', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80', 'Associate Software Engineer, Hybrid Cloud & AI Solutions', 'https://www.ibm.com/careers', 'medium', 115),
('Oracle', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=80', 'Database Applications, OCI Cloud & Server-side Java Development', 'https://www.oracle.com/careers', 'hard', 130),
('Deloitte', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80', 'Technology Strategy, Analytics & Risk Advisory Services', 'https://www me.deloitte.com/careers', 'medium', 90)
ON CONFLICT (name) DO NOTHING;

-- 2. Host Department Assignment Table
CREATE TABLE IF NOT EXISTS host_department_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{"can_upload_pdf": true, "can_create_challenges": true, "can_approve_questions": true}',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_host_dept_host ON host_department_assignments(host_id);

-- 3. System Admin Audit Trail Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(100),
  target_id VARCHAR(255),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON admin_audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);
