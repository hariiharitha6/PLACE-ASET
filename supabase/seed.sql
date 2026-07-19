-- ============================================================
-- PLACE@ASET - Realistic Demo Seed Data Generation
-- ============================================================
-- WARNING: This script generates thousands of rows using PL/pgSQL loops.
-- Do not run on production databases!

DO $$
DECLARE
    -- Main Entity IDs
    master_college_id UUID;
    
    -- Department IDs
    dept_cse_id UUID;
    dept_ece_id UUID;
    dept_eee_id UUID;
    dept_me_id UUID;
    dept_ce_id UUID;
    dept_aids_id UUID;
    dept_ids UUID[];

    -- User IDs
    super_admin_id UUID;
    host_1_id UUID;
    host_2_id UUID;
    fac_ids UUID[] := '{}';
    student_ids UUID[] := '{}';
    
    -- Question tracking
    technical_q_ids UUID[] := '{}';
    logical_q_ids UUID[] := '{}';
    aptitude_q_ids UUID[] := '{}';
    verbal_q_ids UUID[] := '{}';
    all_q_ids UUID[] := '{}';

    -- Loop indices & vars
    i INTEGER;
    j INTEGER;
    temp_uuid UUID;
    temp_q_uuid UUID;
    temp_opt_uuid UUID;
    temp_chal_uuid UUID;
    q_diff VARCHAR;
    random_dept UUID;
    c_status VARCHAR;
BEGIN
    RAISE NOTICE 'Starting Seed Data Generation...';

    -- 1. Create College
    INSERT INTO colleges (name, slug, website, description) 
    VALUES ('Ahalia School of Engineering and Technology', 'aset', 'ahalia.ac.in', 'Ahalia School of Engineering and Technology (ASET)') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO master_college_id;
    RAISE NOTICE 'College Created: %', master_college_id;

    -- 2. Create Departments
    INSERT INTO departments (name, code, college_id) VALUES ('Computer Science and Engineering', 'CSE', master_college_id) RETURNING id INTO dept_cse_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Electronics and Communication', 'ECE', master_college_id) RETURNING id INTO dept_ece_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Electrical and Electronics', 'EEE', master_college_id) RETURNING id INTO dept_eee_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Mechanical Engineering', 'ME', master_college_id) RETURNING id INTO dept_me_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Civil Engineering', 'CE', master_college_id) RETURNING id INTO dept_ce_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Artificial Intelligence & Data Science', 'AI&DS', master_college_id) RETURNING id INTO dept_aids_id;
    
    dept_ids := ARRAY[dept_cse_id, dept_ece_id, dept_eee_id, dept_me_id, dept_ce_id, dept_aids_id];
    RAISE NOTICE 'Departments Created.';

    -- 3. Users (Super Admin, Hosts, Faculty, Students)
    super_admin_id := gen_random_uuid();
    INSERT INTO users (id, email, full_name, role, college_id, is_active) 
    VALUES (super_admin_id, 'admin@aset.com', 'System Admin', 'super_admin', master_college_id, true);
    
    host_1_id := gen_random_uuid();
    INSERT INTO users (id, email, full_name, role, college_id, is_active) 
    VALUES (host_1_id, 'host1@aset.com', 'Host One', 'host', master_college_id, true);
    
    host_2_id := gen_random_uuid();
    INSERT INTO users (id, email, full_name, role, college_id, is_active) 
    VALUES (host_2_id, 'host2@aset.com', 'Host Two', 'host', master_college_id, true);

    -- 5 Faculty
    FOR i IN 1..5 LOOP
        temp_uuid := gen_random_uuid();
        INSERT INTO users (id, email, full_name, role, college_id, department_id, is_active) 
        VALUES (temp_uuid, 'faculty' || i || '@aset.com', 'Faculty Member ' || i, 'faculty', master_college_id, dept_ids[1 + (i % 6)], true);
        fac_ids := fac_ids || temp_uuid;
    END LOOP;

    -- 100 Students
    FOR i IN 1..100 LOOP
        temp_uuid := gen_random_uuid();
        random_dept := dept_ids[1 + floor(random() * 6)::INT];

        INSERT INTO users (id, email, full_name, role, college_id, department_id, is_active) 
        VALUES (temp_uuid, 'student' || i || '@aset.com', 'Student ' || i, 'student', master_college_id, random_dept, true);
        student_ids := student_ids || temp_uuid;
        
        -- Practice Statistics
        INSERT INTO practice_statistics (user_id, questions_solved, correct_answers, total_time_spent)
        VALUES (temp_uuid, (random() * 500)::INT, (random() * 400)::INT, (random() * 100000)::INT);
    END LOOP;
    RAISE NOTICE 'Users Created.';

    -- 4. Question Bank (1250 Questions)
    
    -- Helper function block embedded in the DO statement to insert a question
    -- We will insert 500 Technical
    FOR i IN 1..500 LOOP
        temp_q_uuid := gen_random_uuid();
        q_diff := CASE WHEN i % 3 = 0 THEN 'easy' WHEN i % 3 = 1 THEN 'medium' ELSE 'hard' END;
        
        INSERT INTO questions (id, college_id, created_by, type, difficulty, statement, explanation, is_global, approval_status, visibility)
        VALUES (temp_q_uuid, master_college_id, fac_ids[1 + (i % 5)], 'mcq_single', q_diff::difficulty_level, 'Mock Technical Question ' || i || ': What is the time complexity of QuickSort?', 'Explanation for tech question ' || i, false, 'approved', 'public');
        
        -- Options
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'A', 'O(n)', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'B', 'O(n log n)', true);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'C', 'O(n^2)', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'D', 'O(log n)', false);
        
        -- Department mapping (assign to 1 or 2 depts)
        INSERT INTO question_departments (question_id, department_id) VALUES (temp_q_uuid, dept_cse_id);
        IF random() > 0.5 THEN INSERT INTO question_departments (question_id, department_id) VALUES (temp_q_uuid, dept_ece_id); END IF;
        
        technical_q_ids := technical_q_ids || temp_q_uuid;
        all_q_ids := all_q_ids || temp_q_uuid;
    END LOOP;

    -- 300 Logical
    FOR i IN 1..300 LOOP
        temp_q_uuid := gen_random_uuid();
        q_diff := CASE WHEN i % 3 = 0 THEN 'easy' WHEN i % 3 = 1 THEN 'medium' ELSE 'hard' END;
        
        INSERT INTO questions (id, college_id, created_by, type, difficulty, statement, explanation, is_global, approval_status, visibility)
        VALUES (temp_q_uuid, master_college_id, fac_ids[1 + (i % 5)], 'mcq_single', q_diff::difficulty_level, 'Mock Logical Question ' || i || ': Find the missing number in the series 2, 4, 8, 16...', 'Explanation for logical question ' || i, true, 'approved', 'public');
        
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'A', '24', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'B', '32', true);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'C', '64', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'D', '20', false);
        
        logical_q_ids := logical_q_ids || temp_q_uuid;
        all_q_ids := all_q_ids || temp_q_uuid;
    END LOOP;

    -- 250 Aptitude
    FOR i IN 1..250 LOOP
        temp_q_uuid := gen_random_uuid();
        q_diff := CASE WHEN i % 3 = 0 THEN 'easy' WHEN i % 3 = 1 THEN 'medium' ELSE 'hard' END;
        
        INSERT INTO questions (id, college_id, created_by, type, difficulty, statement, explanation, is_global, approval_status, visibility)
        VALUES (temp_q_uuid, master_college_id, fac_ids[1 + (i % 5)], 'mcq_single', q_diff::difficulty_level, 'Mock Aptitude Question ' || i || ': A train travels 60km/h. How long to travel 120km?', 'Explanation for aptitude question ' || i, true, 'approved', 'public');
        
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'A', '1 hour', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'B', '1.5 hours', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'C', '2 hours', true);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'D', '3 hours', false);
        
        aptitude_q_ids := aptitude_q_ids || temp_q_uuid;
        all_q_ids := all_q_ids || temp_q_uuid;
    END LOOP;

    -- 200 Verbal
    FOR i IN 1..200 LOOP
        temp_q_uuid := gen_random_uuid();
        q_diff := CASE WHEN i % 3 = 0 THEN 'easy' WHEN i % 3 = 1 THEN 'medium' ELSE 'hard' END;
        
        INSERT INTO questions (id, college_id, created_by, type, difficulty, statement, explanation, is_global, approval_status, visibility)
        VALUES (temp_q_uuid, master_college_id, fac_ids[1 + (i % 5)], 'mcq_single', q_diff::difficulty_level, 'Mock Verbal Question ' || i || ': Choose the synonym for "Abundant".', 'Explanation for verbal question ' || i, true, 'approved', 'public');
        
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'A', 'Scarce', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'B', 'Plentiful', true);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'C', 'Rare', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'D', 'Empty', false);
        
        verbal_q_ids := verbal_q_ids || temp_q_uuid;
        all_q_ids := all_q_ids || temp_q_uuid;
    END LOOP;
    RAISE NOTICE '1250 Questions Created.';

    -- 5. Weekly Challenges (50)
    FOR i IN 1..50 LOOP
        temp_chal_uuid := gen_random_uuid();
        c_status := CASE WHEN random() > 0.5 THEN 'active' ELSE 'closed' END;
        
        INSERT INTO challenges (id, title, description, start_time, end_time, duration_minutes, college_id, status, host_id, difficulty)
        VALUES (
            temp_chal_uuid,
            'Weekly Mock Challenge ' || i,
            'This is a generated mock challenge.',
            NOW() - (random() * 30 || ' days')::INTERVAL,
            NOW() + (random() * 30 || ' days')::INTERVAL,
            60,
            master_college_id,
            c_status,
            host_1_id,
            'medium'
        );

        -- Add 20 random questions to challenge
        FOR j IN 1..20 LOOP
            BEGIN
                INSERT INTO challenge_questions (challenge_id, question_id, points, sequence_order)
                VALUES (temp_chal_uuid, all_q_ids[1 + floor(random() * array_length(all_q_ids, 1))::INT], 10, j);
            EXCEPTION WHEN unique_violation THEN
                -- Ignore duplicates generated randomly
            END;
        END LOOP;
        
        -- Add challenge registrations and submissions for 10 random students if active/closed
        FOR j IN 1..10 LOOP
            temp_uuid := student_ids[1 + floor(random() * array_length(student_ids, 1))::INT];
            
            BEGIN
                INSERT INTO challenge_registrations (challenge_id, user_id, status)
                VALUES (temp_chal_uuid, temp_uuid, 'registered');
                
                IF c_status = 'closed' THEN
                    INSERT INTO challenge_submissions (challenge_id, user_id, score, time_taken, status)
                    VALUES (temp_chal_uuid, temp_uuid, (random() * 200)::INT, (random() * 3600)::INT, 'submitted');
                END IF;
            EXCEPTION WHEN unique_violation THEN
            END;
        END LOOP;
    END LOOP;
    RAISE NOTICE '50 Challenges Created.';

    -- 6. Practice Sessions (100)
    FOR i IN 1..100 LOOP
        temp_uuid := gen_random_uuid();
        INSERT INTO practice_sessions (id, user_id, mode, status, total_questions, correct_answers, score, time_taken)
        VALUES (
            temp_uuid,
            student_ids[1 + floor(random() * array_length(student_ids, 1))::INT],
            'mixed',
            'completed',
            20,
            (random() * 20)::INT,
            (random() * 100)::INT,
            (random() * 1800)::INT
        );
        
        -- Insert a few practice answers
        FOR j IN 1..5 LOOP
            INSERT INTO practice_answers (session_id, question_id, is_correct, time_taken_seconds)
            VALUES (temp_uuid, all_q_ids[1 + floor(random() * array_length(all_q_ids, 1))::INT], (random() > 0.5), (random() * 60)::INT)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
    RAISE NOTICE '100 Practice Sessions Created.';

    -- 7. Community Uploads (20)
    FOR i IN 1..20 LOOP
        INSERT INTO community_submissions (user_id, title, type, statement, correct_answer, status, college_id)
        VALUES (
            student_ids[1 + floor(random() * array_length(student_ids, 1))::INT],
            'Community Contributed Q' || i,
            'question',
            'A user contributed question text ' || i,
            'A',
            'approved',
            master_college_id
        );
    END LOOP;
    RAISE NOTICE 'Community Submissions Created.';

    -- 8. Achievements & Badges
    FOR i IN 1..10 LOOP
        INSERT INTO user_badges (user_id, badge_id, awarded_at)
        VALUES (
            student_ids[1 + floor(random() * array_length(student_ids, 1))::INT],
            'first_challenge_win',
            NOW() - (random() * 30 || ' days')::INTERVAL
        ) ON CONFLICT DO NOTHING;
        
        INSERT INTO unlocked_achievements (user_id, achievement_id, progress, unlocked_at)
        VALUES (
            student_ids[1 + floor(random() * array_length(student_ids, 1))::INT],
            'practice_novice',
            100,
            NOW() - (random() * 30 || ' days')::INTERVAL
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    RAISE NOTICE 'Achievements & Badges Created.';

    -- 9. OCR Jobs
    FOR i IN 1..10 LOOP
        INSERT INTO ocr_jobs (user_id, file_name, file_url, status, total_pages, processed_pages)
        VALUES (
            student_ids[1 + floor(random() * array_length(student_ids, 1))::INT],
            'Mock_Upload_' || i || '.pdf',
            'https://storage.supabase.co/mock/upload_' || i || '.pdf',
            'completed',
            10,
            10
        );
    END LOOP;
    RAISE NOTICE 'OCR Jobs Created.';

    -- 10. Notifications
    FOR i IN 1..50 LOOP
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (
            student_ids[1 + floor(random() * array_length(student_ids, 1))::INT],
            'Welcome to PLACE@ASET',
            'Start your practice sessions today!',
            'system',
            false
        );
    END LOOP;
    RAISE NOTICE 'Notifications Created.';

    RAISE NOTICE 'Seed Data Generation Completed Successfully!';
END $$;
