/**
 * @file apps/api/routes/v1/payment.routes.js
 * @description Payment transaction and mock checkout routes (/api/v1/payments)
 */

import { Router } from 'express';
import {
  initiatePayment,
  simulateSuccess,
  simulateFailure,
  handleWebhook,
  refundPayment,
  getPaymentStatus
} from '../../controllers/payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

// Payment initiation
router.post('/initiate', authenticate, initiatePayment);
router.get('/status/:transactionId', authenticate, getPaymentStatus);

// Mock checkout simulation endpoints (enabled for local testing)
router.post('/mock-success', simulateSuccess);
router.post('/mock-failure', simulateFailure);
router.post('/webhook', handleWebhook);

// Refund endpoint (admin only)
router.post('/refund', authenticate, requireAdmin, refundPayment);

export default router;
