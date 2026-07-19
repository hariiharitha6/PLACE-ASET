import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PracticeService } from '../services/practice.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function startPracticeSession(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const {
      category_id,
      difficulty,
      mode,
      questionCount,
      department_id,
      company_id,
      tags,
      question_type,
      solved_status,
      bookmarked_only,
      weak_topics_only,
      recently_added_only
    } = req.body;

    const result = await PracticeService.startSession(req.user.id, req.user.collegeId || '', {
      category_id,
      difficulty,
      mode: mode || 'topic',
      questionCount: questionCount || 10,
      department_id,
      company_id,
      tags,
      question_type,
      solved_status,
      bookmarked_only,
      weak_topics_only,
      recently_added_only
    });
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to start practice session', 400);
  }
}

export async function submitPracticeAnswer(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const sessionId = req.params.sessionId || req.body.sessionId;
    const { question_id, selected_option_id, time_spent } = req.body;
    if (!sessionId) return errorResponse(res, 'Session ID is required', 400);
    const result = await PracticeService.submitAnswer(sessionId, question_id, selected_option_id, time_spent || 0);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to submit answer', 400);
  }
}

export async function endPracticeSession(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const sessionId = req.params.sessionId || req.body.sessionId;
    if (!sessionId) return errorResponse(res, 'Session ID is required', 400);
    const result = await PracticeService.endSession(sessionId, req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to end practice session', 400);
  }
}

export async function getPracticeHistory(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const result = await PracticeService.getSessionHistory(req.user.id, page, limit);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load practice history', 400);
  }
}

export async function getPracticeSessionResults(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const sessionId = req.params.sessionId || req.query.sessionId;
    if (!sessionId) return errorResponse(res, 'Session ID is required', 400);
    const result = await PracticeService.getSessionResults(sessionId as string);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load session results', 400);
  }
}

export async function getPracticeStats(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await PracticeService.getUserStats(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load practice stats', 400);
  }
}

export async function getPracticeRecommendations(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await PracticeService.getRecommendations(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load recommendations', 400);
  }
}

export async function togglePracticeBookmark(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { questionId } = req.body;
    if (!questionId) return errorResponse(res, 'Question ID is required', 400);
    const result = await PracticeService.toggleBookmark(req.user.id, questionId);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to toggle bookmark', 400);
  }
}

export async function getPracticeBookmarks(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await PracticeService.getBookmarks(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load bookmarks', 400);
  }
}
