/**
 * @file apps/api/controllers/kyc.controller.js
 * @description Dynamic controller for Partner & Seller KYC applications
 */

import KYC from '../models/KYC.js';
import ProviderProfile from '../models/ProviderProfile.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

// ==========================================
// 1. GET ALL KYC APPLICATIONS
// ==========================================
export const getAllKycApplications = asyncHandler(async (req, res) => {
  const { status, docType, search, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (status && status !== 'All') {
    query.status = status.toLowerCase();
  }
  if (docType && docType !== 'All') {
    query.docType = new RegExp(docType, 'i');
  }
  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { partnerName: new RegExp(q, 'i') },
      { businessName: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { docNumber: new RegExp(q, 'i') }
    ];
  }

  const [applications, total] = await Promise.all([
    KYC.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    KYC.countDocuments(query)
  ]);

  const formatted = applications.map((app) => ({
    id: app._id.toString(),
    _id: app._id.toString(),
    partnerName: app.partnerName,
    businessName: app.businessName,
    email: app.email,
    phone: app.phone,
    phoneNumber: app.phone,
    category: app.category,
    city: app.city,
    applicantType: app.applicantType,
    docType: app.docType,
    documentType: app.docType,
    docNumber: app.docNumber,
    documentNumber: app.docNumber,
    docUrl: app.docUrl,
    documents: app.documents,
    status: app.status,
    experienceYears: app.experienceYears,
    notes: app.notes,
    rejectionReason: app.rejectionReason,
    submittedAt: app.createdAt ? app.createdAt.toISOString().slice(0, 10) : '',
    submittedDate: app.createdAt ? app.createdAt.toISOString().slice(0, 10) : ''
  }));

  res.status(200).json({
    success: true,
    data: formatted,
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
// 2. GET KYC BY ID
// ==========================================
export const getKycById = asyncHandler(async (req, res) => {
  const app = await KYC.findById(req.params.id);
  if (!app) {
    throw ApiError.notFound('KYC application not found');
  }
  res.status(200).json({
    success: true,
    data: app
  });
});

// ==========================================
// 3. SUBMIT KYC APPLICATION
// ==========================================
export const submitKycApplication = asyncHandler(async (req, res) => {
  const {
    partnerName,
    businessName,
    email,
    phone,
    category,
    city,
    docType,
    documentType,
    docNumber,
    documentNumber,
    docUrl,
    documents,
    experienceYears,
    notes
  } = req.body;

  const targetName = partnerName || businessName || (req.user ? req.user.fullName : 'Partner');
  const targetEmail = email || (req.user ? req.user.email : '');
  const targetPhone = phone || (req.user ? req.user.phoneNumber : '');
  const targetDocType = docType || documentType || 'Trade License';
  const targetDocNumber = docNumber || documentNumber || '';

  const docList = Array.isArray(documents) && documents.length > 0
    ? documents
    : docUrl ? [{ docType: targetDocType, docNumber: targetDocNumber, docUrl }] : [];

  const newApp = await KYC.create({
    userId: req.user ? req.user._id : null,
    partnerName: targetName,
    businessName: businessName || targetName,
    email: targetEmail,
    phone: targetPhone,
    category: category || 'General',
    city: city || 'Indore',
    docType: targetDocType,
    docNumber: targetDocNumber,
    docUrl: docUrl || (docList[0] ? docList[0].docUrl : ''),
    documents: docList,
    experienceYears: Number(experienceYears) || 0,
    status: 'pending_verification',
    notes: notes || ''
  });

  // Sync to ProviderProfile if user is authenticated
  if (req.user && req.user._id) {
    await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          businessName: businessName || targetName,
          kycStatus: 'pending_verification',
          experienceYears: Number(experienceYears) || 0
        },
        $push: {
          kycDocuments: {
            docType: targetDocType,
            docNumber: targetDocNumber,
            docUrl: docUrl || (docList[0] ? docList[0].docUrl : ''),
            submittedAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      $set: { kycStatus: 'pending' }
    });
  }

  res.status(201).json({
    success: true,
    message: 'KYC application submitted successfully',
    data: newApp
  });
});

// ==========================================
// 4. UPDATE KYC STATUS (APPROVE / REJECT)
// ==========================================
export const updateKycStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, notes } = req.body;

  let app = await KYC.findById(id);
  if (!app) {
    // Check if ID matches a ProviderProfile
    const profile = await ProviderProfile.findById(id);
    if (profile) {
      profile.kycStatus = status;
      if (rejectionReason) profile.rejectionReason = rejectionReason;
      await profile.save();

      if (profile.userId) {
        await User.findByIdAndUpdate(profile.userId, {
          $set: { kycStatus: status === 'verified' ? 'verified' : (status === 'rejected' ? 'rejected' : 'pending') }
        });
      }
      return res.status(200).json({
        success: true,
        message: `KYC application marked as ${status}`
      });
    }
    throw ApiError.notFound('KYC application not found');
  }

  app.status = status;
  if (rejectionReason) app.rejectionReason = rejectionReason;
  if (notes) app.notes = notes;
  app.reviewedAt = new Date();
  if (req.user) app.reviewedBy = req.user._id;
  await app.save();

  // Sync with user profile if linked
  if (app.userId) {
    await User.findByIdAndUpdate(app.userId, {
      $set: {
        kycStatus: status === 'verified' ? 'verified' : (status === 'rejected' ? 'rejected' : 'pending'),
        status: status === 'rejected' ? 'suspended' : 'active'
      }
    });

    await ProviderProfile.findOneAndUpdate(
      { userId: app.userId },
      { $set: { kycStatus: status } }
    );
  }

  res.status(200).json({
    success: true,
    message: `KYC application marked as ${status}`,
    data: app
  });
});

// ==========================================
// 5. DELETE KYC APPLICATION
// ==========================================
export const deleteKycApplication = asyncHandler(async (req, res) => {
  const app = await KYC.findByIdAndDelete(req.params.id);
  if (!app) {
    throw ApiError.notFound('KYC application not found');
  }
  res.status(200).json({
    success: true,
    message: 'KYC application deleted successfully'
  });
});

export default {
  getAllKycApplications,
  getKycById,
  submitKycApplication,
  updateKycStatus,
  deleteKycApplication
};
