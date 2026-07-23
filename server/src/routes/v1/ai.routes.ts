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
import {
  getAIProvidersStatus,
  updateTaskRouting,
  getPromptTemplates,
  updatePromptTemplate,
  generateQuestionAI,
  improveQuestionAI,
  getAIAnalytics
} from '../../controllers/ai_engine.controller';

const router = Router();

router.use(verifyJWT as any);

// Existing AI analytics & student profile endpoints
router.get('/profile', getProfile as any);
router.post('/profile/compute', computeProfile as any);
router.get('/recommendations', getRecommendations as any);
router.post('/recommendations/action', recordAction as any);
router.get('/study-path', getStudyPath as any);
router.get('/similar/:questionId', getSimilarQuestions as any);
router.get('/dashboard', getAIDashboard as any);

// Multi-Provider Enterprise AI Engine Endpoints
router.get('/providers', getAIProvidersStatus as any);
router.post('/task-routing', updateTaskRouting as any);
router.get('/prompts', getPromptTemplates as any);
router.put('/prompts/:key', updatePromptTemplate as any);
router.post('/generate', generateQuestionAI as any);
router.post('/improve', improveQuestionAI as any);
router.get('/engine/analytics', getAIAnalytics as any);

export default router;
