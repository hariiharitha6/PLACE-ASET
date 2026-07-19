import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { cacheGet, cacheSet } from '../utils/cache';

/**
 * Retrieves the dashboard summary payload for the student dashboard.
 */
export async function getDashboardSummary(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const collegeId = req.user.collegeId || '';
    if (!collegeId) {
      return errorResponse(res, 'User has no associated college', 400);
    }

    const cacheKey = `dashboard:summary:${req.user.id}:${collegeId}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return successResponse(res, cachedData, 200);
    }

    const summary = await DashboardService.getSummary(req.user.id, collegeId);
    
    // Cache the summary for 5 minutes (300 seconds)
    await cacheSet(cacheKey, summary, 300);

    return successResponse(res, summary, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch dashboard summary', 400);
  }
}

/**
 * Retrieves detailed practice telemetry and XP progress metrics.
 */
export async function getDashboardStats(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const stats = await DashboardService.getStats(req.user.id);
    return successResponse(res, stats, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch dashboard stats', 400);
  }
}

/**
 * Retrieves the candidate's activity history logs.
 */
export async function getActivityLogs(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const logs = await DashboardService.getActivityLogs(req.user.id);
    return successResponse(res, logs, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch activity logs', 400);
  }
}

/**
 * Retrieves the candidate's notifications list.
 */
export async function getNotifications(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const list = await DashboardService.getNotifications(req.user.id);
    return successResponse(res, list, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch notifications', 400);
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationRead(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Notification ID is required', 400);
    }

    const updated = await DashboardService.markNotificationRead(req.user.id, id);
    return successResponse(res, updated, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to mark notification as read', 400);
  }
}

/**
 * Marks all user's notifications as read.
 */
export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await DashboardService.markAllNotificationsRead(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to mark all notifications as read', 400);
  }
}
