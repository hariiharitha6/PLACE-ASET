# PLACE@ASET — Comprehensive Testing & Quality Assurance Checklist

This QA checklist validates end-to-end functionality, security, multi-tenant isolation, and UX compliance across all modules and user personas of **PLACE@ASET**.

---

## 1. Authentication & Role-Based Access Control (RBAC)

- [ ] **Student Registration**: Register with college selection, verify account creation in Supabase `users` table.
- [ ] **Faculty Registration**: Register as faculty; confirm account is placed in pending approval queue.
- [ ] **Login with Valid Credentials**: Confirm JWT tokens generated; refresh token stored in HTTP-only cookie.
- [ ] **Login with Invalid Credentials**: Confirm user-friendly error message; no stack trace leaked.
- [ ] **Route Protection**: Attempt accessing `/admin/dashboard` as a student; verify redirect to unauthorized page with option to return.
- [ ] **Multi-Tenant Isolation**: Confirm a student from College A cannot view questions, challenges, or events belonging to College B via API or direct URL.

---

## 2. Student Experience & Core Workflows

### 2.1 Dashboard & "Your Next Step" Engine
- [ ] **New Student State**: On zero practice history, dashboard displays "Start Your First Practice".
- [ ] **First Visit Welcome Toast**: Verify a single non-intrusive toast welcomes the student on their first visit, dismissed and recorded in `localStorage`.
- [ ] **Unfinished Session Detection**: Start an arena practice, close the browser without finishing; verify "Continue Your Practice Session" appears on dashboard reload.
- [ ] **Weak Topic Diagnostic**: When practice accuracy on a topic falls below 60%, verify "Your Next Step" recommends that specific topic by name.
- [ ] **Zero Jargon Audit**: Verify no database IDs, table names, or raw errors appear in any dashboard card.

### 2.2 Practice Arena
- [ ] **Mode Selection**: Verify all 8 modes initialize properly:
  - [ ] Technical Practice
  - [ ] Logical Reasoning
  - [ ] Quantitative Aptitude
  - [ ] Verbal Ability
  - [ ] Adaptive Practice
  - [ ] Mixed Practice
  - [ ] Company Specific
  - [ ] Department Specific
- [ ] **Practice Evaluation**: Submit correct and incorrect answers; verify XP points increment and explanations render.
- [ ] **Bookmarking**: Bookmark a question in the arena; verify it appears in `/practice/bookmarks`.
- [ ] **Empty State**: Verify empty history displays `EmptyState` component with CTA to select a mode.

### 2.3 Resources & Bookmarks
- [ ] **Resource Browsing**: Filter by Category, Department, and Placement tracks.
- [ ] **Resource Bookmarking**: Bookmark a study guide; confirm it appears in `/resources/bookmarks`.
- [ ] **Empty Bookmark State**: With zero bookmarks, confirm `EmptyState` renders with "Browse Resources" button.

### 2.4 Personal Learning Studio
- [ ] **Document Upload**: Paste raw text or upload text content; verify record created in `personal_documents`.
- [ ] **AI Summarization**: Verify summary generation completes without client-side error.
- [ ] **AI Flashcard Generation**: Flip cards, verify questions and answers match the uploaded material.
- [ ] **AI Quiz Generation**: Attempt the quiz questions; check scoring accuracy.
- [ ] **Empty State**: For a new user with 0 documents, verify `EmptyState` component renders with "Upload Material" CTA.

### 2.5 Academic Calendar & Schedule
- [ ] **Event Creation**: Add an event with title, date, and category (Drive, Exam, Contest).
- [ ] **AI Study Plan**: Trigger AI study plan generator; verify suggested timetable renders.
- [ ] **Empty State**: Clear all events; verify clean `EmptyState` appears with "Add Event" CTA.

### 2.6 Placement Readiness Diagnostic
- [ ] **Telemetry Calculation**: Verify score updates dynamically based on practice accuracy.
- [ ] **Company Eligibility**: Verify qualifying companies show green checkmarks and non-qualifying show unmet criteria.

### 2.7 AI Resume Builder
- [ ] **Form Population**: Enter education, skills, projects, and work experience.
- [ ] **AI ATS Scoring**: Run ATS evaluator; verify keyword suggestions and numerical score return.
- [ ] **PDF Export**: Click Print/Save PDF; verify layout is clean, single-column, and formatted.

### 2.8 AI Interview Simulator
- [ ] **Audio/Speech Input**: Test microphone input; confirm spoken answers are transcribed.
- [ ] **Evaluation Rubric**: Complete mock questions; verify feedback on clarity, technical accuracy, and completeness.

### 2.9 Weekly Challenges & Contests
- [ ] **Contest Registration**: Register for an active challenge; verify entry in `challenge_registrations`.
- [ ] **Timer & Auto-Submit**: Let contest timer expire; verify answers automatically submit.
- [ ] **Leaderboard**: Verify score is calculated and leaderboard rank updates.

### 2.10 Certificates & Achievements
- [ ] **Sync Achievements**: Click "Check & Unlock Badges"; confirm newly qualified achievements unlock.
- [ ] **Empty State**: Verify `EmptyState` renders on zero unlocked badges and zero earned certificates.

---

## 3. Faculty Workflows

- [ ] **Faculty Dashboard**: Verify metrics for assigned courses, student counts, and pending approvals.
- [ ] **Question Contribution**: Author a new MCQ; verify it saves to `questions` table with proper category and college ID.
- [ ] **Assignment Creation**: Create an assignment with start/due date and question list.
- [ ] **Student Oversight**: Search student directory by department; view individual student readiness index.

---

## 4. HOD & Principal Portals

- [ ] **HOD Dashboard**: Verify departmental pass rates, topic weakness distribution, and faculty stats load.
- [ ] **Principal Dashboard**: Verify multi-department comparative graphs and overall college placement readiness index.

---

## 5. TPO / Placement Cell Portal

- [ ] **Drive Management**: Create a campus placement drive with criteria (minimum CGPA, allowed departments).
- [ ] **Candidate Shortlist Filter**: Apply filters; verify eligible students are correctly calculated.
- [ ] **Export Shortlist**: Verify CSV/Excel export generates accurate candidate data.

---

## 6. Administration & Multi-Tenant Setup

- [ ] **User Approvals**: Admin approves pending faculty registration; verify role transition.
- [ ] **Department Configuration**: Add and rename college departments.
- [ ] **Multi-College Provisioning (Host)**: Host creates new college tenant; verify unique `college_id` is assigned and schema isolation holds.

---

## 7. Responsive Design & Accessibility

- [ ] **Mobile Viewport (375px - 480px)**:
  - [ ] Mobile navigation drawer opens, closes, and navigates properly.
  - [ ] NextStepCard, KPI tiles, and Arena controls stack vertically without horizontal overflow.
- [ ] **Tablet Viewport (768px - 1024px)**:
  - [ ] Sidebar collapses appropriately or presents clean toggle.
  - [ ] Grid components reflow into 2-column layouts.
- [ ] **Desktop Viewport (1280px+)**:
  - [ ] Grouped navigation sidebar renders with LEARN, PROGRESS, CONNECT, CAREER headers.
- [ ] **Reduced Motion**:
  - [ ] Enable `prefers-reduced-motion: reduce` in system settings; verify transitions and spinner animations are suppressed.
- [ ] **Color Contrast**: Verify all text elements meet WCAG 2.1 AA minimum contrast standards.
