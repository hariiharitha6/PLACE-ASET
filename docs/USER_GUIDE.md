# PLACE@ASET — Official User Guide

Welcome to the official user documentation for **PLACE@ASET**, an enterprise-grade AI-powered campus learning, placement readiness, and assessment orchestration platform.

---

## Table of Contents

1. [Introduction & Platform Mission](#1-introduction--platform-mission)
2. [User Roles & Permissions Matrix](#2-user-roles--permissions-matrix)
3. [Authentication & Account Lifecycle](#3-authentication--account-lifecycle)
4. [The Student Experience](#4-the-student-experience)
   - [4.1 Student Command Center & Dashboard](#41-student-command-center--dashboard)
   - [4.2 "Your Next Step" Autonomous Recommendation Engine](#42-your-next-step-autonomous-recommendation-engine)
   - [4.3 Placement Practice Arena](#43-placement-practice-arena)
   - [4.4 Curated Resource Hub & Bookmarks](#44-curated-resource-hub--bookmarks)
   - [4.5 AI Personal Learning & Career Mentor](#45-ai-personal-learning--career-mentor)
   - [4.6 Personal Learning Mode & Private Studio](#46-personal-learning-mode--private-studio)
   - [4.7 Academic Calendar & AI Study Plan Generator](#47-academic-calendar--ai-study-plan-generator)
   - [4.8 Placement Readiness Diagnostic & AI Telemetry](#48-placement-readiness-diagnostic--ai-telemetry)
   - [4.9 Performance Analytics & Heatmap](#49-performance-analytics--heatmap)
   - [4.10 Weekly Coding Challenges & Contests](#410-weekly-coding-challenges--contests)
   - [4.11 Digital Credentials & Verifiable Certificates](#411-digital-credentials--verifiable-certificates)
   - [4.12 ATS-Optimized AI Resume Builder](#412-ats-optimized-ai-resume-builder)
   - [4.13 Conversational AI Interview Simulator](#413-conversational-ai-interview-simulator)
   - [4.14 Community Forum & Peer Collaboration](#414-community-forum--peer-collaboration)
   - [4.15 Notification Center](#415-notification-center)
5. [Faculty Features & Academic Workflows](#5-faculty-features--academic-workflows)
   - [5.1 Faculty Command Dashboard](#51-faculty-command-dashboard)
   - [5.2 Question Bank Contribution & Moderation](#52-question-bank-contribution--moderation)
   - [5.3 Assignment & Assessment Creation](#53-assignment--assessment-creation)
   - [5.4 Student Progress Oversight](#54-student-progress-oversight)
6. [Department Head (HOD) & Principal Dashboards](#6-department-head-hod--principal-dashboards)
7. [Training & Placement Officer (TPO) Portal](#7-training--placement-officer-tpo-portal)
8. [Administration & Multi-Tenant Provisioning](#8-administration--multi-tenant-provisioning)
9. [Accessibility, Theming & Performance](#9-accessibility-theming--performance)
10. [Troubleshooting & Frequently Asked Questions](#10-troubleshooting--frequently-asked-questions)
11. [Glossary of Platform Terms](#11-glossary-of-platform-terms)

---

## 1. Introduction & Platform Mission

**PLACE@ASET** is designed to bridge the gap between academic engineering curriculums and top-tier campus placement requirements.

By uniting adaptive practice testing, personalized AI mentorship, multi-modal document synthesis, placement telemetry, and faculty assessment tools into a unified dark-mode web application, PLACE@ASET ensures that every student knows:
1. **Where they stand** in their placement preparation journey.
2. **What actions they can take right now** to strengthen their competencies.
3. **What their immediate next priority is** based on real-time diagnostic performance.

---

## 2. User Roles & Permissions Matrix

The platform implements multi-tenant, role-based access control (RBAC) enforced by PostgreSQL Row-Level Security (RLS) policies and JWT middleware.

| Role Code | Role Name | Primary Route | Scope & Capabilities |
|---|---|---|---|
| `student` | Student Learner | `/dashboard` | Practice tests, AI study studio, challenges, community, resumes, certificates, and personal telemetry. |
| `faculty` | Faculty Member | `/faculty/dashboard` | Course assignments, question authoring, student performance monitoring, and content approvals. |
| `hod` | Head of Department | `/hod/dashboard` | Departmental performance heatmaps, curriculum mapping, and faculty oversight. |
| `principal` | College Principal | `/principal/dashboard` | Institutional readiness telemetry, inter-departmental benchmarking, and accreditation KPIs. |
| `placement_cell` | TPO / Placement Officer | `/placement/dashboard` | Placement drives, eligibility criteria filtering, student shortlisting, and hiring analytics. |
| `college_admin` | Institutional Admin | `/admin/dashboard` | User approvals, department configurations, college question banks, and audit logging. |
| `super_admin` / `host` | Platform Administrator | `/super-admin/dashboard` | Multi-college provisioning, global tenant isolation, API key rotation, and system health. |

---

## 3. Authentication & Account Lifecycle

### 3.1 Registration & College Association
1. Navigate to `/register`.
2. Select your institutional college from the provisioned tenant dropdown.
3. Enter your full name, institutional email address, department, roll number / faculty ID, and password.
4. Upon submission:
   - **Student accounts** are registered with immediate access or subject to institutional email domain verification.
   - **Faculty and administrative accounts** enter a pending approval state awaiting confirmation from the `college_admin`.

### 3.2 Login & Session Security
- Navigate to `/login`.
- Authentication uses secure, signed JSON Web Tokens (JWT). An access token is returned in memory/auth state and refresh tokens are stored in secure HTTP-only cookies.
- Unauthorized access triggers immediate redirection to `/login` with clean return URL preserves.

### 3.3 Profile Setup & Settings
- Access your profile settings anytime at `/settings`.
- Update your bio, target company dream roles, technical skills tags, notification preferences, and password.

---

## 4. The Student Experience

### 4.1 Student Command Center & Dashboard (`/dashboard`)
When logging in as a student, the Command Center immediately provides an operational overview:
- **Greeting & Active Streak**: Displays your consecutive daily practice streak (`current_streak`) with milestone indicators.
- **Focus Command Card**: An instant one-click card showing active goal targets and direct resumption links.
- **Telemetry KPIs**: Live counters for total practice sessions completed, coding challenges entered, current college rank, and placement readiness index.
- **Core Learning Tracks**: Direct launchpads into Data Structures, DBMS & SQL, Operating Systems, and Quantitative Aptitude.

### 4.2 "Your Next Step" Autonomous Recommendation Engine
Located directly below the Focus Card, **Your Next Step** dynamically computes your highest-impact action using real database records.

**Guiding Principles:**
- **Zero Technical Jargon**: Never displays database IDs, SQL names, or internal flags.
- **WHAT & WHY Clarity**: Explains in plain English what to do and exactly why it is recommended.
- **Single Dominant CTA**: Highlights one clear button to take action in 3 seconds.

**Evaluation Priority Order:**
1. **Profile Completion**: Missing department or roll number prompts profile finalization.
2. **Unfinished Practice Session**: Automatically detects if an open session exists (`ended_at IS NULL`) and provides a "Continue Practice" link.
3. **First-Time Practice**: If 0 sessions have been completed, guides the student directly into the Arena.
4. **Weak Topic Review**: Identifies topics with accuracy under 60% in `practice_statistics.weak_topics` and recommends targeted drills.
5. **Upcoming Contests**: Recommends registering for newly published college coding challenges.
6. **Study Material Upload**: Recommends uploading personal notes to the Private Studio if none exist.
7. **Unread Notifications**: Alerts when 5 or more unread faculty or challenge notifications accumulate.
8. **Streak Preservation**: Encourages a quick practice drill when a multi-day streak is active.
9. **Caught-Up State**: Recommends exploring community topics when all immediate tasks are complete.

### 4.3 Placement Practice Arena (`/practice`)
The practice module tests problem-solving speed and conceptual mastery across 8 dedicated practice modes:

1. **Technical Practice**: Data structures, algorithms, operating systems, networking, and DBMS.
2. **Logical Reasoning**: Puzzles, pattern recognition, number sequences, and syllogisms.
3. **Quantitative Aptitude**: Arithmetic, algebra, probability, and data interpretation.
4. **Verbal Ability**: English grammar, vocabulary, sentence correction, and reading comprehension.
5. **Adaptive Practice**: Automatically selects questions matching your current skill level, targeting medium and weak areas.
6. **Mixed Practice**: A cross-topic randomized blend simulating full campus aptitude exams.
7. **Company Specific**: Tailored practice question sets matching hiring patterns of specific recruiters (e.g., TCS, Infosys, Cognizant, Wipro).
8. **Department Specific**: Curriculum-aligned question banks curated by your institution's faculty.

**Arena Capabilities:**
- Real-time timer with optional timed modes.
- Instant answer evaluation with clear explanations and complexity insights.
- Bookmark questions during review for later practice.
- Question flag reporting for invalid questions or typos.

### 4.4 Curated Resource Hub & Bookmarks (`/resources`)
- Central repository for faculty-approved textbooks, interview prep cheat sheets, curated video playlists, and question archives.
- **Filter Tabs**: Filter by *Featured*, *Recently Added*, *Most Viewed*, *Department*, and *Placement*.
- **Personal Bookmarks**: Access `/resources/bookmarks` to quickly review all saved learning materials.

### 4.5 AI Personal Learning & Career Mentor (`/mentor`)
- A 24/7 interactive conversational assistant powered by Google Gemini.
- Context-aware assistance grounded in your actual curriculum, personal documents, and practice history.
- Use suggested prompts for DSA explanations, mock interview questions, or debugging advice.

### 4.6 Personal Learning Mode & Private Studio (`/personal`)
- Upload lecture slides, class notes, or syllabus PDFs.
- The AI extraction engine parses the text and automatically generates:
  - **Executive Summaries**: High-yield key concepts and takeaways.
  - **Interactive Flashcards**: Digital flip-cards with spaced-repetition prompts.
  - **Practice Quizzes**: Multiple-choice diagnostic questions grounded strictly in your uploaded text.

### 4.7 Academic Calendar & AI Study Plan Generator (`/calendar`)
- Unified timeline integrating college placement drives, assignment deadlines, coding challenges, and exam schedules.
- **AI Study Plan Generator**: Click *Generate AI Study Plan* to formulate a personalized daily or weekly revision schedule based on your weak practice areas and upcoming deadlines.

### 4.8 Placement Readiness Diagnostic (`/dashboard/readiness`)
- A comprehensive placement readiness diagnostic scoring your employability from 0 to 100.
- **Component Breakdown**:
  - Technical Core Score (DSA, OS, DBMS)
  - Quantitative & Logical Aptitude Score
  - Verbal Communication Score
  - Mock Interview Evaluation Score
- **Company Eligibility Matrix**: Real-time checklist indicating which visiting campus recruiters you currently qualify for based on CGPA and readiness scores.

### 4.9 Performance Analytics & Heatmap (`/analytics`)
- Visual performance telemetry including:
  - 365-day practice activity heatmap.
  - Domain & topic accuracy progress bars.
  - Difficulty distribution analysis (Easy / Medium / Hard).
  - Weekly XP accumulation metrics.

### 4.10 Weekly Coding Challenges (`/challenges`)
- Timed competitive coding and MCQ assessments hosted by your college or placement cell.
- Live campus leaderboards, automated code execution, test-case verification, and post-contest solution discussions.

### 4.11 Digital Credentials & Verifiable Certificates (`/certificates`)
- Cryptographically verifiable digital credentials awarded for:
  - Scoring top percentiles in college challenges.
  - Completing faculty placement training tracks.
  - Maintaining 30+ day practice streaks.
- Includes unique verification IDs and direct PDF download options.

### 4.12 ATS-Optimized AI Resume Builder (`/resume`)
- Built specifically for engineering undergraduates.
- Select from clean, ATS-compliant single-column templates.
- **AI ATS Scoring**: Scans your resume against real job descriptions, highlights missing keywords, and recommends phrasing improvements.
- Export directly to formatted PDF or raw text.

### 4.13 Conversational AI Interview Simulator (`/interview-prep`)
- Realistic mock interview simulations covering:
  - Technical Core (DSA, System Design, OOP)
  - HR & Behavioral Questions (STAR format evaluation)
  - Department Specific Fundamentals
- Features voice/speech-to-text input, real-time response transcription, and automated rubric scoring on confidence, correctness, and completeness.

### 4.14 Community Forum (`/community`)
- Collaborative campus forum where students and faculty interact.
- Post questions with markdown and syntax-highlighted code snippets.
- Upvote helpful answers, mark accepted solutions, and filter by trending or unanswered topics.

### 4.15 Notification Center (`/notifications`)
- Categorized in-app alerts for challenge launches, faculty announcements, community mentions, and system updates.
- One-click *Mark All as Read* capability.

---

## 5. Faculty Features & Academic Workflows

### 5.1 Faculty Command Dashboard (`/faculty/dashboard`)
- Overview of enrolled students, active assignments, question submission statuses, and class performance averages.

### 5.2 Question Bank Contribution & Moderation (`/faculty/questions`)
- Create multiple-choice or coding questions mapped to specific departments, subjects, and difficulty tiers.
- Review student-submitted questions in the moderation queue before publishing them to the college-wide Question Bank.

### 5.3 Assignment & Assessment Creation (`/faculty/assignments`)
- Build timed assignments with custom question sets or randomized pools.
- Set start/end submission windows and auto-grading rubrics.

### 5.4 Student Progress Oversight (`/faculty/students`)
- Search student profiles, monitor individual practice logs, view diagnostic readiness scores, and identify at-risk candidates needing academic intervention.

---

## 6. Department Head (HOD) & Principal Dashboards

### 6.1 Head of Department Dashboard (`/hod/dashboard`)
- Real-time departmental metrics: average student readiness index, faculty assignment coverage, and topic weakness distributions across semesters.

### 6.2 Principal Dashboard (`/principal/dashboard`)
- Executive institution-wide dashboard benchmarking departmental placement readiness.
- Provides accreditation telemetry, company qualification statistics, and institutional performance summaries.

---

## 7. Training & Placement Officer (TPO) Portal

Accessible at `/placement/dashboard`:
- **Placement Drive Management**: Schedule on-campus and virtual recruitment drives.
- **Candidate Filtering**: Filter students by CGPA, backlogs, technical readiness score, and departmental criteria.
- **Shortlist Export**: Download verified candidate eligibility rosters in Excel/CSV formats.
- **Drive Outcome Telemetry**: Track offer letters, median CTC statistics, and hiring conversion rates.

---

## 8. Administration & Multi-Tenant Provisioning

### 8.1 College Admin (`/admin/dashboard`)
- Manage faculty and student approval queues.
- Configure college departments, academic semesters, and campus announcements.

### 8.2 Host & Super Admin (`/super-admin/dashboard`)
- Provision new college instances with dedicated tenant identifiers (`college_id`).
- Monitor system API latency, Supabase connection pool health, and Redis cache performance.

---

## 9. Accessibility, Theming & Performance

- **Reduced Motion**: Automatically honors system `prefers-reduced-motion: reduce` settings by disabling non-essential transitions and animations.
- **Contrast & Hierarchy**: Compliant with WCAG AA standards using an academic dark color palette with high-contrast foreground typography.
- **Responsive Layout**: Fluid experience tailored for desktop monitors, laptop screens, tablets, and mobile smartphones.

---

## 10. Troubleshooting & Frequently Asked Questions

#### Q1: Why does my dashboard say "Start Your First Practice"?
**A**: This recommendation appears automatically until you complete your first practice session in the Practice Arena. As soon as you complete a 10-question set, your dashboard will calculate topic accuracies and personalize future recommendations.

#### Q2: What happens if my session gets interrupted?
**A**: Unfinished practice sessions are safely saved in the database. The "Your Next Step" widget on your dashboard will immediately display a "Continue Your Practice Session" button linking back to your exact arena session.

#### Q3: Why is my Readiness Score at 0?
**A**: The Placement Readiness Index requires assessment data. Solve questions across Technical, Quantitative, and Verbal categories in the Practice Arena to establish your initial score.

#### Q4: How do I verify a certificate?
**A**: Every certificate issued by PLACE@ASET contains a unique Certificate ID and QR code. Anyone can navigate to `/certificates/verify` and enter the ID to confirm authenticity.

---

## 11. Glossary of Platform Terms

- **Arena**: The real-time interactive testing interface where students answer practice questions.
- **ATS (Applicant Tracking System)**: Automated recruiting software evaluated by the AI Resume Builder to score resume keyword match rates.
- **Diagnostic Telemetry**: Algorithmic metrics tracking accuracy, speed, and topic retention.
- **RLS (Row-Level Security)**: PostgreSQL database security mechanism ensuring data remains strictly isolated within each college tenant.
- **Weak Topic**: Any subject category where student accuracy drops below 60% across recent practice attempts.
