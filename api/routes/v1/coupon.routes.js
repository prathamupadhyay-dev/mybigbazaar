/**
 * @file apps/api/routes/v1/coupon.routes.js
 * @description Promotional coupons CRUD and live cart/checkout validation endpoints
 */

import { Router } from 'express';
import { Coupon } from '../../models/Coupon.js';
import { asyncHandler, ApiError } from '../../middleware/error.middleware.js';

const router = Router();

// GET all coupons (supports status filter)
router.get('/', asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const coupons = await Coupon.find(query).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons,
    coupons
  });
}));

// GET single coupon by ID or Code
router.get('/:idOrCode', asyncHandler(async (req, res) => {
  const { idOrCode } = req.params;
  let coupon = null;
  if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
    coupon = await Coupon.findById(idOrCode);
  }
  if (!coupon) {
    coupon = await Coupon.findOne({ code: idOrCode.toUpperCase() });
  }
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }
  res.status(200).json({ success: true, data: coupon });
}));

// POST create new coupon
router.post('/', asyncHandler(async (req, res) => {
  const {
    code,
    discountType = 'percentage',
    discountValue,
    minOrderAmount = 0,
    maxDiscount = null,
    expiryDate = null,
    usageLimit = 500,
    status = 'Active'
  } = req.body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    throw ApiError.badRequest('Coupon code is required');
  }
  if (discountValue === undefined || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
    throw ApiError.badRequest('A positive discount value is required');
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) {
    throw ApiError.badRequest(`Coupon code "${cleanCode}" already exists`);
  }

  const coupon = await Coupon.create({
    code: cleanCode,
    discountType: discountType === 'flat' ? 'flat' : 'percentage',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : null,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    usageLimit: Number(usageLimit) || 500,
    status: status === 'Inactive' ? 'Inactive' : 'Active'
  });

  res.status(201).json({
    success: true,
    message: `Coupon "${cleanCode}" created successfully`,
    data: coupon
  });
}));

// PUT update coupon
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiryDate,
    usageLimit,
    status
  } = req.body;

  if (code && code.trim().toUpperCase() !== coupon.code) {
    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) throw ApiError.badRequest(`Coupon code "${code.trim().toUpperCase()}" is already in use`);
    coupon.code = code.trim().toUpperCase();
  }

  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
  if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
  if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
  if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
  if (status !== undefined) coupon.status = status;

  await coupon.save();

  res.status(200).json({
    success: true,
    message: `Coupon "${coupon.code}" updated successfully`,
    data: coupon
  });
}));

// DELETE coupon
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }
  await coupon.deleteOne();
  res.status(200).json({
    success: true,
    message: `Coupon "${coupon.code}" deleted successfully`
  });
}));

// POST validate coupon in cart/checkout
router.post('/validate', asyncHandler(async (req, res) => {
  const { code, amount = 0, subtotal = 0 } = req.body;
  const orderAmount = Number(amount || subtotal || 0);

  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(200).json({
      success: false,
      valid: false,
      discount: 0,
      message: 'Please enter a coupon code'
    });
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) {
    return res.status(200).json({
      success: false,
      valid: false,
      discount: 0,
      message: `Coupon code "${cleanCode}" is invalid`
    });
  }

  if (coupon.status !== 'Active') {
    return res.status(200).json({
      success: false,
      valid: false,
      discount: 0,
      message: `Coupon "${cleanCode}" is no longer active`
    });
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return res.status(200).json({
      success: false,
      valid: false,
      discount: 0,
      message: `Coupon "${cleanCode}" has expired`
    });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(200).json({
      success: false,
      valid: false,
      discount: 0,
      message: `Coupon "${cleanCode}" usage limit has been reached`
    });
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return res.status(200).json({
      success: false,
      valid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon "${cleanCode}"`
    });
  }

  // Calculate discount
  let calculatedDiscount = 0;
  if (coupon.discountType === 'percentage') {
    calculatedDiscount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
      calculatedDiscount = coupon.maxDiscount;
    }
  } else {
    calculatedDiscount = coupon.discountValue;
  }

  calculatedDiscount = Math.min(calculatedDiscount, orderAmount);

  res.status(200).json({
    success: true,
    valid: true,
    discount: calculatedDiscount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    couponCode: coupon.code,
    message: `Coupon "${coupon.code}" applied! You save ₹${calculatedDiscount}.`,
    coupon
  });
}));

export default router;
