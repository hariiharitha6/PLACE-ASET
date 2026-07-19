-- ============================================================
-- PLACE@ASET Migration 012: Community Repository & OCR Schema
-- ============================================================

-- Community Submissions
CREATE TABLE IF NOT EXISTS community_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('question', 'resource')),
  department VARCHAR(100),
  topic VARCHAR(100),
  difficulty VARCHAR(50) DEFAULT 'medium',
  company VARCHAR(100),
  tags JSONB DEFAULT '[]',
  question_type VARCHAR(50) DEFAULT 'mcq',
  correct_answer VARCHAR(100),
  explanation TEXT,
  source VARCHAR(255),
  reference_link TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'merged', 'archived')) DEFAULT 'submitted',
  approved_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cs_college ON community_submissions(college_id);
CREATE INDEX IF NOT EXISTS idx_cs_user ON community_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_status ON community_submissions(status);

-- Submission Attachments
CREATE TABLE IF NOT EXISTS submission_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sa_sub ON submission_attachments(submission_id);

-- OCR Jobs
CREATE TABLE IF NOT EXISTS ocr_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attachment_id UUID REFERENCES submission_attachments(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocrj_user ON ocr_jobs(user_id);

-- OCR Results
CREATE TABLE IF NOT EXISTS ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocr_job_id UUID NOT NULL REFERENCES ocr_jobs(id) ON DELETE CASCADE,
  raw_text TEXT,
  extracted_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocrr_job ON ocr_results(ocr_job_id);

-- Duplicate Checks
CREATE TABLE IF NOT EXISTS duplicate_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  similarity_score FLOAT NOT NULL,
  matching_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('semantic', 'text', 'ocr')),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dc_sub ON duplicate_checks(submission_id);

-- Review History
CREATE TABLE IF NOT EXISTS review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('approve', 'reject', 'merge', 'edit', 'archive', 'restore')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rh_sub ON review_history(submission_id);

-- Question Versions (History)
CREATE TABLE IF NOT EXISTS question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  statement TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  correct_answer VARCHAR(100),
  explanation TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qv_question ON question_versions(question_id);

-- RLS Policies
ALTER TABLE community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_versions ENABLE ROW LEVEL SECURITY;

-- Select/Update Policies
CREATE POLICY "Users read own submissions" ON community_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));
CREATE POLICY "Users insert submissions" ON community_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own submissions" ON community_submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));

CREATE POLICY "Users read own attachments" ON submission_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert attachments" ON submission_attachments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users read own OCR jobs" ON ocr_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));
CREATE POLICY "Users insert OCR jobs" ON ocr_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update OCR jobs" ON ocr_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));

CREATE POLICY "Users read OCR results" ON ocr_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert OCR results" ON ocr_results FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users read duplicate checks" ON duplicate_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage duplicate checks" ON duplicate_checks FOR ALL TO authenticated USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));

CREATE POLICY "Users read review history" ON review_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage review history" ON review_history FOR ALL TO authenticated USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));

CREATE POLICY "Users read question versions" ON question_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage question versions" ON question_versions FOR ALL TO authenticated USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin'));

-- Grants
GRANT ALL ON community_submissions TO authenticated;
GRANT ALL ON submission_attachments TO authenticated;
GRANT ALL ON ocr_jobs TO authenticated;
GRANT ALL ON ocr_results TO authenticated;
GRANT ALL ON duplicate_checks TO authenticated;
GRANT ALL ON review_history TO authenticated;
GRANT ALL ON question_versions TO authenticated;
