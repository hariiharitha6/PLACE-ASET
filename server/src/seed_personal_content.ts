import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { initDatabase, getSupabaseAdmin } from './config/database';
import { SeedQuestion, APTITUDE_QUESTIONS } from './data/questions_aptitude';
import { PROGRAMMING_QUESTIONS } from './data/questions_programming';
import { DSA_QUESTIONS } from './data/questions_dsa';
import { DBMS_SQL_QUESTIONS } from './data/questions_dbms_sql';
import { OOP_QUESTIONS } from './data/questions_oop';
import { OS_NETWORKS_QUESTIONS } from './data/questions_os_networks';
import { INTERVIEW_QUESTIONS } from './data/questions_interview';
import { SEED_RESOURCES } from './data/personal_resources';

const ALL_QUESTIONS: SeedQuestion[] = [
  ...APTITUDE_QUESTIONS,
  ...PROGRAMMING_QUESTIONS,
  ...DSA_QUESTIONS,
  ...DBMS_SQL_QUESTIONS,
  ...OOP_QUESTIONS,
  ...OS_NETWORKS_QUESTIONS,
  ...INTERVIEW_QUESTIONS
];

export async function seedPersonalContent() {
  console.log('====================================================');
  console.log('   PLACE@ASET — Personal Content & Data Activation');
  console.log('====================================================');
  console.log(`Total questions loaded: ${ALL_QUESTIONS.length}`);
  console.log(`Total learning resources loaded: ${SEED_RESOURCES.length}`);

  initDatabase();
  let db;
  try {
    db = getSupabaseAdmin();
  } catch (err: any) {
    console.error('❌ Database initialization error:', err.message);
    return { success: false, error: err.message };
  }

  // 1. Verify Connectivity
  console.log('\n[Step 1/5] Verifying database connectivity...');
  try {
    const { count, error: pingErr } = await db.from('categories').select('*', { count: 'exact', head: true });
    if (pingErr) {
      console.warn('⚠️  Database ping failed. Remote Supabase may be paused or unreachable:', pingErr.message);
      return { success: false, error: pingErr.message, paused: true };
    }
    console.log(`✅ Connected! Categories in DB: ${count}`);
  } catch (netErr: any) {
    console.warn('⚠️  Network connectivity error:', netErr.message);
    return { success: false, error: netErr.message, paused: true };
  }

  // 2. Fetch Master College and Admin ID
  console.log('\n[Step 2/5] Resolving college and admin references...');
  let masterCollegeId = '13d4decc-75fd-4138-8145-6a9fcff454ad';
  const { data: colData } = await db.from('colleges').select('id').eq('slug', 'aset').maybeSingle();
  if (colData?.id) masterCollegeId = colData.id;

  let superAdminId = '00000000-0000-0000-0000-000000000001';
  const { data: adminUser } = await db.from('users').select('id').eq('role', 'super_admin').limit(1).maybeSingle();
  if (adminUser?.id) superAdminId = adminUser.id;

  console.log(`Using College ID: ${masterCollegeId}, Admin ID: ${superAdminId}`);

  // 3. Resolve Categories by Slug
  console.log('\n[Step 3/5] Syncing categories and hierarchy...');
  const { data: catRows } = await db.from('categories').select('id, slug, name');
  const catMap = new Map<string, string>();
  catRows?.forEach(c => catMap.set(c.slug, c.id));

  // Ensure Technical Aptitude is parent of sub-categories
  const techParentId = catMap.get('technical-aptitude');
  if (techParentId) {
    const subSlugs = [
      'c-programming', 'cpp-programming', 'java', 'python',
      'dbms', 'operating-systems', 'computer-networks', 'oop-concepts', 'dsa'
    ];
    const subIds = subSlugs.map(s => catMap.get(s)).filter(Boolean) as string[];
    if (subIds.length > 0) {
      await db.from('categories').update({ parent_id: techParentId }).in('id', subIds);
      console.log('✅ Technical subcategories linked under Technical Aptitude.');
    }
  }

  // 4. Seed / Update Question Bank
  console.log('\n[Step 4/5] Seeding starter question bank...');
  let qInserted = 0;
  let qUpdated = 0;
  let qFailed = 0;

  // Fetch existing question statements to avoid duplicate insertions
  const { data: existingQList } = await db.from('questions').select('id, statement');
  const existingStmtMap = new Map<string, string>();
  existingQList?.forEach(q => existingStmtMap.set(q.statement.trim(), q.id));

  for (let i = 0; i < ALL_QUESTIONS.length; i++) {
    const q = ALL_QUESTIONS[i];
    const catId = catMap.get(q.category_slug) || techParentId || null;
    const existingId = existingStmtMap.get(q.statement.trim());

    try {
      let qId: string;
      if (existingId) {
        // Update existing question with rich explanation, difficulty, and metadata
        const { error: upErr } = await db
          .from('questions')
          .update({
            category_id: catId,
            statement: q.statement,
            explanation: q.explanation,
            difficulty: q.difficulty,
            type: q.type || 'mcq_single',
            is_global: true,
            approval_status: 'approved',
            visibility: 'public',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId);

        if (upErr) {
          console.error(`  ❌ Update error on question "${q.statement.slice(0, 30)}":`, upErr.message);
          qFailed++;
          continue;
        }
        qId = existingId;
        qUpdated++;

        // Refresh options
        await db.from('question_options').delete().eq('question_id', qId);
      } else {
        // Insert new question
        const { data: inserted, error: insErr } = await db
          .from('questions')
          .insert({
            college_id: masterCollegeId,
            created_by: superAdminId,
            category_id: catId,
            statement: q.statement,
            explanation: q.explanation,
            difficulty: q.difficulty,
            type: q.type || 'mcq_single',
            is_global: true,
            approval_status: 'approved',
            visibility: 'public'
          })
          .select('id')
          .single();

        if (insErr || !inserted) {
          console.error(`  ❌ Insert error on question "${q.statement.slice(0, 30)}":`, insErr?.message);
          qFailed++;
          continue;
        }
        qId = inserted.id;
        qInserted++;
        existingStmtMap.set(q.statement.trim(), qId);
      }

      // Insert options
      const optPayload = q.options.map((opt, idx) => ({
        question_id: qId,
        label: opt.label,
        content: opt.content,
        is_correct: opt.is_correct,
        sort_order: idx
      }));

      await db.from('question_options').insert(optPayload);
    } catch (err: any) {
      console.error(`  ❌ Exception on question "${q.statement.slice(0, 30)}":`, err.message);
      qFailed++;
    }
  }

  console.log(`✅ Questions process complete: ${qInserted} newly inserted, ${qUpdated} updated, ${qFailed} failed.`);

  // 5. Seed Starter Resources
  console.log('\n[Step 5/5] Seeding starter learning resources...');
  
  // Check if extended schema columns exist on resources table
  const { error: extColErr } = await db.from('resources').select('department').limit(1);
  const hasExtendedResourceCols = !extColErr;

  let resAdded = 0;
  for (const res of SEED_RESOURCES) {
    const catId = catMap.get(res.category_slug) || null;
    const { data: existingRes } = await db.from('resources').select('id').eq('title', res.title).maybeSingle();
    if (!existingRes) {
      const payload: any = {
        college_id: masterCollegeId,
        uploaded_by: superAdminId,
        title: res.title,
        description: res.description,
        type: res.type,
        file_url: res.file_url,
        file_name: res.file_name,
        file_type: res.file_type,
        file_size: res.file_size,
        category_id: catId,
        is_global: true,
        is_active: true
      };

      if (hasExtendedResourceCols) {
        payload.department = res.department;
        payload.subject = res.subject;
        payload.semester = res.semester;
        payload.difficulty = res.difficulty;
        payload.tags = res.tags;
        payload.author = res.author;
        payload.external_resource_url = res.external_resource_url;
        payload.is_published = true;
        payload.status = 'published';
        payload.ai_summary = res.ai_summary;
        payload.ai_key_points = res.ai_key_points;
      }

      const { error: rErr } = await db.from('resources').insert(payload);
      if (!rErr) {
        resAdded++;
        console.log(`  + Resource added: ${res.title}`);
      } else {
        console.error(`  ❌ Resource insert failed for "${res.title}":`, rErr.message);
      }
    }
  }
  console.log(`✅ Learning resources synced (${resAdded} newly added).`);

  // 6. Update Active Weekly Placement Challenges
  console.log('\nSyncing active placement challenges...');
  const { data: challenges } = await db.from('challenges').select('id, title').limit(5);
  if (challenges && challenges.length > 0) {
    const challengeTemplates = [
      { title: 'Placement Coding Sprint: Arrays, Strings & Two Pointers', diff: 'medium' },
      { title: 'Core CS Technical Assessment: OS, DBMS & Networks', diff: 'hard' },
      { title: 'Aptitude & Logical Reasoning Placement Qualifier', diff: 'medium' },
      { title: 'Campus Placement Full Mock Test (TCS & Infosys Pattern)', diff: 'medium' },
      { title: 'Advanced DSA & Problem Solving Challenge', diff: 'hard' }
    ];

    for (let i = 0; i < Math.min(challenges.length, challengeTemplates.length); i++) {
      const tmpl = challengeTemplates[i];
      await db.from('challenges').update({
        title: tmpl.title,
        description: 'Comprehensive 60-minute placement preparation challenge covering curated questions for campus placement drives.',
        status: 'active',
        difficulty: tmpl.diff,
        start_time: new Date(Date.now() - 3600000).toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000).toISOString()
      }).eq('id', challenges[i].id);
    }
    console.log('✅ Active challenges updated.');
  }

  console.log('\n✨ Personal Content Activation Complete!');
  return { success: true, questionsInserted: qInserted, questionsUpdated: qUpdated, resourcesAdded: resAdded };
}

// Execute standalone if called directly
if (require.main === module) {
  seedPersonalContent()
    .then(result => {
      console.log('Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}
