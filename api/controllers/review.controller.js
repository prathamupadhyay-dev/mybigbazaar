/**
 * @file apps/api/controllers/review.controller.js
 * @description Customer reviews and rating feedback controller
 */

import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import Service from '../models/Service.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

// ==========================================
// 1. ADD REVIEW & RATING
// ==========================================
export const addReview = asyncHandler(async (req, res) => {
  const {
    targetType: bodyTargetType,
    targetId: bodyTargetId,
    targetName: bodyTargetName,
    productId,
    productTitle,
    sellerId,
    sellerName: bodySellerName,
    reviewerId: bodyReviewerId,
    reviewerName: bodyReviewerName,
    reviewerEmail: bodyReviewerEmail,
    userName,
    rating = 5,
    reviewText,
    comment,
    images,
    status = 'Approved',
    verifiedBuyer = true,
    isVerifiedPurchase = true
  } = req.body;

  const resolvedProductId = String(productId || bodyTargetId || '');
  const resolvedTargetId = (bodyTargetId || productId) && mongoose.Types.ObjectId.isValid(bodyTargetId || productId)
    ? (bodyTargetId || productId)
    : (resolvedProductId || new mongoose.Types.ObjectId());

  let listingDoc = null;
  if (resolvedProductId && mongoose.Types.ObjectId.isValid(resolvedProductId)) {
    listingDoc = await Listing.findById(resolvedProductId).lean().catch(() => null);
  }

  const resolvedProductTitle =
    productTitle ||
    bodyTargetName ||
    listingDoc?.title ||
    'Marketplace Product';
  const resolvedSellerName =
    bodySellerName ||
    listingDoc?.sellerName ||
    'Verified Seller';
  const resolvedTargetType = bodyTargetType || 'product';

  const rawReviewerId = bodyReviewerId || (req.user && req.user._id);
  const resolvedReviewerId = rawReviewerId && mongoose.Types.ObjectId.isValid(rawReviewerId) ? rawReviewerId : null;
  const resolvedReviewerName =
    bodyReviewerName ||
    userName ||
    req.user?.fullName ||
    req.user?.name ||
    'Verified Buyer';
  const resolvedReviewerEmail =
    bodyReviewerEmail ||
    req.user?.email ||
    '';

  const numericRating = Math.min(5, Math.max(1, parseFloat(rating) || 5));
  const resolvedComment = (comment || reviewText || '').trim();

  const review = await Review.create({
    targetType: resolvedTargetType,
    targetId: resolvedTargetId,
    productId: resolvedProductId,
    productTitle: resolvedProductTitle,
    targetName: resolvedProductTitle,
    sellerId: sellerId || listingDoc?.sellerId || null,
    sellerName: resolvedSellerName,
    reviewerId: resolvedReviewerId,
    reviewerName: resolvedReviewerName,
    reviewerEmail: resolvedReviewerEmail,
    rating: numericRating,
    reviewText: resolvedComment,
    comment: resolvedComment,
    images: Array.isArray(images) ? images : [],
    status: status || 'Approved',
    verifiedBuyer: Boolean(verifiedBuyer),
    isVerifiedPurchase: Boolean(isVerifiedPurchase)
  });

  // Recompute average rating for target service or provider if applicable
  if (resolvedTargetType === 'service' && mongoose.Types.ObjectId.isValid(resolvedTargetId)) {
    const allReviews = await Review.find({ targetType: 'service', targetId: resolvedTargetId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);
    await Service.findByIdAndUpdate(resolvedTargetId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: allReviews.length
    }).catch(() => null);
  } else if (resolvedTargetType === 'provider' && mongoose.Types.ObjectId.isValid(resolvedTargetId)) {
    const allReviews = await Review.find({ targetType: 'provider', targetId: resolvedTargetId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);
    await ProviderProfile.findOneAndUpdate({ userId: resolvedTargetId }, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: allReviews.length
    }).catch(() => null);
  }

  res.status(201).json({
    success: true,
    status: true,
    message: 'Review submitted successfully',
    data: review,
    review
  });
});

// ==========================================
// 2. GET REVIEWS FOR ENTITY / ADMIN
// ==========================================
export const getReviews = asyncHandler(async (req, res) => {
  const { targetType, targetId, productId, rating, status, page = 1, limit = 100 } = req.query;

  const filter = {};
  if (targetType && targetType.toLowerCase() !== 'all') filter.targetType = targetType;
  if (targetId || productId) {
    const tid = targetId || productId;
    filter.$or = [{ targetId: tid }, { productId: String(tid) }];
    if (mongoose.Types.ObjectId.isValid(tid)) {
      filter.$or.push({ targetId: new mongoose.Types.ObjectId(tid) });
    }
  }
  if (rating && rating !== 'ALL') filter.rating = Number(rating);
  if (status && status !== 'ALL') filter.status = status;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewerId', 'fullName email avatarUrl phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter)
  ]);

  const formatted = reviews.map((r) => {
    const revName = r.reviewerName || r.reviewerId?.fullName || 'Verified Buyer';
    const revEmail = r.reviewerEmail || r.reviewerId?.email || '';
    const prodTitle = r.productTitle || r.targetName || (r.targetType === 'service' ? 'Service Order' : 'Marketplace Product');
    const text = r.comment || r.reviewText || '';
    const normStatus = r.status === 'active' ? 'Approved' : (r.status || 'Approved');

    return {
      _id: r._id.toString(),
      id: r._id.toString(),
      productId: r.productId || (r.targetId ? String(r.targetId) : ''),
      productTitle: prodTitle,
      targetName: prodTitle,
      targetTitle: prodTitle,
      targetType: r.targetType || 'product',
      targetId: r.targetId ? String(r.targetId) : '',
      sellerId: r.sellerId ? String(r.sellerId) : '',
      sellerName: r.sellerName || 'Verified Seller',
      reviewerId: r.reviewerId?._id ? r.reviewerId._id.toString() : (r.reviewerId ? String(r.reviewerId) : ''),
      reviewerName: revName,
      userName: revName,
      reviewerEmail: revEmail,
      rating: r.rating || 5,
      reviewText: text,
      comment: text,
      images: r.images || [],
      isVerifiedPurchase: r.isVerifiedPurchase !== false,
      verifiedBuyer: r.verifiedBuyer !== false,
      status: normStatus,
      moderationNotes: r.moderationNotes || '',
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
    };
  });

  res.status(200).json({
    success: true,
    status: true,
    data: formatted,
    reviews: formatted,
    count: formatted.length,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// ==========================================
// 3. DELETE REVIEW (ADMIN)
// ==========================================
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  res.status(200).json({
    success: true,
    status: true,
    message: 'Review deleted successfully'
  });
});

// ==========================================
// 4. UPDATE REVIEW STATUS (MODERATION)
// ==========================================
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, moderationNotes, comment, reviewText, rating } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (status) review.status = status;
  if (moderationNotes !== undefined) review.moderationNotes = moderationNotes;
  if (comment !== undefined || reviewText !== undefined) {
    const nextText = comment ?? reviewText;
    review.comment = nextText;
    review.reviewText = nextText;
  }
  if (rating !== undefined) review.rating = Number(rating);

  await review.save();

  res.status(200).json({
    success: true,
    status: true,
    message: `Review status updated to ${review.status}`,
    data: review,
    review
  });
});

export default {
  addReview,
  getReviews,
  deleteReview,
  updateReviewStatus
};
