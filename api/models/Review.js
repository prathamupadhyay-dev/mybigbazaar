/**
 * @file apps/api/models/Review.js
 * @description Reviews and ratings model for products, services, and providers
 */

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      default: 'product',
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true
    },
    productId: {
      type: String,
      default: '',
      index: true
    },
    productTitle: {
      type: String,
      default: ''
    },
    targetName: {
      type: String,
      default: ''
    },
    sellerId: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    sellerName: {
      type: String,
      default: ''
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    reviewerName: {
      type: String,
      default: 'Verified Buyer'
    },
    reviewerEmail: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Rating must be between 1 and 5'],
      min: 1,
      max: 5,
      default: 5,
      index: true
    },
    reviewText: {
      type: String,
      trim: true,
      default: ''
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true
    },
    verifiedBuyer: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      default: 'Approved'
    },
    moderationNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'Review'
  }
);

ReviewSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const Review = mongoose.model('Review', ReviewSchema);
export default Review;
