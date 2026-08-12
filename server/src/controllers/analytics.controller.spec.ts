import { expect } from 'chai';
import {
  getStudentAnalytics,
  getDepartmentAnalytics,
  getPlacementAnalytics,
  getExecutiveAnalytics
} from './analytics.controller';
import { AnalyticsService } from '../services/analytics.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Analytics Controller Unit Tests', () => {
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

  it('getStudentAnalytics should return 200 on success', async () => {
    const original = AnalyticsService.getStudentAnalytics;
    AnalyticsService.getStudentAnalytics = async () => ({ summary: {}, heatmap: [], skillBreakdown: [], recentSessions: [] } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' }
    };
    await getStudentAnalytics(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AnalyticsService.getStudentAnalytics = original;
  });

  it('getDepartmentAnalytics should return 200 on success', async () => {
    const original = AnalyticsService.getDepartmentAnalytics;
    AnalyticsService.getDepartmentAnalytics = async () => ({ totalStudents: 10, avgReadiness: 80, activeDepartment: 'CSE', topPerformers: [] });
    mockReq = {
      user: { id: 'u1', email: 'faculty@e.com', role: 'faculty', collegeId: 'c1' },
      query: { department: 'CSE' }
    };
    await getDepartmentAnalytics(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AnalyticsService.getDepartmentAnalytics = original;
  });

  it('getPlacementAnalytics should return 200 on success', async () => {
    const original = AnalyticsService.getPlacementAnalytics;
    AnalyticsService.getPlacementAnalytics = async () => ({ placementEligibleStudents: 80, readyCount: 40, nearReadyCount: 30, needsPreparationCount: 10, averageAptitudeScore: 80, averageTechnicalScore: 75 });
    mockReq = {
      user: { id: 'u1', email: 'placement@e.com', role: 'placement_cell', collegeId: 'c1' }
    };
    await getPlacementAnalytics(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AnalyticsService.getPlacementAnalytics = original;
  });

  it('getExecutiveAnalytics should return 200 on success', async () => {
    const original = AnalyticsService.getExecutiveAnalytics;
    AnalyticsService.getExecutiveAnalytics = async () => ({ totalUsers: 100, totalQuestions: 500, activeColleges: 1, overallPlatformActivityRate: 90 });
    mockReq = {
      user: { id: 'u1', email: 'principal@e.com', role: 'principal', collegeId: 'c1' }
    };
    await getExecutiveAnalytics(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AnalyticsService.getExecutiveAnalytics = original;
  });
});
