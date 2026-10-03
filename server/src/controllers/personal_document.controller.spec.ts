import { expect } from 'chai';
import {
  uploadPersonalDocument,
  listPersonalDocuments,
  getPersonalDocument,
  deletePersonalDocument,
  askPersonalDocument,
  listPersonalCollections,
  createPersonalCollection
} from './ai.controller';
import { PersonalDocumentService } from '../services/personal_document.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Personal Document Controller Unit Tests', () => {
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

  describe('uploadPersonalDocument', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq = { user: undefined };
      await uploadPersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(401);
      expect(resJson.success).to.be.false;
    });

    it('should return 400 if title is missing', async () => {
      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        body: { rawText: 'Some notes' }
      };
      await uploadPersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(400);
      expect(resJson.error).to.include('title is required');
    });

    it('should return 201 when document is successfully created', async () => {
      const orig = PersonalDocumentService.createAndProcessDocument;
      PersonalDocumentService.createAndProcessDocument = async () => ({
        id: 'doc-123',
        title: 'Binary Search Notes',
        user_id: 'u1'
      } as any);

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        body: { title: 'Binary Search Notes', rawText: 'Binary search works on sorted arrays.' }
      };

      await uploadPersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(201);
      expect(resJson.success).to.be.true;
      expect(resJson.data.id).to.equal('doc-123');

      PersonalDocumentService.createAndProcessDocument = orig;
    });
  });

  describe('listPersonalDocuments', () => {
    it('should return 200 and user documents', async () => {
      const orig = PersonalDocumentService.listUserDocuments;
      PersonalDocumentService.listUserDocuments = async (userId: string) => [
        { id: 'doc-1', title: 'Note 1', user_id: userId } as any
      ];

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' }
      };

      await listPersonalDocuments(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(200);
      expect(resJson.success).to.be.true;
      expect(resJson.data).to.have.lengthOf(1);

      PersonalDocumentService.listUserDocuments = orig;
    });
  });

  describe('getPersonalDocument', () => {
    it('should return 200 and document details', async () => {
      const orig = PersonalDocumentService.getDocumentById;
      PersonalDocumentService.getDocumentById = async (userId: string, id: string) => ({
        id,
        title: 'Specific Doc',
        user_id: userId
      } as any);

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        params: { id: 'doc-123' }
      };

      await getPersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(200);
      expect(resJson.success).to.be.true;
      expect(resJson.data.id).to.equal('doc-123');

      PersonalDocumentService.getDocumentById = orig;
    });
  });

  describe('deletePersonalDocument', () => {
    it('should return 200 and delete confirmation', async () => {
      const orig = PersonalDocumentService.deleteDocument;
      PersonalDocumentService.deleteDocument = async () => ({ success: true, message: 'Deleted' });

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        params: { id: 'doc-123' }
      };

      await deletePersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(200);
      expect(resJson.success).to.be.true;

      PersonalDocumentService.deleteDocument = orig;
    });
  });

  describe('askPersonalDocument', () => {
    it('should return 400 if query is missing', async () => {
      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        params: { id: 'doc-123' },
        body: {}
      };

      await askPersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(400);
    });

    it('should return 200 with grounded AI answer', async () => {
      const orig = PersonalDocumentService.askDocumentAI;
      PersonalDocumentService.askDocumentAI = async () => ({
        answer: 'Time complexity is O(log n)',
        documentTitle: 'Binary Search Notes',
        provider: 'ollama',
        tokensUsed: 42
      });

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        params: { id: 'doc-123' },
        body: { query: 'What is the time complexity?' }
      };

      await askPersonalDocument(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(200);
      expect(resJson.success).to.be.true;
      expect(resJson.data.answer).to.include('O(log n)');

      PersonalDocumentService.askDocumentAI = orig;
    });
  });

  describe('Personal Collections', () => {
    it('listPersonalCollections should return 200', async () => {
      const orig = PersonalDocumentService.listCollections;
      PersonalDocumentService.listCollections = async () => [];

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' }
      };

      await listPersonalCollections(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(200);
      expect(resJson.success).to.be.true;

      PersonalDocumentService.listCollections = orig;
    });

    it('createPersonalCollection should return 201 on valid name', async () => {
      const orig = PersonalDocumentService.createCollection;
      PersonalDocumentService.createCollection = async () => ({
        id: 'col-1',
        name: 'DSA Prep',
        user_id: 'u1'
      } as any);

      mockReq = {
        user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
        body: { name: 'DSA Prep' }
      };

      await createPersonalCollection(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
      expect(resStatus).to.equal(201);
      expect(resJson.success).to.be.true;

      PersonalDocumentService.createCollection = orig;
    });
  });
});
