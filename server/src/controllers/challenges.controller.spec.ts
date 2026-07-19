import { expect } from 'chai';
import { 
  getChallengesList, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge, 
  cloneChallenge, 
  assignQuestions, 
  startChallengeAttempt, 
  saveChallengeProgress, 
  finalizeChallengeAttempt, 
  logChallengeActivity, 
  getChallengeResults, 
  getChallengeDiscussions, 
  postChallengeComment,
  getChallengeDetails,
  publishChallenge,
  unpublishChallenge,
  archiveChallenge,
  getChallengeAnalytics,
  getChallengeQuestionsWithSolutions
} from './challenges.controller';
import { ChallengesService } from '../services/challenges.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Challenges Controller Unit Tests', () => {
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

  it('getChallengesList should return 200 on success', async () => {
    const originalList = ChallengesService.listChallenges;
    ChallengesService.listChallenges = async () => ({
      challenges: [{ id: 'c-1', title: 'Test Challenge', status: 'published' }] as any,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      query: { page: '1', limit: '10' },
    };

    await getChallengesList(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.challenges[0].title).to.equal('Test Challenge');

    ChallengesService.listChallenges = originalList;
  });

  it('createChallenge should return 201 on success', async () => {
    const originalCreate = ChallengesService.createChallenge;
    ChallengesService.createChallenge = async () => ({ id: 'c-new', title: 'New Prep' } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'coll-1' },
      body: { title: 'New Prep' },
    };

    await createChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    expect(resJson.data.id).to.equal('c-new');

    ChallengesService.createChallenge = originalCreate;
  });

  it('getChallengeDetails should return 200 with details', async () => {
    const originalGet = ChallengesService.getChallengeById;
    ChallengesService.getChallengeById = async () => ({ id: 'c-1', title: 'Test Challenge' } as any);

    mockReq = {
      params: { id: 'c-1' },
    };

    await getChallengeDetails(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.title).to.equal('Test Challenge');

    ChallengesService.getChallengeById = originalGet;
  });

  it('updateChallenge should return 200 with updated details', async () => {
    const originalUpdate = ChallengesService.updateChallenge;
    ChallengesService.updateChallenge = async () => ({ id: 'c-1', title: 'Updated' } as any);

    mockReq = {
      params: { id: 'c-1' },
      body: { title: 'Updated' },
    };

    await updateChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.updateChallenge = originalUpdate;
  });

  it('deleteChallenge should return 200', async () => {
    const originalDelete = ChallengesService.deleteChallenge;
    ChallengesService.deleteChallenge = async () => ({ success: true });

    mockReq = { params: { id: 'c-1' } };

    await deleteChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.deleteChallenge = originalDelete;
  });

  it('cloneChallenge should return 201', async () => {
    const originalClone = ChallengesService.cloneChallenge;
    ChallengesService.cloneChallenge = async () => ({ id: 'c-clone', title: 'Test (Clone)' } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await cloneChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;

    ChallengesService.cloneChallenge = originalClone;
  });

  it('assignQuestions should return 200', async () => {
    const originalAssign = ChallengesService.assignQuestions;
    ChallengesService.assignQuestions = async () => ({ success: true });

    mockReq = {
      params: { id: 'c-1' },
      body: { questions: [] },
    };

    await assignQuestions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.assignQuestions = originalAssign;
  });

  it('startChallengeAttempt should return 200 with exam details', async () => {
    const originalStart = ChallengesService.startChallenge;
    ChallengesService.startChallenge = async () => ({
      challenge: { id: 'c-1', title: 'Test Challenge', duration_minutes: 60, started_at: 'now' },
      questions: [],
      submissions: [],
    });

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await startChallengeAttempt(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.startChallenge = originalStart;
  });

  it('saveChallengeProgress should return 200', async () => {
    const originalSave = ChallengesService.saveProgress;
    ChallengesService.saveProgress = async () => ({ success: true });

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
      body: { answers: [] },
    };

    await saveChallengeProgress(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.saveProgress = originalSave;
  });

  it('finalizeChallengeAttempt should return 200 with result statistics', async () => {
    const originalFinalize = ChallengesService.finalizeAttempt;
    ChallengesService.finalizeAttempt = async () => ({
      score: 10,
      correctCount: 2,
      percentage: 50,
      totalTimeSeconds: 600,
    });

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await finalizeChallengeAttempt(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.finalizeAttempt = originalFinalize;
  });

  it('logChallengeActivity should return 200', async () => {
    const originalLog = ChallengesService.logActivity;
    ChallengesService.logActivity = async () => ({ success: true });

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
      body: { event_type: 'tab_switch', details: {} },
    };

    await logChallengeActivity(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.logActivity = originalLog;
  });

  it('getChallengeResults should return 200 with rankings', async () => {
    const originalResults = ChallengesService.getResults;
    ChallengesService.getResults = async () => ({
      leaderboard: [],
      personalResult: null,
    });

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await getChallengeResults(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.getResults = originalResults;
  });

  it('getChallengeDiscussions should return 200 with comments list', async () => {
    const originalComms = ChallengesService.getDiscussions;
    ChallengesService.getDiscussions = async () => [
      { id: 'cd-1', comment: 'Nice challenge', created_at: 'now' }
    ] as any;

    mockReq = { params: { id: 'c-1' } };

    await getChallengeDiscussions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    ChallengesService.getDiscussions = originalComms;
  });

  it('postChallengeComment should return 201 with created comment', async () => {
    const originalComment = ChallengesService.addComment;
    ChallengesService.addComment = async () => ({
      id: 'cd-1',
      comment: 'Good quiz',
    } as any);

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
      body: { comment: 'Good quiz' },
    };

    await postChallengeComment(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;

    ChallengesService.addComment = originalComment;
  });

  it('publishChallenge should return 200 with published challenge', async () => {
    const originalPublish = ChallengesService.publishChallenge;
    ChallengesService.publishChallenge = async () => ({ id: 'c-1', status: 'published' } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'host', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await publishChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.status).to.equal('published');

    ChallengesService.publishChallenge = originalPublish;
  });

  it('unpublishChallenge should return 200 with draft status', async () => {
    const originalUnpublish = ChallengesService.unpublishChallenge;
    ChallengesService.unpublishChallenge = async () => ({ id: 'c-1', status: 'draft' } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'host', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await unpublishChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.status).to.equal('draft');

    ChallengesService.unpublishChallenge = originalUnpublish;
  });

  it('archiveChallenge should return 200 with archived status', async () => {
    const originalArchive = ChallengesService.archiveChallenge;
    ChallengesService.archiveChallenge = async () => ({ id: 'c-1', status: 'archived' } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'host', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await archiveChallenge(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.status).to.equal('archived');

    ChallengesService.archiveChallenge = originalArchive;
  });

  it('getChallengeAnalytics should return 200 with analytics data', async () => {
    const originalAnalytics = ChallengesService.getChallengeAnalytics;
    ChallengesService.getChallengeAnalytics = async () => ({
      challenge: { id: 'c-1', title: 'Test', status: 'ended' },
      participation: { total_registrations: 10, total_started: 8, total_completed: 7, completion_rate: 87 },
      scores: { avg_score: 45, avg_percentage: 75, max_score: 60, score_distribution: {} },
      question_analytics: [],
      anti_cheat_summary: [],
      leaderboard: [],
    } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'host', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await getChallengeAnalytics(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.participation.total_registrations).to.equal(10);

    ChallengesService.getChallengeAnalytics = originalAnalytics;
  });

  it('getChallengeQuestionsWithSolutions should return 200 with solution data', async () => {
    const originalSolutions = ChallengesService.getChallengeQuestionsWithSolutions;
    ChallengesService.getChallengeQuestionsWithSolutions = async () => [
      { sort_order: 1, points: 2, questions: { id: 'q-1', statement: 'What is 2+2?', type: 'mcq', explanation: 'Basic math' } }
    ] as any;

    mockReq = {
      user: { id: 'student-1', email: 't@e.com', role: 'student', collegeId: 'coll-1' },
      params: { id: 'c-1' },
    };

    await getChallengeQuestionsWithSolutions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data).to.be.an('array');

    ChallengesService.getChallengeQuestionsWithSolutions = originalSolutions;
  });
});

