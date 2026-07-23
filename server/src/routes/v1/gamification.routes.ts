import { Router } from 'express';
import { getAchievementsList, getBadgesList } from '../../controllers/gamification.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.get('/achievements', verifyJWT as any, getAchievementsList as any);
router.get('/badges', verifyJWT as any, getBadgesList as any);

export default router;
