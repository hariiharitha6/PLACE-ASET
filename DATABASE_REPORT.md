# Database Schema & Performance Indexing Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** Database Architecture, Migrations & RLS Policies  
**Date:** July 22, 2026  

---

## 1. Migration Log

| Migration File | Primary Responsibility |
| :--- | :--- |
| `001_create_core.sql` | Users, Colleges, Departments, Core Schemas |
| `002_create_questions.sql` | Question Bank, Repositories, MCQ Options |
| `003_create_challenges.sql` | Challenges, Contests, Submissions |
| `004_create_remaining.sql` | Practice sessions, Notifications, Resources |
| `005_create_rls_policies.sql` | Base Row Level Security Policies |
| `006_auth_user_management.sql` | User Profiles & Auth Hooks |
| `007_question_bank_extensions.sql` | Repositories & Quality Scoring |
| `008_module2_and_ai_engine.sql` | AI Processing Jobs & Queue |
| `015_enterprise_admin_and_host_portal.sql` | Admin Audit Logs & Host Portals |
| `016_enterprise_rbac_and_portals.sql` | Roles, Designations, Permissions, Requests |
| `017_module2_enterprise_complete.sql` | Permission Logs, Expiry, Student Privacy RLS |

---

## 2. Student Privacy RLS Function

```sql
CREATE OR REPLACE FUNCTION public.check_can_view_student_profile(target_student_id UUID)
RETURNS BOOLEAN AS $$
...
```
Restricts student profile access strictly to Self (Student), Placement Cell, HOD (own dept), Principal, College Admin, and Super Admin.
