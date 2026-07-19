import { Router } from 'express';
import { getActivityLogs, getAuditLogs } from '../../controllers/logs.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyJWT as any);
router.use(checkRole(['super_admin', 'college_admin', 'host']) as any);

router.get('/activity', getActivityLogs as any);
router.get('/audit', getAuditLogs as any);

export default router;
