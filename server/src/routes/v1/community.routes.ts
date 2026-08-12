import { Router } from 'express';
import {
  listCommunityQuestions, submitCommunityQuestion, reviewCommunityQuestion,
  listSolutions, submitSolution, voteSolution,
  listDiscussions, getDiscussionDetail, createDiscussion, createReply,
  acceptAnswer, toggleReaction, toggleBookmark, getAISuggestedAnswer,
  togglePin, reportContent
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

// Discussion Forum & Collaboration Routes
router.get('/discussions', listDiscussions as any);
router.get('/discussions/:id', getDiscussionDetail as any);
router.post('/discussions', createDiscussion as any);
router.post('/discussions/:id/replies', createReply as any);
router.patch('/discussions/:id/replies/:replyId/accept', acceptAnswer as any);
router.post('/discussions/react', toggleReaction as any);
router.post('/discussions/:id/bookmark', toggleBookmark as any);
router.get('/discussions/:id/ai-suggest', getAISuggestedAnswer as any);
router.patch('/discussions/:id/pin', checkRole(['faculty', 'hod', 'super_admin', 'college_admin', 'host']) as any, togglePin as any);
router.post('/reports', reportContent as any);

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
