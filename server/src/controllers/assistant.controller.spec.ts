import { expect } from 'chai';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  renameConversation,
  deleteConversation,
  clearConversation,
  executeQuickAction,
} from './assistant.controller';
import { AssistantService } from '../services/assistant.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Assistant Controller Unit Tests', () => {
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

  it('getConversations should return 200 on success', async () => {
    const original = AssistantService.getUserConversations;
    AssistantService.getUserConversations = async () => [{ id: 'c1', title: 'Session 1' } as any];
    mockReq = { user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' } };

    await getConversations(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data).to.have.lengthOf(1);
    AssistantService.getUserConversations = original;
  });

  it('createConversation should return 201 on success', async () => {
    const original = AssistantService.createConversation;
    AssistantService.createConversation = async () => ({ id: 'c1', title: 'New Topic' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      body: { title: 'New Topic', category: 'practice' },
    };

    await createConversation(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    AssistantService.createConversation = original;
  });

  it('getMessages should return 200 on success', async () => {
    const original = AssistantService.getConversationMessages;
    AssistantService.getConversationMessages = async () => [{ id: 'm1', message: 'Hello' } as any];
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      params: { id: 'c1' },
    };

    await getMessages(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AssistantService.getConversationMessages = original;
  });

  it('sendMessage should return 201 on success with context', async () => {
    const original = AssistantService.sendChatMessage;
    AssistantService.sendChatMessage = async () => ({
      conversationId: 'c1',
      message: { id: 'm2', sender: 'assistant', message: 'Step 1: Understand binary search.' } as any,
    });
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      body: {
        conversationId: 'c1',
        message: 'How do I solve this question?',
        context: {
          type: 'practice',
          questionStatement: 'Find element in sorted array',
          category: 'DSA',
          difficulty: 'medium',
        },
      },
    };

    await sendMessage(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    expect(resJson.data.message.message).to.include('binary search');
    AssistantService.sendChatMessage = original;
  });

  it('sendMessage should reject empty message with 400', async () => {
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      body: { message: '   ' },
    };

    await sendMessage(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(400);
    expect(resJson.success).to.be.false;
  });

  it('sendMessage should reject oversized messages (>4000 chars)', async () => {
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      body: { message: 'a'.repeat(4001) },
    };

    await sendMessage(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(400);
    expect(resJson.success).to.be.false;
  });

  it('renameConversation should return 200 on success', async () => {
    const original = AssistantService.renameConversation;
    AssistantService.renameConversation = async () => ({ id: 'c1', title: 'Renamed Session' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      params: { id: 'c1' },
      body: { title: 'Renamed Session' },
    };

    await renameConversation(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AssistantService.renameConversation = original;
  });

  it('deleteConversation should return 200 on success', async () => {
    const original = AssistantService.deleteConversation;
    AssistantService.deleteConversation = async () => ({ success: true });
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      params: { id: 'c1' },
    };

    await deleteConversation(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AssistantService.deleteConversation = original;
  });

  it('clearConversation should return 200 on success', async () => {
    const original = AssistantService.clearConversationMessages;
    AssistantService.clearConversationMessages = async () => ({ success: true });
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      params: { id: 'c1' },
    };

    await clearConversation(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AssistantService.clearConversationMessages = original;
  });

  it('executeQuickAction should return 200 on valid action', async () => {
    const original = AssistantService.executeQuickAction;
    AssistantService.executeQuickAction = async () => ({
      action: 'daily_plan',
      response: 'Structured daily plan.',
      provider: 'ollama',
    });
    mockReq = {
      user: { id: 'u1', email: 'test@example.com', role: 'student', collegeId: 'c1' },
      body: { action: 'daily_plan' },
    };

    await executeQuickAction(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    AssistantService.executeQuickAction = original;
  });
});
