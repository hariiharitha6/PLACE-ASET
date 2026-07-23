import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RBACService } from '../services/rbac.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { LoggingService } from '../services/logging.service';

export async function getDesignations(_req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const designations = await RBACService.getDesignations();
    return successResponse(res, designations, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to fetch designations', 500);
  }
}

export async function listPermissionRequests(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { status } = req.query;
    const requests = await RBACService.listPermissionRequests(status ? String(status) : undefined);
    return successResponse(res, requests, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to fetch permission requests', 500);
  }
}

export async function createPermissionRequest(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { permissionId, reason, durationDays, priority } = req.body;
    if (!permissionId || !reason) {
      return errorResponse(res, 'permissionId and reason are required', 400);
    }

    const request = await RBACService.createPermissionRequest({
      userId: req.user?.id!,
      permissionId,
      reason,
      durationDays: Number(durationDays) || 7,
      priority,
    });

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || '',
      role: req.user?.role || '',
      action: 'PERMISSION_REQUEST_SUBMITTED',
      targetTable: 'permission_requests',
      details: `Requested '${permissionId}' for ${durationDays || 7} days`,
    });

    return successResponse(res, request, 201);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to submit permission request', 400);
  }
}

export async function approvePermissionRequest(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { requestId } = req.params;
    const { durationDays } = req.body;

    const result = await RBACService.approvePermissionRequest(requestId, req.user?.id!, durationDays ? Number(durationDays) : undefined);

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || 'admin@aset.ac.in',
      role: req.user?.role || 'super_admin',
      action: 'PERMISSION_REQUEST_APPROVED',
      targetTable: 'permission_requests',
      targetId: requestId,
      details: `Approved temporary permission grant for ${durationDays || 7} days`,
    });

    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to approve permission request', 400);
  }
}

export async function rejectPermissionRequest(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const result = await RBACService.rejectPermissionRequest(requestId, req.user?.id!, reason);

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || 'admin@aset.ac.in',
      role: req.user?.role || 'super_admin',
      action: 'PERMISSION_REQUEST_REJECTED',
      targetTable: 'permission_requests',
      targetId: requestId,
      details: reason || 'Permission request rejected',
    });

    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to reject permission request', 400);
  }
}

export async function getLiveSystemUsers(_req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const users = await RBACService.getLiveSystemUsers();
    return successResponse(res, users, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to fetch live system users', 500);
  }
}
