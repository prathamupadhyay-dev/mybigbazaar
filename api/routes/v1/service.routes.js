/**
 * @file apps/api/routes/v1/service.routes.js
 * @description Hyperlocal service catalogue and provider KYC routes (/api/v1/services, /service, /services)
 */

import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getProviderProfile,
  submitKyc,
  reviewKyc
} from '../../controllers/service.controller.js';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import { requireProvider } from '../../middleware/rbac.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.use(optionalAuth);

// Public catalogue browsing
router.get('/', getServices);
router.get('/get-all', getServices);
router.get('/profile', getProviderProfile);
router.get('/profile/:userId', getProviderProfile);
router.get('/:id', getServiceById);

// Service management (Admin & Provider) - supports multipart ('images', 'image', or JSON)
router.post('/create', authenticate, requireProvider, upload.any(), createService);
router.post('/', authenticate, requireProvider, upload.any(), createService);
router.put('/update/:id', upload.any(), updateService);
router.put('/:id', upload.any(), updateService);
router.delete('/delete/:id', deleteService);
router.delete('/:id', deleteService);

// KYC verification
router.post('/kyc/submit', upload.any(), submitKyc);
router.put('/kyc/review/:profileId', reviewKyc);

export default router;
