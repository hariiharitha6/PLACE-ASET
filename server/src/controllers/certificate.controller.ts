import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CertificateService } from '../services/certificate.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getUserCertificates(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CertificateService.getUserCertificates(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load certificates', 400);
  }
}

export async function getCertificateDetail(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await CertificateService.getCertificateDetail(req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Certificate not found', 404);
  }
}

export async function verifyCertificate(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await CertificateService.verifyCertificate(req.params.code);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Certificate verification failed', 400);
  }
}

export async function issueCertificate(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { target_user_id, title, category, metadata } = req.body;
    const result = await CertificateService.issueCertificate(target_user_id || req.user.id, req.user.collegeId || '', { title, category, metadata });
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to issue certificate', 400);
  }
}

export async function getUserAchievements(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CertificateService.getUserAchievements(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load achievements', 400);
  }
}

export async function checkAndUnlockAchievements(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CertificateService.checkAndUnlockAchievements(req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Achievement check failed', 400);
  }
}
