import { Router } from 'express';
import {
  listCommunityQuestions, submitCommunityQuestion, reviewCommunityQuestion,
  listSolutions, submitSolution, voteSolution
} from '../../controllers/community.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyJWT as any);

// Community questions
router.get('/questions', listCommunityQuestions as any);
router.post('/questions', submitCommunityQuestion as any);
router.put('/questions/:id/review', checkRole(['super_admin', 'college_admin', 'host']) as any, reviewCommunityQuestion as any);

// Solutions
router.get('/solutions/:questionId', listSolutions as any);
router.post('/solutions', submitSolution as any);
router.post('/solutions/:solutionId/vote', voteSolution as any);

// Community Repository & OCR Routes
import {
  uploadSubmission,
  getHistory,
  getReviewQueue,
  reviewSubmission,
  getDuplicates,
  runOCR,
  withdrawSubmission
} from '../../controllers/community_repo.controller';

router.post('/upload', uploadSubmission as any);
router.get('/history', getHistory as any);
router.get('/review', getReviewQueue as any);
router.post('/review/:id', reviewSubmission as any);
router.get('/duplicates/:id', getDuplicates as any);
router.post('/ocr', runOCR as any);
router.post('/withdraw/:id', withdrawSubmission as any);

export default router;
