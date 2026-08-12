import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AIMentorService } from '../services/ai_mentor.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getUserChats(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AIMentorService.getUserChats(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load mentor sessions', 400);
  }
}

export async function createChatSession(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { category, title } = req.body;
    const result = await AIMentorService.createChatSession(req.user.id, category, title);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create chat session', 400);
  }
}

export async function getChatMessages(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AIMentorService.getChatMessages(req.params.id, req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load chat messages', 400);
  }
}

export async function sendMentorMessage(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { message, category } = req.body;
    const result = await AIMentorService.sendMentorMessage(req.user.id, req.params.id, message, category);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to send mentor message', 400);
  }
}

export async function executeQuickPrompt(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { mode } = req.body;
    const result = await AIMentorService.executeQuickPrompt(req.user.id, mode || 'daily_plan');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to execute quick prompt', 400);
  }
}
