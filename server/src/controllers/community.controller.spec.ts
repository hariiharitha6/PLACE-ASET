import { expect } from 'chai';
import {
  listCommunityQuestions,
  submitCommunityQuestion,
  reviewCommunityQuestion,
  listSolutions,
  submitSolution,
  voteSolution,
  listDiscussions,
  getDiscussionDetail,
  createDiscussion,
  createReply,
  acceptAnswer,
  toggleReaction,
  toggleBookmark,
  getAISuggestedAnswer,
  togglePin,
  reportContent
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

  it('listDiscussions should return 200 on success', async () => {
    const original = CommunityService.listDiscussions;
    CommunityService.listDiscussions = async () => ({ discussions: [], total: 0, page: 1, limit: 12, totalPages: 0 });
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, query: {} };
    await listDiscussions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.listDiscussions = original;
  });

  it('getDiscussionDetail should return 200 on success', async () => {
    const original = CommunityService.getDiscussionDetail;
    CommunityService.getDiscussionDetail = async () => ({ id: 'd1', title: 'Discussion' } as any);
    mockReq = { params: { id: 'd1' } };
    await getDiscussionDetail(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.title).to.equal('Discussion');
    CommunityService.getDiscussionDetail = original;
  });

  it('createDiscussion should return 201 on success', async () => {
    const original = CommunityService.createDiscussion;
    CommunityService.createDiscussion = async () => ({ id: 'd1', title: 'Title' } as any);
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, body: { title: 'Title', content: 'Content' } };
    await createDiscussion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CommunityService.createDiscussion = original;
  });

  it('createReply should return 201 on success', async () => {
    const original = CommunityService.createReply;
    CommunityService.createReply = async () => ({ id: 'rep1', content: 'Reply' } as any);
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, params: { id: 'd1' }, body: { content: 'Reply' } };
    await createReply(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CommunityService.createReply = original;
  });

  it('acceptAnswer should return 200 on success', async () => {
    const original = CommunityService.acceptAnswer;
    CommunityService.acceptAnswer = async () => ({ success: true, accepted_reply_id: 'rep1' });
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, params: { id: 'd1', replyId: 'rep1' } };
    await acceptAnswer(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.acceptAnswer = original;
  });

  it('toggleReaction should return 200 on success', async () => {
    const original = CommunityService.toggleReaction;
    CommunityService.toggleReaction = async () => ({ reacted: true });
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, body: { discussionId: 'd1' } };
    await toggleReaction(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.toggleReaction = original;
  });

  it('toggleBookmark should return 200 on success', async () => {
    const original = CommunityService.toggleBookmark;
    CommunityService.toggleBookmark = async () => ({ bookmarked: true });
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, params: { id: 'd1' } };
    await toggleBookmark(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.toggleBookmark = original;
  });

  it('getAISuggestedAnswer should return 200 on success', async () => {
    const original = CommunityService.getAISuggestedAnswer;
    CommunityService.getAISuggestedAnswer = async () => ({ ai_suggested_answer: 'Answer', provider: 'gemini' });
    mockReq = { params: { id: 'd1' } };
    await getAISuggestedAnswer(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.getAISuggestedAnswer = original;
  });

  it('togglePin should return 200 on success', async () => {
    const original = CommunityService.togglePin;
    CommunityService.togglePin = async () => ({ is_pinned: true });
    mockReq = { user: { id: 'u1', email: 'faculty@e.com', role: 'faculty', collegeId: 'c1' }, params: { id: 'd1' } };
    await togglePin(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CommunityService.togglePin = original;
  });

  it('reportContent should return 201 on success', async () => {
    const original = CommunityService.reportContent;
    CommunityService.reportContent = async () => ({ id: 'rep1', status: 'pending' } as any);
    mockReq = { user: { id: 'u1', email: 'student@e.com', role: 'student', collegeId: 'c1' }, body: { discussion_id: 'd1', reason: 'Spam' } };
    await reportContent(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CommunityService.reportContent = original;
  });
});
