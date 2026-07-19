import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { LeaderboardService, GamificationService } from '../services/leaderboard.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { cacheGet, cacheSet } from '../utils/cache';

export async function getPracticeLeaderboard(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const collegeId = req.user.collegeId || '';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const timeframe = (req.query.timeframe as string) || 'all';
    const department = req.query.department as string || 'all';

    const cacheKey = `leaderboard:practice:${collegeId}:${department}:${timeframe}:${page}:${limit}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) return successResponse(res, cachedData, 200);

    const result = await LeaderboardService.getPracticeLeaderboard(collegeId, { page, limit, timeframe, department: department === 'all' ? undefined : department });
    await cacheSet(cacheKey, result, 300); // 5 minute cache
    
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load practice leaderboard', 400);
  }
}

export async function getChallengeLeaderboard(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const collegeId = req.user.collegeId || '';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const challengeId = req.query.challengeId as string || 'all';

    const cacheKey = `leaderboard:challenge:${collegeId}:${challengeId}:${page}:${limit}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) return successResponse(res, cachedData, 200);

    const result = await LeaderboardService.getChallengeLeaderboard(collegeId, { page, limit, challengeId: challengeId === 'all' ? undefined : challengeId });
    await cacheSet(cacheKey, result, 300);

    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load challenge leaderboard', 400);
  }
}

export async function getContributorLeaderboard(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const collegeId = req.user.collegeId || '';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const cacheKey = `leaderboard:contributor:${collegeId}:${page}:${limit}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) return successResponse(res, cachedData, 200);

    const result = await LeaderboardService.getContributorLeaderboard(collegeId, { page, limit });
    await cacheSet(cacheKey, result, 300);

    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load contributor leaderboard', 400);
  }
}

export async function getUserBadges(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const badges = await GamificationService.getUserBadges(req.user.id);
    return successResponse(res, { badges }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load badges', 400);
  }
}

export async function checkBadges(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await GamificationService.checkAndAwardBadges(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to check badges', 400);
  }
}

export async function getXPHistory(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await GamificationService.getXPHistory(req.user.id, page, limit);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load XP history', 400);
  }
}
