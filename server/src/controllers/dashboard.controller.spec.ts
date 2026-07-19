import { expect } from 'chai';
import { 
  getDashboardSummary, 
  getDashboardStats, 
  getActivityLogs, 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from './dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Dashboard Controller Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let resStatus: number;
  let resJson: any;

  beforeEach(() => {
    resStatus = 200;
    resJson = null;
    mockRes = {
      status: (code: number) => {
        resStatus = code;
        return mockRes as Response;
      },
      json: (data: any) => {
        resJson = data;
        return mockRes as Response;
      },
    };
  });

  it('getDashboardSummary should return 200 on success', async () => {
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

    mockReq = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
        collegeId: 'college-uuid-1',
      },
    };

    await getDashboardSummary(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.profile.xp).to.equal(500);

    DashboardService.getSummary = originalSummary;
  });

  it('getDashboardStats should return 200 with practice telemetry', async () => {
    const originalStats = DashboardService.getStats;
    DashboardService.getStats = async () => ({
      xpHistory: [],
      totalAnswers: 12,
      accuracy: 75,
      correctAnswers: 9,
    });

    mockReq = {
      user: { id: 'test-user-id', email: 'test@example.com', role: 'student', collegeId: 'c1' },
    };

    await getDashboardStats(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.accuracy).to.equal(75);

    DashboardService.getStats = originalStats;
  });

  it('getActivityLogs should return 200 with logs list', async () => {
    const originalLogs = DashboardService.getActivityLogs;
    DashboardService.getActivityLogs = async () => [
      { id: 'log-1', action: 'solved_practice', target_type: 'question', created_at: 'now', metadata: {} }
    ];

    mockReq = {
      user: { id: 'test-user-id', email: 'test@example.com', role: 'student', collegeId: 'c1' },
    };

    await getActivityLogs(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data).to.have.lengthOf(1);

    DashboardService.getActivityLogs = originalLogs;
  });

  it('getNotifications should return 200 with alerts list', async () => {
    const originalNotifs = DashboardService.getNotifications;
    DashboardService.getNotifications = async () => [
      { id: 'n-1', type: 'level_up', title: 'Level up!', message: 'You reached level 2', action_url: '', is_read: false, created_at: 'now' }
    ];

    mockReq = {
      user: { id: 'test-user-id', email: 'test@example.com', role: 'student', collegeId: 'c1' },
    };

    await getNotifications(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].title).to.equal('Level up!');

    DashboardService.getNotifications = originalNotifs;
  });

  it('markNotificationRead should return 200 with updated alert', async () => {
    const originalRead = DashboardService.markNotificationRead;
    DashboardService.markNotificationRead = async () => ({
      id: 'n-1',
      is_read: true,
    } as any);

    mockReq = {
      user: { id: 'test-user-id', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      params: { id: 'n-1' },
    };

    await markNotificationRead(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.is_read).to.be.true;

    DashboardService.markNotificationRead = originalRead;
  });

  it('markAllNotificationsRead should return 200 on success', async () => {
    const originalAll = DashboardService.markAllNotificationsRead;
    DashboardService.markAllNotificationsRead = async () => ({ success: true });

    mockReq = {
      user: { id: 'test-user-id', email: 'test@example.com', role: 'student', collegeId: 'c1' },
    };

    await markAllNotificationsRead(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    DashboardService.markAllNotificationsRead = originalAll;
  });
});
