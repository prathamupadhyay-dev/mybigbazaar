/**
 * @file apps/api/routes/legacy/auth.legacy.js
 * @description 100% backward-compatible /auth routes
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
import {
  legacyGetAllUsers,
  legacyGetUserById,
  legacyGetAllAdmins,
  legacyCreateUser,
  legacyUpdateUser,
  legacyDeleteUser
} from '../../controllers/legacy.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Standard auth flows (rate-limited against brute force)
router.post('/check-email', authLimiter, checkEmail);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/send-phone-otp', authLimiter, sendPhoneOtp);
router.post('/phone-otp', authLimiter, sendPhoneOtp);
router.post('/verify-phone-otp', authLimiter, verifyPhoneOtp);
router.post('/phone-login', authLimiter, verifyPhoneOtp);
router.post('/signup', authLimiter, signup);
router.post('/register', authLimiter, signup);
router.post('/google', authLimiter, googleAuth);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-forgot-password-otp', authLimiter, verifyForgotPasswordOtp);
router.post('/reset-password', authLimiter, resetPassword);

// Profile routes
router.get('/profile', authenticate, getMe);
router.put('/profile', authenticate, updateMe);
router.get('/me', authenticate, getMe);

// Legacy account inspection routes (sanitized and protected)
router.get('/get-all', authenticate, requireAdmin, legacyGetAllUsers);
router.get('/get-all-users', authenticate, requireAdmin, legacyGetAllUsers);
router.get('/get-all-admins', authenticate, requireAdmin, legacyGetAllAdmins);
router.post('/create-user', authenticate, requireAdmin, legacyCreateUser);
router.put('/update-user/:id', authenticate, requireAdmin, legacyUpdateUser);
router.get('/get-by-id/:id', authenticate, legacyGetUserById);
router.get('/get-by-userId/:userId', authenticate, legacyGetUserById);
router.delete('/delete/:id', authenticate, requireAdmin, legacyDeleteUser);

export default router;
