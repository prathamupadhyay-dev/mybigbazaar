/**
 * @file apps/api/models/Deal.js
 * @description Promotional deals, flash sales, discount offers and bundled commerce packages
 */

import mongoose from 'mongoose';

const DealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    dealType: {
      type: String,
      enum: ['discount', 'flash_sale', 'bundle', 'bogo', 'clearance'],
      default: 'discount'
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    dealPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    category: {
      type: String,
      default: 'All'
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    imageUrl: {
      type: String,
      default: ''
    },
    badgeText: {
      type: String,
      default: 'HOT DEAL'
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'upcoming', 'inactive'],
      default: 'active',
      index: true
    },
    redemptionLimit: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    timesRedeemed: {
      type: Number,
      default: 0
    },
    priority: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    collection: 'deals'
  }
);

export const Deal = mongoose.model('Deal', DealSchema);
export default Deal;
