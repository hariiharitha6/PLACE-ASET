import { Router } from 'express';
import {
  listResources,
  getHubSections,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getRecommendations,
  processResourceAI,
  runResourceAIPrompt,
  getFacultyAnalytics,
  getAdminAnalytics,
  moderateResource
} from '../../controllers/resource.controller';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyJWT as any);

// Public / Student endpoints
router.get('/', listResources as any);
router.get('/hub', getHubSections as any);
router.get('/recommendations', getRecommendations as any);
router.get('/bookmarks', getUserBookmarks as any);

// Specific Resource detail endpoints
router.get('/:id', getResource as any);
router.post('/:id/download', downloadResource as any);

// Bookmarking
router.post('/:id/bookmark', addBookmark as any);
router.delete('/:id/bookmark', removeBookmark as any);

// AI Engine Integrations
router.post('/:id/ai/process', processResourceAI as any);
router.post('/:id/ai/prompt', runResourceAIPrompt as any);

// Faculty & Publisher routes
router.get('/faculty/analytics', checkRole(['faculty', 'hod', 'super_admin', 'college_admin']) as any, getFacultyAnalytics as any);
router.post('/', checkRole(['faculty', 'hod', 'placement_cell', 'super_admin', 'college_admin', 'host']) as any, createResource as any);
router.patch('/:id', checkRole(['faculty', 'hod', 'placement_cell', 'super_admin', 'college_admin', 'host']) as any, updateResource as any);
router.put('/:id', checkRole(['faculty', 'hod', 'placement_cell', 'super_admin', 'college_admin', 'host']) as any, updateResource as any);
router.delete('/:id', checkRole(['faculty', 'hod', 'placement_cell', 'super_admin', 'college_admin', 'host']) as any, deleteResource as any);

// Institutional Admin & Moderation routes
router.get('/admin/analytics', checkRole(['super_admin', 'college_admin']) as any, getAdminAnalytics as any);
router.patch('/:id/moderate', checkRole(['super_admin', 'college_admin']) as any, moderateResource as any);

export default router;
