import { expect } from 'chai';
import { getAchievementsList, getBadgesList } from './gamification.controller';
import { GamificationService } from '../services/gamification.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Gamification Controller Unit Tests', () => {
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

  it('getAchievementsList should return 200 with achievements progress list', async () => {
    const original = GamificationService.getAchievements;
    GamificationService.getAchievements = async () => ([
      { id: 'a-1', name: 'Practice Master', progressPct: 40, isUnlocked: false }
    ] as any);

    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' }
    };

    await getAchievementsList(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].id).to.equal('a-1');
    expect(resJson.data[0].progressPct).to.equal(40);
    
    GamificationService.getAchievements = original;
  });

  it('getBadgesList should return 200 with badges lock status list', async () => {
    const original = GamificationService.getBadges;
    GamificationService.getBadges = async () => ([
      { id: 'b-1', name: 'First Challenge Solver', isEarned: true }
    ] as any);

    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' }
    };

    await getBadgesList(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].id).to.equal('b-1');
    expect(resJson.data[0].isEarned).to.be.true;

    GamificationService.getBadges = original;
  });
});
