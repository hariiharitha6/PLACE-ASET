import { Router } from 'express';
import { 
  getChallengesList, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge, 
  cloneChallenge, 
  assignQuestions, 
  startChallengeAttempt, 
  saveChallengeProgress, 
  finalizeChallengeAttempt, 
  logChallengeActivity, 
  getChallengeResults, 
  getChallengeDiscussions, 
  postChallengeComment,
  getChallengeDetails,
  publishChallenge,
  unpublishChallenge,
  archiveChallenge,
  getChallengeAnalytics,
  getChallengeQuestionsWithSolutions
} from '../../controllers/challenges.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(verifyJWT as any);

// ─── Student / Participant Actions ──────────────────────────────────────────
router.get('/', getChallengesList as any);
router.get('/:id', getChallengeDetails as any);
router.post('/:id/start', startChallengeAttempt as any);
router.post('/:id/answers', saveChallengeProgress as any);
router.post('/:id/finalize', finalizeChallengeAttempt as any);
router.post('/:id/activity', logChallengeActivity as any);
router.get('/:id/results', getChallengeResults as any);
router.get('/:id/discussions', getChallengeDiscussions as any);
router.post('/:id/discussions', postChallengeComment as any);
router.get('/:id/solutions', getChallengeQuestionsWithSolutions as any);

// ─── Host / Admin Operations (write access) ──────────────────────────────────
const restrictToWrite = checkRole(['super_admin', 'college_admin', 'host']) as any;

router.post('/', restrictToWrite, createChallenge as any);
router.put('/:id', restrictToWrite, updateChallenge as any);
router.delete('/:id', restrictToWrite, deleteChallenge as any);
router.post('/:id/clone', restrictToWrite, cloneChallenge as any);
router.post('/:id/questions', restrictToWrite, assignQuestions as any);
router.post('/:id/publish', restrictToWrite, publishChallenge as any);
router.post('/:id/unpublish', restrictToWrite, unpublishChallenge as any);
router.post('/:id/archive', restrictToWrite, archiveChallenge as any);
router.get('/:id/analytics', restrictToWrite, getChallengeAnalytics as any);

export default router;
