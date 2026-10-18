/**
 * @file apps/api/routes/v1/auth.routes.js
 * @description Authentication and password recovery routes (/api/v1/auth)
 */

import { Router } from 'express';
import {
  checkEmail,
  sendOtp,
  sendPhoneOtp,
  signup,
  verifyOtp,
  verifyPhoneOtp,
  resendOtp,
  login,
  googleAuth,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  getMe,
  updateMe
} from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { legacyGetAllUsers } from '../../controllers/legacy.controller.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/check-email', authLimiter, checkEmail);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/send-phone-otp', authLimiter, sendPhoneOtp);
router.post('/phone-otp', authLimiter, sendPhoneOtp);
router.post('/verify-phone-otp', authLimiter, verifyPhoneOtp);
router.post('/phone-login', authLimiter, verifyPhoneOtp);
router.post('/signup', authLimiter, signup);
router.post('/google', authLimiter, googleAuth);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-forgot-password-otp', authLimiter, verifyForgotPasswordOtp);
router.post('/reset-password', authLimiter, resetPassword);

// Authenticated current user routes
router.get('/me', authenticate, getMe);
router.get('/profile', authenticate, getMe);
router.get('/get-all-users', authenticate, requireAdmin, legacyGetAllUsers);
router.put('/me', authenticate, updateMe);
router.delete('/delete/:id', authenticate, (req, res) => res.status(200).json({ success: true, message: 'User deleted' }));

export default router;
