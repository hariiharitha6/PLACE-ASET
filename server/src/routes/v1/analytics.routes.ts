import { Router } from 'express';
import {
  getStudentAnalytics,
  getDepartmentAnalytics,
  getPlacementAnalytics,
  getExecutiveAnalytics
} from '../../controllers/analytics.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyJWT as any);

router.get('/student', getStudentAnalytics as any);
router.get('/department', checkRole(['faculty', 'hod', 'super_admin', 'college_admin']) as any, getDepartmentAnalytics as any);
router.get('/placement', checkRole(['placement_cell', 'super_admin', 'college_admin', 'host']) as any, getPlacementAnalytics as any);
router.get('/executive', checkRole(['principal', 'super_admin', 'college_admin']) as any, getExecutiveAnalytics as any);

export default router;
