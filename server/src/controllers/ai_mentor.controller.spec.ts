import { expect } from 'chai';
import {
  getUserChats,
  createChatSession,
  getChatMessages,
  sendMentorMessage,
  executeQuickPrompt
} from './ai_mentor.controller';
import { AIMentorService } from '../services/ai_mentor.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('AI Mentor Controller Unit Tests', () => {
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

  it('getUserChats should return 200 on success', async () => {
    const original = AIMentorService.getUserChats;
    AIMentorService.getUserChats = async () => [];
    mockReq = { user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' } };
    await getUserChats(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AIMentorService.getUserChats = original;
  });

  it('createChatSession should return 201 on success', async () => {
    const original = AIMentorService.createChatSession;
    AIMentorService.createChatSession = async () => ({ id: 'chat1', title: 'New Chat' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { title: 'New Chat', category: 'general' }
    };
    await createChatSession(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    AIMentorService.createChatSession = original;
  });

  it('getChatMessages should return 200 on success', async () => {
    const original = AIMentorService.getChatMessages;
    AIMentorService.getChatMessages = async () => [];
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      params: { id: 'chat1' }
    };
    await getChatMessages(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AIMentorService.getChatMessages = original;
  });

  it('sendMentorMessage should return 201 on success', async () => {
    const original = AIMentorService.sendMentorMessage;
    AIMentorService.sendMentorMessage = async () => ({ id: 'm1', sender: 'assistant', message: 'Hello' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      params: { id: 'chat1' },
      body: { message: 'How do I learn DSA?' }
    };
    await sendMentorMessage(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    AIMentorService.sendMentorMessage = original;
  });

  it('executeQuickPrompt should return 200 on success', async () => {
    const original = AIMentorService.executeQuickPrompt;
    AIMentorService.executeQuickPrompt = async () => ({ mode: 'daily_plan', response: 'Plan', provider: 'gemini' });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { mode: 'daily_plan' }
    };
    await executeQuickPrompt(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AIMentorService.executeQuickPrompt = original;
  });
});
