/**
 * @file apps/api/models/Coupon.js
 * @description Coupon and promotional discount rules model
 */

import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be positive']
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount must be non-negative']
    },
    maxDiscount: {
      type: Number,
      default: null
    },
    expiryDate: {
      type: Date,
      default: null
    },
    usageLimit: {
      type: Number,
      default: 500
    },
    usedCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  {
    timestamps: true,
    collection: 'Coupon'
  }
);

export const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
