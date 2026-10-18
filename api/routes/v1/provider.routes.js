/**
 * @file apps/api/routes/v1/provider.routes.js
 * @description Provider profile, availability, and KYC submission routes (/api/v1/providers, /provider, /providers)
 */

import { Router } from 'express';
import mongoose from 'mongoose';
import ProviderProfile from '../../models/ProviderProfile.js';
import User from '../../models/User.js';
import KYC from '../../models/KYC.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { asyncHandler, ApiError } from '../../middleware/error.middleware.js';
import { storageProvider } from '../../providers/storage/index.js';

const router = Router();

router.use(optionalAuth);

const listProvidersHandler = asyncHandler(async (req, res) => {
  const { category, city, isAvailable } = req.query;
  const filter = {};
  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === 'true';
  }
  if (city) {
    filter.serviceAreas = { $in: [new RegExp(city, 'i')] };
  }

  const profiles = await ProviderProfile.find(filter)
    .populate('userId', 'fullName phoneNumber email avatar isVerified')
    .populate('serviceCategories', 'name image')
    .sort({ rating: -1, updatedAt: -1 });

  const formatted = profiles.map((p) => {
    const obj = p.toObject();
    return {
      ...obj,
      id: obj._id,
      fullName: obj.userId?.fullName || obj.businessName || 'Service Partner',
      name: obj.businessName || obj.userId?.fullName || 'Service Partner',
      phone: obj.userId?.phoneNumber || '',
      email: obj.userId?.email || '',
      category: obj.serviceCategories?.[0]?.name || 'Home Services',
      isOnline: obj.isAvailable
    };
  });

  if (category) {
    const filtered = formatted.filter(
      (item) =>
        item.category.toLowerCase().includes(category.toLowerCase()) ||
        (item.bio && item.bio.toLowerCase().includes(category.toLowerCase()))
    );
    return res.status(200).json({ status: true, success: true, count: filtered.length, data: filtered, providers: filtered });
  }

  res.status(200).json({ status: true, success: true, count: formatted.length, data: formatted, providers: formatted });
});

router.get('/', listProvidersHandler);
router.get('/get-all', listProvidersHandler);

router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.query.userId;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    const first = await ProviderProfile.findOne().populate('userId', 'fullName phoneNumber email avatar isVerified');
    return res.status(200).json({ status: true, success: true, data: first });
  }

  let profile = await ProviderProfile.findOne({ userId })
    .populate('userId', 'fullName phoneNumber email avatar isVerified')
    .populate('serviceCategories', 'name image');

  if (!profile) {
    profile = await ProviderProfile.create({
      userId,
      businessName: req.user?.fullName || 'Certified Partner',
      isAvailable: true
    });
  }

  res.status(200).json({ status: true, success: true, data: profile });
}));

const upsertProviderProfileHandler = asyncHandler(async (req, res) => {
  const {
    userId: bodyUserId,
    businessName,
    partnerName,
    name,
    experienceYears,
    bio,
    serviceAreas,
    serviceCategories,
    workingHours,
    isAvailable,
    isOnline,
    category,
    city
  } = req.body;

  let resolvedUserId = req.user?._id || (bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId) ? bodyUserId : null);
  if (!resolvedUserId) {
    const fallbackUser = await User.findOne({ role: 'provider' }) || await User.findOne();
    resolvedUserId = fallbackUser?._id || new mongoose.Types.ObjectId();
  }

  let profile = await ProviderProfile.findOne({ userId: resolvedUserId });
  if (!profile) {
    profile = new ProviderProfile({ userId: resolvedUserId });
  }

  const resolvedBizName = businessName || partnerName || name;
  if (resolvedBizName !== undefined) profile.businessName = resolvedBizName;
  if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
  if (bio !== undefined) profile.bio = bio;
  if (serviceAreas !== undefined) {
    profile.serviceAreas = Array.isArray(serviceAreas)
      ? serviceAreas
      : String(serviceAreas).split(',').map((s) => s.trim()).filter(Boolean);
  } else if (city && (!profile.serviceAreas || profile.serviceAreas.length === 0)) {
    profile.serviceAreas = [city];
  }
  if (Array.isArray(serviceCategories)) {
    profile.serviceCategories = serviceCategories.filter((id) => mongoose.Types.ObjectId.isValid(id));
  }
  if (workingHours !== undefined) profile.workingHours = workingHours;
  if (isAvailable !== undefined || isOnline !== undefined) {
    profile.isAvailable = Boolean(isAvailable ?? isOnline);
  }
  if (category && !profile.bio) {
    profile.bio = `Certified ${category} specialist`;
  }

  await profile.save();

  res.status(200).json({
    status: true,
    success: true,
    message: 'Provider profile saved successfully',
    data: profile,
    provider: profile
  });
});

router.post('/profile', upsertProviderProfileHandler);
router.post('/create', upsertProviderProfileHandler);
router.post('/', upsertProviderProfileHandler);

router.put('/availability', asyncHandler(async (req, res) => {
  const { isAvailable, isOnline, userId: bodyUserId } = req.body;
  const nextState = isAvailable !== undefined ? Boolean(isAvailable) : Boolean(isOnline);

  let resolvedUserId = req.user?._id || (bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId) ? bodyUserId : null);
  if (!resolvedUserId) {
    const firstProfile = await ProviderProfile.findOne();
    resolvedUserId = firstProfile?.userId;
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { userId: resolvedUserId },
    { $set: { isAvailable: nextState } },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: true,
    success: true,
    message: `Provider status updated to ${nextState ? 'Online' : 'Offline'}`,
    data: { isAvailable: profile.isAvailable, isOnline: profile.isAvailable }
  });
}));

import { legacyGetKycs, legacyUpdateKyc } from '../../controllers/legacy.controller.js';

router.get('/kyc', legacyGetKycs);
router.put('/kyc/:id', legacyUpdateKyc);
router.patch('/kyc/:id', legacyUpdateKyc);

router.post('/kyc', upload.any(), asyncHandler(async (req, res) => {
  const {
    docType,
    documentType,
    docNumber,
    documentNumber,
    businessName,
    partnerName,
    experienceYears,
    userId: bodyUserId,
    phone,
    email,
    category,
    city
  } = req.body;

  const resolvedDocType = docType || documentType || 'Aadhaar';
  const resolvedDocNumber = docNumber || documentNumber || 'XXXX-XXXX-0000';

  const fileObj = req.file || (Array.isArray(req.files) && req.files[0]);
  const docUrl = fileObj
    ? storageProvider.getFileUrl(fileObj.filename)
    : req.body.docUrl || req.body.documentUrl || '/uploads/kyc-placeholder.png';

  let resolvedUserId = req.user?._id || (bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId) ? bodyUserId : null);
  if (!resolvedUserId) {
    const fallbackUser = await User.findOne().select('_id fullName email phoneNumber').lean();
    resolvedUserId = fallbackUser?._id;
  }

  let profile = resolvedUserId ? await ProviderProfile.findOne({ userId: resolvedUserId }) : null;
  if (!profile && resolvedUserId) {
    profile = new ProviderProfile({ userId: resolvedUserId });
  }

  const validEnumTypes = ['Aadhaar', 'PAN', 'Trade License', 'Driving License', 'Passport', 'Other'];
  const mappedEnumDocType = validEnumTypes.find((t) => resolvedDocType.toLowerCase().includes(t.toLowerCase())) || 'Other';

  if (profile) {
    if (businessName || partnerName) profile.businessName = businessName || partnerName;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);

    profile.kycDocuments.push({
      docType: mappedEnumDocType,
      docNumber: resolvedDocNumber,
      docUrl,
      submittedAt: new Date()
    });
    profile.kycStatus = 'pending_verification';
    await profile.save();
  }

  if (resolvedUserId) {
    await User.findByIdAndUpdate(resolvedUserId, { kycStatus: 'pending_verification' });
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
    docNumber: resolvedDocNumber,
    docUrl,
    documents: [{ docType: resolvedDocType, docNumber: resolvedDocNumber, docUrl }],
    status: 'pending_verification',
    experienceYears: Number(experienceYears) || 0
  });

  res.status(201).json({
    status: true,
    success: true,
    message: 'KYC submitted successfully and pending admin verification',
    data: profile || kycRecord,
    kyc: kycRecord
  });
}));

router.put('/:id/kyc', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, kycStatus, rejectionReason } = req.body;
  const raw = status || kycStatus || 'verified';
  const normalized = String(raw).toLowerCase().includes('verif') || String(raw).toLowerCase().includes('approv')
    ? 'verified'
    : (String(raw).toLowerCase().includes('reject') ? 'rejected' : 'pending_verification');

  const profile = mongoose.Types.ObjectId.isValid(id)
    ? (await ProviderProfile.findById(id) || await ProviderProfile.findOne({ userId: id }))
    : null;

  if (!profile) {
    throw ApiError.notFound('Provider profile not found');
  }

  profile.kycStatus = normalized;
  if (rejectionReason !== undefined) profile.rejectionReason = rejectionReason;
  await profile.save();

  if (profile.userId) {
    await User.findByIdAndUpdate(profile.userId, {
      kycStatus: normalized,
      isVerified: normalized === 'verified'
    });
    await KYC.updateMany({ userId: profile.userId }, { $set: { status: normalized, reviewedAt: new Date() } });
  }

  res.status(200).json({
    status: true,
    success: true,
    message: `Provider KYC updated to ${normalized}`,
    data: profile
  });
}));

export default router;
