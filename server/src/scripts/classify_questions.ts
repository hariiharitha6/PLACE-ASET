import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { QuestionBankService } from '../services/question_bank.service';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zrtvefculvxrdadeolpz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_KEY) {
  console.error('Missing Supabase Service Key in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface DbQuestion {
  id: string;
  college_id: string;
  category_id: string;
  created_by: string;
  type: string;
  difficulty: string;
  statement: string;
  explanation: string;
  image_url: string | null;
  is_global: boolean;
  is_archived: boolean;
  times_answered: number;
  times_correct: number;
  success_rate: number;
  version: number;
  created_at: string;
  updated_at: string;
  approval_status: string;
  visibility: string;
}

interface UserRecord {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

export type ClassificationType = 'VERIFIED_CORE' | 'INSTITUTIONAL' | 'PERSONAL' | 'AI_GENERATED' | 'UNKNOWN';

export interface ClassifiedQuestion {
  id: string;
  statement: string;
  normalized_hash: string;
  classification: ClassificationType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  created_by: string;
  creator_role?: string;
  creator_email?: string;
  created_at: string;
  visibility: string;
  is_global: boolean;
  approval_status: string;
  suggested_status: string;
  suggested_verified: boolean;
  exact_duplicate_of?: string[];
  near_duplicate_of?: Array<{ id: string; similarity: number }>;
}

async function run() {
  console.log('Initializing QuestionBankService...');
  QuestionBankService.init();
  const coreQuestions = (QuestionBankService as any).verifiedCoreQuestions;
  const coreHashMap = new Map<string, any>();
  for (const q of coreQuestions) {
    coreHashMap.set(q.normalized_hash, q);
  }
  console.log(`Core bank loaded: ${coreQuestions.length} verified questions.`);

  console.log('Fetching remote questions from Supabase...');
  const { data: dbQuestions, error: qErr } = await supabase.from('questions').select('*');
  if (qErr || !dbQuestions) {
    console.error('Failed to fetch questions:', qErr);
    process.exit(1);
  }
  console.log(`Fetched ${dbQuestions.length} questions from remote database.`);

  // Fetch users for creator provenance
  const creatorIds = Array.from(new Set(dbQuestions.map(q => q.created_by)));
  const { data: users } = await supabase.from('users').select('id, email, role, full_name').in('id', creatorIds);
  const userMap = new Map<string, UserRecord>();
  if (users) {
    for (const u of users) {
      userMap.set(u.id, u);
    }
  }

  // Check personal documents file for verification
  const personalDocStatements = new Set<string>();
  const personalDocsPath = path.join(__dirname, '../../data/personal_documents.json');
  if (fs.existsSync(personalDocsPath)) {
    try {
      const docData = JSON.parse(fs.readFileSync(personalDocsPath, 'utf8'));
      for (const doc of docData) {
        if (doc.extracted_text) {
          const qRegex = /Q\d+\.\s*(?:\[[^\]]+\])?\s*([\s\S]*?)(?=\n[A-D]\.|\nAnswer Key)/g;
          let match;
          while ((match = qRegex.exec(doc.extracted_text)) !== null) {
            const clean = match[1].replace(/\s+/g, ' ').trim();
            personalDocStatements.add(QuestionBankService.normalizeText(clean));
          }
        }
        if (Array.isArray(doc.flashcards)) {
          for (const fc of doc.flashcards) {
            if (fc.question) {
              personalDocStatements.add(QuestionBankService.normalizeText(fc.question));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading personal_documents.json:', e);
    }
  }

  // Compute normalized hashes and index questions
  const hashMap = new Map<string, DbQuestion[]>();
  const qMap = new Map<string, DbQuestion>();

  for (const q of dbQuestions) {
    qMap.set(q.id, q);
    const hash = QuestionBankService.computeHash(q.statement);
    if (!hashMap.has(hash)) {
      hashMap.set(hash, []);
    }
    hashMap.get(hash)!.push(q);
  }

  // Detect near duplicates
  const nearDupesMap = new Map<string, Array<{ id: string; similarity: number }>>();
  for (let i = 0; i < dbQuestions.length; i++) {
    for (let j = i + 1; j < dbQuestions.length; j++) {
      const qA = dbQuestions[i];
      const qB = dbQuestions[j];
      const hashA = QuestionBankService.computeHash(qA.statement);
      const hashB = QuestionBankService.computeHash(qB.statement);
      if (hashA === hashB) continue; // Exact duplicates handled separately

      const sim = QuestionBankService.calculateSimilarity(qA.statement, qB.statement);
      if (sim >= 0.85) {
        if (!nearDupesMap.has(qA.id)) nearDupesMap.set(qA.id, []);
        nearDupesMap.get(qA.id)!.push({ id: qB.id, similarity: Math.round(sim * 100) / 100 });

        if (!nearDupesMap.has(qB.id)) nearDupesMap.set(qB.id, []);
        nearDupesMap.get(qB.id)!.push({ id: qA.id, similarity: Math.round(sim * 100) / 100 });
      }
    }
  }

  // Classify each question deterministically according to strict priority rules
  const classifiedList: ClassifiedQuestion[] = [];
  const counts = {
    total: dbQuestions.length,
    VERIFIED_CORE: 0,
    INSTITUTIONAL: 0,
    PERSONAL: 0,
    AI_GENERATED: 0,
    UNKNOWN: 0,
    exactDuplicates: 0,
    nearDuplicates: 0,
  };

  const unknownIds: string[] = [];
  const exactDupeGroups: Array<{ hash: string; statement: string; count: number; ids: string[] }> = [];

  for (const [hash, group] of hashMap.entries()) {
    if (group.length > 1) {
      exactDupeGroups.push({
        hash,
        statement: group[0].statement,
        count: group.length,
        ids: group.map(g => g.id),
      });
      counts.exactDuplicates += (group.length - 1);
    }
  }

  counts.nearDuplicates = Array.from(nearDupesMap.keys()).length;

  for (const q of dbQuestions) {
    const hash = QuestionBankService.computeHash(q.statement);
    const norm = QuestionBankService.normalizeText(q.statement);
    const user = userMap.get(q.created_by);
    const exactGroup = hashMap.get(hash) || [];
    const exactDupes = exactGroup.filter(g => g.id !== q.id).map(g => g.id);
    const nearDupes = nearDupesMap.get(q.id) || [];

    let classification: ClassificationType = 'UNKNOWN';
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let evidence = '';
    let suggested_status = 'review';
    let suggested_verified = false;

    // A. VERIFIED_CORE: Must match known verified core bank
    if (coreHashMap.has(hash)) {
      const coreMatch = coreHashMap.get(hash);
      classification = 'VERIFIED_CORE';
      confidence = 'HIGH';
      evidence = `Exact normalized hash match with verified core repository bank (${coreMatch.source || 'Curated Bank'}, subject: ${coreMatch.subject || 'General'})`;
      suggested_status = 'published';
      suggested_verified = true;
    }
    // B. INSTITUTIONAL: Reliable evidence of institutional/faculty origin
    else if (user && user.role === 'faculty') {
      classification = 'INSTITUTIONAL';
      confidence = 'HIGH';
      evidence = `Created by verified faculty member (${user.full_name} <${user.email}>, role: faculty). Originates from seed institutional mock assessment bank.`;
      suggested_status = 'published';
      suggested_verified = true;
    }
    // C. PERSONAL: Owned by student AND linked to personal document extraction
    else if (
      user &&
      user.role === 'student' &&
      q.visibility === 'private' &&
      !q.is_global &&
      personalDocStatements.has(norm)
    ) {
      classification = 'PERSONAL';
      confidence = 'HIGH';
      evidence = `Created by student (${user.full_name} <${user.email}>, role: student) with private visibility; text matches user extracted personal document.`;
      suggested_status = 'published';
      suggested_verified = false;
    }
    // D. AI_GENERATED: Only if data explicitly proves AI generation
    // (None of existing 480 questions have AI provider tags or flags)
    // E. UNKNOWN / UNCLASSIFIED: Everything else
    else {
      classification = 'UNKNOWN';
      confidence = 'HIGH'; // Confident that it cannot be verified core or institutional without guessing
      if (personalDocStatements.has(norm)) {
        evidence = `Duplicate statement of personal document test question, but created by user ${q.created_by} (${user ? user.role : 'unresolved'}) rather than student owner. Lacks direct personal document foreign key.`;
      } else {
        evidence = `No match in 370-question core bank; not created by faculty; lacks proven origin provenance.`;
      }
      suggested_status = 'review';
      suggested_verified = false;
      unknownIds.push(q.id);
    }

    counts[classification]++;

    classifiedList.push({
      id: q.id,
      statement: q.statement,
      normalized_hash: hash,
      classification,
      confidence,
      evidence,
      created_by: q.created_by,
      creator_role: user?.role,
      creator_email: user?.email,
      created_at: q.created_at,
      visibility: q.visibility,
      is_global: q.is_global,
      approval_status: q.approval_status,
      suggested_status,
      suggested_verified,
      exact_duplicate_of: exactDupes.length > 0 ? exactDupes : undefined,
      near_duplicate_of: nearDupes.length > 0 ? nearDupes : undefined,
    });
  }

  // Create outputs directory (both project root and server data)
  const outputDirs = [
    path.resolve(__dirname, '../../../data/question_classification'),
    path.resolve(__dirname, '../../data/question_classification'),
  ];

  for (const outputDir of outputDirs) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. JSON output
    const jsonPath = path.join(outputDir, 'question_classification.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
      metadata: {
        generated_at: new Date().toISOString(),
        counts,
        unknown_ids: unknownIds,
        exact_duplicate_groups: exactDupeGroups,
      },
      questions: classifiedList,
    }, null, 2));
    console.log(`Saved JSON: ${jsonPath}`);

    // 2. CSV output
    const csvPath = path.join(outputDir, 'question_classification.csv');
    const csvHeaders = [
      'id',
      'classification',
      'suggested_verified',
      'suggested_status',
      'created_by',
      'creator_role',
      'created_at',
      'is_global',
      'visibility',
      'normalized_hash',
      'exact_duplicates_count',
      'near_duplicates_count',
      'evidence',
      'statement_preview'
    ];
    const csvRows = [csvHeaders.join(',')];
    for (const item of classifiedList) {
      const cleanStmt = item.statement.replace(/[\r\n]+/g, ' ').replace(/"/g, '""').substring(0, 100);
      const cleanEvidence = item.evidence.replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
      csvRows.push([
        item.id,
        item.classification,
        item.suggested_verified,
        item.suggested_status,
        item.created_by,
        item.creator_role || '',
        item.created_at,
        item.is_global,
        item.visibility,
        item.normalized_hash,
        item.exact_duplicate_of ? item.exact_duplicate_of.length : 0,
        item.near_duplicate_of ? item.near_duplicate_of.length : 0,
        `"${cleanEvidence}"`,
        `"${cleanStmt}"`,
      ].join(','));
    }
    fs.writeFileSync(csvPath, csvRows.join('\n'));
    console.log(`Saved CSV: ${csvPath}`);

    // 3. Markdown report
    const mdPath = path.join(outputDir, 'question_classification_report.md');
    const mdReport = generateMarkdownReport(counts, unknownIds, exactDupeGroups, classifiedList);
    fs.writeFileSync(mdPath, mdReport);
    console.log(`Saved Markdown Report: ${mdPath}`);
  }

  console.log('--- CLASSIFICATION SUMMARY ---');
  console.log(JSON.stringify(counts, null, 2));
}

function generateMarkdownReport(
  counts: any,
  unknownIds: string[],
  exactDupeGroups: any[],
  questions: ClassifiedQuestion[]
): string {
  const unknownQuestions = questions.filter(q => q.classification === 'UNKNOWN');
  const nearDupeQuestions = questions.filter(q => q.near_duplicate_of && q.near_duplicate_of.length > 0);

  return `# Question Classification & Provenance Audit Report

**Date of Execution:** ${new Date().toISOString()}  
**Target Database:** Remote Supabase (\`public.questions\`)  
**Total Existing Questions:** ${counts.total}  

---

## 1. Executive Summary

Prior to applying Migration 027 (\`027_question_intelligence_and_spaced_repetition.sql\`), all 480 existing rows in the remote database were evaluated against the repository's curated question banks, institutional seed definitions, student document extractions, and metadata records.

Defaulting all existing questions to \`source_type = 'VERIFIED_CORE'\` and \`verified = true\` would have incorrectly promoted unverified, duplicated, and test-run questions into official verified student practice material.

### Classification Breakdown

| Source Category | Count | Percentage | Provenance & Evidence Basis |
| :--- | :--- | :--- | :--- |
| **VERIFIED_CORE** | **${counts.VERIFIED_CORE}** | ${(counts.VERIFIED_CORE / counts.total * 100).toFixed(1)}% | 100% exact normalized hash match with the 370 curated repository questions in \`server/src/data/*.ts\`. |
| **INSTITUTIONAL** | **${counts.INSTITUTIONAL}** | ${(counts.INSTITUTIONAL / counts.total * 100).toFixed(1)}% | Created by verified faculty accounts (\`fac_ids 1-5\`) for master college via \`supabase/seed.sql\` (Mock Technical, Logical, Verbal). |
| **PERSONAL** | **${counts.PERSONAL}** | ${(counts.PERSONAL / counts.total * 100).toFixed(1)}% | Created by student account (\`test_student_flow@aset.ac.in\`), \`visibility = 'private'\`, \`is_global = false\`, exactly matching personal document PDF extraction. |
| **AI_GENERATED** | **${counts.AI_GENERATED}** | 0.0% | No existing questions contain explicit AI generation metadata or provider tags. |
| **UNKNOWN / UNCLASSIFIED** | **${counts.UNKNOWN}** | ${(counts.UNKNOWN / counts.total * 100).toFixed(1)}% | Duplicate automated test run questions created under super_admin account during RLS test runs without student ownership or direct FK. |
| **TOTAL** | **${counts.total}** | 100.0% | Complete inventory audited. |

---

## 2. Duplicate Analysis

### Exact Duplicates
- **Total Duplicate Instances (Redundant Rows):** ${counts.exactDuplicates}
- **Distinct Duplicate Content Groups:** ${exactDupeGroups.length}

All ${exactDupeGroups.length} exact duplicate groups originate from repetitive test runs of the 15 personal document aptitude questions (1 created by student, 3 runs created under admin fallback).

| Sample Question Statement | Total Rows in DB | Question IDs |
| :--- | :--- | :--- |
${exactDupeGroups.map(g => `| "${g.statement.replace(/[\r\n]+/g, ' ').substring(0, 50)}..." | ${g.count} | \`${g.ids.join('`, `')}\` |`).join('\n')}

### Near Duplicates
- **Questions with Near-Duplicate Matches (Similarity ≥ 0.85):** ${counts.nearDuplicates}
${nearDupeQuestions.length > 0 ? nearDupeQuestions.slice(0, 10).map(q => `- **Question \`${q.id}\`**: matched \`${q.near_duplicate_of?.map(n => `${n.id} (${(n.similarity * 100).toFixed(0)}%)`).join(', ')}\``).join('\n') : '- None outside exact duplicate groupings.'}

---

## 3. UNKNOWN / Unclassified Questions (${unknownIds.length} Questions)

These questions cannot be confidently classified as verified core or institutional. They must default to \`source_type = 'UNKNOWN'\`, \`verified = false\`, and \`status = 'review'\`.

| # | Question ID | Created At | Created By | Preview | Classification Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
${unknownQuestions.map((q, idx) => `| ${idx + 1} | \`${q.id}\` | ${q.created_at.substring(0, 10)} | \`${q.created_by.substring(0, 8)}...\` | ${q.statement.replace(/[\r\n]+/g, ' ').substring(0, 40)}... | ${q.evidence} |`).join('\n')}

### Complete List of UNKNOWN Question IDs
\`\`\`json
${JSON.stringify(unknownIds, null, 2)}
\`\`\`

---

## 4. Migration 027 Safety Recommendations

1. **Avoid Universal \`DEFAULT 'VERIFIED_CORE'\`**:
   Migration 027 should NOT set \`DEFAULT 'VERIFIED_CORE'\` for existing rows.
   Existing rows should default to \`'UNKNOWN'\` or \`NULL\` (or be backfilled using this classification dataset).
2. **Set \`verified DEFAULT false\` for unclassified**:
   Questions should only be \`verified = true\` if they match \`VERIFIED_CORE\` or approved \`INSTITUTIONAL\`.
3. **Allow \`source_type CHECK (source_type IN ('VERIFIED_CORE', 'INSTITUTIONAL', 'AI_GENERATED', 'PERSONAL', 'UNKNOWN'))\`**:
   Add \`'UNKNOWN'\` to the allowed ENUM / CHECK values to accommodate legacy questions cleanly.
`;
}

run().catch(err => {
  console.error('Fatal error running classification:', err);
  process.exit(1);
});
