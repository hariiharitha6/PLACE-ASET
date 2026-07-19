import { Router } from 'express';
import { 
  searchQuestions, 
  createQuestion, 
  getQuestionDetails, 
  updateQuestion, 
  deleteQuestion, 
  archiveQuestion, 
  restoreQuestion, 
  cloneQuestion, 
  getQuestionHistory, 
  getRandomQuestions, 
  getBankStatistics,
  checkDuplicates,
  ocrImport
} from '../../controllers/questions.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validator';
import { 
  createQuestionSchema, 
  updateQuestionSchema, 
  searchQuerySchema 
} from '../../validators/questions.validator';

const router = Router();

// All questions routes are authenticated
router.use(verifyJWT as any);

// Duplicate check route
router.post('/check-duplicates', checkDuplicates as any);

// Read actions (accessible to all authenticated users)
router.get('/', validate(searchQuerySchema), searchQuestions as any);
router.get('/random', getRandomQuestions as any);
router.get('/statistics', getBankStatistics as any);
router.get('/:id', getQuestionDetails as any);
router.get('/:id/history', getQuestionHistory as any);

// Write actions (restricted to super_admin, college_admin, and host)
const restrictToWrite = checkRole(['super_admin', 'college_admin', 'host']) as any;

router.post('/ocr-import', restrictToWrite, ocrImport as any);
router.post('/', restrictToWrite, validate(createQuestionSchema), createQuestion as any);
router.put('/:id', restrictToWrite, validate(updateQuestionSchema), updateQuestion as any);
router.delete('/:id', restrictToWrite, deleteQuestion as any);
router.put('/:id/archive', restrictToWrite, archiveQuestion as any);
router.put('/:id/restore', restrictToWrite, restoreQuestion as any);
router.post('/:id/clone', restrictToWrite, cloneQuestion as any);

export default router;
