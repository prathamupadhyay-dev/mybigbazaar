import { Router } from 'express';
import {
  createReport,
  getReports,
  updateReportStatus,
  resolveBulkReports,
  moderateListing,
  toggleUserSuspension,
  deleteReport
} from '../../controllers/moderation.controller.js';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin, requireModerator } from '../../middleware/rbac.middleware.js';

const router = Router();

// Reporting endpoints for mobile and web clients (can be submitted with optionalAuth)
router.post('/report', optionalAuth, createReport);
router.post('/reports', optionalAuth, createReport);
router.post('/', optionalAuth, createReport);

// Moderator & Admin operations (queue, list, resolve, delete) - requires authentication & moderator role
router.get('/reports', authenticate, requireModerator, getReports);
router.get('/get-all', authenticate, requireModerator, getReports);
router.get('/queue', authenticate, requireModerator, getReports);
router.get('/', authenticate, requireModerator, getReports);
router.put('/reports/:reportId', authenticate, requireModerator, updateReportStatus);
router.post('/reports/:reportId/resolve', authenticate, requireModerator, updateReportStatus);
router.delete('/reports/:reportId', authenticate, requireModerator, deleteReport);
router.put('/:reportId', authenticate, requireModerator, updateReportStatus);
router.post('/:reportId/resolve', authenticate, requireModerator, updateReportStatus);
router.delete('/:reportId', authenticate, requireModerator, deleteReport);
router.post('/resolve', authenticate, requireModerator, resolveBulkReports);
router.put('/listings/:listingId', authenticate, requireModerator, moderateListing);

// Administrative user suspension (admin only)
router.put('/users/:userId/suspension', authenticate, requireAdmin, toggleUserSuspension);

export default router;
