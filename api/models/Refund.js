/**
 * @file apps/api/models/Refund.js
 * @description Dedicated refund requests, adjudication, and settlement transaction records
 */

import mongoose from 'mongoose';

const RefundSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      unique: true,
      index: true
    },
    orderId: {
      type: String,
      default: ''
    },
    bookingId: {
      type: String,
      default: ''
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      trim: true,
      default: ''
    },
    customerPhone: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['Product Return', 'Order Cancellation', 'Service Cancellation', 'Disputed Escrow', 'Duplicate Charge', 'Customer Request', 'Other'],
      default: 'Product Return'
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required']
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: 0
    },
    originalPaymentMode: {
      type: String,
      default: 'UPI / Card'
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Processed', 'Rejected'],
      default: 'Pending Approval',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    refundMethod: {
      type: String,
      enum: ['original', 'wallet'],
      default: 'original'
    },
    bankDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date,
      default: null
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'refunds'
  }
);

// Auto generate refundId
RefundSchema.pre('save', function () {
  if (!this.refundId) {
    this.refundId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  }
});

export const Refund = mongoose.model('Refund', RefundSchema);
export default Refund;
