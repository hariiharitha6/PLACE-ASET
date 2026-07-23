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

export async function getPublicProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const targetUserId = req.params.id || req.user?.id;
    if (!targetUserId) {
      return errorResponse(res, 'Student ID required', 400);
    }

    const publicProfile = await UserService.getPublicProfile(targetUserId);

    if (req.user && req.user.id !== targetUserId) {
      await UserService.recordProfileVisit(req.user.id, targetUserId);
    }

    return successResponse(res, publicProfile, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch public profile', 404);
  }
}

export async function getUserAchievements(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const targetUserId = req.params.id || req.user?.id;
    if (!targetUserId) return errorResponse(res, 'Student ID required', 400);

    const achievements = await UserService.getUserAchievements(targetUserId);
    return successResponse(res, achievements, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch achievements', 400);
  }
}

export async function compareStudents(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const user1Id = (req.query.user1 as string) || req.user?.id || 'user-1';
    const user2Id = (req.query.user2 as string) || 'user-2';

    const comparison = await UserService.compareStudents(user1Id, user2Id);
    return successResponse(res, comparison, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to generate student comparison', 400);
  }
}

export async function uploadProfilePhoto(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);

    const { avatarUrl } = req.body;
    if (!avatarUrl) return errorResponse(res, 'Avatar URL required', 400);

    const updated = await UserService.updateProfile(req.user.id, { avatarUrl });
    return successResponse(res, updated, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to upload photo', 400);
  }
}

export async function deleteProfilePhoto(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);

    const updated = await UserService.updateProfile(req.user.id, { avatarUrl: null });
    return successResponse(res, updated, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to delete photo', 400);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const body = req.validated?.body || req.body;

    const updatedProfile = await UserService.updateProfile(req.user.id, {
      fullName: body.fullName,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      skills: body.skills,
      linkedinUrl: body.linkedinUrl,
      githubUrl: body.githubUrl,
      portfolioUrl: body.portfolioUrl,
      resumeUrl: body.resumeUrl,
      collegeId: body.collegeId,
      departmentId: body.departmentId,
      year: body.year,
      section: body.section,
      rollNumber: body.rollNumber,
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
