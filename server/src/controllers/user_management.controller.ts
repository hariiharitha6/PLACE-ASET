import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserManagementService } from '../services/user_management.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { LoggingService } from '../services/logging.service';

export async function listUsers(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { search, role, departmentId, collegeId, year, status, sortBy, sortOrder, page, limit } = req.query;

    const result = await UserManagementService.listUsers({
      search: search ? String(search) : undefined,
      role: role ? String(role) : undefined,
      departmentId: departmentId ? String(departmentId) : undefined,
      collegeId: collegeId ? String(collegeId) : undefined,
      year: year ? String(year) : undefined,
      status: status ? String(status) : undefined,
      sortBy: sortBy ? String(sortBy) : 'created_at',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to list users', 500);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await UserManagementService.updateUser(userId, updates);

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || '',
      role: req.user?.role || '',
      action: 'USER_PROFILE_UPDATED',
      targetTable: 'users',
      targetId: userId,
      details: `Updated fields: ${Object.keys(updates).join(', ')}`,
    });

    return successResponse(res, user, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to update user', 400);
  }
}

export async function changeUserRole(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return errorResponse(res, 'New role is required', 400);
    }

    const user = await UserManagementService.changeUserRole(userId, role, req.user?.id!);

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || '',
      role: req.user?.role || '',
      action: 'USER_ROLE_CHANGED',
      targetTable: 'users',
      targetId: userId,
      details: `Assigned new role: ${role}`,
    });

    return successResponse(res, user, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to change user role', 400);
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await UserManagementService.setUserStatus(userId, Boolean(isActive), reason);

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || '',
      role: req.user?.role || '',
      action: isActive ? 'USER_ENABLED' : 'USER_DISABLED',
      targetTable: 'users',
      targetId: userId,
      details: reason || (isActive ? 'User account enabled' : 'User account disabled'),
    });

    return successResponse(res, user, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to update user status', 400);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { userId } = req.params;

    const result = await UserManagementService.deleteUser(userId);

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || '',
      role: req.user?.role || '',
      action: 'USER_PERMANENTLY_DELETED',
      targetTable: 'users',
      targetId: userId,
      details: 'Permanently deleted user profile and authentication account',
    });

    return successResponse(res, result, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to delete user', 400);
  }
}

export async function bulkUserAction(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { userIds, action, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0 || !action) {
      return errorResponse(res, 'userIds array and action are required', 400);
    }

    const results = await UserManagementService.bulkUserAction(userIds, action, {
      role,
      actorId: req.user?.id,
    });

    await LoggingService.logAdminAuditAction({
      userId: req.user?.id,
      email: req.user?.email || '',
      role: req.user?.role || '',
      action: `BULK_USER_${action.toUpperCase()}`,
      targetTable: 'users',
      details: `Processed ${userIds.length} users with action: ${action}`,
    });

    return successResponse(res, results, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to execute bulk user action', 400);
  }
}
