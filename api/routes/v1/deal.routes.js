/**
 * @file apps/api/routes/v1/deal.routes.js
 * @description Promotional deals & offers routes (/api/v1/deals)
 */

import { Router } from 'express';
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  toggleDealStatus
} from '../../controllers/deal.controller.js';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', optionalAuth, getAllDeals);
router.get('/:id', optionalAuth, getDealById);
router.post('/', authenticate, requireAdmin, createDeal);
router.put('/:id', authenticate, requireAdmin, updateDeal);
router.put('/:id/status', authenticate, requireAdmin, toggleDealStatus);
router.delete('/:id', authenticate, requireAdmin, deleteDeal);

export default router;
