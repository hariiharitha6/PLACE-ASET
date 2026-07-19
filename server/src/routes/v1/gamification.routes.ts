import { Router } from 'express';
import { getAchievementsList, getBadgesList } from '../../controllers/gamification.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.use(verifyJWT as any);

router.get('/achievements', getAchievementsList as any);
router.get('/badges', getBadgesList as any);

export default router;
