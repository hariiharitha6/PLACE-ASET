import { expect } from 'chai';
import { 
  searchQuestions, 
  createQuestion, 
  getQuestionDetails, 
  updateQuestion, 
  deleteQuestion, 
  archiveQuestion, 
  restoreQuestion, 
  cloneQuestion, 
  getQuestionHistory, 
  getRandomQuestions, 
  getBankStatistics 
} from './questions.controller';
import { QuestionsService } from '../services/questions.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Questions Controller Unit Tests', () => {
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

  it('searchQuestions should return 200 on success', async () => {
    const originalSearch = QuestionsService.searchAndFilter;
    QuestionsService.searchAndFilter = async () => ({
      questions: [
        { id: 'q-1', statement: 'What is DSA?', difficulty: 'easy', type: 'mcq_single' }
      ] as any,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    mockReq = {
      user: { id: 'user-1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      validated: { query: { page: 1, limit: 10 } },
    };

    await searchQuestions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.questions[0].statement).to.equal('What is DSA?');

    QuestionsService.searchAndFilter = originalSearch;
  });

  it('createQuestion should return 201 on successful insert', async () => {
    const originalCreate = QuestionsService.createQuestion;
    QuestionsService.createQuestion = async () => ({
      id: 'q-2',
      statement: 'Write a recursion tree.',
      difficulty: 'hard',
      type: 'mcq_single',
    } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'c1' },
      validated: { body: { statement: 'Write a recursion tree.', type: 'mcq_single', difficulty: 'hard' } },
    };

    await createQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    expect(resJson.data.id).to.equal('q-2');

    QuestionsService.createQuestion = originalCreate;
  });

  it('getQuestionDetails should return 200 with details', async () => {
    const originalGet = QuestionsService.getQuestionById;
    QuestionsService.getQuestionById = async () => ({
      id: 'q-1',
      statement: 'What is DSA?',
      difficulty: 'easy',
      type: 'mcq_single',
    } as any);

    mockReq = {
      user: { id: 'user-1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      params: { id: 'q-1' },
    };

    await getQuestionDetails(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.statement).to.equal('What is DSA?');

    QuestionsService.getQuestionById = originalGet;
  });

  it('updateQuestion should return 200 with updated question', async () => {
    const originalUpdate = QuestionsService.updateQuestion;
    QuestionsService.updateQuestion = async () => ({
      id: 'q-1',
      statement: 'Updated Statement',
    } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'c1' },
      params: { id: 'q-1' },
      validated: { body: { statement: 'Updated Statement' } },
    };

    await updateQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.statement).to.equal('Updated Statement');

    QuestionsService.updateQuestion = originalUpdate;
  });

  it('deleteQuestion should return 200', async () => {
    const originalDelete = QuestionsService.deleteQuestion;
    QuestionsService.deleteQuestion = async () => ({ success: true });

    mockReq = { params: { id: 'q-1' } };

    await deleteQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    QuestionsService.deleteQuestion = originalDelete;
  });

  it('archiveQuestion should return 200', async () => {
    const originalArchive = QuestionsService.archiveQuestion;
    QuestionsService.archiveQuestion = async () => ({ success: true });

    mockReq = { params: { id: 'q-1' } };

    await archiveQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    QuestionsService.archiveQuestion = originalArchive;
  });

  it('restoreQuestion should return 200', async () => {
    const originalRestore = QuestionsService.restoreQuestion;
    QuestionsService.restoreQuestion = async () => ({ success: true });

    mockReq = { params: { id: 'q-1' } };

    await restoreQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    QuestionsService.restoreQuestion = originalRestore;
  });

  it('cloneQuestion should return 201', async () => {
    const originalClone = QuestionsService.cloneQuestion;
    QuestionsService.cloneQuestion = async () => ({
      id: 'q-cloned',
      statement: 'What is DSA? (Copy)',
    } as any);

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'c1' },
      params: { id: 'q-1' },
    };

    await cloneQuestion(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    expect(resJson.data.statement).to.equal('What is DSA? (Copy)');

    QuestionsService.cloneQuestion = originalClone;
  });

  it('getQuestionHistory should return 200 with versions', async () => {
    const originalHistory = QuestionsService.getVersionHistory;
    QuestionsService.getVersionHistory = async () => [
      { id: 'v-1', version: 1, statement: 'Initial statement', created_at: 'now' }
    ] as any;

    mockReq = { params: { id: 'q-1' } };

    await getQuestionHistory(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].version).to.equal(1);

    QuestionsService.getVersionHistory = originalHistory;
  });

  it('getRandomQuestions should return 200 with random selection', async () => {
    const originalRandom = QuestionsService.getRandomQuestions;
    QuestionsService.getRandomQuestions = async () => [
      { id: 'q-random-1', statement: 'Random Q' }
    ] as any;

    mockReq = {
      user: { id: 'user-1', email: 't@e.com', role: 'student', collegeId: 'c1' },
      query: { limit: '2' },
    };

    await getRandomQuestions(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;

    QuestionsService.getRandomQuestions = originalRandom;
  });

  it('getBankStatistics should return 200 with stats', async () => {
    const originalStats = QuestionsService.getStatistics;
    QuestionsService.getStatistics = async () => ({
      totalQuestions: 15,
      types: { mcq_single: 10 },
      difficulties: { medium: 15 },
      statuses: { approved: 15 },
    });

    mockReq = {
      user: { id: 'user-1', email: 't@e.com', role: 'student', collegeId: 'c1' },
    };

    await getBankStatistics(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.totalQuestions).to.equal(15);

    QuestionsService.getStatistics = originalStats;
  });

  it('checkDuplicates should return 200 with matches list', async () => {
    const { checkDuplicates } = await import('./questions.controller');
    const { AIService } = await import('../services/ai.service');
    const originalDetect = AIService.detectDuplicates;
    AIService.detectDuplicates = async () => [{ question: { id: 'q-1' }, similarity: 0.85 }] as any;

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'c1' },
      body: { statement: 'What is DSA?', threshold: 0.7 }
    };

    await checkDuplicates(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].similarity).to.equal(0.85);

    AIService.detectDuplicates = originalDetect;
  });

  it('ocrImport should return 200 with parsed questions', async () => {
    const { ocrImport } = await import('./questions.controller');
    const { OCRService } = await import('../services/ocr.service');
    const originalProcess = OCRService.processImage;
    OCRService.processImage = async () => [{ statement: 'Complexity?', options: [], correctAnswer: 'B' }];

    mockReq = {
      user: { id: 'admin-1', email: 't@e.com', role: 'super_admin', collegeId: 'c1' },
      body: { imageUrl: 'http://example.com/image.png' }
    };

    await ocrImport(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data[0].statement).to.equal('Complexity?');

    OCRService.processImage = originalProcess;
  });
});


