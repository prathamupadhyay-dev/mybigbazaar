/**
 * @file apps/api/routes/v1/setting.routes.js
 * @description Global platform settings API routes (/api/v1/settings, /api/settings/global)
 */

import { Router } from 'express';
import Setting from '../../models/Setting.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

const router = Router();

// GET /api/v1/settings (or /api/settings/global)
router.get('/', asyncHandler(async (req, res) => {
  let settings = await Setting.findOne({ key: 'global' });
  if (!settings) {
    settings = await Setting.create({ key: 'global' });
  }
  res.status(200).json({
    success: true,
    status: true,
    data: settings,
    settings: settings
  });
}));

// GET /api/v1/settings/global
router.get('/global', asyncHandler(async (req, res) => {
  let settings = await Setting.findOne({ key: 'global' });
  if (!settings) {
    settings = await Setting.create({ key: 'global' });
  }
  res.status(200).json({
    success: true,
    status: true,
    data: settings,
    settings: settings
  });
}));

// PUT /api/v1/settings
router.put('/', asyncHandler(async (req, res) => {
  const payload = req.body || {};
  if (payload.min_wallet_redeem_amount && !payload.minWalletRedeemAmount) {
    payload.minWalletRedeemAmount = Number(payload.min_wallet_redeem_amount);
  }
  if (payload.minWalletRedeemAmount && !payload.min_wallet_redeem_amount) {
    payload.min_wallet_redeem_amount = Number(payload.minWalletRedeemAmount);
  }

  const settings = await Setting.findOneAndUpdate(
    { key: 'global' },
    { $set: payload },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    status: true,
    message: 'Global settings updated successfully',
    data: settings,
    settings: settings
  });
}));

// POST /api/v1/settings (alias for form submits)
router.post('/', asyncHandler(async (req, res) => {
  const payload = req.body || {};
  if (payload.min_wallet_redeem_amount && !payload.minWalletRedeemAmount) {
    payload.minWalletRedeemAmount = Number(payload.min_wallet_redeem_amount);
  }
  if (payload.minWalletRedeemAmount && !payload.min_wallet_redeem_amount) {
    payload.min_wallet_redeem_amount = Number(payload.minWalletRedeemAmount);
  }

  const settings = await Setting.findOneAndUpdate(
    { key: 'global' },
    { $set: payload },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    status: true,
    message: 'Global settings saved successfully',
    data: settings,
    settings: settings
  });
}));

export default router;
