import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth';
import { checkRole } from '../../middleware/rbac';
import {
  getDashboardOverview,
  getDashboardCharts,
  getUsers,
  manageStudentStatus,
  resetUserPassword,
  deleteUserRecord,
  getHosts,
  createHost,
  getColleges,
  createCollege,
  getDepartments,
  createDepartment,
  getCompanies,
  createCompany,
  getPendingQuestions,
  reviewQuestion,
  bulkReviewQuestions,
  archiveQuestion,
  restoreQuestion,
  globalSearchAdmin,
  getEvents,
  createEvent,
  getPlacementDrives,
  getAnnouncements,
  getAuditLogs,
  getReportSummary,
} from '../../controllers/admin.controller';
import {
  listUsers as listManagedUsers,
  updateUser,
  changeUserRole,
  toggleUserStatus,
  deleteUser as deleteManagedUser,
  bulkUserAction,
} from '../../controllers/user_management.controller';
import {
  getDesignations,
  listPermissionRequests,
  createPermissionRequest,
  approvePermissionRequest,
  rejectPermissionRequest,
  getLiveSystemUsers,
} from '../../controllers/rbac.controller';
import { uploadDataset, listDatasets } from '../../controllers/dataset.controller';

const router = Router();

// Apply auth & role guards for Admin Portal
router.use(verifyJWT as any);

// Designations list accessible to auth users
router.get('/designations', getDesignations as any);

// Permission Requests for logged in users
router.post('/permissions/request', createPermissionRequest as any);

// Admin / Super Admin protected routes
router.use(checkRole(['super_admin', 'college_admin', 'principal', 'hod', 'placement_cell']) as any);

// Global Search across Admin Portal
router.get('/search', globalSearchAdmin as any);

// Live System Users Monitor
router.get('/system-users', getLiveSystemUsers as any);

// Permission Request Governance
router.get('/permissions/requests', listPermissionRequests as any);
router.patch('/permissions/requests/:requestId/approve', approvePermissionRequest as any);
router.patch('/permissions/requests/:requestId/reject', rejectPermissionRequest as any);

// Dashboard
router.get('/dashboard/overview', getDashboardOverview as any);
router.get('/dashboard/charts', getDashboardCharts as any);

// Datasets Module
router.post('/datasets/upload', uploadDataset as any);
router.get('/datasets', listDatasets as any);

// Question Approval Queue & Moderation
router.get('/questions/pending', getPendingQuestions as any);
router.patch('/questions/:questionId/review', reviewQuestion as any);
router.patch('/questions/:questionId/archive', archiveQuestion as any);
router.patch('/questions/:questionId/restore', restoreQuestion as any);
router.post('/questions/bulk-review', bulkReviewQuestions as any);

// Advanced Enterprise User Management
router.get('/users/managed', listManagedUsers as any);
router.patch('/users/:userId/managed', updateUser as any);
router.patch('/users/:userId/role', changeUserRole as any);
router.patch('/users/:userId/status-toggle', toggleUserStatus as any);
router.delete('/users/:userId/managed', deleteManagedUser as any);
router.post('/users/bulk-action', bulkUserAction as any);

// Standard User & Host Management
router.get('/users', getUsers as any);
router.get('/students', getUsers as any);
router.patch('/users/:studentId/status', manageStudentStatus as any);
router.post('/users/:userId/reset-password', resetUserPassword as any);
router.delete('/users/:userId', deleteUserRecord as any);

router.get('/hosts', getHosts as any);
router.post('/hosts', createHost as any);

// Colleges & Departments
router.get('/colleges', getColleges as any);
router.post('/colleges', createCollege as any);
router.get('/departments', getDepartments as any);
router.post('/departments', createDepartment as any);

// Companies Repository
router.get('/companies', getCompanies as any);
router.post('/companies', createCompany as any);

// Events & Placement Drives
router.get('/events', getEvents as any);
router.post('/events', createEvent as any);
router.get('/placement-drives', getPlacementDrives as any);
router.get('/announcements', getAnnouncements as any);

// Audit Logs & Reports
router.get('/logs', getAuditLogs as any);
router.get('/reports/summary', getReportSummary as any);

export default router;
