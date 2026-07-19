import { Router } from 'express';
import {
  startPracticeSession,
  submitPracticeAnswer,
  endPracticeSession,
  getPracticeHistory,
  getPracticeSessionResults,
  getPracticeStats,
  getPracticeRecommendations,
  togglePracticeBookmark,
  getPracticeBookmarks
} from '../../controllers/practice.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.use(verifyJWT as any);

// Legacy/REST endpoints
router.post('/sessions', startPracticeSession as any);
router.post('/sessions/:sessionId/answer', submitPracticeAnswer as any);
router.post('/sessions/:sessionId/end', endPracticeSession as any);
router.get('/sessions/:sessionId/results', getPracticeSessionResults as any);
router.get('/stats', getPracticeStats as any);

// Specific Practice Arena endpoints (Module 6 spec alignment)
router.post('/start', startPracticeSession as any);
router.post('/submit', submitPracticeAnswer as any);
router.post('/end', endPracticeSession as any);
router.get('/history', getPracticeHistory as any);
router.get('/statistics', getPracticeStats as any);
router.get('/recommendations', getPracticeRecommendations as any);
router.post('/bookmarks', togglePracticeBookmark as any);
router.get('/bookmarks', getPracticeBookmarks as any);

export default router;
