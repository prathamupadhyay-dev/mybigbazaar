/**
 * @file apps/api/routes/v1/sellerForm.routes.js
 * @description Dynamic Marketplace Seller Form Routes (/api/v1/seller-forms)
 */

import { Router } from 'express';
import {
  getAllSellerForms,
  getSellerFormByCategory,
  upsertSellerForm,
  deleteSellerForm
} from '../../controllers/sellerForm.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

// Public / Mobile access: retrieve form schemas
router.get('/', getAllSellerForms);
router.get('/find', getSellerFormByCategory);

// Admin operations: create, update, delete form schemas
router.post('/', authenticate, requireAdmin, upsertSellerForm);
router.put('/', authenticate, requireAdmin, upsertSellerForm);
router.delete('/:id', authenticate, requireAdmin, deleteSellerForm);

export default router;
