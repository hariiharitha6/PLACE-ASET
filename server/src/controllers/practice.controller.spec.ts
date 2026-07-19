import { expect } from 'chai';
import {
  startPracticeSession,
  submitPracticeAnswer,
  endPracticeSession,
  getPracticeHistory,
  getPracticeSessionResults,
  getPracticeStats,
  getPracticeRecommendations,
  togglePracticeBookmark,
  getPracticeBookmarks
} from './practice.controller';
import { PracticeService } from '../services/practice.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Practice Controller Unit Tests', () => {
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

  it('startPracticeSession should return 201', async () => {
    const original = PracticeService.startSession;
    PracticeService.startSession = async () => ({
      session: { id: 's-1' } as any,
      questions: [{ id: 'q-1', statement: 'What?' }] as any
    });
    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      body: { mode: 'topic', questionCount: 5 }
    };
    await startPracticeSession(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    PracticeService.startSession = original;
  });

  it('submitPracticeAnswer should return 200', async () => {
    const original = PracticeService.submitAnswer;
    PracticeService.submitAnswer = async () => ({ answer: { id: 'a-1' } as any, isCorrect: true });
    mockReq = {
      params: { sessionId: 's-1' },
      body: { question_id: 'q-1', selected_option_id: 'o-1', time_spent: 12 }
    };
    await submitPracticeAnswer(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.isCorrect).to.be.true;
    PracticeService.submitAnswer = original;
  });

  it('endPracticeSession should return 200 with stats', async () => {
    const original = PracticeService.endSession;
    PracticeService.endSession = async () => ({
      sessionId: 's-1', totalQuestions: 5, totalAnswered: 5, correctCount: 3, wrongCount: 2, skippedCount: 0, accuracy: 60, xpEarned: 40
    });
    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      params: { sessionId: 's-1' }
    };
    await endPracticeSession(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.xpEarned).to.equal(40);
    PracticeService.endSession = original;
  });

  it('getPracticeHistory should return 200', async () => {
    const original = PracticeService.getSessionHistory;
    PracticeService.getSessionHistory = async () => ({
      sessions: [], total: 0, page: 1, limit: 10, totalPages: 0
    });
    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      query: { page: '1', limit: '10' }
    };
    await getPracticeHistory(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    PracticeService.getSessionHistory = original;
  });

  it('getPracticeSessionResults should return 200', async () => {
    const original = PracticeService.getSessionResults;
    PracticeService.getSessionResults = async () => ({
      session: { id: 's-1' } as any,
      answers: []
    });
    mockReq = { params: { sessionId: 's-1' } };
    await getPracticeSessionResults(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    PracticeService.getSessionResults = original;
  });

  it('getPracticeStats should return 200 with aggregates', async () => {
    const original = PracticeService.getUserStats;
    PracticeService.getUserStats = async () => ({
      totalSessions: 5, totalQuestions: 50, totalCorrect: 30, totalXP: 400,
      accuracy: 60, streak: 3, categoryBreakdown: []
    } as any);
    mockReq = { user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' } };
    await getPracticeStats(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.streak).to.equal(3);
    PracticeService.getUserStats = original;
  });

  it('getPracticeRecommendations should return 200 with suggestions', async () => {
    const original = PracticeService.getRecommendations;
    PracticeService.getRecommendations = async () => ([{ id: 'r-1', reason: 'Accuracy is low in Java' }] as any);
    mockReq = { user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' } };
    await getPracticeRecommendations(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data[0].id).to.equal('r-1');
    PracticeService.getRecommendations = original;
  });

  it('togglePracticeBookmark should return 200 with success status', async () => {
    const original = PracticeService.toggleBookmark;
    PracticeService.toggleBookmark = async () => ({ bookmarked: true });
    mockReq = {
      user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      body: { questionId: 'q-1' }
    };
    await togglePracticeBookmark(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.bookmarked).to.be.true;
    PracticeService.toggleBookmark = original;
  });

  it('getPracticeBookmarks should return 200 with bookmark list', async () => {
    const original = PracticeService.getBookmarks;
    PracticeService.getBookmarks = async () => (['q-1', 'q-2']);
    mockReq = { user: { id: 'u1', email: 't@e.com', role: 'student', collegeId: 'c1' } };
    await getPracticeBookmarks(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data).to.deep.equal(['q-1', 'q-2']);
    PracticeService.getBookmarks = original;
  });
});
