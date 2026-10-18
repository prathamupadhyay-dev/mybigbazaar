/**
 * @file apps/api/providers/payment/mock.payment.js
 * @description Local deterministic mock payment provider for end-to-end checkout testing
 */

import { IPaymentProvider } from './payment.interface.js';
import Payment from '../../models/Payment.js';
import Booking from '../../models/Booking.js';
import Order from '../../models/Order.js';
import { PaymentStatus, BookingStatus, OrderStatus } from '../../config/constants.js';

export class MockPaymentProvider extends IPaymentProvider {
  /**
   * Create mock payment transaction record
   */
  async createPaymentOrder({ amount, currency = 'INR', referenceId, purpose, userId, idempotencyKey }) {
    // Idempotency check: if key already exists, return previous transaction
    if (idempotencyKey) {
      const existing = await Payment.findOne({ idempotencyKey });
      if (existing) {
        return {
          gatewayOrderId: existing.gatewayOrderId,
          transactionId: existing.transactionId,
          amount: existing.amount,
          status: existing.status,
          isIdempotentReplay: true
        };
      }
    }

    const gatewayOrderId = `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      userId,
      referenceId,
      purpose,
      amount,
      currency,
      status: PaymentStatus.PENDING,
      paymentMode: 'Mock Gateway',
      paymentGateway: 'mock',
      gatewayOrderId,
      idempotencyKey
    });

    return {
      gatewayOrderId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      status: payment.status,
      checkoutUrl: `/api/v1/payments/mock-checkout/${payment.transactionId}`
    };
  }

  /**
   * Simulate a successful payment
   */
  async simulateSuccess({ transactionId, gatewayPaymentId }) {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { payment, alreadyProcessed: true };
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.gatewayPaymentId = gatewayPaymentId || `pay_mock_${Date.now()}`;
    await payment.save();

    // Update referenced domain entity
    if (payment.purpose === 'booking') {
      await Booking.findOneAndUpdate(
        { bookingId: payment.referenceId },
        {
          paymentStatus: PaymentStatus.SUCCESS,
          status: BookingStatus.CONFIRMED,
          $push: {
            statusHistory: {
              status: BookingStatus.CONFIRMED,
              note: `Payment captured via Mock Gateway (${payment.transactionId})`,
              changedAt: new Date()
            }
          }
        }
      );
    } else if (payment.purpose === 'order') {
      await Order.findOneAndUpdate(
        { orderNumber: payment.referenceId },
        {
          paymentStatus: PaymentStatus.SUCCESS,
          trackingStatus: OrderStatus.PROCESSING,
          $push: {
            statusHistory: {
              status: OrderStatus.PROCESSING,
              note: `Payment captured via Mock Gateway (${payment.transactionId})`,
              changedAt: new Date()
            }
          }
        }
      );
    }

    return { payment, success: true };
  }

  /**
   * Simulate a failed payment
   */
  async simulateFailure({ transactionId, reason = 'Card declined in mock environment' }) {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    payment.status = PaymentStatus.FAILED;
    await payment.save();

    if (payment.purpose === 'booking') {
      await Booking.findOneAndUpdate(
        { bookingId: payment.referenceId },
        { paymentStatus: PaymentStatus.FAILED }
      );
    } else if (payment.purpose === 'order') {
      await Order.findOneAndUpdate(
        { orderNumber: payment.referenceId },
        { paymentStatus: PaymentStatus.FAILED }
      );
    }

    return { payment, success: false, reason };
  }

  /**
   * Process mock refund
   */
  async processRefund({ transactionId, amount, reason = 'Customer requested refund' }) {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new Error(`Cannot refund transaction with status: ${payment.status}`);
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundDetails = {
      refundId: `rfnd_mock_${Date.now()}`,
      amount: amount || payment.amount,
      reason,
      refundedAt: new Date()
    };
    await payment.save();

    if (payment.purpose === 'booking') {
      await Booking.findOneAndUpdate(
        { bookingId: payment.referenceId },
        {
          paymentStatus: PaymentStatus.REFUNDED,
          status: BookingStatus.CANCELLED,
          cancellationReason: `Refunded: ${reason}`
        }
      );
    } else if (payment.purpose === 'order') {
      await Order.findOneAndUpdate(
        { orderNumber: payment.referenceId },
        {
          paymentStatus: PaymentStatus.REFUNDED,
          trackingStatus: OrderStatus.CANCELLED
        }
      );
    }

    return { payment, success: true };
  }

  /**
   * Simulate webhook event processing
   */
  async handleWebhook(event, payload) {
    if (event === 'payment.captured') {
      return this.simulateSuccess({
        transactionId: payload.transactionId,
        gatewayPaymentId: payload.gatewayPaymentId
      });
    } else if (event === 'payment.failed') {
      return this.simulateFailure({
        transactionId: payload.transactionId,
        reason: payload.reason
      });
    } else if (event === 'refund.processed') {
      return this.processRefund({
        transactionId: payload.transactionId,
        amount: payload.amount,
        reason: payload.reason
      });
    }
    return { received: true, event };
  }
}

export default new MockPaymentProvider();
