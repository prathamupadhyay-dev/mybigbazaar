/**
 * @file apps/api/middleware/rateLimit.middleware.js
 * @description API rate limiting middleware protecting against abuse and brute-force attacks
 */

import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') ? 100000 : 500,
  skip: (req) => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') ? 100000 : 30,
  skip: (req) => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});
