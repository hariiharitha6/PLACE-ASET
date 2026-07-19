import { Router } from 'express';
import {
  getPracticeLeaderboard,
  getChallengeLeaderboard,
  getContributorLeaderboard,
  getUserBadges,
  checkBadges,
  getXPHistory
} from '../../controllers/leaderboard.controller';
import { verifyJWT } from '../../middleware/auth';
import { cacheMiddleware } from '../../utils/cache';

const router = Router();

router.use(verifyJWT as any);

// Leaderboards (Cache for 5 minutes)
router.get('/practice', cacheMiddleware('leaderboard_practice', 300) as any, getPracticeLeaderboard as any);
router.get('/challenges', cacheMiddleware('leaderboard_challenges', 300) as any, getChallengeLeaderboard as any);
router.get('/contributors', cacheMiddleware('leaderboard_contributors', 300) as any, getContributorLeaderboard as any);

// Gamification
router.get('/badges', getUserBadges as any);
router.post('/badges/check', checkBadges as any);
router.get('/xp-history', getXPHistory as any);

export default router;
