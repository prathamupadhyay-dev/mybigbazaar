/**
 * @file apps/api/controllers/service.controller.js
 * @description Service catalogue & provider KYC management controller
 */

import mongoose from 'mongoose';
import Service from '../models/Service.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ProviderProfile from '../models/ProviderProfile.js';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { KycStatus } from '../config/constants.js';

function getPagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function formatPaginatedResponse(data, total, page, limit) {
  return {
    success: true,
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / Math.max(limit, 1)),
    data
  };
}

/**
 * @desc    Get all services with category, location, and search filtering
 * @route   GET /api/v1/services | GET /service/get-all
 * @access  Public
 */
export const getServices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, subcategory, location, search, minPrice, maxPrice, all } = req.query;
  const isGetAll = req.originalUrl?.includes('get-all') || all === 'true';

  const filter = {};
  if (!isGetAll) {
    filter.status = { $in: ['live', 'active', 'pending_approval', 'draft'] };
  }

  if (category && category !== 'All') {
    if (mongoose.Types.ObjectId.isValid(category) && String(category).length === 24) {
      filter.categoryId = category;
    } else {
      filter.category = { $regex: new RegExp(category, 'i') };
    }
  }
  if (subcategory) {
    filter.subcategory = { $regex: new RegExp(subcategory, 'i') };
  }
  if (location) {
    filter.$or = [
      { location: { $regex: new RegExp(location, 'i') } },
      { serviceAreas: { $in: [new RegExp(location, 'i')] } }
    ];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.basePrice.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { title: { $regex: new RegExp(search, 'i') } },
      { description: { $regex: new RegExp(search, 'i') } },
      { category: { $regex: new RegExp(search, 'i') } }
    ];
  }

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('providerId', 'fullName phoneNumber avatar isVerified')
      .populate('categoryId', 'name image')
      .populate('subCategoryId', 'name image price')
      .sort({ rating: -1, createdAt: -1 })
      .skip(isGetAll ? 0 : skip)
      .limit(isGetAll ? 500 : limit)
      .lean(),
    Service.countDocuments(filter)
  ]);

  const mappedServices = services.map((s) => ({
    ...s,
    id: s._id,
    name: s.title,
    price: s.basePrice,
    serviceCategory: s.categoryId || s.category,
    serviceSubCategory: s.subCategoryId || s.subcategory
  }));

  res.status(200).json({
    status: true,
    ...formatPaginatedResponse(mappedServices, total, page, isGetAll ? Math.max(total, 1) : limit),
    services: mappedServices
  });
});

/**
 * @desc    Get single service details by ID
 * @route   GET /api/v1/services/:id
 * @access  Public
 */
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('providerId', 'fullName phoneNumber email avatar isVerified')
    .populate('categoryId', 'name image')
    .populate('subCategoryId', 'name image price');

  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  res.status(200).json({
    status: true,
    success: true,
    data: service,
    service
  });
});

/**
 * @desc    Create a new service package
 * @route   POST /api/v1/services | POST /service/create
 * @access  Public / Optional Auth (Provider or Admin)
 */
export const createService = asyncHandler(async (req, res) => {
  const {
    title,
    name,
    serviceName,
    description,
    category,
    serviceCategory,
    categoryName,
    subcategory,
    serviceSubCategory,
    categoryId,
    subCategoryId,
    basePrice,
    price,
    packages,
    variants,
    timeEstimate,
    duration,
    location,
    city,
    serviceAreas,
    providerName,
    seller,
    createdBy,
    adminId,
    providerId: bodyProviderId
  } = req.body;

  const serviceTitle = (title || name || serviceName || '').trim();
  const cost = basePrice !== undefined ? Number(basePrice) : (price !== undefined ? Number(price) : undefined);

  // Resolve category (accepts name OR ServiceCategory ObjectId via category / serviceCategory / categoryId)
  let resolvedCategoryName = (category || categoryName || '').trim();
  let resolvedCategoryId = categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : undefined;

  const rawServiceCat = serviceCategory || category;
  if (rawServiceCat) {
    if (mongoose.Types.ObjectId.isValid(rawServiceCat) && String(rawServiceCat).length === 24) {
      resolvedCategoryId = rawServiceCat;
      const catDoc = await ServiceCategory.findById(rawServiceCat).lean();
      resolvedCategoryName = catDoc?.name || 'Home Services';
    } else if (!resolvedCategoryName) {
      resolvedCategoryName = String(rawServiceCat).trim();
      const catDoc = await ServiceCategory.findOne({
        name: { $regex: new RegExp(`^${resolvedCategoryName}$`, 'i') }
      }).lean();
      if (catDoc) resolvedCategoryId = catDoc._id;
    }
  }

  if (!resolvedCategoryName && resolvedCategoryId) {
    const catDoc = await ServiceCategory.findById(resolvedCategoryId).lean();
    resolvedCategoryName = catDoc?.name || 'Home Services';
  }

  if (!serviceTitle || !resolvedCategoryName || cost === undefined || isNaN(cost)) {
    throw new ApiError(400, 'Title/name, category/serviceCategory, and basePrice/price are required');
  }

  let uploadedImages = [];
  if (Array.isArray(req.files) && req.files.length > 0) {
    uploadedImages = req.files.map((f) => `/uploads/${f.filename}`);
  } else if (req.file) {
    uploadedImages = [`/uploads/${req.file.filename}`];
  } else if (req.body.images) {
    uploadedImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  } else if (req.body.image) {
    uploadedImages = [req.body.image];
  }

  let parsedPackages = [];
  const rawPackages = packages || variants;
  if (rawPackages) {
    parsedPackages = typeof rawPackages === 'string' ? JSON.parse(rawPackages) : rawPackages;
  }

  // Resolve Provider ID
  let resolvedProviderId = req.user?._id || null;
  if (!resolvedProviderId) {
    const candidate = bodyProviderId || seller || createdBy || adminId;
    if (candidate && mongoose.Types.ObjectId.isValid(candidate) && String(candidate).length === 24) {
      resolvedProviderId = new mongoose.Types.ObjectId(candidate);
    }
  }
  if (!resolvedProviderId) {
    const fallbackUser = await User.findOne({ role: { $in: ['provider', 'admin'] } }).select('_id fullName').lean()
      || await User.findOne().select('_id fullName').lean();
    resolvedProviderId = fallbackUser?._id || new mongoose.Types.ObjectId();
  }

  const resolvedSubCatId = (subCategoryId || serviceSubCategory) && mongoose.Types.ObjectId.isValid(subCategoryId || serviceSubCategory)
    ? (subCategoryId || serviceSubCategory)
    : undefined;

  const service = await Service.create({
    title: serviceTitle,
    description: description || `${serviceTitle} professional service`,
    providerId: resolvedProviderId,
    providerName: providerName || req.user?.fullName || 'Certified Service Partner',
    category: resolvedCategoryName,
    subcategory: typeof (subcategory || serviceSubCategory) === 'string' && !mongoose.Types.ObjectId.isValid(subcategory || serviceSubCategory)
      ? (subcategory || serviceSubCategory)
      : '',
    categoryId: resolvedCategoryId,
    subCategoryId: resolvedSubCatId,
    basePrice: cost,
    packages: parsedPackages,
    variants: parsedPackages,
    images: uploadedImages,
    timeEstimate: timeEstimate || (duration ? `${duration} mins` : '1-2 hours'),
    location: location || city || 'Indore',
    serviceAreas: serviceAreas
      ? (Array.isArray(serviceAreas) ? serviceAreas : String(serviceAreas).split(',').map((s) => s.trim()).filter(Boolean))
      : ['Indore', 'Bhopal', 'Mumbai']
  });

  res.status(201).json({
    status: true,
    success: true,
    message: 'Service created successfully',
    data: {
      ...service.toObject(),
      id: service._id,
      name: service.title,
      price: service.basePrice
    },
    service
  });
});

/**
 * @desc    Update service details
 * @route   PUT /api/v1/services/:id | PUT /service/update/:id
 * @access  Public / Optional Auth (Owner or Admin)
 */
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  const updates = { ...req.body };
  if (updates.name && !updates.title) updates.title = updates.name;
  if (updates.serviceName && !updates.title) updates.title = updates.serviceName;
  if (updates.price !== undefined && updates.basePrice === undefined) updates.basePrice = Number(updates.price);
  if (updates.basePrice !== undefined) updates.basePrice = Number(updates.basePrice);

  if (updates.serviceCategory && !updates.category) {
    if (mongoose.Types.ObjectId.isValid(updates.serviceCategory) && String(updates.serviceCategory).length === 24) {
      updates.categoryId = updates.serviceCategory;
      const catDoc = await ServiceCategory.findById(updates.serviceCategory).lean();
      if (catDoc) updates.category = catDoc.name;
    } else {
      updates.category = updates.serviceCategory;
    }
  }

  if (Array.isArray(req.files) && req.files.length > 0) {
    updates.images = req.files.map((f) => `/uploads/${f.filename}`);
  } else if (req.file) {
    updates.images = [`/uploads/${req.file.filename}`];
  }

  Object.assign(service, updates);
  await service.save();

  res.status(200).json({
    status: true,
    success: true,
    message: 'Service updated successfully',
    data: service,
    service
  });
});

/**
 * @desc    Delete service
 * @route   DELETE /api/v1/services/:id | DELETE /service/delete/:id
 * @access  Public / Optional Auth (Owner or Admin)
 */
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  await service.deleteOne();

  res.status(200).json({
    status: true,
    success: true,
    message: 'Service deleted successfully'
  });
});

/**
 * @desc    Get provider profile and KYC status
 * @route   GET /api/v1/services/profile/:userId
 * @access  Public / Optional Auth
 */
export const getProviderProfile = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId || req.user?._id;
  if (!targetUserId) {
    const allProfiles = await ProviderProfile.find().populate('userId', 'fullName phoneNumber email avatar isVerified').lean();
    return res.status(200).json({
      status: true,
      success: true,
      data: allProfiles
    });
  }

  let profile = await ProviderProfile.findOne({ userId: targetUserId }).populate(
    'userId',
    'fullName phoneNumber email avatar isVerified'
  );

  if (!profile && mongoose.Types.ObjectId.isValid(targetUserId)) {
    profile = await ProviderProfile.create({ userId: targetUserId });
  }

  res.status(200).json({
    status: true,
    success: true,
    data: profile
  });
});

/**
 * @desc    Submit KYC document for provider verification
 * @route   POST /api/v1/services/kyc/submit
 * @access  Public / Optional Auth
 */
export const submitKyc = asyncHandler(async (req, res) => {
  const {
    docType,
    documentType,
    docNumber,
    documentNumber,
    businessName,
    experienceYears,
    bio,
    serviceAreas,
    userId: bodyUserId,
    partnerName,
    phone,
    email,
    category,
    city
  } = req.body;

  const resolvedDocType = docType || documentType || 'Aadhaar';
  const resolvedDocNum = docNumber || documentNumber || 'XXXX-XXXX-1234';
  const docUrl = req.file
    ? `/uploads/${req.file.filename}`
    : (Array.isArray(req.files) && req.files[0] ? `/uploads/${req.files[0].filename}` : req.body.docUrl || '/uploads/kyc-default.png');

  let resolvedUserId = req.user?._id || (bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId) ? bodyUserId : null);
  if (!resolvedUserId) {
    const fallbackUser = await User.findOne().select('_id fullName email phoneNumber').lean();
    resolvedUserId = fallbackUser?._id;
  }

  let profile = resolvedUserId ? await ProviderProfile.findOne({ userId: resolvedUserId }) : null;
  if (!profile && resolvedUserId) {
    profile = new ProviderProfile({ userId: resolvedUserId });
  }

  if (profile) {
    if (businessName) profile.businessName = businessName;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (bio) profile.bio = bio;
    if (serviceAreas) {
      profile.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : String(serviceAreas).split(',').map((s) => s.trim());
    }
    const validEnumTypes = ['Aadhaar', 'PAN', 'Trade License', 'Driving License', 'Passport', 'Other'];
    const mappedEnumDocType = validEnumTypes.find((t) => resolvedDocType.toLowerCase().includes(t.toLowerCase())) || 'Other';

    profile.kycDocuments.push({
      docType: mappedEnumDocType,
      docNumber: resolvedDocNum,
      docUrl
    });
    profile.kycStatus = KycStatus.PENDING;
    await profile.save();
  }

  const kycRecord = await KYC.create({
    userId: resolvedUserId || undefined,
    partnerName: partnerName || businessName || req.user?.fullName || 'Service Partner',
    businessName: businessName || partnerName || '',
    email: email || req.user?.email || '',
    phone: phone || req.user?.phoneNumber || '',
    category: category || 'Home Services',
    city: city || 'Indore',
    applicantType: 'provider',
    docType: resolvedDocType,
    docNumber: resolvedDocNum,
    docUrl,
    documents: [{ docType: resolvedDocType, docNumber: resolvedDocNum, docUrl }],
    status: 'pending_verification',
    experienceYears: Number(experienceYears) || 0,
    notes: bio || ''
  });

  res.status(200).json({
    status: true,
    success: true,
    message: 'KYC submitted successfully and pending admin verification',
    data: profile || kycRecord,
    kyc: kycRecord
  });
});

/**
 * @desc    Admin approve or reject provider KYC
 * @route   PUT /api/v1/services/kyc/review/:profileId
 * @access  Public / Optional Auth (Admin)
 */
export const reviewKyc = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const { profileId } = req.params;

  let profile = mongoose.Types.ObjectId.isValid(profileId) ? await ProviderProfile.findById(profileId) : null;
  let kycRecord = mongoose.Types.ObjectId.isValid(profileId) ? await KYC.findById(profileId) : null;

  if (!profile && !kycRecord) {
    throw new ApiError(404, 'KYC or Provider profile not found');
  }

  const normalized = String(status).toLowerCase().includes('verif') || String(status).toLowerCase().includes('approv')
    ? 'verified'
    : (String(status).toLowerCase().includes('reject') ? 'rejected' : status);

  if (profile) {
    profile.kycStatus = normalized;
    if (normalized === KycStatus.REJECTED) {
      profile.rejectionReason = rejectionReason || 'Documents unclear or invalid';
    } else if (normalized === KycStatus.VERIFIED) {
      profile.rejectionReason = null;
      await User.findByIdAndUpdate(profile.userId, { isVerified: true });
    }
    await profile.save();
  }

  if (kycRecord) {
    kycRecord.status = normalized;
    if (rejectionReason) kycRecord.rejectionReason = rejectionReason;
    kycRecord.reviewedAt = new Date();
    await kycRecord.save();
  }

  res.status(200).json({
    status: true,
    success: true,
    message: `Provider KYC marked as ${normalized}`,
    data: profile || kycRecord
  });
});
