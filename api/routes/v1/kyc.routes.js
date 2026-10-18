/**
 * @file apps/api/routes/v1/kyc.routes.js
 * @description Dedicated KYC verification routes (/api/v1/kyc)
 */

import { Router } from 'express';
import {
  getAllKycApplications,
  getKycById,
  submitKycApplication,
  updateKycStatus,
  deleteKycApplication
} from '../../controllers/kyc.controller.js';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import { requireModerator, requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', optionalAuth, getAllKycApplications);
router.get('/:id', optionalAuth, getKycById);
router.post('/', optionalAuth, submitKycApplication);
router.put('/:id/status', authenticate, requireModerator, updateKycStatus);
router.put('/:id', authenticate, requireModerator, updateKycStatus);
router.delete('/:id', authenticate, requireAdmin, deleteKycApplication);

export default router;
