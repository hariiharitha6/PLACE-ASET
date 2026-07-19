import request from 'supertest';
import { expect } from 'chai';
import app from '../../app';
import * as dbModule from '../../config/database';
import { ChallengesService } from '../../services/challenges.service';

describe('Challenges API Routes Integration Tests', () => {
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

  it('GET /api/v1/challenges - should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/challenges');

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('GET /api/v1/challenges - should return 200 on authorized request', async () => {
    stubAuthUser('student');
    const originalList = ChallengesService.listChallenges;
    ChallengesService.listChallenges = async () => ({
      challenges: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const res = await request(app)
      .get('/api/v1/challenges')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;

    ChallengesService.listChallenges = originalList;
  });

  it('POST /api/v1/challenges - should return 403 Forbidden for students', async () => {
    stubAuthUser('student');

    const res = await request(app)
      .post('/api/v1/challenges')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        title: 'Student Attempt Challenge Creation',
      });

    expect(res.status).to.equal(403);
    expect(res.body.success).to.be.false;
    expect(res.body.error).to.equal('Insufficient permissions');
  });

  it('POST /api/v1/challenges - should bypass RBAC role check for admins', async () => {
    stubAuthUser('super_admin');
    const originalCreate = ChallengesService.createChallenge;
    ChallengesService.createChallenge = async () => ({ id: 'c-created' } as any);

    const res = await request(app)
      .post('/api/v1/challenges')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        title: 'Weekly Prep Challenge #1',
        start_time: '2026-08-01T10:00:00.000Z',
        end_time: '2026-08-02T10:00:00.000Z',
      });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data.id).to.equal('c-created');

    ChallengesService.createChallenge = originalCreate;
  });
});
