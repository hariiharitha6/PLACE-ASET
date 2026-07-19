import { Router } from 'express';
import { 
  getDashboardSummary, 
  getDashboardStats, 
  getActivityLogs, 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../../controllers/dashboard.controller';
import { verifyJWT } from '../../middleware/auth';
import { cacheMiddleware } from '../../utils/cache';

const router = Router();

// Secure all dashboard routes
router.use(verifyJWT as any);

router.get('/summary', cacheMiddleware('dashboard_summary', 60) as any, getDashboardSummary as any);
router.get('/stats', cacheMiddleware('dashboard_stats', 60) as any, getDashboardStats as any);
router.get('/activity', getActivityLogs as any);
router.get('/notifications', getNotifications as any);
router.put('/notifications/read-all', markAllNotificationsRead as any);
router.put('/notifications/:id/read', markNotificationRead as any);

export default router;
