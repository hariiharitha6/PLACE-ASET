import { Router } from 'express';
import { register, login, logout, forgotPassword, resetPassword, refresh } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validator';
import { verifyJWT } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../models/validators/auth.schema';

const router = Router();

// Rate limited endpoints for auth
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', verifyJWT, logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', verifyJWT, validate(resetPasswordSchema), resetPassword);
router.post('/refresh', authLimiter, refresh);

export default router;
