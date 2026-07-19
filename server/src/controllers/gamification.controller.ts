import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { GamificationService } from '../services/gamification.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getAchievementsList(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await GamificationService.getAchievements(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load achievements', 400);
  }
}

export async function getBadgesList(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await GamificationService.getBadges(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load badges list', 400);
  }
}
