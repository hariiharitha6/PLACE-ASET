import { Router } from 'express';
import {
  getUserCertificates,
  getCertificateDetail,
  verifyCertificate,
  issueCertificate,
  getUserAchievements,
  checkAndUnlockAchievements
} from '../../controllers/certificate.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

// Public route for verifying digital credential QR/code
router.get('/verify/:code', verifyCertificate as any);

// Authenticated routes
router.use(verifyJWT as any);

router.get('/', getUserCertificates as any);
router.get('/achievements', getUserAchievements as any);
router.post('/achievements/check', checkAndUnlockAchievements as any);
router.get('/:id', getCertificateDetail as any);
router.post('/issue', checkRole(['faculty', 'hod', 'super_admin', 'college_admin', 'host', 'placement_cell']) as any, issueCertificate as any);

export default router;
