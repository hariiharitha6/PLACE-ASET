-- ============================================================
-- PLACE@ASET - Realistic Demo Seed Data Generation
-- ============================================================
-- Script for seeding development and staging environments.

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

    -- Badge tracking
    first_badge_id UUID;

    -- Loop indices & vars
    i INTEGER;
    j INTEGER;
    temp_uuid UUID;
    temp_q_uuid UUID;
    temp_chal_uuid UUID;
    q_diff VARCHAR;
    random_dept UUID;
    c_status challenge_status;
BEGIN
    RAISE NOTICE 'Starting Seed Data Generation...';

    -- 1. Create College
    INSERT INTO colleges (name, slug, website, description) 
    VALUES ('Ahalia School of Engineering and Technology', 'aset', 'ahalia.ac.in', 'Ahalia School of Engineering and Technology (ASET)') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO master_college_id;
    RAISE NOTICE 'College Created: %', master_college_id;

    -- 2. Create Departments
    INSERT INTO departments (name, code, college_id) VALUES ('Computer Science and Engineering', 'CSE', master_college_id) ON CONFLICT (college_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO dept_cse_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Electronics and Communication', 'ECE', master_college_id) ON CONFLICT (college_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO dept_ece_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Electrical and Electronics', 'EEE', master_college_id) ON CONFLICT (college_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO dept_eee_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Mechanical Engineering', 'ME', master_college_id) ON CONFLICT (college_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO dept_me_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Civil Engineering', 'CE', master_college_id) ON CONFLICT (college_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO dept_ce_id;
    INSERT INTO departments (name, code, college_id) VALUES ('Artificial Intelligence & Data Science', 'AI&DS', master_college_id) ON CONFLICT (college_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO dept_aids_id;
    
    dept_ids := ARRAY[dept_cse_id, dept_ece_id, dept_eee_id, dept_me_id, dept_ce_id, dept_aids_id];
    RAISE NOTICE 'Departments Created.';

    -- 3. Users (Super Admin, Hosts, Faculty, Students)
    -- Seed Auth Users first to satisfy FK constraints on auth.users
    super_admin_id := '00000000-0000-0000-0000-000000000001'::UUID;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (super_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@aset.com', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, email, full_name, role, college_id, is_active) 
    VALUES (super_admin_id, 'admin@aset.com', 'System Admin', 'super_admin', master_college_id, true)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
    
    host_1_id := '00000000-0000-0000-0000-000000000002'::UUID;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (host_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host1@aset.com', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Host One"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, email, full_name, role, college_id, is_active) 
    VALUES (host_1_id, 'host1@aset.com', 'Host One', 'host', master_college_id, true)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
    
    host_2_id := '00000000-0000-0000-0000-000000000003'::UUID;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (host_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host2@aset.com', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Host Two"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, email, full_name, role, college_id, is_active) 
    VALUES (host_2_id, 'host2@aset.com', 'Host Two', 'host', master_college_id, true)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- 5 Faculty
    FOR i IN 1..5 LOOP
        temp_uuid := ('00000000-0000-0000-0000-00000000010' || i)::UUID;
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (temp_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'faculty' || i || '@aset.com', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO users (id, email, full_name, role, college_id, department_id, is_active) 
        VALUES (temp_uuid, 'faculty' || i || '@aset.com', 'Faculty Member ' || i, 'faculty', master_college_id, dept_ids[1 + (i % 6)], true)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
        
        fac_ids := fac_ids || temp_uuid;
    END LOOP;

    -- 20 Students
    FOR i IN 1..20 LOOP
        temp_uuid := gen_random_uuid();
        random_dept := dept_ids[1 + floor(random() * 6)::INT];

        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (temp_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student' || i || '@aset.com', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO users (id, email, full_name, role, college_id, department_id, is_active) 
        VALUES (temp_uuid, 'student' || i || '@aset.com', 'Student ' || i, 'student', master_college_id, random_dept, true)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
        
        student_ids := student_ids || temp_uuid;
        
        -- Practice Statistics
        INSERT INTO practice_statistics (user_id, total_questions_solved, total_correct_answers)
        VALUES (temp_uuid, (random() * 100)::INT, (random() * 80)::INT)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
    RAISE NOTICE 'Users Created.';

    -- 4. Question Bank (50 Questions)
    -- Insert Technical Questions
    FOR i IN 1..20 LOOP
        temp_q_uuid := gen_random_uuid();
        q_diff := CASE WHEN i % 3 = 0 THEN 'easy' WHEN i % 3 = 1 THEN 'medium' ELSE 'hard' END;
        
        INSERT INTO questions (id, college_id, created_by, type, difficulty, statement, explanation, is_global, approval_status, visibility)
        VALUES (temp_q_uuid, master_college_id, fac_ids[1 + (i % 5)], 'mcq_single', q_diff::difficulty_level, 'Mock Technical Question ' || i || ': What is the time complexity of QuickSort?', 'Explanation for tech question ' || i, false, 'approved', 'public');
        
        -- Options
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'A', 'O(n)', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'B', 'O(n log n)', true);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'C', 'O(n^2)', false);
        INSERT INTO question_options (question_id, label, content, is_correct) VALUES (temp_q_uuid, 'D', 'O(log n)', false);
        
        -- Department mapping
        INSERT INTO question_departments (question_id, department_id) VALUES (temp_q_uuid, dept_cse_id) ON CONFLICT DO NOTHING;
        
        technical_q_ids := technical_q_ids || temp_q_uuid;
        all_q_ids := all_q_ids || temp_q_uuid;
    END LOOP;

    -- Insert Logical Questions
    FOR i IN 1..15 LOOP
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

    -- Insert Aptitude Questions
    FOR i IN 1..15 LOOP
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
    RAISE NOTICE '50 Questions Created.';

    -- 5. Weekly Challenges (5)
    FOR i IN 1..5 LOOP
        temp_chal_uuid := gen_random_uuid();
        c_status := CASE WHEN i % 2 = 0 THEN 'active'::challenge_status ELSE 'ended'::challenge_status END;
        
        INSERT INTO challenges (id, title, description, start_time, end_time, duration_minutes, college_id, status, created_by, difficulty)
        VALUES (
            temp_chal_uuid,
            'Weekly Mock Challenge ' || i,
            'This is a generated mock challenge.',
            NOW() - (i || ' days')::INTERVAL,
            NOW() + (i || ' days')::INTERVAL,
            60,
            master_college_id,
            c_status,
            host_1_id,
            'medium'
        );

        -- Add 5 random questions to challenge
        FOR j IN 1..5 LOOP
            BEGIN
                INSERT INTO challenge_questions (challenge_id, question_id, points, sort_order)
                VALUES (temp_chal_uuid, all_q_ids[j], 10, j);
            EXCEPTION WHEN unique_violation THEN
            END;
        END LOOP;
        
        -- Add challenge registrations for students
        FOR j IN 1..5 LOOP
            temp_uuid := student_ids[j];
            BEGIN
                INSERT INTO challenge_registrations (challenge_id, user_id)
                VALUES (temp_chal_uuid, temp_uuid);
                
                IF c_status = 'ended'::challenge_status THEN
                    INSERT INTO submissions (challenge_id, user_id, question_id, is_correct, time_spent_seconds, points_earned)
                    VALUES (temp_chal_uuid, temp_uuid, all_q_ids[1], true, 45, 10);
                END IF;
            EXCEPTION WHEN unique_violation THEN
            END;
        END LOOP;
    END LOOP;
    RAISE NOTICE '5 Challenges Created.';

    -- 6. Practice Sessions (10)
    FOR i IN 1..10 LOOP
        temp_uuid := gen_random_uuid();
        INSERT INTO practice_sessions (id, user_id, college_id, mode, total_questions, correct_count)
        VALUES (
            temp_uuid,
            student_ids[1 + (i % array_length(student_ids, 1))],
            master_college_id,
            'topic',
            10,
            (random() * 10)::INT
        );
        
        -- Insert a practice answer
        INSERT INTO practice_answers (session_id, question_id, is_correct, time_spent_seconds)
        VALUES (temp_uuid, all_q_ids[1 + (i % array_length(all_q_ids, 1))], (random() > 0.5), (random() * 60)::INT);
    END LOOP;
    RAISE NOTICE 'Practice Sessions Created.';

    -- 7. Community Submissions (5)
    FOR i IN 1..5 LOOP
        INSERT INTO community_submissions (user_id, college_id, title, type, statement, correct_answer, status)
        VALUES (
            student_ids[i],
            master_college_id,
            'Community Contributed Q' || i,
            'question',
            'A user contributed question text ' || i,
            'A',
            'approved'
        );
    END LOOP;
    RAISE NOTICE 'Community Submissions Created.';

    -- 8. Badges
    SELECT id INTO first_badge_id FROM badges WHERE slug = 'first-challenge' LIMIT 1;
    IF first_badge_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (student_ids[i], first_badge_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    -- 9. Notifications
    FOR i IN 1..5 LOOP
        INSERT INTO notifications (user_id, college_id, title, message, type, is_read)
        VALUES (
            student_ids[i],
            master_college_id,
            'Welcome to PLACE@ASET',
            'Start your practice sessions today!',
            'announcement'::notification_type,
            false
        );
    END LOOP;
    RAISE NOTICE 'Notifications Created.';

    RAISE NOTICE 'Seed Data Generation Completed Successfully!';
END $$;
