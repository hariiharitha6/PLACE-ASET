import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ResourceService } from '../services/resource.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function listResources(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { page, limit, category_id, type, search, sortBy } = req.query as Record<string, string>;
    const result = await ResourceService.searchResources(req.user.collegeId || '', {
      page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 12,
      category_id, type, search, sortBy
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load resources', 400);
  }
}

export async function getResource(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await ResourceService.getResource(req.params.id);
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
