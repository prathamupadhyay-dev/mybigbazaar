/**
 * @file apps/api/routes/v1/order.routes.js
 * @description Physical product order routes (/api/v1/orders)
 */

import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateTrackingStatus,
  updateOrderStatus
} from '../../controllers/order.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalAuth);

router.post('/', createOrder);
router.post('/create', createOrder);
router.get('/', getOrders);
router.get('/get-all', getOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrderStatus);
router.patch('/:id', updateOrderStatus);
router.put('/:id/status', updateOrderStatus);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id/tracking', updateTrackingStatus);
router.patch('/:id/tracking', updateTrackingStatus);

export default router;
