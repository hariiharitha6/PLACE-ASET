import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth';
import {
  getProfile,
  computeProfile,
  getRecommendations,
  recordAction,
  getStudyPath,
  getSimilarQuestions,
  getAIDashboard,
  scoreResume,
  submitMockInterview,
  uploadPersonalDocument,
  listPersonalDocuments,
  getPersonalDocument,
  deletePersonalDocument,
  askPersonalDocument,
  listPersonalCollections,
  createPersonalCollection,
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

// Resume & Interview AI endpoints
router.post('/resume/score', scoreResume as any);
router.post('/interview/submit', submitMockInterview as any);

// Personal Learning Mode Document Endpoints
router.post('/personal/documents', uploadPersonalDocument as any);
router.get('/personal/documents', listPersonalDocuments as any);
router.get('/personal/documents/:id', getPersonalDocument as any);
router.delete('/personal/documents/:id', deletePersonalDocument as any);
router.post('/personal/documents/:id/ask', askPersonalDocument as any);
router.get('/personal/collections', listPersonalCollections as any);
router.post('/personal/collections', createPersonalCollection as any);

// Multi-Provider Enterprise AI Engine Endpoints
router.get('/providers', getAIProvidersStatus as any);
router.post('/task-routing', updateTaskRouting as any);
router.get('/prompts', getPromptTemplates as any);
router.put('/prompts/:key', updatePromptTemplate as any);
router.post('/generate', generateQuestionAI as any);
router.post('/improve', improveQuestionAI as any);
router.get('/engine/analytics', getAIAnalytics as any);

export default router;
