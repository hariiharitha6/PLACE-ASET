import request from 'supertest';
import { expect } from 'chai';
import app from '../../app';
import * as dbModule from '../../config/database';
import { AIService } from '../../services/ai.service';

describe('AI Engine API Routes Integration Tests', () => {
  let originalGetSupabase: any;

  before(() => {
    originalGetSupabase = dbModule.getSupabase;
    const mockSupabase = {
      auth: {
        getUser: async (token: string) => {
          if (token === 'valid-test-token') {
            return {
              data: {
                user: {
                  id: 'test-user-id',
                  email: 'student@example.com',
                  app_metadata: {
                    user_role: 'student',
                    college_id: 'college-uuid-1',
                  },
                  aud: 'authenticated',
                  created_at: 'now',
                }
              },
              error: null,
            };
          }
          return { data: { user: null }, error: new Error('Invalid token') };
        }
      }
    };
    (dbModule as any).getSupabase = () => mockSupabase;
  });

  after(() => {
    (dbModule as any).getSupabase = originalGetSupabase;
  });

  it('GET /api/v1/ai/profile - should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/ai/profile');

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('GET /api/v1/ai/profile - should return 200 on authorized request', async () => {
    const originalGetProfile = AIService.getOrCreateLearningProfile;
    AIService.getOrCreateLearningProfile = async () => ({
      id: 'profile-uuid',
      user_id: 'test-user-id',
      mastery_score: 85,
      weak_topics: ['DBMS'],
      strong_topics: ['Python'],
      learning_velocity: 1.5,
      practice_frequency: 4,
      average_response_time: 12.5,
      preferred_difficulty: 'medium'
    } as any);

    const res = await request(app)
      .get('/api/v1/ai/profile')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.mastery_score).to.equal(85);

    AIService.getOrCreateLearningProfile = originalGetProfile;
  });

  it('POST /api/v1/ai/profile/compute - should return 200 on successful execution', async () => {
    const originalComputeProfile = AIService.computeLearningProfile;
    AIService.computeLearningProfile = async () => ({
      id: 'profile-uuid',
      user_id: 'test-user-id',
      mastery_score: 90,
      weak_topics: [],
      strong_topics: ['DBMS', 'Python'],
      learning_velocity: 2.0,
      practice_frequency: 5,
      average_response_time: 10.0,
      preferred_difficulty: 'medium'
    } as any);

    const res = await request(app)
      .post('/api/v1/ai/profile/compute')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.strong_topics).to.deep.equal(['DBMS', 'Python']);

    AIService.computeLearningProfile = originalComputeProfile;
  });

  it('GET /api/v1/ai/recommendations - should return list of recommendations', async () => {
    const originalGetRecs = AIService.getRecommendations;
    AIService.getRecommendations = async () => [
      {
        id: 'rec-1',
        user_id: 'test-user-id',
        item_type: 'question',
        item_id: 'q-1',
        reason: 'Recommended for DBMS',
        confidence_score: 0.85
      }
    ] as any;

    const res = await request(app)
      .get('/api/v1/ai/recommendations')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.length).to.equal(1);
    expect(res.body.data[0].confidence_score).to.equal(0.85);

    AIService.getRecommendations = originalGetRecs;
  });

  it('POST /api/v1/ai/recommendations/action - should record user click', async () => {
    const originalRecordAction = AIService.recordRecommendationAction;
    AIService.recordRecommendationAction = async () => ({
      id: 'history-1',
      user_id: 'test-user-id',
      recommendation_id: 'rec-1',
      action: 'click'
    } as any);

    const res = await request(app)
      .post('/api/v1/ai/recommendations/action')
      .set('Authorization', 'Bearer valid-test-token')
      .send({ recommendationId: 'rec-1', action: 'click' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.action).to.equal('click');

    AIService.recordRecommendationAction = originalRecordAction;
  });

  it('GET /api/v1/ai/study-path - should return study path layout', async () => {
    const originalGetStudyPath = AIService.getPersonalizedStudyPath;
    AIService.getPersonalizedStudyPath = async () => ({
      message: 'Here is your structured learning path.',
      path: [
        {
          step: 1,
          topic: 'DBMS',
          targetQuestions: [{ id: 'q-1', statement: 'What is SQL?', difficulty: 'easy' }]
        }
      ]
    });

    const res = await request(app)
      .get('/api/v1/ai/study-path')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.path[0].topic).to.equal('DBMS');

    AIService.getPersonalizedStudyPath = originalGetStudyPath;
  });

  it('GET /api/v1/ai/similar/:questionId - should return duplicate suggestions', async () => {
    const originalSimilar = AIService.getSimilarQuestions;
    const originalEmbeddings = AIService.generateEmbeddings;
    
    AIService.generateEmbeddings = async () => ({}) as any;
    AIService.getSimilarQuestions = async () => [
      {
        question: { id: 'q-2', statement: 'Compare databases', difficulty: 'medium' },
        similarity: 0.88
      }
    ];

    const res = await request(app)
      .get('/api/v1/ai/similar/q-1')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data[0].similarity).to.equal(0.88);

    AIService.getSimilarQuestions = originalSimilar;
    AIService.generateEmbeddings = originalEmbeddings;
  });
});
