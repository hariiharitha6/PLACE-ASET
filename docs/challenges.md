# Weekly Challenge Engine Documentation

This document describes the design, execution workflows, automatic evaluations, and security designs implemented for the **Weekly Challenge Engine (Module 5)**.

---

## 🏗️ Schema & Database Design

To support timed quiz attempts and discussions, the database relies on [003_create_challenges.sql](file:///c:/Users/harii/Downloads/PLACE@ASET/supabase/migrations/003_create_challenges.sql) and [008_challenge_discussions.sql](file:///c:/Users/harii/Downloads/PLACE@ASET/supabase/migrations/008_challenge_discussions.sql).

### 1. Database Entities
- `challenges`: Challenge configurations (duration, schedules, passing percentage, instructions).
- `challenge_questions`: Questions assigned with sort orders and score weights.
- `challenge_registrations`: Attempt session logs (start time, end time, completeness).
- `submissions`: Solved answers list, storing selected options and computed points.
- `anti_cheat_events`: Activity audit trail logs (e.g. window blur, tab hidden events).
- `leaderboard_entries`: Aggregated final scores, accuracies, time spent, and ranks.
- `challenge_discussions` [NEW]: comment board supporting replies.

---

## 🌓 Access Scopes (RBAC)

- **Admin/Host Actions** (`super_admin`, `college_admin`, `host`): Full access to create, edit, delete, publish, assign questions, and review activity audits.
- **Candidate Actions** (`student`): Can view list of published challenges, start a timed active challenge session, auto-save answers, submit, and review leaderboard results/walkthrough solution sheets once finalized.

---

## 🔌 API Reference

Endpoints are secured behind `verifyJWT`.

| Endpoint | Method | Description | Roles Allowed |
|---|---|---|---|
| `/api/v1/challenges` | `GET` | Lists challenges (status-filtered) | All |
| `/api/v1/challenges/:id` | `GET` | Challenge details | All |
| `/api/v1/challenges/:id/start` | `POST` | Initiates timed session, loads questions | Students |
| `/api/v1/challenges/:id/answers` | `POST` | Auto-saves answer progress | Students |
| `/api/v1/challenges/:id/finalize` | `POST` | Finalizes grading and updates leaderboard | Students |
| `/api/v1/challenges/:id/activity` | `POST` | Logs suspicious tab switch action | Students |
| `/api/v1/challenges/:id/results` | `GET` | Retrieves score and leaderboard | All |
| `/api/v1/challenges/:id/discussions` | `GET` | Fetches comment logs | All |
| `/api/v1/challenges/:id/discussions` | `POST` | Posts discussion comment | All |
| `/api/v1/challenges` | `POST` | Creates challenge | Admins / Hosts |
| `/api/v1/challenges/:id` | `PUT` | Updates challenge configs | Admins / Hosts |
| `/api/v1/challenges/:id` | `DELETE` | Removes challenge | Admins / Hosts |
| `/api/v1/challenges/:id/clone` | `POST` | Clones a challenge base copy | Admins / Hosts |
| `/api/v1/challenges/:id/questions` | `POST` | Assigns questions to challenge | Admins / Hosts |

---

## 🧩 Frontend UI Layouts

Located inside `src/app/(dashboard)/challenges/`:
1. **Challenges List** (`/challenges`): Cards panel listing draft, live, and ended tests.
2. **Details & Info** (`/challenges/[id]`): Displays syllabus instructions and starts the test.
3. **Competition Arena** (`/challenges/[id]/arena`): Timed full screen quiz interface. Monitors window focus and blurs, auto-saving every 30 seconds.
4. **Leaderboard & Ranks** (`/challenges/[id]/results`): Score reports and ranks.
5. **Walkthrough Solution** (`/challenges/[id]/solutions`): Post-exam answers overview and comment columns.
6. **Form Editors** (`new/`, `[id]/edit/`, `[id]/questions/`): Configures questions lists and schedules.
