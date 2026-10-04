import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AssistantService } from '../services/assistant.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getConversations(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const conversations = await AssistantService.getUserConversations(req.user.id);
    return successResponse(res, conversations, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to load conversations', 400);
  }
}

export async function createConversation(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { title, category } = req.body;
    const conversation = await AssistantService.createConversation(req.user.id, title, category);
    return successResponse(res, conversation, 201);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to create conversation', 400);
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const messages = await AssistantService.getConversationMessages(req.user.id, req.params.id);
    return successResponse(res, messages, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to load conversation messages', 400);
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { message, conversationId, context, mode } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return errorResponse(res, 'Message text is required', 400);
    }

    if (message.length > 4000) {
      return errorResponse(res, 'Message exceeds character limit (4000 max)', 400);
    }

    const result = await AssistantService.sendChatMessage(req.user.id, {
      conversationId,
      message: message.trim(),
      context,
      mode,
    });

    return successResponse(res, result, 201);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to process assistant message', 400);
  }
}

export async function renameConversation(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { title } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 'Title is required', 400);
    }
    const updated = await AssistantService.renameConversation(req.user.id, req.params.id, title.trim());
    return successResponse(res, updated, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to rename conversation', 400);
  }
}

export async function deleteConversation(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AssistantService.deleteConversation(req.user.id, req.params.id);
    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to delete conversation', 400);
  }
}

export async function clearConversation(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AssistantService.clearConversationMessages(req.user.id, req.params.id);
    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to clear conversation', 400);
  }
}

export async function executeQuickAction(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { action } = req.body;
    const validActions = ['daily_plan', 'weekly_review', 'career_roadmap', 'practice_recommendations', 'interview_prep'];
    if (!validActions.includes(action)) {
      return errorResponse(res, 'Invalid action specified', 400);
    }
    const result = await AssistantService.executeQuickAction(req.user.id, action);
    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to execute quick action', 400);
  }
}
