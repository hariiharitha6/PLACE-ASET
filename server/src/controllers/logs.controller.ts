import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { LoggingService } from '../services/logging.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getActivityLogs(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const userId = req.query.userId as string;
    const action = req.query.action as string;

    const result = await LoggingService.getActivityLogs(req.user.collegeId || '', {
      page, limit, userId, action
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch activity logs', 400);
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const adminId = req.query.adminId as string;
    const action = req.query.action as string;

    const result = await LoggingService.getAuditLogs(req.user.collegeId || '', {
      page, limit, adminId, action
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch audit logs', 400);
  }
}
