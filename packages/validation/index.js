/**
 * @file packages/validation/index.js
 * @description Lightweight, zero-dependency validation helpers for API endpoints,
 * mobile screens, and admin moderation consoles across MyBigBazaar.
 */

import {
  MARKETPLACE_CATEGORIES,
  SERVICE_CATEGORIES,
  ITEM_CONDITIONS,
  PAYMENT_MODES
} from '../shared/index.js';

/**
 * Validate email address format
 * @param {string} email 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' };
  }
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate phone number (accepts Indian 10-digit or international format)
 * @param {string} phone 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Matches 10-digit Indian numbers, optional +91, or general international numbers 10-15 digits
  const phoneRegex = /^(\+?\d{1,3})?[6-9]\d{9}$/;
  const fallbackRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(cleaned) && !fallbackRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number (at least 10 digits)' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate password requirements
 * @param {string} password 
 * @param {number} [minLength=6] 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` };
  }
  return { isValid: true, error: null };
}

/**
 * Validate 6-digit verification OTP
 * @param {string} otp 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateOtp(otp) {
  if (!otp || typeof otp !== 'string') {
    return { isValid: false, error: 'Verification code is required' };
  }
  const clean = otp.trim();
  if (!/^\d{6}$/.test(clean)) {
    return { isValid: false, error: 'Verification code must be exactly 6 digits' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate non-negative numeric price or amount
 * @param {number|string} price 
 * @returns {{ isValid: boolean, error: string | null, value: number }}
 */
export function validatePrice(price) {
  const numeric = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, ''));
  if (isNaN(numeric) || numeric < 0) {
    return { isValid: false, error: 'Please enter a valid non-negative amount', value: 0 };
  }
  return { isValid: true, error: null, value: numeric };
}

/**
 * Validate classified ad / product listing creation payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateListing(data = {}) {
  const errors = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  const priceResult = validatePrice(data.price);
  if (!priceResult.isValid || priceResult.value <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!data.category || !MARKETPLACE_CATEGORIES.includes(data.category)) {
    errors.category = `Category must be one of: ${MARKETPLACE_CATEGORIES.join(', ')}`;
  }

  if (data.condition && !ITEM_CONDITIONS.includes(data.condition)) {
    errors.condition = `Condition must be one of: ${ITEM_CONDITIONS.join(', ')}`;
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate service catalogue item creation payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateService(data = {}) {
  const errors = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    errors.title = 'Service title must be at least 3 characters long';
  }

  if (!data.category || !SERVICE_CATEGORIES.includes(data.category)) {
    errors.category = `Service category must be one of: ${SERVICE_CATEGORIES.join(', ')}`;
  }

  const priceResult = validatePrice(data.basePrice);
  if (!priceResult.isValid || priceResult.value < 0) {
    errors.basePrice = 'Base price must be a valid non-negative number';
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate physical service/shipping address payload
 * @param {Object} address 
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateAddress(address = {}) {
  const errors = {};

  if (!address.houseNo || !address.houseNo.trim()) {
    errors.houseNo = 'House / Flat number is required';
  }

  if (!address.street || !address.street.trim()) {
    errors.street = 'Street or locality is required';
  }

  if (!address.city || !address.city.trim()) {
    errors.city = 'City is required';
  }

  if (!address.pincode || !/^\d{6}$/.test(String(address.pincode).trim())) {
    errors.pincode = 'Valid 6-digit postal code / PIN is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate booking creation request
 * @param {Object} booking 
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateBooking(booking = {}) {
  const errors = {};

  if (!booking.scheduledDate || !booking.scheduledDate.trim()) {
    errors.scheduledDate = 'Scheduled date is required';
  }

  if (!booking.scheduledTimeSlot || !booking.scheduledTimeSlot.trim()) {
    errors.scheduledTimeSlot = 'Scheduled time slot is required';
  }

  if (!booking.serviceName || !booking.serviceName.trim()) {
    errors.serviceName = 'Service name is required';
  }

  const priceResult = validatePrice(booking.amount);
  if (!priceResult.isValid || priceResult.value <= 0) {
    errors.amount = 'Booking amount must be greater than zero';
  }

  if (booking.address && typeof booking.address === 'object') {
    const addressValidation = validateAddress(booking.address);
    if (!addressValidation.isValid) {
      errors.address = addressValidation.errors;
    }
  } else if (!booking.serviceAddress || !booking.serviceAddress.trim()) {
    errors.serviceAddress = 'Service address is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate review & rating submission
 * @param {Object} review 
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateReview(review = {}) {
  const errors = {};
  const ratingNum = Number(review.rating);

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    errors.rating = 'Rating must be an integer between 1 and 5';
  }

  if (review.reviewText && review.reviewText.trim().length > 1000) {
    errors.reviewText = 'Review text cannot exceed 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateOtp,
  validatePrice,
  validateListing,
  validateService,
  validateAddress,
  validateBooking,
  validateReview
};
