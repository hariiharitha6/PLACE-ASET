import request from 'supertest';
import { expect } from 'chai';
import app from '../../app';
import * as dbModule from '../../config/database';
import { QuestionsService } from '../../services/questions.service';

describe('Questions API Routes Integration Tests', () => {
  let originalGetSupabase: any;

  before(() => {
    originalGetSupabase = dbModule.getSupabase;
  });

  after(() => {
    (dbModule as any).getSupabase = originalGetSupabase;
  });

  const stubAuthUser = (role: string) => {
    const mockSupabase = {
      auth: {
        getUser: async (token: string) => {
          if (token === 'valid-test-token') {
            return {
              data: {
                user: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  app_metadata: {
                    user_role: role,
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
  };

  it('GET /api/v1/questions - should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/questions');

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('GET /api/v1/questions - should return 200 on authorized request', async () => {
    stubAuthUser('student');
    const originalSearch = QuestionsService.searchAndFilter;
    QuestionsService.searchAndFilter = async () => ({
      questions: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const res = await request(app)
      .get('/api/v1/questions')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;

    QuestionsService.searchAndFilter = originalSearch;
  });

  it('POST /api/v1/questions - should return 403 Forbidden for students', async () => {
    stubAuthUser('student');

    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        statement: 'Some test question statement',
        type: 'mcq_single',
        difficulty: 'medium',
      });

    expect(res.status).to.equal(403);
    expect(res.body.success).to.be.false;
    expect(res.body.error).to.equal('Insufficient permissions');
  });

  it('POST /api/v1/questions - should bypass RBAC role check for admins', async () => {
    stubAuthUser('super_admin');
    const originalCreate = QuestionsService.createQuestion;
    QuestionsService.createQuestion = async () => ({ id: 'q-created' } as any);

    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        statement: 'What is a binary tree?',
        type: 'mcq_single',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'A tree structure', is_correct: true }
        ]
      });

    // It should hit validation success or validation error, but NOT 403!
    // Since we sent valid properties, it should successfully pass validation and hit controller -> return 201.
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data.id).to.equal('q-created');

    QuestionsService.createQuestion = originalCreate;
  });
});
