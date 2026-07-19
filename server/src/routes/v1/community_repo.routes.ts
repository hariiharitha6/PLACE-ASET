import { Router } from 'express';
import {
  uploadSubmission,
  getHistory,
  getReviewQueue,
  reviewSubmission,
  getDuplicates,
  runOCR,
  withdrawSubmission
} from '../../controllers/community_repo.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.use(verifyJWT as any);

router.post('/upload', uploadSubmission as any);
router.get('/history', getHistory as any);
router.get('/review', getReviewQueue as any);
router.post('/review/:id', reviewSubmission as any);
router.get('/duplicates/:id', getDuplicates as any);
router.post('/ocr', runOCR as any);
router.post('/withdraw/:id', withdrawSubmission as any);

export default router;
