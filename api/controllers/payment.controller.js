/**
 * @file apps/api/controllers/payment.controller.js
 * @description Payment orchestration controller supporting mock gateways, webhooks, and refunds
 */

import { paymentProvider } from '../providers/payment/index.js';
import Payment from '../models/Payment.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

// ==========================================
// 1. INITIATE PAYMENT SESSION
// ==========================================
export const initiatePayment = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', referenceId, purpose, idempotencyKey } = req.body;

  if (!amount || !referenceId || !purpose) {
    throw ApiError.badRequest('Amount, referenceId, and purpose are required');
  }

  const result = await paymentProvider.createPaymentOrder({
    amount: parseFloat(amount),
    currency,
    referenceId,
    purpose,
    userId: req.user._id,
    idempotencyKey
  });

  res.status(200).json({
    success: true,
    message: 'Payment session created',
    data: result
  });
});

// ==========================================
// 2. SIMULATE SUCCESSFUL PAYMENT (MOCK)
// ==========================================
export const simulateSuccess = asyncHandler(async (req, res) => {
  const { transactionId, gatewayPaymentId } = req.body;

  if (!transactionId) {
    throw ApiError.badRequest('Transaction ID is required');
  }

  const result = await paymentProvider.simulateSuccess({
    transactionId,
    gatewayPaymentId
  });

  res.status(200).json({
    success: true,
    message: 'Payment simulated successfully',
    data: result
  });
});

// ==========================================
// 3. SIMULATE FAILED PAYMENT (MOCK)
// ==========================================
export const simulateFailure = asyncHandler(async (req, res) => {
  const { transactionId, reason } = req.body;

  if (!transactionId) {
    throw ApiError.badRequest('Transaction ID is required');
  }

  const result = await paymentProvider.simulateFailure({
    transactionId,
    reason
  });

  res.status(200).json({
    success: false,
    message: 'Payment marked as failed',
    data: result
  });
});

// ==========================================
// 4. WEBHOOK DISPATCH / SIMULATION
// ==========================================
export const handleWebhook = asyncHandler(async (req, res) => {
  const { event, payload, signature } = req.body;

  if (!event || !payload) {
    throw ApiError.badRequest('Event and payload are required');
  }

  const result = await paymentProvider.handleWebhook(event, payload, signature);

  res.status(200).json({
    success: true,
    message: 'Webhook processed',
    data: result
  });
});

// ==========================================
// 5. REFUND PAYMENT
// ==========================================
export const refundPayment = asyncHandler(async (req, res) => {
  const { transactionId, amount, reason } = req.body;

  if (!transactionId) {
    throw ApiError.badRequest('Transaction ID is required');
  }

  const result = await paymentProvider.processRefund({
    transactionId,
    amount: amount ? parseFloat(amount) : undefined,
    reason
  });

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: result
  });
});

// ==========================================
// 6. GET PAYMENT STATUS
// ==========================================
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const payment = await Payment.findOne({ transactionId })
    .populate('userId', 'fullName email phoneNumber');

  if (!payment) {
    throw ApiError.notFound('Payment record not found');
  }

  const isOwner = payment.userId && payment.userId._id.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to view this payment record');
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

export default {
  initiatePayment,
  simulateSuccess,
  simulateFailure,
  handleWebhook,
  refundPayment,
  getPaymentStatus
};
