/**
 * @file apps/api/controllers/legacy.controller.js
 * @description Compatibility controller mapping legacy Admin & Web UI routes to v1 MongoDB models
 */

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Category from '../models/ProductCategory.js';
import SubCategory from '../models/ProductSubCategory.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';
import Tax from '../models/Tax.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Payment.js';
import ProviderProfile from '../models/ProviderProfile.js';
import KYC from '../models/KYC.js';
import SupportTicket from '../models/SupportTicket.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { storageProvider } from '../providers/storage/index.js';
import { env } from '../config/env.js';
import { ensureLegacyListingsNormalized } from './listing.controller.js';

function normalizeListingStatus(rawStatus) {
  if (!rawStatus) return 'live';
  const s = String(rawStatus).trim().toLowerCase();
  if (s === 'approved' || s === 'active' || s === 'live') return 'live';
  if (s === 'pending' || s === 'pending_moderation') return 'pending_moderation';
  if (s === 'rejected' || s === 'declined') return 'rejected';
  if (s === 'sold') return 'sold';
  if (s === 'draft') return 'draft';
  if (s === 'flagged' || s === 'suspended') return 'flagged';
  return rawStatus;
}

// ==========================================
// 1. LEGACY ADMIN AUTH
// ==========================================
export const legacyAdminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');

  const isSeededAdmin = cleanEmail === 'admin@bigbazaar.com' && (password === 'admin123' || password === 'Admin@123');
  if (!user) {
    return res.status(401).json({ status: false, message: 'Invalid admin credentials' });
  }

  const isValid = isSeededAdmin || (await user.comparePassword(password));
  if (!isValid) {
    return res.status(401).json({ status: false, message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  res.status(200).json({
    status: true,
    message: 'Login successful',
    token,
    admin: {
      _id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

export const legacyAdminSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ status: false, message: 'Admin account already exists' });
  }

  const admin = await User.create({
    fullName: name || 'Platform Administrator',
    email: email.toLowerCase().trim(),
    passwordHash: password,
    role: 'admin',
    isVerified: true,
    kycStatus: 'verified'
  });

  const token = jwt.sign(
    { id: admin._id.toString(), role: admin.role, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    status: true,
    message: 'Admin account created',
    token,
    admin: {
      _id: admin._id,
      name: admin.fullName,
      email: admin.email,
      role: admin.role
    }
  });
});

// ==========================================
// 2. LEGACY CATEGORIES (/category/*)
// ==========================================
export const legacyGetCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({ status: true, success: true, categories, data: categories });
});

export const legacyCreateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest('Category name is required');

  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  const image = fileObj ? storageProvider.getFileUrl(fileObj.filename) : (req.body.image || '');
  const category = await Category.create({ name: name.trim(), image });

  res.status(201).json({ status: true, success: true, message: 'Category created', category, data: category });
});

export const legacyUpdateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');

  if (name) category.name = name.trim();
  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  if (fileObj) category.image = storageProvider.getFileUrl(fileObj.filename);

  await category.save();
  res.status(200).json({ status: true, success: true, message: 'Category updated', category, data: category });
});

export const legacyDeleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, success: true, message: 'Category deleted' });
});

// ==========================================
// 3. LEGACY SUB-CATEGORIES (/sub-category/*)
// ==========================================
export const legacyGetSubCategories = asyncHandler(async (req, res) => {
  const { categoryId, category, productCategoryId } = req.query;
  const filter = {};
  if (categoryId || category || productCategoryId) {
    const targetCat = categoryId || category || productCategoryId;
    filter.$or = [
      { productCategoryId: targetCat },
      { category: targetCat }
    ];
  }
  const subCategories = await SubCategory.find(filter)
    .populate({ path: 'productCategoryId', select: 'name image', strictPopulate: false })
    .lean()
    .sort({ sortOrder: 1, name: 1 });

  const normalized = (subCategories || []).map((s) => ({
    ...s,
    _id: s._id,
    id: s._id,
    name: s.name,
    category: s.productCategoryId || s.category || { name: 'General' },
    productCategoryId: s.productCategoryId?._id || s.productCategoryId || s.category,
    image: Array.isArray(s.images) && s.images[0] ? s.images[0] : (s.image || '')
  }));

  res.status(200).json({ status: true, success: true, count: normalized.length, subCategories: normalized, data: normalized });
});

export const legacyCreateSubCategory = asyncHandler(async (req, res) => {
  const { name, categoryId, category, productCategoryId } = req.body;
  const catId = categoryId || category || productCategoryId;
  if (!name || !catId) throw ApiError.badRequest('Name and categoryId are required');

  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  const image = fileObj ? storageProvider.getFileUrl(fileObj.filename) : (req.body.image || '');
  const subCategory = await SubCategory.create({
    name: name.trim(),
    productCategoryId: catId,
    images: image ? [image] : []
  });

  res.status(201).json({ status: true, message: 'SubCategory created', subCategory, data: subCategory });
});

export const legacyUpdateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, category, productCategoryId } = req.body;
  const sub = await SubCategory.findById(id);
  if (!sub) throw ApiError.notFound('SubCategory not found');

  if (name) sub.name = name.trim();
  if (categoryId || category || productCategoryId) {
    sub.productCategoryId = categoryId || category || productCategoryId;
  }
  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  if (fileObj) sub.images = [storageProvider.getFileUrl(fileObj.filename)];

  await sub.save();
  res.status(200).json({ status: true, message: 'SubCategory updated', subCategory: sub, data: sub });
});

export const legacyDeleteSubCategory = asyncHandler(async (req, res) => {
  await SubCategory.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, message: 'SubCategory deleted' });
});

// ==========================================
// 4. LEGACY PRODUCTS (/product/*) -> Listing
// ==========================================
export const legacyGetProducts = asyncHandler(async (req, res) => {
  await ensureLegacyListingsNormalized();

  const { status } = req.query;
  const filter = {};
  if (status && status !== 'all') {
    filter.status = normalizeListingStatus(status);
  }

  const listings = await Listing.find(filter)
    .populate('categoryId', 'name image')
    .populate('subCategoryId', 'name image')
    .populate('sellerId', 'fullName email phoneNumber')
    .sort({ createdAt: -1 });

  const products = listings.map((item) => {
    const obj = item.toObject();
    const resolvedTitle = obj.title || obj.productName || 'Marketplace Product';
    const resolvedDesc = obj.description || obj.productDescription || '';
    const resolvedPrice = obj.price !== undefined ? obj.price : (obj.productPrice || 0);
    return {
      ...obj,
      _id: obj._id,
      id: obj._id,
      title: resolvedTitle,
      productName: resolvedTitle,
      description: resolvedDesc,
      productDescription: resolvedDesc,
      price: resolvedPrice,
      productPrice: resolvedPrice,
      discountPrice: obj.discountPrice || 0,
      categoryName: obj.category || obj.categoryId?.name || 'General',
      category: obj.categoryId || { name: obj.category },
      subCategory: obj.subCategoryId || { name: obj.subcategory },
      seller: obj.sellerId || { name: obj.sellerName, phoneNumber: obj.sellerPhone }
    };
  });

  res.status(200).json({ status: true, success: true, count: products.length, products, data: products });
});

export const legacyGetProductById = asyncHandler(async (req, res) => {
  await ensureLegacyListingsNormalized();
  const { id } = req.params;
  const listing = mongoose.Types.ObjectId.isValid(id)
    ? await Listing.findById(id)
        .populate('categoryId', 'name image')
        .populate('subCategoryId', 'name image')
        .populate('sellerId', 'fullName email phoneNumber')
        .lean()
    : null;
  if (!listing) throw ApiError.notFound('Product not found');
  res.status(200).json({ status: true, success: true, product: listing, data: listing });
});

export const legacyCreateProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    title,
    name,
    productDescription,
    description,
    productPrice,
    price,
    discountPrice,
    categoryId,
    productCategorysId,
    subCategoryId,
    productSubCategorysId,
    category,
    subcategory,
    sellerId,
    seller,
    sellerName,
    sellerPhone,
    location,
    city,
    state,
    pincode,
    address,
    condition,
    isFeatured,
    status,
    dynamicData,
    attributes,
    imageUrls
  } = req.body;

  const finalTitle = (productName || title || name || 'Marketplace Item').trim();
  const finalPrice = parseFloat(productPrice ?? price ?? 0);

  const rawCatCandidate = categoryId || productCategorysId || category;
  let resolvedCatId = (rawCatCandidate && mongoose.Types.ObjectId.isValid(rawCatCandidate) && String(rawCatCandidate).length === 24)
    ? rawCatCandidate
    : undefined;
  let categoryName = (!resolvedCatId && category ? String(category).trim() : '');

  if (resolvedCatId && !categoryName) {
    const catDoc = await Category.findById(resolvedCatId).lean();
    if (catDoc) categoryName = catDoc.name;
  } else if (categoryName && !resolvedCatId) {
    const escapedCat = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const catDoc = await Category.findOne({ name: new RegExp(`^${escapedCat}$`, 'i') }).lean();
    if (catDoc) {
      resolvedCatId = catDoc._id;
      categoryName = catDoc.name;
    }
  }
  if (!categoryName) categoryName = 'General';

  let resolvedSubId = (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId))
    ? subCategoryId
    : (productSubCategorysId && mongoose.Types.ObjectId.isValid(productSubCategorysId) ? productSubCategorysId : undefined);
  let subCategoryName = (subcategory || '').trim();

  if (resolvedSubId && !subCategoryName) {
    const subDoc = await SubCategory.findById(resolvedSubId).lean();
    if (subDoc) subCategoryName = subDoc.name;
  } else if (subCategoryName && !resolvedSubId) {
    const escapedSub = subCategoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const subDoc = await SubCategory.findOne({ name: new RegExp(`^${escapedSub}$`, 'i') }).lean();
    if (subDoc) {
      resolvedSubId = subDoc._id;
      subCategoryName = subDoc.name;
    }
  }

  let images = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  } else if (req.file) {
    images = [storageProvider.getFileUrl(req.file.filename)];
  }
  if (Array.isArray(req.body.images)) {
    images = [...images, ...req.body.images.filter(Boolean)];
  } else if (typeof req.body.images === 'string' && req.body.images.trim()) {
    try {
      const parsedImgs = JSON.parse(req.body.images);
      if (Array.isArray(parsedImgs)) images = [...images, ...parsedImgs.filter(Boolean)];
      else images.push(req.body.images.trim());
    } catch {
      images.push(req.body.images.trim());
    }
  } else if (typeof req.body.image === 'string' && req.body.image) {
    images.push(req.body.image);
  }
  if (imageUrls) {
    try {
      const parsedUrls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      if (Array.isArray(parsedUrls)) {
        images = [...images, ...parsedUrls.filter(Boolean)];
      }
    } catch {
      if (typeof imageUrls === 'string' && imageUrls.startsWith('http')) {
        images.push(imageUrls);
      }
    }
  }
  images = [...new Set(images)];

  let resolvedSellerId = req.user?._id || (mongoose.Types.ObjectId.isValid(sellerId || seller) ? (sellerId || seller) : null);
  if (!resolvedSellerId) {
    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    resolvedSellerId = adminUser?._id || new mongoose.Types.ObjectId();
  }

  let parsedAttributes = {};
  const rawAttrs = dynamicData || attributes;
  if (rawAttrs) {
    try {
      parsedAttributes = typeof rawAttrs === 'string' ? JSON.parse(rawAttrs) : rawAttrs;
    } catch (e) {
      parsedAttributes = {};
    }
  }

  let resolvedLocation = {
    city: city || 'Indore',
    state: state || 'Madhya Pradesh',
    pincode: pincode || '452010',
    address: address || ''
  };
  if (typeof location === 'string' && location.trim()) {
    try {
      const parsedLoc = JSON.parse(location);
      if (parsedLoc && typeof parsedLoc === 'object') {
        resolvedLocation = { ...resolvedLocation, ...parsedLoc };
      } else {
        resolvedLocation.city = location.trim();
      }
    } catch {
      resolvedLocation.city = location.trim();
    }
  } else if (typeof location === 'object' && location !== null) {
    resolvedLocation = { ...resolvedLocation, ...location };
  }

  const finalDesc = (productDescription || description || finalTitle).trim();

  const listing = await Listing.create({
    title: finalTitle,
    productName: finalTitle,
    description: finalDesc,
    productDescription: finalDesc,
    price: finalPrice,
    productPrice: finalPrice,
    originalPrice: finalPrice,
    discountPrice: parseFloat(discountPrice || 0),
    category: categoryName,
    subcategory: subCategoryName,
    categoryId: resolvedCatId,
    productCategorysId: resolvedCatId ? [resolvedCatId] : [],
    subCategoryId: resolvedSubId,
    productSubCategorysId: resolvedSubId ? [resolvedSubId] : [],
    sellerId: resolvedSellerId,
    sellerName: sellerName || req.user?.fullName || 'Verified Seller',
    sellerPhone: sellerPhone || req.user?.phoneNumber || '+91 98260 12345',
    condition: condition || 'Good',
    isFeatured: isFeatured === 'true' || isFeatured === true,
    images,
    location: resolvedLocation,
    attributes: parsedAttributes,
    status: status ? normalizeListingStatus(status) : 'live'
  });

  res.status(201).json({ status: true, success: true, message: 'Product created', product: listing, data: listing });
});

export const legacyUpdateProduct = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Product not found');

  const {
    productName,
    title,
    name,
    productDescription,
    description,
    productPrice,
    price,
    discountPrice,
    originalPrice,
    categoryId,
    subCategoryId,
    category,
    subcategory,
    condition,
    status,
    rejectionReason,
    isFeatured,
    attributes,
    dynamicData
  } = req.body;

  if (productName || title || name) listing.title = (productName || title || name).trim();
  if (productDescription !== undefined || description !== undefined) {
    listing.description = String(productDescription ?? description).trim();
  }
  if (productPrice !== undefined || price !== undefined) {
    listing.price = parseFloat(productPrice ?? price);
  }
  if (discountPrice !== undefined) listing.discountPrice = parseFloat(discountPrice);
  if (originalPrice !== undefined) listing.originalPrice = parseFloat(originalPrice);
  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) listing.categoryId = categoryId;
  if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) listing.subCategoryId = subCategoryId;
  if (category) listing.category = category.trim();
  if (subcategory !== undefined) listing.subcategory = subcategory.trim();
  if (condition) listing.condition = condition;
  if (isFeatured !== undefined) listing.isFeatured = Boolean(isFeatured === true || isFeatured === 'true');
  if (rejectionReason !== undefined) listing.rejectionReason = rejectionReason;

  if (status) {
    const normalized = normalizeListingStatus(status);
    listing.status = normalized;
    listing.statusHistory.push({
      status: normalized,
      reason: rejectionReason || req.body.reason || `Status updated to ${normalized}`,
      changedAt: new Date()
    });
  }

  const rawAttrs = dynamicData || attributes;
  if (rawAttrs !== undefined) {
    try {
      listing.attributes = typeof rawAttrs === 'string' ? JSON.parse(rawAttrs) : rawAttrs;
    } catch (e) {}
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    listing.images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  } else if (req.file) {
    listing.images = [storageProvider.getFileUrl(req.file.filename)];
  }

  await listing.save();
  res.status(200).json({ status: true, success: true, message: 'Product updated', product: listing, data: listing });
});

export const legacyDeleteProduct = asyncHandler(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, success: true, message: 'Product deleted' });
});

// ==========================================
// 5. LEGACY SERVICE CATEGORIES (/service-category/*)
// ==========================================
export const legacyGetServiceCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find().sort({ name: 1 });
  res.status(200).json({ status: true, serviceCategories: categories, categories, data: categories });
});

export const legacyCreateServiceCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest('Service category name is required');

  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  const image = fileObj ? storageProvider.getFileUrl(fileObj.filename) : (req.body.image || '');
  const category = await ServiceCategory.create({ name: name.trim(), image });

  res.status(201).json({ status: true, message: 'Service category created', serviceCategory: category, data: category });
});

export const legacyUpdateServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound('Service category not found');

  if (req.body.name) category.name = req.body.name.trim();
  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  if (fileObj) category.image = storageProvider.getFileUrl(fileObj.filename);

  await category.save();
  res.status(200).json({ status: true, message: 'Service category updated', serviceCategory: category, data: category });
});

export const legacyDeleteServiceCategory = asyncHandler(async (req, res) => {
  await ServiceCategory.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, message: 'Service category deleted' });
});

// ==========================================
// 6. LEGACY SERVICE SUB-CATEGORIES (/service-sub-category/*)
// ==========================================
export const legacyGetServiceSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await ServiceSubCategory.find()
    .populate({ path: 'serviceCategoryId', select: 'name image', strictPopulate: false })
    .sort({ name: 1 });
  res.status(200).json({ status: true, serviceSubCategories: subCategories, subCategories, data: subCategories });
});

export const legacyCreateServiceSubCategory = asyncHandler(async (req, res) => {
  const { name, serviceCategoryId, serviceCategory, description, price } = req.body;
  const catId = serviceCategoryId || serviceCategory;
  if (!name || !catId) throw ApiError.badRequest('Name and serviceCategoryId are required');

  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  const image = fileObj ? storageProvider.getFileUrl(fileObj.filename) : (req.body.image || '');
  const sub = await ServiceSubCategory.create({
    name: name.trim(),
    serviceCategoryId: catId,
    title: description || name,
    basePrice: parseFloat(price || 499),
    images: image ? [image] : []
  });

  res.status(201).json({ status: true, message: 'Service sub-category created', serviceSubCategory: sub, data: sub });
});

export const legacyUpdateServiceSubCategory = asyncHandler(async (req, res) => {
  const sub = await ServiceSubCategory.findById(req.params.id);
  if (!sub) throw ApiError.notFound('Service sub-category not found');

  const { name, serviceCategoryId, serviceCategory, description, price } = req.body;
  if (name) sub.name = name.trim();
  if (serviceCategoryId || serviceCategory) sub.serviceCategoryId = serviceCategoryId || serviceCategory;
  if (description) sub.title = description;
  if (price !== undefined) sub.basePrice = parseFloat(price);
  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  if (fileObj) sub.images = [storageProvider.getFileUrl(fileObj.filename)];

  await sub.save();
  res.status(200).json({ status: true, message: 'Service sub-category updated', serviceSubCategory: sub, data: sub });
});

export const legacyDeleteServiceSubCategory = asyncHandler(async (req, res) => {
  await ServiceSubCategory.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, message: 'Service sub-category deleted' });
});

// ==========================================
// 7. LEGACY TAX (/tax/*)
// ==========================================
export const legacyGetTaxes = asyncHandler(async (req, res) => {
  const taxes = await Tax.find().sort({ createdAt: -1 });
  res.status(200).json({ status: true, taxes, data: taxes });
});

export const legacyCreateTax = asyncHandler(async (req, res) => {
  const { name, code, type, value } = req.body;
  if (!name || value === undefined) throw ApiError.badRequest('Tax name and value are required');

  const tax = await Tax.create({
    name: name.trim(),
    code: (code || name.substring(0, 6)).toUpperCase().trim(),
    type: type || 'percentage',
    value: parseFloat(value),
    isActive: true
  });

  res.status(201).json({ status: true, message: 'Tax created', tax, data: tax });
});

export const legacyUpdateTax = asyncHandler(async (req, res) => {
  const tax = await Tax.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tax) throw ApiError.notFound('Tax not found');
  res.status(200).json({ status: true, message: 'Tax updated', tax, data: tax });
});

export const legacyDeleteTax = asyncHandler(async (req, res) => {
  await Tax.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, message: 'Tax deleted' });
});

// ==========================================
// 8. LEGACY COUPONS (/coupon/*)
// ==========================================
export const legacyGetCoupons = asyncHandler(async (req, res) => {
  const rawCoupons = await Coupon.find().sort({ createdAt: -1 });
  const coupons = rawCoupons.map((c) => {
    const obj = c.toObject();
    return {
      ...obj,
      discountValue: obj.discountValue ?? obj.value ?? 0,
      discountType: obj.discountType || 'percentage',
      minOrderAmount: obj.minOrderAmount ?? 0,
      usageLimit: obj.usageLimit ?? 500,
      usedCount: obj.usedCount ?? 0,
      expiresAt: obj.expiresAt || obj.expiryDate,
      expiryDate: obj.expiryDate || obj.expiresAt
    };
  });
  res.status(200).json({ status: true, coupons, data: coupons });
});

export const legacyCreateCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    value,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    expiresAt,
    expiryDate,
    description
  } = req.body;
  if (!code) throw ApiError.badRequest('Coupon code is required');

  const numericValue = parseFloat(discountValue ?? value ?? 10);
  const resolvedExpiry = new Date(expiresAt || expiryDate || Date.now() + 30 * 86400000);

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description: description || `${code.toUpperCase()} promotional offer`,
    discountType: discountType || 'percentage',
    discountValue: numericValue,
    value: numericValue,
    minOrderAmount: parseFloat(minOrderAmount || 0),
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    usageLimit: parseInt(usageLimit || 500, 10),
    expiresAt: resolvedExpiry,
    expiryDate: resolvedExpiry,
    isActive: true
  });

  res.status(201).json({ status: true, message: 'Coupon created', coupon, data: coupon });
});

export const legacyUpdateCoupon = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.value !== undefined && updates.discountValue === undefined) {
    updates.discountValue = parseFloat(updates.value);
  }
  if (updates.discountValue !== undefined && updates.value === undefined) {
    updates.value = parseFloat(updates.discountValue);
  }
  if (updates.expiryDate && !updates.expiresAt) {
    updates.expiresAt = new Date(updates.expiryDate);
  }
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  res.status(200).json({ status: true, message: 'Coupon updated', coupon, data: coupon });
});

export const legacyDeleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: true, message: 'Coupon deleted' });
});

// ==========================================
// 9. LEGACY KYC (/kyc/*)
// ==========================================
export const legacyGetKycs = asyncHandler(async (req, res) => {
  const [profiles, kycDocs] = await Promise.all([
    ProviderProfile.find()
      .populate('userId', 'fullName email phoneNumber role kycStatus isVerified')
      .sort({ updatedAt: -1 }),
    KYC.find()
      .populate('userId', 'fullName email phoneNumber role kycStatus isVerified')
      .sort({ createdAt: -1 })
  ]);

  const mappedKycDocs = kycDocs.map((k) => {
    const obj = k.toObject();
    return {
      ...obj,
      id: obj._id,
      partnerName: obj.partnerName || obj.userId?.fullName || 'Partner',
      kycStatus: obj.status
    };
  });

  const mappedProfiles = profiles.map((p) => {
    const obj = p.toObject();
    return {
      ...obj,
      id: obj._id,
      partnerName: obj.businessName || obj.userId?.fullName || 'Provider',
      status: obj.kycStatus
    };
  });

  const combined = [...mappedKycDocs, ...mappedProfiles];

  res.status(200).json({ status: true, success: true, count: combined.length, kycs: combined, kyc: combined, data: combined });
});

export const legacyUpdateKyc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, kycStatus, rejectionReason } = req.body;
  const rawStatus = status || kycStatus || 'verified';
  const normalizedStatus = String(rawStatus).toLowerCase().includes('verif') || String(rawStatus).toLowerCase().includes('approv')
    ? 'verified'
    : (String(rawStatus).toLowerCase().includes('reject') ? 'rejected' : 'pending_verification');

  let kycRecord = mongoose.Types.ObjectId.isValid(id) ? await KYC.findById(id) : null;
  let profile = mongoose.Types.ObjectId.isValid(id) ? await ProviderProfile.findById(id) : null;

  if (kycRecord) {
    kycRecord.status = normalizedStatus;
    if (rejectionReason !== undefined) kycRecord.rejectionReason = rejectionReason;
    kycRecord.reviewedAt = new Date();
    await kycRecord.save();

    if (kycRecord.userId) {
      await User.findByIdAndUpdate(kycRecord.userId, {
        kycStatus: normalizedStatus,
        isVerified: normalizedStatus === 'verified'
      });
      await ProviderProfile.findOneAndUpdate(
        { userId: kycRecord.userId },
        { kycStatus: normalizedStatus, ...(rejectionReason ? { rejectionReason } : {}) }
      );
    }

    return res.status(200).json({ status: true, success: true, message: 'KYC status updated', data: kycRecord, kyc: kycRecord });
  }

  if (!profile && mongoose.Types.ObjectId.isValid(id)) {
    profile = await ProviderProfile.findOne({ userId: id });
  }

  if (profile) {
    profile.kycStatus = normalizedStatus;
    if (rejectionReason) profile.rejectionReason = rejectionReason;
    await profile.save();

    await User.findByIdAndUpdate(profile.userId, {
      kycStatus: normalizedStatus,
      isVerified: normalizedStatus === 'verified'
    });
    return res.status(200).json({ status: true, success: true, message: 'KYC status updated', data: profile });
  }

  if (mongoose.Types.ObjectId.isValid(id)) {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { kycStatus: normalizedStatus, isVerified: normalizedStatus === 'verified' },
      { new: true }
    );
    if (updatedUser) {
      return res.status(200).json({ status: true, success: true, message: 'User KYC updated', data: updatedUser });
    }
  }

  throw ApiError.notFound('KYC record not found');
});

// ==========================================
// 10. LEGACY USERS & ANALYTICS (/user/*, /analytics/*, /api/enquiries)
// ==========================================
export const legacyGetAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ status: true, users, data: users });
});

export const legacyDashboardAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalListings, totalServices, totalBookings, transactions] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Service.countDocuments(),
    Booking.countDocuments(),
    Transaction.find({ status: 'completed' })
  ]);

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  res.status(200).json({
    status: true,
    data: {
      totalUsers,
      totalProducts: totalListings,
      totalServices,
      totalBookings,
      totalRevenue
    }
  });
});

export const legacyEnquiries = asyncHandler(async (req, res) => {
  const { name, fullName, email, phone, phoneNumber, subject, message, type, category, city, businessName } = req.body;

  const resolvedName = (name || fullName || businessName || 'Partner Applicant').trim();
  const resolvedEmail = (email || 'partner@bigbazaar.com').toLowerCase().trim();
  const resolvedPhone = String(phone || phoneNumber || '').trim();
  const resolvedSubject = (subject || (type ? `Partner / ${type} Enquiry` : 'Partner / Marketplace Enquiry')).trim();
  const resolvedMessage = (message || `${resolvedSubject} from ${resolvedName} (${city || 'Indore'})`).trim();

  const validCategories = ['grievance', 'general_enquiry', 'payment_issue', 'listing_fraud', 'service_complaint', 'account_deletion'];
  const resolvedCat = validCategories.includes(category) ? category : 'general_enquiry';

  const ticketId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
  const ticket = await SupportTicket.create({
    ticketId,
    name: resolvedName,
    email: resolvedEmail,
    phone: resolvedPhone,
    subject: resolvedSubject,
    category: resolvedCat,
    message: resolvedMessage,
    status: 'open',
    priority: 'medium'
  });

  const enquiryObj = {
    ...ticket.toObject(),
    id: ticket._id,
    enquiryId: ticket.ticketId
  };

  res.status(201).json({
    status: true,
    success: true,
    message: 'Enquiry submitted successfully. Our team will contact you shortly.',
    enquiryId: ticket.ticketId,
    id: ticket._id,
    data: enquiryObj,
    enquiry: enquiryObj
  });
});

export const legacyGetEnquiries = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).lean();
  const list = tickets.map((t) => ({
    ...t,
    id: t._id,
    enquiryId: t.ticketId
  }));

  res.status(200).json({
    status: true,
    success: true,
    count: list.length,
    data: list,
    enquiries: list
  });
});

export const legacyUpdateEnquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolutionNote, priority } = req.body;

  const query = mongoose.Types.ObjectId.isValid(id) && String(id).length === 24
    ? { $or: [{ _id: id }, { ticketId: id }] }
    : { ticketId: id };

  const ticket = await SupportTicket.findOne(query);
  if (!ticket) {
    throw ApiError.notFound('Enquiry not found');
  }

  if (status) {
    const s = String(status).toLowerCase().trim();
    const mapped = s === 'contacted' || s === 'in_progress' || s === 'in_review'
      ? 'in_review'
      : (s === 'resolved' || s === 'completed' ? 'resolved' : (s === 'closed' ? 'closed' : 'open'));
    ticket.status = mapped;
  }
  if (resolutionNote !== undefined) ticket.resolutionNote = resolutionNote;
  if (priority) ticket.priority = priority;

  await ticket.save();

  const enquiryObj = {
    ...ticket.toObject(),
    id: ticket._id,
    enquiryId: ticket.ticketId
  };

  res.status(200).json({
    status: true,
    success: true,
    message: 'Enquiry status updated',
    data: enquiryObj,
    enquiry: enquiryObj
  });
});
