# Technical Handoff & Question Intelligence Audit Report

**Date:** 2026-10-07  
**Auditor:** Antigravity Autonomous Technical Pair  
**Baseline Commit:** `1a81af6`  
**Security Commit:** `79d2128`  
**Classification & Safety Commit:** `94daf76`  

---

## 1. Privacy Security Commit

- **Commit Hash:** [`79d2128`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/services/storage.service.ts)
- **Commit Message:** `fix: enforce private personal document storage isolation`
- **Changed File:** [`server/src/services/storage.service.ts`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/services/storage.service.ts)
- **Security Invariants Enforced:**
  1. Personal documents upload strictly to the private `personal-materials` bucket without fallback to `institutional-materials`.
  2. Signed URLs for personal documents are generated strictly from the private `personal-materials` bucket.
  3. Resilient fallback to `institutional-materials` public URL is permanently removed for all personal files.
  4. An explicit privacy guard raises an exception if signed URL generation fails for personal materials, preventing accidental public exposure.
  5. User ownership and Row-Level Security (RLS) isolation are preserved.

---

## 2. Question Classification Script

- **Script Location:** [`server/src/scripts/classify_questions.ts`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/scripts/classify_questions.ts)
- **Execution Command:** `npm run ts-node src/scripts/classify_questions.ts` (or `node -r ts-node/register src/scripts/classify_questions.ts`)
- **Output Artifacts Generated:**
  - JSON Dataset: [`data/question_classification/question_classification.json`](file:///c:/Users/harii/Downloads/PLACE@ASET/data/question_classification/question_classification.json)
  - CSV Dataset: [`data/question_classification/question_classification.csv`](file:///c:/Users/harii/Downloads/PLACE@ASET/data/question_classification/question_classification.csv)
  - Detailed Markdown Audit: [`data/question_classification/question_classification_report.md`](file:///c:/Users/harii/Downloads/PLACE@ASET/data/question_classification/question_classification_report.md)

---

## 3. Classification Counts

Every single question among the 480 questions currently in the remote database (`public.questions`) was deterministically audited against the codebase question banks, institutional seed SQL, and personal document extracts:

| Source Category | Count | Percentage | Provenance & Evidence Basis |
| :--- | :--- | :--- | :--- |
| **VERIFIED_CORE** | **370** | 77.08% | Exact normalized sha256 hash match with the 370 curated repository questions in [`server/src/data/*.ts`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/data/). |
| **INSTITUTIONAL** | **50** | 10.42% | Created by verified faculty accounts (`fac_ids[1..5]`) for master college via [`supabase/seed.sql`](file:///c:/Users/harii/Downloads/PLACE@ASET/supabase/seed.sql) (Mock Technical, Logical, Verbal). |
| **PERSONAL** | **15** | 3.12% | Created by student account (`test_student_flow@aset.ac.in`), with `visibility = 'private'`, `is_global = false`, matching the extracted personal document PDF test dataset. |
| **AI_GENERATED** | **0** | 0.00% | No existing questions have AI provider tags or flags. |
| **UNKNOWN / UNCLASSIFIED** | **45** | 9.38% | Duplicate automated test run questions created under `super_admin` (`00000000-0000-0000-0000-000000000001`) during previous RLS test runs without student ownership or direct FK. |
| **TOTAL** | **480** | 100.00% | Complete inventory audited. |

---

## 4. UNKNOWN Questions Analysis

- **Total UNKNOWN Count:** 45 questions
- **Provenance Finding:**
  The 45 UNKNOWN questions originate from 3 subsequent automated test runs of the 15 personal document aptitude questions executed on `2026-10-06`. Because previous test code bypassed student RLS by resolving the super-admin user ID, these rows were recorded under `created_by: '00000000-0000-0000-0000-000000000001'`.
- **Classification Decision:**
  In accordance with strict priority rules, these questions cannot be classified as `VERIFIED_CORE` (not in the 370 core bank), `INSTITUTIONAL` (not faculty curriculum), or `PERSONAL` (no student ownership). They are flagged as `UNKNOWN` with `verified = false` and `status = 'review'`.
- **Complete List of UNKNOWN Question IDs:**
  Recorded in machine-readable JSON: [`data/question_classification/question_classification.json`](file:///c:/Users/harii/Downloads/PLACE@ASET/data/question_classification/question_classification.json).

---

## 5. Exact Duplicates Count

- **Total Duplicate Instances (Redundant Extra Rows):** 45
- **Distinct Duplicate Content Groups:** 15
- **Description:** Each of the 15 personal document aptitude test questions appears 4 times in the remote database (1 created by student on 2026-10-04 + 3 created under super-admin during test runs on 2026-10-06).

---

## 6. Near Duplicates Count

- **Total Questions with Near-Duplicate Matches (Similarity ≥ 0.85):** 52
- **Description:** Comprises the 50 faculty seed mock questions that share similar repetitive template phrasing ("Mock Logical Question X...", "Mock Technical Question Y..."), plus variations within the personal document question set.

---

## 7. Migration 027 Safety Findings

1. **Risk of Mass Promotion:**  
   The original Migration 027 applied:
   ```sql
   ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'VERIFIED_CORE'
   ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT true
   ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published'
   ```
   Applying this remotely would have instantly promoted all 480 existing rows—including the 45 redundant test runs and private student questions—into official verified, published core questions accessible to all students.
2. **Missing `UNKNOWN` in Enum Check:**  
   The original `CHECK (source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL', 'AI_GENERATED', 'PERSONAL'))` did not accommodate legacy or unclassified questions.
3. **Student Practice Pollution:**  
   Because all 480 existing rows had `approval_status = 'approved'`, setting `verified = true` would cause students to see duplicate test data in their official practice arena.

---

## 8. Exact Changes Made to Migration 027

File: [`supabase/migrations/027_question_intelligence_and_spaced_repetition.sql`](file:///c:/Users/harii/Downloads/PLACE@ASET/supabase/migrations/027_question_intelligence_and_spaced_repetition.sql)

```diff
-  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'VERIFIED_CORE' CHECK (source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL', 'AI_GENERATED', 'PERSONAL')),
-  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT true,
-  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived', 'rejected')),
+  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'UNKNOWN' CHECK (source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL', 'AI_GENERATED', 'PERSONAL', 'UNKNOWN')),
+  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
+  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'review' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived', 'rejected')),
```

In addition, the Row-Level Security policy on `public.questions` was tightened so that students can only select:
```sql
(
  source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL')
  AND verified = true
  AND (status = 'published' OR approval_status = 'approved')
  AND (is_global = true OR college_id = public.current_college_id())
)
OR
(
  source_type = 'PERSONAL'
  AND created_by = auth.uid()
)
```
This guarantees that `UNKNOWN` and unverified questions are never exposed to students.

---

## 9. Validation Results

| Test / Check | Tooling | Result | Details |
| :--- | :--- | :--- | :--- |
| **Backend TypeScript Build** | `tsc` | **PASS (0 errors)** | Clean compilation, types aligned. |
| **Backend Test Suite** | `mocha` via `ts-node` | **PASS (193/193 tests)** | 500ms execution time, 0 failures. |
| **Frontend ESLint** | `next lint` | **PASS (0 warnings, 0 errors)** | Strict code quality compliance. |
| **Frontend Production Build** | `next build` | **PASS (90/90 static routes)** | Complete production artifact generation. |

*Migration 027 was NOT applied remotely yet, in strict accordance with task instructions.*

---

## 10. Explicit Recommendation for the Next Step

1. **Apply Corrected Migration 027 Remotely:**  
   Execute [`supabase/migrations/027_question_intelligence_and_spaced_repetition.sql`](file:///c:/Users/harii/Downloads/PLACE@ASET/supabase/migrations/027_question_intelligence_and_spaced_repetition.sql) in the Supabase remote SQL Editor or CLI.
2. **Execute Targeted Backfill Migration (Optional Post-Step):**  
   Use the machine-readable output in [`data/question_classification/question_classification.json`](file:///c:/Users/harii/Downloads/PLACE@ASET/data/question_classification/question_classification.json) to update the 370 matching core questions to `source_type = 'VERIFIED_CORE', verified = true, status = 'published'` and the 50 faculty seed questions to `source_type = 'INSTITUTIONAL', verified = true, status = 'published'`, while leaving the 45 test runs as `UNKNOWN, verified = false, status = 'review'`.
3. **Clean Up Redundant Test Runs:**  
   Archive or prune the 45 redundant test run questions from `super_admin` after stakeholder sign-off.
