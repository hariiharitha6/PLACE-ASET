import { Router } from 'express';
import { FacultyController } from '../../controllers/faculty.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

// Protect all faculty routes with JWT & RBAC
router.use(verifyJWT);

router.get('/assignments', FacultyController.getAssignments);
router.post('/assignments', checkRole(['faculty', 'college_admin', 'super_admin']), FacultyController.createAssignment);
router.get('/analytics', FacultyController.getDepartmentAnalytics);

export default router;
