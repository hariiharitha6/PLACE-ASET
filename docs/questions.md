# Question Bank Management System Documentation

This document describes the design, routing structures, validation schemas, frontend interfaces, and API controllers implemented for the **Question Bank Management System (Module 4)**.

---

## 🏗️ Schema & Database Design

To support weekly challenges, practice arena queries, and company specific tags, we extended the database schemas using migration [007_question_bank_extensions.sql](file:///c:/Users/harii/Downloads/PLACE@ASET/supabase/migrations/007_question_bank_extensions.sql).

### 1. Extended PostgreSQL Types
- `question_type`: Extended to include `'fill_in_the_blank'`, `'descriptive'`, `'image_based'`, `'code_snippet_mcq'`.
- `difficulty_level`: Extended to include `'expert'`.

### 2. Base & Junction Tables
- `questions`: Holds basic statement, explanation, difficulty, type, approval status, visibility, and version counter.
- `question_options`: Child rows linking option labels (A, B, C) and contents to parent questions.
- `question_tags`: Junction mapping questions to search tags.
- `question_departments` [NEW]: Junction mapping questions to academic departments (e.g. CSE, ECE).
- `company_questions`: Junction mapping questions to placement companies (e.g. Amazon, TCS).
- `question_versions`: Snapshot log entries storing previous statements, options, and author/change reason parameters.

---

## 🌓 Security & Access Controls (RBAC)

RBAC permissions are enforced in both database RLS policies and backend routers:
- **Admin/Host Actions** (`super_admin`, `college_admin`, `host`): Full CRUD capabilities (create, edit, delete, archive, restore, and clone questions).
- **Candidate Actions** (`student`): Can only read questions where `approval_status = 'approved'` and visibility checks (`public` OR `college` matching their college id) succeed.

---

## 🔌 API Reference

Protected endpoints require a Bearer token in the `Authorization` header.

| Endpoint | Method | Description | Roles Allowed |
|---|---|---|---|
| `/api/v1/questions` | `GET` | Paginated search and filtering of questions | All |
| `/api/v1/questions/:id` | `GET` | Details of a single question | All |
| `/api/v1/questions/random` | `GET` | Randomized question selection | All |
| `/api/v1/questions/statistics` | `GET` | Question bank breakdown metrics | All |
| `/api/v1/questions/:id/history` | `GET` | Edit versions log list | Admins / Hosts |
| `/api/v1/questions` | `POST` | Creates a new question in the bank | Admins / Hosts |
| `/api/v1/questions/:id` | `PUT` | Updates question details and saves previous version | Admins / Hosts |
| `/api/v1/questions/:id` | `DELETE` | Deletes a question completely | Admins / Hosts |
| `/api/v1/questions/:id/archive` | `PUT` | Archives a question (`is_archived = true`) | Admins / Hosts |
| `/api/v1/questions/:id/restore` | `PUT` | Restores an archived question | Admins / Hosts |
| `/api/v1/questions/:id/clone` | `POST` | Clones a copy of the question | Admins / Hosts |

---

## 🧩 Frontend UI Structures

Routes are nested inside the responsive route group `(dashboard)`:
1. **Questions List** (`/questions`): Full-page table listing bank entries with search bars, filters (category, type, difficulty, department, company), and pagination.
2. **Details & History** (`/questions/[id]`): Renders full question preview (correct answers, explanations) and lists version history.
3. **Creation Form** (`/questions/new`): Mounts the `QuestionForm` editor component.
4. **Editor Form** (`/questions/[id]/edit`): Mounts form pre-filled with the loaded question state.
