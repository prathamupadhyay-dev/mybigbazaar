/**
 * @file apps/api/models/Payment.js
 * @description Payment ledger transaction record supporting gateway references & escrow
 */

import mongoose from 'mongoose';
import { PaymentStatus } from '../config/constants.js';

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    userName: {
      type: String,
      default: ''
    },
    userEmail: {
      type: String,
      default: ''
    },
    userPhone: {
      type: String,
      default: ''
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sellerName: {
      type: String,
      default: ''
    },
    orderId: {
      type: String,
      default: '',
      index: true
    },
    productTitle: {
      type: String,
      default: ''
    },
    productImage: {
      type: String,
      default: ''
    },
    referenceId: {
      type: String,
      default: '',
      index: true
    },
    type: {
      type: String,
      default: 'payment'
    },
    purpose: {
      type: String,
      default: 'order'
    },
    subtotal: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    taxName: {
      type: String,
      default: 'GST 18%'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      default: PaymentStatus.SUCCESS,
      index: true
    },
    paymentMode: {
      type: String,
      default: 'UPI'
    },
    method: {
      type: String,
      default: 'UPI'
    },
    paymentGateway: {
      type: String,
      default: 'Razorpay'
    },
    gatewayOrderId: {
      type: String,
      default: null
    },
    gatewayPaymentId: {
      type: String,
      default: null
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true
    },
    refundDetails: {
      refundId: { type: String, default: null },
      amount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      refundedAt: { type: Date, default: null },
      source: { type: String, default: 'Product Order' },
      customerName: { type: String, default: '' },
      customerEmail: { type: String, default: '' },
      customerPhone: { type: String, default: '' },
      adminNotes: { type: String, default: '' },
      bankDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({})
      }
    }
  },
  {
    timestamps: true,
    collection: 'Payment'
  }
);

PaymentSchema.pre('save', function () {
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

export const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
