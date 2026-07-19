import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CommunityRepoService } from '../services/community_repo.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function uploadSubmission(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityRepoService.submitSubmission(req.user.id, req.user.collegeId || '', req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to process upload submission', 400);
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await CommunityRepoService.getUserHistory(req.user.id, page, limit);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch history', 400);
  }
}

export async function getReviewQueue(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    // RBAC check: Host/Admin only
    if (req.user.role !== 'admin' && req.user.role !== 'host') {
      return errorResponse(res, 'Access denied. Hosts or Admins only.', 403);
    }
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await CommunityRepoService.getReviewQueue(req.user.collegeId || '', page, limit);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load review queue', 400);
  }
}

export async function reviewSubmission(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    if (req.user.role !== 'admin' && req.user.role !== 'host') {
      return errorResponse(res, 'Access denied. Hosts or Admins only.', 403);
    }
    const { id } = req.params;
    const { action, notes } = req.body; // action: approve / reject / merge
    const result = await CommunityRepoService.reviewSubmission(id, req.user.id, action, notes);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to submit review', 400);
  }
}

export async function getDuplicates(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const result = await CommunityRepoService.getDuplicatesList(id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load duplicate matches', 400);
  }
}

export async function runOCR(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { jobId } = req.body;
    await CommunityRepoService.processOCRJob(jobId);
    return successResponse(res, { message: 'OCR job completed' }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to run OCR job', 400);
  }
}

export async function withdrawSubmission(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const result = await CommunityRepoService.withdrawSubmission(id, req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to withdraw submission', 400);
  }
}
