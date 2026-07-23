import { Router } from 'express';
import { register, registerFaculty, login, logout, forgotPassword, resetPassword, verifyEmail, refresh } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validator';
import { verifyJWT } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../models/validators/auth.schema';

const router = Router();

// Public auth routes (NO verifyJWT middleware)
router.post('/register', authLimiter, validate(registerSchema), register as any);
router.post('/register-faculty', authLimiter, registerFaculty as any);
router.post('/login', authLimiter, validate(loginSchema), login as any);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword as any);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword as any);
router.post('/verify-email', authLimiter, verifyEmail as any);
router.post('/refresh', authLimiter, refresh as any);

// Protected auth route (Requires valid JWT)
router.post('/logout', verifyJWT as any, logout as any);

export default router;
