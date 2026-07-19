import { Router } from 'express';
import { listResources, getResource, createResource, updateResource, deleteResource, downloadResource } from '../../controllers/resource.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyJWT as any);

router.get('/', listResources as any);
router.get('/:id', getResource as any);
router.post('/:id/download', downloadResource as any);

// Admin/Host only
router.post('/', checkRole(['super_admin', 'college_admin', 'host']) as any, createResource as any);
router.put('/:id', checkRole(['super_admin', 'college_admin', 'host']) as any, updateResource as any);
router.delete('/:id', checkRole(['super_admin', 'college_admin', 'host']) as any, deleteResource as any);

export default router;
