import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function scopeToCollege(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next();
  }

  // Super admins can pass any college_id via query/body to scope data, otherwise defaults to their own profile's collegeId
  if (req.user.role === 'super_admin') {
    req.collegeId = (req.query.college_id || req.body?.college_id || req.user.collegeId) as string | null;
  } else {
    req.collegeId = req.user.collegeId;
  }

  next();
}
