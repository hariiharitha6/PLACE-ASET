import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analytics.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getStudentAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AnalyticsService.getStudentAnalytics(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load student analytics', 400);
  }
}

export async function getDepartmentAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { department } = req.query as Record<string, string>;
    const result = await AnalyticsService.getDepartmentAnalytics(req.user.collegeId || '', department);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load department analytics', 400);
  }
}

export async function getPlacementAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AnalyticsService.getPlacementAnalytics(req.user.collegeId || '');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load placement analytics', 400);
  }
}

export async function getExecutiveAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await AnalyticsService.getExecutiveAnalytics(req.user.collegeId || '');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load executive analytics', 400);
  }
}
