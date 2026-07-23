import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { getSupabaseAdmin } from '../config/database';

export type UserRole =
  | 'super_admin'
  | 'college_admin'
  | 'principal'
  | 'hod'
  | 'placement_cell'
  | 'host'
  | 'faculty'
  | 'student';

export const ROLE_HIERARCHY: Record<UserRole | string, number> = {
  super_admin: 8,
  college_admin: 7,
  principal: 6,
  hod: 5,
  placement_cell: 4,
  host: 3,
  faculty: 2,
  student: 1,
  guest: 0,
};

export function checkRole(allowedRoles: (UserRole | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userRole = req.user.role;

    // super_admin overrides everything
    if (userRole === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole,
      });
    }

    next();
  };
}

export function requireMinRole(minRole: UserRole | string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permission level',
      });
    }

    next();
  };
}

/**
 * Dynamic Permission Engine Checker
 */
export function checkPermission(permissionName: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    try {
      const supabaseAdmin = getSupabaseAdmin();
      const userId = req.user.id;
      const userRole = req.user.role;

      // 1. Check user-specific active permissions
      const { data: userPerm } = await supabaseAdmin
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('permission_id', permissionName)
        .maybeSingle();

      if (userPerm) {
        if (userPerm.is_granted && (!userPerm.expires_at || new Date(userPerm.expires_at) > new Date())) {
          return next();
        }
        if (!userPerm.is_granted) {
          return res.status(403).json({ success: false, error: `Permission '${permissionName}' explicitly denied` });
        }
      }

      // 2. Check role default permissions
      const { data: rolePerm } = await supabaseAdmin
        .from('role_permissions')
        .select('*')
        .eq('role_id', userRole)
        .eq('permission_id', permissionName)
        .maybeSingle();

      if (rolePerm) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Permission '${permissionName}' required to execute this operation`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Permission verification error' });
    }
  };
}
