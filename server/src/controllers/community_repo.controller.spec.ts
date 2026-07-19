import { expect } from 'chai';
import {
  uploadSubmission,
  getHistory,
  getReviewQueue,
  reviewSubmission,
  getDuplicates,
  runOCR,
  withdrawSubmission
} from './community_repo.controller';
import { CommunityRepoService } from '../services/community_repo.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Community Repository Controller Unit Tests', () => {
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

  it('uploadSubmission should return 201 on success', async () => {
    const original = CommunityRepoService.submitSubmission;
    CommunityRepoService.submitSubmission = async () => ({ id: 'sub-1', title: 'Calculus Questions' } as any);

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'student', collegeId: 'c1' },
      body: { title: 'Calculus Questions', type: 'question' }
    };

    await uploadSubmission(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    expect(resJson.data.title).to.equal('Calculus Questions');

    CommunityRepoService.submitSubmission = original;
  });

  it('getHistory should return 200 with list', async () => {
    const original = CommunityRepoService.getUserHistory;
    CommunityRepoService.getUserHistory = async () => ({ history: [{ id: 'sub-1', title: 'Calculus' }], total: 1 } as any);

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'student', collegeId: 'c1' },
      query: { page: '1', limit: '20' }
    };

    await getHistory(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.history[0].title).to.equal('Calculus');

    CommunityRepoService.getUserHistory = original;
  });

  it('getReviewQueue should deny access to students', async () => {
    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'student', collegeId: 'c1' }
    };

    await getReviewQueue(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(403);
    expect(resJson.success).to.be.false;
  });

  it('getReviewQueue should return 200 for admins', async () => {
    const original = CommunityRepoService.getReviewQueue;
    CommunityRepoService.getReviewQueue = async () => ({ submissions: [], total: 0 } as any);

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'admin', collegeId: 'c1' },
      query: { page: '1', limit: '20' }
    };

    await getReviewQueue(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    CommunityRepoService.getReviewQueue = original;
  });

  it('reviewSubmission should allow admins to approve', async () => {
    const original = CommunityRepoService.reviewSubmission;
    CommunityRepoService.reviewSubmission = async () => ({ id: 'sub-1', status: 'approved' } as any);

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'admin', collegeId: 'c1' },
      params: { id: 'sub-1' },
      body: { action: 'approve', notes: 'Perfect quality' }
    };

    await reviewSubmission(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.status).to.equal('approved');

    CommunityRepoService.reviewSubmission = original;
  });

  it('getDuplicates should return matched items list', async () => {
    const original = CommunityRepoService.getDuplicatesList;
    CommunityRepoService.getDuplicatesList = async () => ([{ id: 'dc-1', similarity_score: 0.8 }] as any);

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'student', collegeId: 'c1' },
      params: { id: 'sub-1' }
    };

    await getDuplicates(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].similarity_score).to.equal(0.8);

    CommunityRepoService.getDuplicatesList = original;
  });

  it('withdrawSubmission should allow students to archive submission', async () => {
    const original = CommunityRepoService.withdrawSubmission;
    CommunityRepoService.withdrawSubmission = async () => ({ success: true } as any);

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'student', collegeId: 'c1' },
      params: { id: 'sub-1' }
    };

    await withdrawSubmission(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    CommunityRepoService.withdrawSubmission = original;
  });

  it('runOCR should return 200 on success', async () => {
    const original = CommunityRepoService.processOCRJob;
    CommunityRepoService.processOCRJob = async () => {};

    mockReq = {
      user: { id: 'u1', email: 'test@aset.com', role: 'student', collegeId: 'c1' },
      body: { jobId: 'job-1' }
    };

    await runOCR(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    CommunityRepoService.processOCRJob = original;
  });
});
