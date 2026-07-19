import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    
    const profile = await UserService.getProfile(req.user.id);
    return successResponse(res, profile, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch user profile', 404);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { fullName, avatarUrl, collegeId, departmentId, year, section, rollNumber } = req.validated.body;

    const updatedProfile = await UserService.updateProfile(req.user.id, {
      fullName,
      avatarUrl,
      collegeId,
      departmentId,
      year,
      section,
      rollNumber,
    });

    return successResponse(res, updatedProfile, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to update profile', 400);
  }
}

export async function getPreferences(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const prefs = await UserService.getPreferences(req.user.id);
    return successResponse(res, prefs, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to get preferences', 400);
  }
}

export async function updatePreferences(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const updated = await UserService.updatePreferences(req.user.id, req.body);
    return successResponse(res, updated, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to update preferences', 400);
  }
}
