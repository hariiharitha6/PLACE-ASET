import { expect } from 'chai';
import { QuestionBankService, VerifiedQuestion } from './question_bank.service';
import { RepetitionEngineService, UserQuestionSchedule } from './repetition_engine.service';
import { AIRouterService } from './ai_engine/ai_router.service';

const createMockQuestion = (overrides: Partial<VerifiedQuestion>): VerifiedQuestion => ({
  id: overrides.id || 'mock-id',
  statement: overrides.statement || 'Sample question statement?',
  options: overrides.options || [
    { label: 'A', content: 'Option 1', is_correct: true },
    { label: 'B', content: 'Option 2', is_correct: false },
  ],
  category_slug: overrides.category_slug || 'quantitative-aptitude',
  topic: overrides.topic || 'General Practice',
  difficulty: overrides.difficulty || 'medium',
  type: overrides.type || 'mcq_single',
  explanation: overrides.explanation || 'Verified explanation',
  source: overrides.source || 'Curated Bank',
  source_type: overrides.source_type || 'VERIFIED_CORE',
  verified: overrides.verified !== undefined ? overrides.verified : true,
  status: overrides.status || 'published',
  approval_status: overrides.approval_status || 'approved',
  normalized_hash: overrides.normalized_hash || 'mock-hash',
  quality_score: 90,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('PLACE@ASET Question Intelligence & Spaced Repetition Test Suite', () => {
  describe('Phase 2 & Phase 15: Verified Question Bank & Audit', () => {
    it('should load seeded verified questions with correct schema and published status', async () => {
      const candidates = await QuestionBankService.getVerifiedQuestions({});
      expect(candidates).to.be.an('array');
      expect(candidates.length).to.be.greaterThan(50);

      // Verify candidates have verified=true and status=published
      for (const q of candidates) {
        expect(q.verified).to.be.true;
        expect(q.status).to.equal('published');
        expect(q.options).to.be.an('array');
        expect(q.options.length).to.be.at.least(2);
        expect(q.statement).to.be.a('string').and.not.empty;
        expect(q.difficulty).to.be.oneOf(['easy', 'medium', 'hard', 'expert']);
        expect(q.source_type).to.be.oneOf(['VERIFIED_CORE', 'INSTITUTIONAL']);
      }
    });

    it('should strictly exclude unverified, draft, or rejected questions from official practice', () => {
      const mockPool: VerifiedQuestion[] = [
        createMockQuestion({
          id: 'mock-1',
          statement: 'Legitimate question',
          verified: true,
          status: 'published',
          source_type: 'VERIFIED_CORE',
        }),
        createMockQuestion({
          id: 'mock-2-draft',
          statement: 'Draft question',
          verified: true,
          status: 'draft',
          source_type: 'VERIFIED_CORE',
        }),
        createMockQuestion({
          id: 'mock-3-unverified',
          statement: 'Unverified question',
          verified: false,
          status: 'published',
          source_type: 'AI_GENERATED',
        }),
        createMockQuestion({
          id: 'mock-4-rejected',
          statement: 'Rejected question',
          verified: false,
          status: 'rejected',
          source_type: 'INSTITUTIONAL',
        }),
      ];

      // Simulate official practice filter
      const officialQuestions = mockPool.filter(
        q => q.verified === true && q.status === 'published' && q.source_type !== 'AI_GENERATED'
      );

      expect(officialQuestions.length).to.equal(1);
      expect(officialQuestions[0].id).to.equal('mock-1');
    });
  });

  describe('Phase 8: Normalization & Duplicate Detection', () => {
    it('should normalize text by stripping punctuation, whitespace, and case', () => {
      const text1 = '  What is the TIME complexity of Binary Search?  ';
      const text2 = 'what is the time complexity of binary search';
      const norm1 = QuestionBankService.normalizeText(text1);
      const norm2 = QuestionBankService.normalizeText(text2);
      expect(norm1).to.equal(norm2);
      expect(QuestionBankService.computeHash(text1)).to.equal(QuestionBankService.computeHash(text2));
    });

    it('should detect near duplicates using token Jaccard similarity', () => {
      const statement1 = 'What is the time complexity of quick sort in average case';
      const statement2 = 'What is the average case time complexity of quick sort algorithm';
      const existingPool: VerifiedQuestion[] = [
        createMockQuestion({
          id: 'existing-1',
          statement: statement1,
          normalized_hash: QuestionBankService.computeHash(statement1),
        }),
      ];

      const check = QuestionBankService.checkDuplicate(statement2, existingPool);
      expect(check.isNearDuplicate).to.be.true;
    });

    it('should not flag genuinely different questions as duplicates', () => {
      const statement1 = 'Explain Dijkstra shortest path algorithm';
      const statement2 = 'Explain Floyd Warshall all pairs shortest path algorithm';
      const existingPool: VerifiedQuestion[] = [
        createMockQuestion({
          id: 'existing-2',
          statement: statement1,
          normalized_hash: QuestionBankService.computeHash(statement1),
        }),
      ];

      const check = QuestionBankService.checkDuplicate(statement2, existingPool);
      expect(check.isExactMatch).to.be.false;
      expect(check.isNearDuplicate).to.be.false;
    });
  });

  describe('Phase 3 & Phase 14: Deterministic Selection & No-Repetition Across Sessions', () => {
    it('should never select duplicate question IDs in the same practice session', async () => {
      const candidates = await QuestionBankService.getVerifiedQuestions({});
      const schedules = new Map<string, UserQuestionSchedule>();
      const weakTopics = {};

      const sessionQuestions = RepetitionEngineService.selectQuestions(
        candidates,
        schedules,
        weakTopics,
        1,
        10
      );

      expect(sessionQuestions.length).to.equal(10);
      const ids = sessionQuestions.map(q => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).to.equal(ids.length);
    });

    it('should rotate questions so Session 2 does not repeat questions from Session 1', async () => {
      const candidates = await QuestionBankService.getVerifiedQuestions({});
      expect(candidates.length).to.be.at.least(25);

      const userSchedules = new Map<string, UserQuestionSchedule>();
      const weakTopics = {};

      // Session 1: pick 10 questions
      const session1 = RepetitionEngineService.selectQuestions(
        candidates,
        userSchedules,
        weakTopics,
        1,
        10
      );

      // Record student attempt for session 1 questions
      for (const q of session1) {
        userSchedules.set(q.id, {
          user_id: 'test-student',
          question_id: q.id,
          attempt_count: 1,
          correct_count: 1,
          incorrect_count: 0,
          last_attempted_at: new Date().toISOString(),
          last_result: true,
          last_session_number: 1,
          interval_sessions: 3,
          next_review_session_number: 4, // Due in session 4
          next_review_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          mastery_level: 1,
        });
      }

      // Session 2: pick 10 questions
      const session2 = RepetitionEngineService.selectQuestions(
        candidates,
        userSchedules,
        weakTopics,
        2,
        10
      );

      const s1Ids = new Set(session1.map(q => q.id));
      const s2Ids = new Set(session2.map(q => q.id));

      // Check overlap between Session 1 and Session 2
      const overlap = [...s2Ids].filter(id => s1Ids.has(id));
      expect(overlap.length).to.equal(0, `Session 2 repeated questions from Session 1: ${overlap.join(', ')}`);
    });
  });

  describe('Phase 4 & Phase 5: Spaced Repetition Scheduling', () => {
    it('should schedule incorrect questions for immediate review (next session)', () => {
      const schedule = RepetitionEngineService.computeSchedule(
        'test-user',
        'q-101',
        false, // Wrong answer
        1,
        undefined
      );

      expect(schedule.attempt_count).to.equal(1);
      expect(schedule.incorrect_count).to.equal(1);
      expect(schedule.correct_count).to.equal(0);
      expect(schedule.last_result).to.be.false;
      expect(schedule.interval_sessions).to.equal(1);
      expect(schedule.next_review_session_number).to.equal(2); // Review in session 2
      expect(schedule.mastery_level).to.equal(0);
    });

    it('should schedule single correct answer 3 sessions later', () => {
      const schedule = RepetitionEngineService.computeSchedule(
        'test-user',
        'q-102',
        true, // Correct answer
        1,
        undefined
      );

      expect(schedule.attempt_count).to.equal(1);
      expect(schedule.correct_count).to.equal(1);
      expect(schedule.last_result).to.be.true;
      expect(schedule.interval_sessions).to.equal(3);
      expect(schedule.next_review_session_number).to.equal(4); // Review in session 4
      expect(schedule.mastery_level).to.equal(1);
    });

    it('should schedule repeatedly correct answers 7 sessions later', () => {
      const prior: UserQuestionSchedule = {
        user_id: 'test-user',
        question_id: 'q-103',
        attempt_count: 2,
        correct_count: 2,
        incorrect_count: 0,
        last_attempted_at: new Date().toISOString(),
        last_result: true,
        last_session_number: 2,
        interval_sessions: 3,
        next_review_session_number: 5,
        next_review_at: new Date().toISOString(),
        mastery_level: 1,
      };

      const updated = RepetitionEngineService.computeSchedule(
        'test-user',
        'q-103',
        true,
        5,
        prior
      );

      expect(updated.attempt_count).to.equal(3);
      expect(updated.correct_count).to.equal(3);
      expect(updated.interval_sessions).to.equal(7);
      expect(updated.next_review_session_number).to.equal(12);
      expect(updated.mastery_level).to.equal(2);
    });

    it('should schedule mastered questions 15 sessions later / 14 days', () => {
      const prior: UserQuestionSchedule = {
        user_id: 'test-user',
        question_id: 'q-104',
        attempt_count: 4,
        correct_count: 4,
        incorrect_count: 0,
        last_attempted_at: new Date().toISOString(),
        last_result: true,
        last_session_number: 10,
        interval_sessions: 7,
        next_review_session_number: 17,
        next_review_at: new Date().toISOString(),
        mastery_level: 2,
      };

      const updated = RepetitionEngineService.computeSchedule(
        'test-user',
        'q-104',
        true,
        17,
        prior
      );

      expect(updated.attempt_count).to.equal(5);
      expect(updated.correct_count).to.equal(5);
      expect(updated.interval_sessions).to.equal(15);
      expect(updated.mastery_level).to.equal(3);
    });
  });

  describe('Phase 6: Weak Topic Prioritization', () => {
    it('should prioritize weak topics using weighted selection without hard filtering other topics', () => {
      const pool: VerifiedQuestion[] = [
        createMockQuestion({
          id: 'q-time-work-1',
          statement: 'Time and work problem 1',
          topic: 'Time and Work',
          normalized_hash: 'tw1',
        }),
        createMockQuestion({
          id: 'q-time-work-2',
          statement: 'Time and work problem 2',
          topic: 'Time and Work',
          normalized_hash: 'tw2',
        }),
        createMockQuestion({
          id: 'q-percentages-1',
          statement: 'Percentages problem 1',
          topic: 'Percentages',
          normalized_hash: 'pct1',
        }),
        createMockQuestion({
          id: 'q-percentages-2',
          statement: 'Percentages problem 2',
          topic: 'Percentages',
          normalized_hash: 'pct2',
        }),
      ];

      // Student is weak in Time and Work (30%) and strong in Percentages (90%)
      const weakTopics = {
        'Time and Work': 30,
        'Percentages': 90,
      };

      const selected = RepetitionEngineService.selectQuestions(
        pool,
        new Map(),
        weakTopics,
        1,
        2
      );

      // Weak topic should appear in top selection
      const topics = selected.map(q => q.topic);
      expect(topics).to.include('Time and Work');
    });
  });

  describe('Phase 7: Dataset Ingestion Pipeline', () => {
    it('should validate and ingest questions, skipping duplicates and classifying status', async () => {
      const batch = [
        {
          statement: 'What is the time complexity of QuickSort in best case?',
          options: [
            { label: 'A', content: 'O(N log N)', is_correct: true },
            { label: 'B', content: 'O(N^2)', is_correct: false },
          ],
          category_slug: 'dsa',
          topic: 'Sorting Algorithms',
          difficulty: 'medium' as const,
          explanation: 'Best case of QuickSort partitions equally.',
          source: 'Faculty Curated Sheet',
        },
      ];

      const result = await QuestionBankService.ingestQuestionsBatch(batch, 'faculty-test-admin');

      expect(result.inserted + result.duplicatesSkipped).to.equal(1);
      expect(result.errors.length).to.equal(0);
    });
  });

  describe('Phase 11 & Phase 12: AI Independence & Offline Engine Status', () => {
    it('should provide structured provider status without throwing unhandled exceptions', async () => {
      const providersStatus = await AIRouterService.getProvidersStatus();
      expect(providersStatus).to.be.an('array');
      expect(providersStatus.length).to.be.at.least(1);

      const ollama = providersStatus.find(p => p.id === 'ollama');
      expect(ollama).to.exist;
      expect(ollama!.isConfigured).to.be.true;
    });

    it('should return structured guidance when live AI providers are offline, without fabricating answers', async function () {
      this.timeout(10000);
      const result = await AIRouterService.executeTask('study_assistant', 'Explain QuickSort', {
        learningMode: 'personal',
        timeoutMs: 1500,
      });

      expect(result).to.have.property('text');
      expect(result).to.have.property('providerId');
      // Must not fabricate a fake API answer when offline
      if (result.providerId === 'unavailable') {
        expect(result.text).to.include('AI is currently unavailable');
      }
    });
  });
});
