import { Router } from 'express';
import { FacultyController } from '../../controllers/faculty.controller';
import { getFacultyAnalytics } from '../../controllers/resource.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

// Protect all faculty routes with JWT & RBAC
router.use(verifyJWT as any);

router.get('/assignments', FacultyController.getAssignments as any);
router.post('/assignments', checkRole(['faculty', 'college_admin', 'super_admin']) as any, FacultyController.createAssignment as any);
router.get('/analytics', FacultyController.getDepartmentAnalytics as any);
router.get('/resources/analytics', checkRole(['faculty', 'hod', 'college_admin', 'super_admin']) as any, getFacultyAnalytics as any);

export default router;
