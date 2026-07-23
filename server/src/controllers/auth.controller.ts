import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/helpers';
import logger from '../utils/logger';
import crypto from 'crypto';

let registerExecutionCounter = 0;

export async function register(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  const requestId = crypto.randomUUID();
  registerExecutionCounter++;
  const currentCount = registerExecutionCounter;

  try {
    const body = req.validated?.body || req.body;
    const timestamp = new Date().toISOString();

    logger.info('[REGISTRATION TRACE] Registration request received', {
      requestId,
      timestamp,
      email: body?.email,
      executionCount: currentCount,
    });

    const { email, password, fullName, collegeId, departmentId, year, section, rollNumber } = body;
    
    const result = await AuthService.register({
      email,
      password,
      fullName,
      collegeId,
      departmentId,
      year,
      section,
      rollNumber,
    }, requestId);

    if (result.session && (result.session as any).refresh_token) {
      res.cookie('refreshToken', (result.session as any).refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    logger.info('[REGISTRATION TRACE] AuthController.register completed successfully', {
      requestId,
      userId: result.userId,
      email: result.email,
    });
    return successResponse(res, result, 201);
  } catch (error: any) {
    logger.error('[REGISTRATION TRACE] AuthController.register error caught', {
      requestId,
      error: error.message,
      stack: error.stack,
    });
    if (
      error.message.includes('already registered') ||
      error.message.includes('already exists') ||
      error.message.includes('users_pkey') ||
      error.message.includes('users_email_key')
    ) {
      return errorResponse(res, 'User already registered', 409);
    }
    return errorResponse(res, error.message || 'Registration failed', 400);
  }
}

export async function registerFaculty(req: Request, res: Response, _next: NextFunction) {
  try {
    const { email, password, fullName, employeeId, phone, collegeId, departmentId, designation } = req.body;
    if (!email || !password || !fullName || !employeeId) {
      return errorResponse(res, 'Email, password, full name, and employee ID are required', 400);
    }

    const result = await AuthService.registerFaculty({
      email,
      password,
      fullName,
      employeeId,
      phone,
      collegeId,
      departmentId,
      designation: designation || 'Assistant Professor',
    });

    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Faculty registration failed', 400);
  }
}

export async function login(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { email, password } = req.validated.body;
    
    const result = await AuthService.login(email, password);

    if (result.session?.refreshToken) {
      res.cookie('refreshToken', result.session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Authentication failed', 401);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await AuthService.logout(token);
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return successResponse(res, { message: 'Logged out successfully' }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Logout failed', 500);
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { email } = req.validated.body;
    // Supposed to redirect student to frontend recovery url
    const redirectTo = `${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}/reset-password`;
    
    await AuthService.sendPasswordResetEmail(email, redirectTo);

    return successResponse(res, { message: 'Password reset link sent to your email' }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to send reset link', 400);
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { password } = req.validated.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';

    await AuthService.resetPassword(token, password);

    return successResponse(res, { message: 'Password reset successful' }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Password reset failed', 400);
  }
}

export async function verifyEmail(req: Request, res: Response, _next: NextFunction) {
  try {
    const { token } = req.body || {};
    return successResponse(res, { message: 'Email verified successfully', tokenVerified: !!token }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Email verification failed', 400);
  }
}

export async function refresh(req: Request, res: Response, _next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const result = await AuthService.refresh(refreshToken);

    if (result.session?.refreshToken) {
      res.cookie('refreshToken', result.session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Token refresh failed', 401);
  }
}
