/**
 * @file apps/api/controllers/listing.controller.js
 * @description Marketplace Classifieds & Product listings with search, filtering, moderation, and favorites
 */

import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Favorite from '../models/Favorite.js';
import User from '../models/User.js';
import Category from '../models/ProductCategory.js';
import SubCategory from '../models/ProductSubCategory.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { storageProvider } from '../providers/storage/index.js';
import { ListingStatus } from '../config/constants.js';

function normalizeListingStatus(rawStatus) {
  if (!rawStatus) return ListingStatus.LIVE;
  const s = String(rawStatus).trim().toLowerCase();
  if (s === 'approved' || s === 'active' || s === 'live') return ListingStatus.LIVE;
  if (s === 'pending' || s === 'pending_moderation') return 'pending_moderation';
  if (s === 'rejected' || s === 'declined') return 'rejected';
  if (s === 'sold') return 'sold';
  if (s === 'draft') return 'draft';
  if (s === 'flagged' || s === 'suspended') return 'flagged';
  return rawStatus;
}

let legacyNormalizedOnce = false;
export async function ensureLegacyListingsNormalized() {
  if (legacyNormalizedOnce) return;
  try {
    const [categories, subCategories, rawDocs] = await Promise.all([
      Category.find().lean(),
      SubCategory.find().lean(),
      Listing.find({
        $or: [
          { title: { $exists: false } },
          { title: '' },
          { category: { $exists: false } },
          { category: '' },
          { status: 'active' }
        ]
      }).lean()
    ]);

    if (!rawDocs || rawDocs.length === 0) {
      legacyNormalizedOnce = true;
      return;
    }

    const catMap = new Map(categories.map((c) => [String(c._id), c.name]));
    const subMap = new Map(subCategories.map((s) => [String(s._id), s.name]));

    for (const doc of rawDocs) {
      const catIdCandidate = doc.categoryId || (Array.isArray(doc.productCategorysId) && doc.productCategorysId[0]) || null;
      const subIdCandidate = doc.subCategoryId || (Array.isArray(doc.productSubCategorysId) && doc.productSubCategorysId[0]) || null;
      const resolvedCatName = doc.category || (catIdCandidate && catMap.get(String(catIdCandidate))) || 'Mobiles';
      const resolvedSubName = doc.subcategory || (subIdCandidate && subMap.get(String(subIdCandidate))) || '';
      const resolvedTitle = doc.title || doc.productName || 'Marketplace Product';
      const resolvedDesc = doc.description || doc.productDescription || resolvedTitle;
      const resolvedPrice = doc.price !== undefined ? Number(doc.price) : Number(doc.productPrice || 0);
      const resolvedStatus = doc.status === 'active' ? ListingStatus.LIVE : (doc.status || ListingStatus.LIVE);

      const updates = {
        title: resolvedTitle,
        productName: doc.productName || resolvedTitle,
        description: resolvedDesc,
        productDescription: doc.productDescription || resolvedDesc,
        price: resolvedPrice,
        productPrice: doc.productPrice || resolvedPrice,
        category: resolvedCatName,
        subcategory: resolvedSubName,
        status: resolvedStatus
      };
      if (catIdCandidate && mongoose.Types.ObjectId.isValid(catIdCandidate)) {
        updates.categoryId = catIdCandidate;
        if (!Array.isArray(doc.productCategorysId) || doc.productCategorysId.length === 0) {
          updates.productCategorysId = [catIdCandidate];
        }
      }
      if (subIdCandidate && mongoose.Types.ObjectId.isValid(subIdCandidate)) {
        updates.subCategoryId = subIdCandidate;
        if (!Array.isArray(doc.productSubCategorysId) || doc.productSubCategorysId.length === 0) {
          updates.productSubCategorysId = [subIdCandidate];
        }
      }

      await Listing.updateOne({ _id: doc._id }, { $set: updates });
    }
    legacyNormalizedOnce = true;
  } catch {
    // non-fatal
  }
}

// ==========================================
// 1. GET ALL / SEARCH LISTINGS (FEED)
// ==========================================
export const getListings = asyncHandler(async (req, res) => {
  await ensureLegacyListingsNormalized();

  const {
    q,
    category,
    categoryId,
    subcategory,
    subCategoryId,
    minPrice,
    maxPrice,
    condition,
    city,
    isFeatured,
    status,
    all,
    sellerId,
    sortBy = 'newest',
    page = 1,
    limit = 100
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (status && status !== 'all') {
    query.status = normalizeListingStatus(status);
  } else if (all !== 'true') {
    query.status = { $in: [ListingStatus.LIVE, 'active'] };
  }

  if (sellerId) {
    query.sellerId = sellerId;
  }

  if (q && q.trim()) {
    query.$text = { $search: q.trim() };
  }

  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    query.$or = [{ categoryId }, { productCategorysId: categoryId }];
  } else if (category) {
    query.category = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }

  if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
    query.subCategoryId = subCategoryId;
  } else if (subcategory) {
    query.subcategory = new RegExp(`^${subcategory.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }

  if (condition) query.condition = condition;

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
  }

  if (city) {
    query['location.city'] = new RegExp(`^${city.trim()}$`, 'i');
  }

  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  let sort = { createdAt: -1 };
  if (sortBy === 'price_asc') sort = { price: 1 };
  else if (sortBy === 'price_desc') sort = { price: -1 };
  else if (sortBy === 'popular') sort = { views: -1 };
  else if (sortBy === 'featured') sort = { isFeatured: -1, createdAt: -1 };

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .populate('sellerId', 'fullName avatarUrl phoneNumber createdAt')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Listing.countDocuments(query)
  ]);

  let favoriteIds = new Set();
  if (req.user) {
    const favorites = await Favorite.find({
      userId: req.user._id,
      targetType: 'listing'
    }).select('targetId');
    favoriteIds = new Set(favorites.map((f) => f.targetId.toString()));
  }

  const enrichedListings = listings.map((item) => {
    const json = item.toJSON();
    return {
      ...json,
      title: json.title || json.productName || 'Marketplace Product',
      productName: json.productName || json.title || 'Marketplace Product',
      description: json.description || json.productDescription || '',
      productDescription: json.productDescription || json.description || '',
      price: json.price !== undefined ? json.price : (json.productPrice || 0),
      productPrice: json.productPrice || json.price || 0,
      isFavorite: favoriteIds.has(item._id.toString())
    };
  });

  res.status(200).json({
    status: true,
    success: true,
    data: enrichedListings,
    listings: enrichedListings,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// ==========================================
// 2. GET LISTING BY ID
// ==========================================
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('sellerId', 'fullName avatarUrl phoneNumber createdAt kycStatus');

  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  let isFavorite = false;
  if (req.user) {
    const fav = await Favorite.findOne({
      userId: req.user._id,
      targetType: 'listing',
      targetId: listing._id
    });
    isFavorite = !!fav;
  }

  const json = listing.toJSON();

  res.status(200).json({
    status: true,
    success: true,
    data: {
      ...json,
      isFavorite
    }
  });
});

// ==========================================
// 3. CREATE LISTING
// ==========================================
export const createListing = asyncHandler(async (req, res) => {
  const {
    title,
    productName,
    name,
    description,
    productDescription,
    price,
    productPrice,
    originalPrice,
    discountPrice,
    category,
    subcategory,
    categoryId,
    productCategorysId,
    subCategoryId,
    productSubCategorysId,
    condition,
    location,
    city,
    state,
    pincode,
    address,
    attributes,
    dynamicData,
    status,
    sellerId: bodySellerId,
    seller,
    sellerName: bodySellerName,
    sellerPhone: bodySellerPhone,
    imageUrls
  } = req.body;

  const resolvedTitle = (title || productName || name || '').trim();
  const resolvedPrice = price !== undefined ? parseFloat(price) : (productPrice !== undefined ? parseFloat(productPrice) : undefined);

  if (!resolvedTitle || resolvedPrice === undefined || isNaN(resolvedPrice)) {
    throw ApiError.badRequest('Title and price are required');
  }

  // Resolve Category & CategoryId symmetrically
  let resolvedCatId = (categoryId && mongoose.Types.ObjectId.isValid(categoryId))
    ? categoryId
    : (productCategorysId && mongoose.Types.ObjectId.isValid(productCategorysId) ? productCategorysId : undefined);
  let resolvedCat = (category || '').trim();

  if (resolvedCatId && !resolvedCat) {
    const catDoc = await Category.findById(resolvedCatId).lean();
    if (catDoc) resolvedCat = catDoc.name;
  } else if (resolvedCat && !resolvedCatId) {
    const escapedCat = resolvedCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const catDoc = await Category.findOne({ name: new RegExp(`^${escapedCat}$`, 'i') }).lean();
    if (catDoc) {
      resolvedCatId = catDoc._id;
      resolvedCat = catDoc.name;
    }
  }
  if (!resolvedCat) resolvedCat = 'General';

  // Resolve SubCategory & SubCategoryId symmetrically
  let resolvedSubId = (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId))
    ? subCategoryId
    : (productSubCategorysId && mongoose.Types.ObjectId.isValid(productSubCategorysId) ? productSubCategorysId : undefined);
  let resolvedSub = (subcategory || '').trim();

  if (resolvedSubId && !resolvedSub) {
    const subDoc = await SubCategory.findById(resolvedSubId).lean();
    if (subDoc) resolvedSub = subDoc.name;
  } else if (resolvedSub && !resolvedSubId) {
    const escapedSub = resolvedSub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const subDoc = await SubCategory.findOne({ name: new RegExp(`^${escapedSub}$`, 'i') }).lean();
    if (subDoc) {
      resolvedSubId = subDoc._id;
      resolvedSub = subDoc.name;
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

  let resolvedLocation = {
    city: city || 'Indore',
    pincode: pincode || '452010',
    state: state || 'Madhya Pradesh',
    address: address || ''
  };
  if (typeof location === 'object' && location !== null) {
    resolvedLocation = { ...resolvedLocation, ...location };
  } else if (typeof location === 'string' && location.trim()) {
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
  }

  let resolvedSellerId = req.user?._id || null;
  if (!resolvedSellerId) {
    const candidate = bodySellerId || seller;
    if (candidate && mongoose.Types.ObjectId.isValid(candidate) && String(candidate).length === 24) {
      resolvedSellerId = new mongoose.Types.ObjectId(candidate);
    }
  }
  if (!resolvedSellerId) {
    const fallbackSeller = await User.findOne().select('_id fullName phoneNumber').lean();
    resolvedSellerId = fallbackSeller?._id || new mongoose.Types.ObjectId();
  }

  let parsedAttributes = {};
  const rawAttrs = attributes || dynamicData;
  if (rawAttrs) {
    try {
      parsedAttributes = typeof rawAttrs === 'string' ? JSON.parse(rawAttrs) : rawAttrs;
    } catch (e) {
      parsedAttributes = {};
    }
  }

  const finalDesc = (description || productDescription || resolvedTitle).trim();

  const newListing = await Listing.create({
    title: resolvedTitle,
    productName: resolvedTitle,
    description: finalDesc,
    productDescription: finalDesc,
    price: resolvedPrice,
    productPrice: resolvedPrice,
    originalPrice: originalPrice ? parseFloat(originalPrice) : resolvedPrice,
    discountPrice: discountPrice ? parseFloat(discountPrice) : 0,
    category: resolvedCat,
    subcategory: resolvedSub,
    categoryId: resolvedCatId,
    productCategorysId: resolvedCatId ? [resolvedCatId] : [],
    subCategoryId: resolvedSubId,
    productSubCategorysId: resolvedSubId ? [resolvedSubId] : [],
    condition: condition || 'Good',
    sellerId: resolvedSellerId,
    sellerName: bodySellerName || req.user?.fullName || 'Verified Seller',
    sellerPhone: bodySellerPhone || req.user?.phoneNumber || '+91 98260 12345',
    images,
    location: resolvedLocation,
    status: status ? normalizeListingStatus(status) : ListingStatus.LIVE,
    attributes: parsedAttributes
  });

  res.status(201).json({
    status: true,
    success: true,
    message: 'Listing published successfully',
    data: newListing,
    listing: newListing,
    product: newListing
  });
});

// ==========================================
// 4. UPDATE / MODERATE LISTING
// ==========================================
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (!req.user) {
    throw ApiError.unauthorized('Authentication required to modify listing');
  }

  const isOwner =
    listing.sellerId?.toString() === req.user._id.toString() ||
    listing.createdBy?.toString() === req.user._id.toString();
  const isStaff = ['admin', 'super_admin', 'moderator'].includes(req.user.role);

  if (!isOwner && !isStaff) {
    throw ApiError.forbidden('You are not authorized to modify this listing');
  }

  const {
    title,
    productName,
    description,
    price,
    productPrice,
    originalPrice,
    discountPrice,
    condition,
    status,
    rejectionReason,
    category,
    subcategory,
    isFeatured,
    attributes,
    dynamicData
  } = req.body;

  if (title || productName) listing.title = (title || productName).trim();
  if (description !== undefined) listing.description = description.trim();
  if (price !== undefined || productPrice !== undefined) listing.price = parseFloat(price ?? productPrice);
  if (originalPrice !== undefined) listing.originalPrice = parseFloat(originalPrice);
  if (discountPrice !== undefined) listing.discountPrice = parseFloat(discountPrice);
  if (condition) listing.condition = condition;
  if (category) listing.category = category.trim();
  if (subcategory !== undefined) listing.subcategory = subcategory.trim();
  if (isFeatured !== undefined && isStaff) {
    listing.isFeatured = Boolean(isFeatured === true || isFeatured === 'true');
  }
  if (rejectionReason !== undefined) {
    listing.rejectionReason = rejectionReason;
  }

  const rawAttrs = attributes || dynamicData;
  if (rawAttrs !== undefined) {
    try {
      listing.attributes = typeof rawAttrs === 'string' ? JSON.parse(rawAttrs) : rawAttrs;
    } catch (e) {}
  }

  if (status) {
    const targetStatus = normalizeListingStatus(status);
    listing.statusHistory.push({
      status: targetStatus,
      reason: rejectionReason || req.body.statusReason || req.body.notes || `Status updated to ${targetStatus}`,
      changedBy: req.user?._id || undefined,
      changedAt: new Date()
    });
    listing.status = targetStatus;
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImages = req.files.map((f) => storageProvider.getFileUrl(f.filename));
    listing.images = [...listing.images, ...newImages];
  } else if (req.file) {
    listing.images = [...listing.images, storageProvider.getFileUrl(req.file.filename)];
  }

  await listing.save();

  res.status(200).json({
    status: true,
    success: true,
    message: 'Listing updated successfully',
    data: listing,
    listing
  });
});

// ==========================================
// 5. DELETE LISTING
// ==========================================
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (!req.user) {
    throw ApiError.unauthorized('Authentication required to delete listing');
  }

  const isOwner =
    listing.sellerId?.toString() === req.user._id.toString() ||
    listing.createdBy?.toString() === req.user._id.toString();
  const isStaff = ['admin', 'super_admin', 'moderator'].includes(req.user.role);

  if (!isOwner && !isStaff) {
    throw ApiError.forbidden('You are not authorized to delete this listing');
  }

  await listing.deleteOne();

  res.status(200).json({
    status: true,
    success: true,
    message: 'Listing deleted successfully'
  });
});

// ==========================================
// 6. GET MY LISTINGS (SELLER)
// ==========================================
export const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const query = req.user?._id ? { sellerId: req.user._id } : {};
  if (status) query.status = normalizeListingStatus(status);

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Listing.countDocuments(query)
  ]);

  res.status(200).json({
    status: true,
    success: true,
    data: listings,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// ==========================================
// 7. TOGGLE FAVORITE / WATCHLIST
// ==========================================
export const toggleFavorite = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const userId = req.user?._id;

  const listing = await Listing.findById(targetId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (!userId) {
    return res.status(200).json({
      status: true,
      success: true,
      isFavorite: true,
      data: { isFavorite: true }
    });
  }

  const existingFav = await Favorite.findOne({
    userId,
    targetType: 'listing',
    targetId
  });

  if (existingFav) {
    await existingFav.deleteOne();
    return res.status(200).json({
      status: true,
      success: true,
      isFavorite: false,
      message: 'Removed from favorites',
      data: { isFavorite: false }
    });
  }

  await Favorite.create({
    userId,
    targetType: 'listing',
    targetId
  });

  res.status(200).json({
    status: true,
    success: true,
    isFavorite: true,
    message: 'Added to favorites',
    data: { isFavorite: true }
  });
});

// ==========================================
// 8. GET MY FAVORITES
// ==========================================
export const getMyFavorites = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  if (!req.user?._id) {
    return res.status(200).json({
      status: true,
      success: true,
      data: [],
      meta: { page: pageNum, limit: limitNum, total: 0, pages: 0 }
    });
  }

  const favorites = await Favorite.find({
    userId: req.user._id,
    targetType: 'listing'
  })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate({
      path: 'targetId',
      model: 'Listing',
      populate: { path: 'sellerId', select: 'fullName avatarUrl phoneNumber' }
    });

  const total = await Favorite.countDocuments({
    userId: req.user._id,
    targetType: 'listing'
  });

  const items = favorites
    .map((f) => f.targetId)
    .filter(Boolean)
    .map((item) => ({ ...item.toJSON(), isFavorite: true }));

  res.status(200).json({
    status: true,
    success: true,
    data: items,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

export default {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  toggleFavorite,
  getMyFavorites
};
