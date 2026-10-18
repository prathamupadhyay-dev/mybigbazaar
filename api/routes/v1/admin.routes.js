/**
 * @file apps/api/routes/v1/admin.routes.js
 * @description Administrative dashboard and user management routes (/api/v1/admin)
 */

import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  deleteUser,
  getAdminReport
} from '../../controllers/admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

import mongoose from 'mongoose';
import User from '../../models/User.js';
import ProviderProfile from '../../models/ProviderProfile.js';
import { ApiError, asyncHandler } from '../../middleware/error.middleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/dashboard', getDashboardStats);
router.get('/reports/:type', getAdminReport);
router.get('/reports', getAdminReport);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserRole);
router.put('/users/:id', updateUserRole);

// Update user KYC status
router.put('/users/:id/kyc', asyncHandler(async (req, res) => {
  const { status, kycStatus } = req.body;
  const targetStatus = status || kycStatus;
  const targetId = req.params.id;
  let user = mongoose.isValidObjectId(targetId) ? await User.findById(targetId) : null;
  if (!user) {
    user = await User.findOne({ $or: [{ email: targetId }, { phoneNumber: targetId }] });
  }
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  user.kycStatus = targetStatus;
  if (targetStatus === 'verified' || targetStatus === 'approved') {
    user.kycStatus = 'verified';
    user.isEmailVerified = true;
    user.status = 'active';
  } else if (targetStatus === 'rejected') {
    user.kycStatus = 'rejected';
  }
  await user.save();
  await ProviderProfile.findOneAndUpdate(
    { userId: user._id },
    { kycStatus: user.kycStatus }
  );

  res.status(200).json({
    success: true,
    message: `KYC verification status updated to ${user.kycStatus}`,
    data: user.toJSON()
  });
}));

// Bulk update user status / verification
router.put('/users/bulk-status', asyncHandler(async (req, res) => {
  const { ids, status, isVerified } = req.body;
  const targetIds = Array.isArray(ids) ? ids : [ids].filter(Boolean);
  if (targetIds.length > 0) {
    const update = {};
    if (status) update.status = status;
    if (typeof isVerified === 'boolean') update.isEmailVerified = isVerified;
    await User.updateMany({ _id: { $in: targetIds } }, { $set: update });
  }
  res.status(200).json({
    success: true,
    message: `Bulk updated status for ${targetIds.length} users`
  });
}));

router.delete('/users/:id', deleteUser);

export default router;
