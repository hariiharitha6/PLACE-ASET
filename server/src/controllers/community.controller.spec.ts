import { expect } from 'chai';
import {
  listCommunityQuestions,
  submitCommunityQuestion,
  reviewCommunityQuestion,
  listSolutions,
  submitSolution,
  voteSolution
} from './community.controller';
import { CommunityService } from '../services/community.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Community Controller Unit Tests', () => {
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

  it('listCommunityQuestions should return 200 on success', async () => {
    const original = CommunityService.listQuestions;
    CommunityService.listQuestions = async () => ({
      questions: [], total: 0, page: 1, limit: 12, totalPages: 0
    });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      query: {}
    };
    await listCommunityQuestions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.listQuestions = original;
  });

  it('submitCommunityQuestion should return 201 on success', async () => {
    const original = CommunityService.submitQuestion;
    CommunityService.submitQuestion = async () => ({ id: 'cq1', statement: 'Statement' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { statement: 'Statement', options: ['A', 'B'], correct_answer: 'A' }
    };
    await submitCommunityQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CommunityService.submitQuestion = original;
  });

  it('reviewCommunityQuestion should return 200 on success', async () => {
    const original = CommunityService.reviewQuestion;
    CommunityService.reviewQuestion = async () => ({ id: 'cq1', status: 'approved' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'admin', collegeId: 'c1' },
      params: { id: 'cq1' },
      body: { action: 'approved', review_notes: 'Good' }
    };
    await reviewCommunityQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.reviewQuestion = original;
  });

  it('listSolutions should return 200 on success', async () => {
    const original = CommunityService.listSolutions;
    CommunityService.listSolutions = async () => ({
      solutions: [], total: 0, page: 1, limit: 20, totalPages: 0
    });
    mockReq = {
      params: { questionId: 'q1' },
      query: {}
    };
    await listSolutions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.listSolutions = original;
  });

  it('submitSolution should return 201 on success', async () => {
    const original = CommunityService.submitSolution;
    CommunityService.submitSolution = async () => ({ id: 's1', content: 'Sol' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { question_id: 'q1', content: 'Sol' }
    };
    await submitSolution(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CommunityService.submitSolution = original;
  });

  it('voteSolution should return 200 on success', async () => {
    const original = CommunityService.voteSolution;
    CommunityService.voteSolution = async () => ({ action: 'voted' });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      params: { solutionId: 's1' },
      body: { vote_type: 'up' }
    };
    await voteSolution(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.voteSolution = original;
  });
});
