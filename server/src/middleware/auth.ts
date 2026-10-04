import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  collegeId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
  collegeId?: string | null;
  validated?: any;
}

export async function verifyJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabase();
    
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database service unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    let role = user.app_metadata?.user_role || user.app_metadata?.role || user.user_metadata?.role || user.user_metadata?.user_role;
    let collegeId = user.app_metadata?.college_id || user.user_metadata?.college_id || null;

    if (!role || role === 'student') {
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('role, college_id')
          .eq('id', user.id)
          .maybeSingle();

        if (dbUser) {
          if (dbUser.role) role = dbUser.role;
          if (dbUser.college_id) collegeId = dbUser.college_id;
        }
      } catch (dbErr) {
        // Fallback to existing role
      }
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: role || 'student',
      collegeId: collegeId || null,
    };

    next();
  } catch (error: any) {
    logger.error('JWT verification failed', { error: error.message });
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }
  
  // Verify token but proceed anyway if invalid (just won't have req.user)
  try {
    const token = authHeader.split(' ')[1];
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email || '',
        role: user.app_metadata?.user_role || 'student',
        collegeId: user.app_metadata?.college_id || null,
      };
    }
  } catch {
    req.user = undefined;
  }
  next();
}
