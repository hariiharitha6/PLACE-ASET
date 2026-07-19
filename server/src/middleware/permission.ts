import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';

/**
 * Express middleware to verify if the authenticated user has a specific permission
 * @param requiredPermission The name of the permission (e.g. 'challenges:create')
 */
export function requirePermission(requiredPermission: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Global super_admin bypasses all permission constraints
      if (req.user.role === 'super_admin') {
        return next();
      }

      const supabaseAdmin = getSupabaseAdmin();

      // Retrieve all permission names associated with the user's roles
      const { data: userRoles, error } = await supabaseAdmin
        .from('user_roles')
        .select(`
          roles (
            name,
            role_permissions (
              permissions (
                name
              )
            )
          )
        `)
        .eq('user_id', req.user.id);

      if (error || !userRoles) {
        logger.error('Failed to query user permissions', { 
          userId: req.user.id, 
          error: error?.message || 'No roles mapping found' 
        });
        return res.status(500).json({ success: false, error: 'Internal authorization error' });
      }

      // Check if any role maps to the required permission
      let hasPermission = false;
      for (const ur of userRoles as any[]) {
        const rolePermissions = ur.roles?.role_permissions || [];
        for (const rp of rolePermissions) {
          if (rp.permissions?.name === requiredPermission) {
            hasPermission = true;
            break;
          }
        }
        if (hasPermission) break;
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: `Forbidden. Insufficient permissions. Required: ${requiredPermission}`,
        });
      }

      next();
    } catch (err: any) {
      logger.error('Authorization check error', { error: err.message });
      return res.status(500).json({ success: false, error: 'Authorization validation failed' });
    }
  };
}
