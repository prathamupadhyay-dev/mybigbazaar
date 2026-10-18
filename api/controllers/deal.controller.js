/**
 * @file apps/api/controllers/deal.controller.js
 * @description Dynamic database operations for promotional deals and offers
 */

import Deal from '../models/Deal.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

// ==========================================
// 1. GET ALL DEALS
// ==========================================
export const getAllDeals = asyncHandler(async (req, res) => {
  const { status, category, activeOnly = 'false', page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (activeOnly === 'true') {
    query.isActive = true;
    query.status = 'active';
  } else if (status && status !== 'all') {
    query.status = status.toLowerCase();
  }
  if (category && category !== 'all' && category !== 'All') {
    query.category = new RegExp(category, 'i');
  }

  const [deals, total] = await Promise.all([
    Deal.find(query).sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limitNum),
    Deal.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: deals,
    count: total,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// ==========================================
// 2. GET DEAL BY ID
// ==========================================
export const getDealById = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }
  res.status(200).json({
    success: true,
    data: deal
  });
});

// ==========================================
// 3. CREATE DEAL
// ==========================================
export const createDeal = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    dealType,
    discountPercentage,
    discountAmount,
    originalPrice,
    dealPrice,
    category,
    listingId,
    serviceId,
    imageUrl,
    badgeText,
    validFrom,
    validUntil,
    isActive,
    redemptionLimit,
    priority
  } = req.body;

  if (!title) {
    throw ApiError.badRequest('Deal title is required');
  }

  const deal = await Deal.create({
    title,
    description: description || '',
    dealType: dealType || 'discount',
    discountPercentage: Number(discountPercentage) || 0,
    discountAmount: Number(discountAmount) || 0,
    originalPrice: Number(originalPrice) || 0,
    dealPrice: Number(dealPrice) || 0,
    category: category || 'All',
    listingId: listingId || null,
    serviceId: serviceId || null,
    imageUrl: imageUrl || '',
    badgeText: badgeText || 'HOT DEAL',
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validUntil: validUntil ? new Date(validUntil) : null,
    isActive: isActive !== false,
    status: isActive === false ? 'inactive' : 'active',
    redemptionLimit: Number(redemptionLimit) || 0,
    priority: Number(priority) || 1
  });

  res.status(201).json({
    success: true,
    message: 'Deal created successfully',
    data: deal
  });
});

// ==========================================
// 4. UPDATE DEAL
// ==========================================
export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  const updates = req.body;
  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      deal[key] = updates[key];
    }
  });

  if (updates.isActive !== undefined) {
    deal.status = updates.isActive ? 'active' : 'inactive';
  }

  await deal.save();

  res.status(200).json({
    success: true,
    message: 'Deal updated successfully',
    data: deal
  });
});

// ==========================================
// 5. DELETE DEAL
// ==========================================
export const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findByIdAndDelete(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }
  res.status(200).json({
    success: true,
    message: 'Deal deleted successfully'
  });
});

// ==========================================
// 6. TOGGLE DEAL STATUS
// ==========================================
export const toggleDealStatus = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  deal.isActive = !deal.isActive;
  deal.status = deal.isActive ? 'active' : 'inactive';
  await deal.save();

  res.status(200).json({
    success: true,
    message: `Deal status changed to ${deal.status}`,
    data: deal
  });
});

export default {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  toggleDealStatus
};
