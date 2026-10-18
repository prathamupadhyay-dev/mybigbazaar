/**
 * @file apps/api/routes/v1/user.routes.js
 * @description User location and device permission preferences (/api/v1/user)
 */

import { Router } from 'express';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import User from '../../models/User.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

const router = Router();

// GET /api/v1/user/location - Returns current location with address & coordinates
router.get('/location', optionalAuth, asyncHandler(async (req, res) => {
  let locationData = {
    address: '123, MG Road, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    latitude: 12.9716,
    longitude: 77.5946
  };

  if (req.user && Array.isArray(req.user.addresses) && req.user.addresses.length > 0) {
    const defaultAddr = req.user.addresses.find(a => a.isDefault) || req.user.addresses[0];
    const street = [defaultAddr.houseNo, defaultAddr.street, defaultAddr.landmark].filter(Boolean).join(', ');
    locationData = {
      address: `${street ? street + ', ' : ''}${defaultAddr.city}, ${defaultAddr.state || 'Karnataka'} ${defaultAddr.pincode}`,
      city: defaultAddr.city,
      state: defaultAddr.state || 'Karnataka',
      pincode: defaultAddr.pincode,
      latitude: 12.9716,
      longitude: 77.5946
    };
  }

  res.status(200).json({
    success: true,
    data: locationData,
    location: locationData
  });
}));

// POST /api/v1/user/notification-permission - Records notification permission state
router.post('/notification-permission', optionalAuth, asyncHandler(async (req, res) => {
  const { granted, pushToken } = req.body;
  
  if (req.user) {
    // Optionally update user doc with notification token or preferences
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'preferences.notifications': Boolean(granted),
        ...(pushToken ? { 'preferences.pushToken': pushToken } : {})
      }
    });
  }

  res.status(200).json({
    success: true,
    message: granted ? 'Notifications enabled successfully' : 'Notification preference saved',
    data: { granted: Boolean(granted) }
  });
}));

export default router;
