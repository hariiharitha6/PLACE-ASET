import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ResourceService } from '../services/resource.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function listResources(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { page, limit, category_id, type, department, subject, semester, difficulty, faculty, search, sortBy } = req.query as Record<string, string>;
    const result = await ResourceService.searchResources(req.user.collegeId || '', {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 12,
      category_id,
      type,
      department,
      subject,
      semester,
      difficulty,
      faculty,
      search,
      sortBy,
      userId: req.user.id
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load resources', 400);
  }
}

export async function getHubSections(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.getHubSections(req.user.id, req.user.collegeId || '');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load hub sections', 400);
  }
}

export async function getResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const userId = req.user?.id;
    const result = await ResourceService.getResource(req.params.id, userId);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Resource not found', 404);
  }
}

export async function createResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.createResource(req.user.id, req.user.collegeId || '', req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create resource', 400);
  }
}

export async function updateResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await ResourceService.updateResource(req.params.id, req.body);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to update resource', 400);
  }
}

export async function deleteResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await ResourceService.deleteResource(req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to delete resource', 400);
  }
}

export async function downloadResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.recordDownload(req.params.id, req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to record download', 400);
  }
}

export async function addBookmark(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.addBookmark(req.user.id, req.params.id);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to add bookmark', 400);
  }
}

export async function removeBookmark(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.removeBookmark(req.user.id, req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to remove bookmark', 400);
  }
}

export async function getUserBookmarks(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { search, sortBy, page, limit } = req.query as Record<string, string>;
    const result = await ResourceService.getUserBookmarks(req.user.id, {
      search,
      sortBy,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 12
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load bookmarks', 400);
  }
}

export async function getRecommendations(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.getPersonalizedRecommendations(req.user.id, req.user.collegeId || '');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load recommendations', 400);
  }
}

export async function processResourceAI(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await ResourceService.processResourceWithAI(req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'AI processing failed', 400);
  }
}

export async function runResourceAIPrompt(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { promptType, customQuestion } = req.body;
    const result = await ResourceService.runResourceAIPrompt(req.params.id, promptType, customQuestion);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'AI prompt execution failed', 400);
  }
}

export async function getFacultyAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.getFacultyAnalytics(req.user.id, req.user.collegeId || '');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load faculty analytics', 400);
  }
}

export async function getAdminAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await ResourceService.getAdminAnalytics(req.user.collegeId || '');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load admin analytics', 400);
  }
}

export async function moderateResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { action, comments } = req.body;
    const result = await ResourceService.moderateResource(req.params.id, req.user.id, action, comments);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to moderate resource', 400);
  }
}
