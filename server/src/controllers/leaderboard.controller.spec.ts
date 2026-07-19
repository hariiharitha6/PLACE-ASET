import { expect } from 'chai';
import {
  getPracticeLeaderboard,
  getChallengeLeaderboard,
  getContributorLeaderboard,
  getUserBadges,
  checkBadges,
  getXPHistory
} from './leaderboard.controller';
import { LeaderboardService, GamificationService } from '../services/leaderboard.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Leaderboard & Gamification Controller Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let resStatus: number;
  let resJson: any;

  beforeEach(() => {
    resStatus = 200;
    resJson = null;
    mockRes = {
      status: (code: number) => { resStatus = code; return mockRes as Response; },
      json: (data: any) => { resJson = data; return mockRes as Response; },
    };
  });

  it('getPracticeLeaderboard should return 200', async () => {
    const original = LeaderboardService.getPracticeLeaderboard;
    LeaderboardService.getPracticeLeaderboard = async () => ({ leaderboard: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    mockReq = { user: { id: 'u1', email: 'a@b.com', role: 'student', collegeId: 'c1' }, query: {} };
    await getPracticeLeaderboard(mockReq as any, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    LeaderboardService.getPracticeLeaderboard = original;
  });

  it('getChallengeLeaderboard should return 200', async () => {
    const original = LeaderboardService.getChallengeLeaderboard;
    LeaderboardService.getChallengeLeaderboard = async () => ({ leaderboard: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    mockReq = { user: { id: 'u1', email: 'a@b.com', role: 'student', collegeId: 'c1' }, query: {} };
    await getChallengeLeaderboard(mockReq as any, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    LeaderboardService.getChallengeLeaderboard = original;
  });

  it('getContributorLeaderboard should return 200', async () => {
    const original = LeaderboardService.getContributorLeaderboard;
    LeaderboardService.getContributorLeaderboard = async () => ({ leaderboard: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    mockReq = { user: { id: 'u1', email: 'a@b.com', role: 'student', collegeId: 'c1' }, query: {} };
    await getContributorLeaderboard(mockReq as any, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    LeaderboardService.getContributorLeaderboard = original;
  });

  it('getUserBadges should return 200 with badges', async () => {
    const original = GamificationService.getUserBadges;
    GamificationService.getUserBadges = async () => [{ id: 'b1', name: 'First Badge', earned: true, earnedAt: '2024-01-01' }] as any;
    mockReq = { user: { id: 'u1', email: 'a@b.com', role: 'student', collegeId: 'c1' } };
    await getUserBadges(mockReq as any, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.badges).to.have.length(1);
    GamificationService.getUserBadges = original;
  });

  it('checkBadges should return 200 with new badges', async () => {
    const original = GamificationService.checkAndAwardBadges;
    GamificationService.checkAndAwardBadges = async () => ({ newBadges: [], metrics: { questionsSolved: 10 } } as any);
    mockReq = { user: { id: 'u1', email: 'a@b.com', role: 'student', collegeId: 'c1' } };
    await checkBadges(mockReq as any, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    GamificationService.checkAndAwardBadges = original;
  });

  it('getXPHistory should return 200 with logs', async () => {
    const original = GamificationService.getXPHistory;
    GamificationService.getXPHistory = async () => ({ logs: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    mockReq = { user: { id: 'u1', email: 'a@b.com', role: 'student', collegeId: 'c1' }, query: {} };
    await getXPHistory(mockReq as any, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    GamificationService.getXPHistory = original;
  });
});
