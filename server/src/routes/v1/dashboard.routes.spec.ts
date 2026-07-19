import request from 'supertest';
import { expect } from 'chai';
import app from '../../app';
import * as dbModule from '../../config/database';
import { DashboardService } from '../../services/dashboard.service';

describe('Dashboard API Routes Integration Tests', () => {
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
                  email: 'test@example.com',
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

  it('GET /api/v1/dashboard/summary - should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary');

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('GET /api/v1/dashboard/summary - should return 200 on authorized request', async () => {
    const originalSummary = DashboardService.getSummary;
    DashboardService.getSummary = async () => ({
      profile: { xp: 500, level: 1, streak: 3, longestStreak: 5, rollNumber: '123', collegeRank: 2 },
      weeklyChallenge: null,
      practiceProgress: { totalSessions: 2, completedSessions: 2, totalScore: 40 },
      leaderboardPreview: [],
      upcomingEvents: [],
      latestResources: [],
      contributionsCount: 0,
    });

    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.profile.xp).to.equal(500);

    DashboardService.getSummary = originalSummary;
  });

  it('GET /api/v1/dashboard/stats - should return 200 on authorized request', async () => {
    const originalStats = DashboardService.getStats;
    DashboardService.getStats = async () => ({
      xpHistory: [],
      totalAnswers: 12,
      accuracy: 75,
      correctAnswers: 9,
    });

    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.accuracy).to.equal(75);

    DashboardService.getStats = originalStats;
  });
});
