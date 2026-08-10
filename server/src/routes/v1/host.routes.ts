import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';
import {
  getHostDashboard,
  getHostDepartmentQuestions,
  createHostPracticeSet,
  createHostChallenge,
  getHostDiscussions,
  moderateHostDiscussion,
} from '../../controllers/host.controller';

const router = Router();

// Apply auth & role guards for Host Portal
router.use(verifyJWT, checkRole(['host', 'faculty', 'college_admin', 'super_admin']));

router.get('/dashboard', getHostDashboard);
router.get('/questions', getHostDepartmentQuestions);
router.post('/practice-sets', createHostPracticeSet);
router.post('/challenges', createHostChallenge);
router.get('/discussions', getHostDiscussions);
router.patch('/discussions/:id', moderateHostDiscussion);

export default router;
