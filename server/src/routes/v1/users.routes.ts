import { Router } from 'express';
import {
  getProfile,
  getPublicProfile,
  updateProfile,
  getUserAchievements,
  compareStudents,
  uploadProfilePhoto,
  deleteProfilePhoto,
  getPreferences,
  updatePreferences
} from '../../controllers/users.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// Private profile routes
router.get('/profile', verifyJWT, getProfile);
router.put('/profile', verifyJWT, updateProfile);
router.post('/profile/photo', verifyJWT, uploadProfilePhoto);
router.delete('/profile/photo', verifyJWT, deleteProfilePhoto);

// Public profile & community routes
router.get('/public/:id', verifyJWT, getPublicProfile);
router.get('/compare', verifyJWT, compareStudents);
router.get('/:id/achievements', verifyJWT, getUserAchievements);

// Preferences routes
router.get('/notifications/preferences', verifyJWT, getPreferences);
router.put('/notifications/preferences', verifyJWT, updatePreferences);

export default router;
