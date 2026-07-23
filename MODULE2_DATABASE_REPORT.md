# Module 2 Database & Schema Verification Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Module:** Module 2 Database Architecture  
**Database Provider:** Supabase / PostgreSQL  

---

## 1. Schema Tables Audit & Status

| Table Name | Description | RLS Policy Status | Primary Key | Migration Source |
| :--- | :--- | :--- | :--- | :--- |
| `users` | User accounts and role claims (`student`, `host`, `faculty`, `college_admin`, `super_admin`). | ENABLED | UUID | `001_create_core.sql` |
| `datasets` | Uploaded dataset metadata, uploader reference, question counts, and processing state. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `dataset_files` | File storage references, file size, format, and OCR status. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `approval_queue` | Candidate question moderation queue with AI quality scores and duplicate percentages. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `questions` | Published global question repository. | ENABLED | UUID | `002_create_questions.sql` |
| `question_embeddings` | Statement vector representations for semantic duplicate search. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `question_quality_scores` | Granular AI quality ratings (Grammar, Formatting, Clarity, Duplicate Risk). | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `repository_rules` | Automated topic and keyword routing rules. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `ai_providers` | Registered multi-provider configurations and health metadata. | ENABLED | VARCHAR(50) | `008_module2_and_ai_engine.sql` |
| `ai_provider_settings` | Task-based AI model routing and fallback assignments. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `ai_prompt_templates` | System prompt library with version control and variable schemas. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `ai_jobs` | Asynchronous background worker job queue tracking progress (0-100%). | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `ai_job_logs` | Per-call AI execution telemetry (tokens, latency ms, estimated cost USD). | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `ai_cache` | SHA-256 prompt response caching for latency & cost optimization. | ENABLED | UUID | `008_module2_and_ai_engine.sql` |
| `admin_audit_logs` | Immutable audit trail for all administrative actions and security mutations. | ENABLED | UUID | `015_enterprise_admin_and_host_portal.sql` |

---

## 2. Row Level Security & Performance Tuning

- **RLS Enforcement**: All 15 Module 2 tables have Row Level Security enabled.
- **Service Role Bypass**: Admin controller operations utilize `getSupabaseAdmin()` (service role client) to perform authorized system operations while enforcing Express RBAC middleware.
- **Indexes**: Performance indexes created on `idx_audit_logs_email`, `idx_audit_logs_action`, `idx_audit_logs_created`, `idx_companies_name`, and `idx_questions_difficulty`.
