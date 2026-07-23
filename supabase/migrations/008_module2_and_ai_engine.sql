-- 008_module2_and_ai_engine.sql
-- Enterprise Database Schema for Module 2 (Admin & Dataset Management) & Add-On Multi-Provider AI Engine

-- 1. Datasets & Files
CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  source VARCHAR(255) DEFAULT 'Admin Upload',
  company VARCHAR(100),
  department VARCHAR(100),
  subject VARCHAR(100),
  visibility VARCHAR(50) DEFAULT 'private',
  batch VARCHAR(50),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  uploader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_questions INT DEFAULT 0,
  processed_questions INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dataset_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type VARCHAR(50) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  ocr_status VARCHAR(50) DEFAULT 'pending', -- pending, skipped, in_progress, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Multi-Provider AI Engine Configuration & Health
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id VARCHAR(50) PRIMARY KEY, -- gemini, openai, ollama, azure, anthropic
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  api_key_status VARCHAR(50) DEFAULT 'configured', -- configured, missing, invalid
  endpoint_url VARCHAR(500),
  models TEXT[] DEFAULT '{}',
  latency_ms INT DEFAULT 0,
  avg_response_time_ms INT DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 4) DEFAULT 0.0000,
  last_error TEXT,
  last_health_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default provider configurations
INSERT INTO public.ai_providers (id, name, is_active, is_default, endpoint_url, models)
VALUES 
  ('gemini', 'Google Gemini AI', true, true, 'https://generativelanguage.googleapis.com', ARRAY['gemini-1.5-flash', 'gemini-1.5-pro']),
  ('openai', 'OpenAI GPT Engine', true, false, 'https://api.openai.com/v1', ARRAY['gpt-4o', 'gpt-4o-mini']),
  ('ollama', 'Local Ollama LLM', true, false, 'http://localhost:11434', ARRAY['llama3', 'mistral', 'phi3', 'gemma2', 'deepseek-coder']),
  ('azure', 'Azure OpenAI Service', false, false, 'https://azure.openai.azure.com', ARRAY['gpt-4-turbo']),
  ('anthropic', 'Anthropic Claude Engine', false, false, 'https://api.anthropic.com', ARRAY['claude-3-5-sonnet'])
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

CREATE TABLE IF NOT EXISTS public.ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(100) NOT NULL UNIQUE, -- ocr, categorization, explanation, question_gen, duplicate_detection, resume_analysis, interview_feedback
  primary_provider_id VARCHAR(50) NOT NULL REFERENCES public.ai_providers(id),
  fallback_provider_id VARCHAR(50) REFERENCES public.ai_providers(id),
  temperature NUMERIC(3, 2) DEFAULT 0.20,
  max_tokens INT DEFAULT 2048,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Task Routing Settings
INSERT INTO public.ai_provider_settings (task_type, primary_provider_id, fallback_provider_id)
VALUES
  ('ocr', 'gemini', 'openai'),
  ('categorization', 'gemini', 'openai'),
  ('explanation', 'openai', 'gemini'),
  ('question_gen', 'openai', 'gemini'),
  ('duplicate_detection', 'gemini', 'openai'),
  ('resume_analysis', 'openai', 'gemini'),
  ('interview_feedback', 'openai', 'gemini')
ON CONFLICT (task_type) DO UPDATE SET updated_at = NOW();

-- 3. Prompt Management Templates
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.ai_prompt_templates (key, title, description, template_text, variables)
VALUES
  ('question_categorization', 'Question Categorization & Tagging', 'Classifies questions into subject, topic, subtopic, company, and difficulty', 'Analyze the following question statement and options. Extract subject, topic, subtopic, difficulty (easy/medium/hard), target company, and appropriate tags.\n\nStatement: {{statement}}\nOptions: {{options}}', ARRAY['statement', 'options']),
  ('explanation_generation', 'Step-by-step Solution Generator', 'Generates detailed step-by-step explanations for technical questions', 'Provide a clear, educational, step-by-step explanation and solution for the following question:\n\nStatement: {{statement}}\nCorrect Answer: {{correct_answer}}', ARRAY['statement', 'correct_answer']),
  ('question_generation', 'AI Question Generator', 'Generates synthetic exam and practice questions', 'Generate {{count}} high-quality placement prep questions for Subject: {{subject}}, Topic: {{topic}}, Difficulty: {{difficulty}}, Target Company: {{company}}.', ARRAY['count', 'subject', 'topic', 'difficulty', 'company'])
ON CONFLICT (key) DO UPDATE SET updated_at = NOW();

-- 4. Asynchronous AI Jobs & Cache
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  task_type VARCHAR(100) NOT NULL,
  provider_id VARCHAR(50) REFERENCES public.ai_providers(id),
  status VARCHAR(50) DEFAULT 'queued', -- queued, running, completed, failed, retrying
  progress_percent INT DEFAULT 0,
  total_items INT DEFAULT 0,
  processed_items INT DEFAULT 0,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ai_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.ai_jobs(id) ON DELETE CASCADE,
  prompt TEXT,
  response TEXT,
  tokens_used INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) DEFAULT 0,
  provider_id VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash VARCHAR(64) NOT NULL UNIQUE,
  task_type VARCHAR(100) NOT NULL,
  response_json JSONB NOT NULL,
  provider_id VARCHAR(50),
  hit_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Question Embeddings & Quality Scoring
CREATE TABLE IF NOT EXISTS public.question_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  statement_text TEXT NOT NULL,
  embedding_vector REAL[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  overall_score INT DEFAULT 85, -- 0 to 100
  grammar_score INT DEFAULT 90,
  formatting_score INT DEFAULT 85,
  duplicate_risk_pct INT DEFAULT 0,
  explanation_quality_score INT DEFAULT 80,
  category_confidence_score INT DEFAULT 90,
  flagged_for_manual_review BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Approval Queue & Repository Rules
CREATE TABLE IF NOT EXISTS public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
  statement TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  subject VARCHAR(100),
  topic VARCHAR(100),
  subtopic VARCHAR(100),
  difficulty VARCHAR(50) DEFAULT 'medium',
  company VARCHAR(100),
  department VARCHAR(100),
  question_type VARCHAR(50) DEFAULT 'mcq_single',
  tags TEXT[] DEFAULT '{}',
  assigned_repository VARCHAR(100) DEFAULT 'General Aptitude',
  quality_score INT DEFAULT 85,
  duplicate_score_pct INT DEFAULT 0,
  duplicate_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  ai_confidence_pct INT DEFAULT 92,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, merged
  admin_comments TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.repository_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_name VARCHAR(100) NOT NULL UNIQUE,
  subject_keywords TEXT[] DEFAULT '{}',
  topic_keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.repository_rules (repository_name, subject_keywords, topic_keywords)
VALUES
  ('Programming & Data Structures', ARRAY['c++', 'cpp', 'java', 'python', 'javascript', 'dsa', 'arrays', 'trees', 'graphs'], ARRAY['pointers', 'recursion', 'sorting', 'stack', 'queue']),
  ('DBMS & SQL', ARRAY['dbms', 'sql', 'database', 'queries'], ARRAY['joins', 'normalization', 'transactions', 'keys']),
  ('Operating Systems & Networks', ARRAY['operating systems', 'os', 'computer networks', 'networking'], ARRAY['process', 'deadlock', 'memory', 'tcp/ip', 'dns']),
  ('Aptitude & Logical Reasoning', ARRAY['aptitude', 'reasoning', 'quants', 'verbal'], ARRAY['percentages', 'ratios', 'puzzles', 'syllogisms'])
ON CONFLICT (repository_name) DO UPDATE SET is_active = true;

-- 7. Audit & Processing Logs
CREATE TABLE IF NOT EXISTS public.processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  level VARCHAR(20) DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  statement TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  modified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_rules ENABLE ROW LEVEL SECURITY;

-- Service role & public access policies
CREATE POLICY "Allow public read access to active ai_providers" ON public.ai_providers FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to datasets" ON public.datasets FOR ALL USING (true);
CREATE POLICY "Allow admin full access to approval_queue" ON public.approval_queue FOR ALL USING (true);
