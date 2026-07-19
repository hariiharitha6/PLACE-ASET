import { Router } from 'express';
import { getProfile, updateProfile, getPreferences, updatePreferences } from '../../controllers/users.controller';
import { validate } from '../../middleware/validator';
import { verifyJWT } from '../../middleware/auth';
import { updateProfileSchema } from '../../models/validators/auth.schema';

const router = Router();

router.get('/profile', verifyJWT, getProfile);
router.put('/profile', verifyJWT, validate(updateProfileSchema), updateProfile);

router.get('/notifications/preferences', verifyJWT, getPreferences);
router.put('/notifications/preferences', verifyJWT, updatePreferences);

export default router;
