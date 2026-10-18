/**
 * @file apps/api/models/Booking.js
 * @description Hyperlocal service booking lifecycle model
 */

import mongoose from 'mongoose';
import { BookingStatus, PaymentStatus } from '../config/constants.js';

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true
    },
    serviceName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    subCategoryName: {
      type: String,
      default: ''
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    scheduledTimeSlot: {
      type: String,
      default: '10:00 AM - 12:00 PM'
    },
    providerName: {
      type: String,
      default: 'Assigned Certified Partner'
    },
    providerContact: {
      type: String,
      default: ''
    },
    serviceAddress: {
      houseNo: { type: String, default: '' },
      street: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, default: 'Kerala' },
      phone: { type: String, default: '' }
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    couponApplied: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true
    },
    paymentMode: {
      type: String,
      enum: ['Cash on Delivery', 'UPI', 'Card', 'NetBanking', 'Wallet'],
      default: 'Cash on Delivery'
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: null
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    userReview: {
      type: String,
      default: null
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'Booking'
  }
);

BookingSchema.pre('validate', function () {
  if (!this.bookingId) {
    this.bookingId = `BB-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  if (!this.amount && this.pricing?.basePrice) {
    this.amount = this.pricing.basePrice;
  } else if (!this.amount && this.totalAmount) {
    this.amount = this.totalAmount;
  }
  if (!this.totalAmount && this.pricing?.totalAmount) {
    this.totalAmount = this.pricing.totalAmount;
  } else if (!this.totalAmount && this.amount) {
    this.totalAmount = this.amount;
  }
  if ((!this.serviceAddress || !this.serviceAddress.city) && this.customerAddress?.city) {
    this.serviceAddress = {
      houseNo: this.customerAddress.addressLine1 || '',
      street: this.customerAddress.addressLine2 || '',
      landmark: this.customerAddress.landmark || '',
      city: this.customerAddress.city || 'Kottayam',
      pincode: this.customerAddress.pincode || '686001',
      state: this.customerAddress.state || 'Kerala',
      phone: this.customerAddress.phone || ''
    };
  }
});

BookingSchema.pre('save', function () {
  if (!this.bookingId) {
    this.bookingId = `BB-${Math.floor(10000 + Math.random() * 90000)}`;
  }
});

BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ providerId: 1, status: 1 });

export const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
