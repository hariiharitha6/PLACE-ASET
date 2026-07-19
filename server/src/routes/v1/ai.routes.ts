import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth';
import {
  getProfile,
  computeProfile,
  getRecommendations,
  recordAction,
  getStudyPath,
  getSimilarQuestions,
  getAIDashboard
} from '../../controllers/ai.controller';

const router = Router();

// Apply auth middleware to all AI endpoints
router.use(verifyJWT as any);

router.get('/profile', getProfile as any);
router.post('/profile/compute', computeProfile as any);
router.get('/recommendations', getRecommendations as any);
router.post('/recommendations/action', recordAction as any);
router.get('/study-path', getStudyPath as any);
router.get('/similar/:questionId', getSimilarQuestions as any);
router.get('/dashboard', getAIDashboard as any);

export default router;
