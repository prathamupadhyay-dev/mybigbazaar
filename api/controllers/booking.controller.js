/**
 * @file apps/api/controllers/booking.controller.js
 * @description Service booking lifecycle controller for customers and providers
 */

import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { BookingStatus, PaymentStatus } from '../config/constants.js';

function resolveScheduledDate(rawDate) {
  if (!rawDate) return new Date(Date.now() + 86400000);
  const str = String(rawDate).trim().toLowerCase();
  if (str === 'today') return new Date();
  if (str === 'tomorrow') return new Date(Date.now() + 86400000);
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date(Date.now() + 86400000);
}

function normalizePaymentMode(rawMode) {
  if (!rawMode) return 'Cash on Delivery';
  const m = String(rawMode).trim().toLowerCase();
  if (m.includes('upi') || m.includes('online') || m.includes('gpay') || m.includes('phonepe')) return 'UPI';
  if (m.includes('card') || m.includes('credit') || m.includes('debit')) return 'Card';
  if (m.includes('netbanking') || m.includes('bank')) return 'NetBanking';
  if (m.includes('wallet')) return 'Wallet';
  return 'Cash on Delivery';
}

function normalizeBookingStatusInput(rawStatus) {
  if (!rawStatus) return BookingStatus.CONFIRMED;
  const s = String(rawStatus).trim().toLowerCase().replace(/\s+/g, '_');
  if (s === 'upcoming' || s === 'confirmed' || s === 'accepted') return BookingStatus.CONFIRMED;
  if (s === 'assigned') return BookingStatus.ASSIGNED;
  if (s === 'in_progress' || s === 'started' || s === 'active') return BookingStatus.IN_PROGRESS;
  if (s === 'completed' || s === 'done') return BookingStatus.COMPLETED;
  if (s === 'cancelled' || s === 'canceled') return BookingStatus.CANCELLED;
  if (s === 'rejected' || s === 'declined') return BookingStatus.REJECTED;
  if (s === 'pending') return BookingStatus.PENDING;
  return BookingStatus.CONFIRMED;
}

async function findBookingByIdOrCode(idOrCode) {
  if (!idOrCode) return null;
  if (mongoose.Types.ObjectId.isValid(idOrCode) && String(idOrCode).length === 24) {
    const byId = await Booking.findById(idOrCode);
    if (byId) return byId;
  }
  return Booking.findOne({ bookingId: String(idOrCode).trim() });
}

/**
 * @desc    Create a new service booking
 * @route   POST /api/v1/bookings | POST /booking/create
 * @access  Public / Optional Auth
 */
export const createBooking = asyncHandler(async (req, res) => {
  const {
    serviceId,
    customerId: bodyCustomerId,
    userId: bodyUserId,
    customer,
    address,
    serviceAddress,
    appointment,
    scheduledDate,
    date,
    scheduledTimeSlot,
    timeSlot,
    pricing,
    amount: bodyAmount,
    totalAmount: bodyTotalAmount,
    couponCode,
    paymentMode,
    paymentMethod,
    notes,
    serviceName: bodyServiceName,
    serviceTitle,
    subCategoryName,
    category: bodyCategory,
    providerName: bodyProviderName,
    providerContact: bodyProviderContact
  } = req.body;

  // 1. Resolve Service (by ObjectId, title, or fallback)
  let service = null;
  if (serviceId && mongoose.Types.ObjectId.isValid(serviceId) && String(serviceId).length === 24) {
    service = await Service.findById(serviceId);
  }
  if (!service && (bodyServiceName || serviceTitle)) {
    service = await Service.findOne({
      title: { $regex: new RegExp(`^${(bodyServiceName || serviceTitle).trim()}$`, 'i') }
    });
  }
  if (!service) {
    service = await Service.findOne({ status: 'live' });
  }

  const resolvedServiceId = service?._id || (
    serviceId && mongoose.Types.ObjectId.isValid(serviceId) && String(serviceId).length === 24
      ? new mongoose.Types.ObjectId(serviceId)
      : new mongoose.Types.ObjectId()
  );
  const resolvedServiceName = bodyServiceName || serviceTitle || service?.title || subCategoryName || 'Home Service Visit';
  const resolvedCategory = bodyCategory || service?.category || 'Home Services';
  const resolvedSubCategory = subCategoryName || service?.subcategory || resolvedServiceName;

  // 2. Resolve Customer ID
  let resolvedCustomerId = req.user?._id || null;
  if (!resolvedCustomerId) {
    const candidateId = bodyCustomerId || bodyUserId || customer?.id || customer?._id;
    if (candidateId && mongoose.Types.ObjectId.isValid(candidateId) && String(candidateId).length === 24) {
      resolvedCustomerId = new mongoose.Types.ObjectId(candidateId);
    }
  }
  if (!resolvedCustomerId && (customer?.phone || customer?.email || req.body.customerPhone)) {
    const query = [];
    if (customer?.phone || req.body.customerPhone) query.push({ phoneNumber: customer?.phone || req.body.customerPhone });
    if (customer?.email) query.push({ email: String(customer.email).toLowerCase() });
    if (query.length > 0) {
      const existingUser = await User.findOne({ $or: query }).select('_id').lean();
      if (existingUser) resolvedCustomerId = existingUser._id;
    }
  }
  if (!resolvedCustomerId) {
    const anyUser = await User.findOne().select('_id').lean();
    resolvedCustomerId = anyUser?._id || new mongoose.Types.ObjectId();
  }

  // 3. Resolve Address
  const rawAddr = serviceAddress || address || {};
  let normalizedAddress = {
    houseNo: '',
    street: '',
    landmark: '',
    city: 'Indore',
    pincode: '452010',
    state: 'Madhya Pradesh',
    phone: customer?.phone || req.body.customerPhone || req.user?.phoneNumber || ''
  };

  if (typeof rawAddr === 'string') {
    const parts = rawAddr.split(',').map((s) => s.trim()).filter(Boolean);
    normalizedAddress.houseNo = parts[0] || rawAddr;
    normalizedAddress.street = parts.slice(1).join(', ') || rawAddr;
    const pinMatch = rawAddr.match(/\b\d{6}\b/);
    if (pinMatch) normalizedAddress.pincode = pinMatch[0];
  } else if (typeof rawAddr === 'object' && rawAddr !== null) {
    normalizedAddress = {
      houseNo: rawAddr.houseNo || rawAddr.addressLine1 || rawAddr.flat || '',
      street: rawAddr.street || rawAddr.addressLine2 || rawAddr.area || rawAddr.addressLine1 || '',
      landmark: rawAddr.landmark || '',
      city: rawAddr.city || 'Indore',
      pincode: String(rawAddr.pincode || rawAddr.postalCode || rawAddr.zip || '452010'),
      state: rawAddr.state || 'Madhya Pradesh',
      phone: rawAddr.phone || customer?.phone || req.body.customerPhone || req.user?.phoneNumber || ''
    };
  }

  // 4. Resolve Pricing & Coupon
  const baseAmt = Number(
    bodyAmount ??
    pricing?.basePrice ??
    bodyTotalAmount ??
    pricing?.totalAmount ??
    service?.basePrice ??
    499
  );
  let discount = Number(pricing?.discount || 0);
  let appliedCouponCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase().trim(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (coupon && baseAmt >= coupon.minOrderAmount) {
      if (coupon.discountType === 'percentage') {
        discount = Math.round((baseAmt * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      } else {
        discount = coupon.discountValue;
      }
      appliedCouponCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const addonsAmt = Number(pricing?.addonsTotal || 0);
  const taxAmt = Number(pricing?.tax || 0);
  const computedTotal = Math.max(0, baseAmt + addonsAmt + taxAmt - discount);
  const finalTotal = bodyTotalAmount !== undefined
    ? Number(bodyTotalAmount)
    : (pricing?.totalAmount !== undefined ? Number(pricing.totalAmount) : computedTotal);

  // 5. Resolve Date & Time Slot
  const resolvedDate = resolveScheduledDate(scheduledDate || appointment?.date || date);
  const resolvedTimeSlot = scheduledTimeSlot || appointment?.timeSlot || timeSlot || '10:00 AM - 12:00 PM';
  const resolvedPaymentMode = normalizePaymentMode(paymentMode || paymentMethod);
  const customerLabel = customer?.name || req.body.customerName || req.user?.fullName || '';

  const booking = await Booking.create({
    customerId: resolvedCustomerId,
    providerId: service?.providerId || null,
    serviceId: resolvedServiceId,
    serviceName: resolvedServiceName,
    category: resolvedCategory,
    subCategoryName: resolvedSubCategory,
    scheduledDate: resolvedDate,
    scheduledTimeSlot: resolvedTimeSlot,
    providerName: bodyProviderName || service?.providerName || 'Assigned Certified Partner',
    providerContact: bodyProviderContact || '+91 98260 12345',
    serviceAddress: normalizedAddress,
    amount: baseAmt,
    discount,
    totalAmount: finalTotal,
    couponApplied: appliedCouponCode,
    status: BookingStatus.CONFIRMED,
    paymentMode: resolvedPaymentMode,
    paymentStatus: resolvedPaymentMode === 'Cash on Delivery' ? PaymentStatus.PENDING : PaymentStatus.PAID,
    notes: notes || (customerLabel ? `Customer: ${customerLabel}` : ''),
    statusHistory: [
      {
        status: BookingStatus.CONFIRMED,
        note: customerLabel ? `Booking created by ${customerLabel}` : 'Booking created by customer'
      }
    ]
  });

  await Payment.create({
    transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: resolvedCustomerId,
    userName: customerLabel || 'Verified Customer',
    userEmail: customer?.email || req.user?.email || '',
    userPhone: normalizedAddress.phone || '',
    sellerId: service?.providerId || null,
    sellerName: booking.providerName || 'Assigned Certified Partner',
    orderId: booking.bookingId,
    referenceId: booking.bookingId,
    productTitle: resolvedServiceName,
    productImage: (service?.images && service.images[0]) || '',
    type: 'payment',
    purpose: 'booking',
    subtotal: baseAmt + addonsAmt,
    taxAmount: taxAmt,
    taxName: 'GST 18%',
    amount: finalTotal,
    currency: 'INR',
    status: 'completed',
    paymentMode: resolvedPaymentMode,
    method: resolvedPaymentMode,
    paymentGateway: 'Razorpay'
  }).catch(() => null);

  res.status(201).json({
    status: true,
    success: true,
    message: 'Booking confirmed successfully',
    bookingId: booking.bookingId,
    data: booking,
    booking
  });
});

/**
 * @desc    Get bookings (customer, provider, or admin list)
 * @route   GET /api/v1/bookings | GET /booking/get-all | GET /booking/get-by-user/:userId
 * @access  Public / Optional Auth
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, role, all, userId: queryUserId } = req.query;
  const paramUserId = req.params.userId || queryUserId;
  const isGetAllRoute = req.originalUrl?.includes('get-all') || all === 'true';

  const filter = {};

  if (paramUserId) {
    if (mongoose.Types.ObjectId.isValid(paramUserId) && String(paramUserId).length === 24) {
      filter.customerId = paramUserId;
    } else {
      filter['serviceAddress.phone'] = String(paramUserId).trim();
    }
  } else if (!isGetAllRoute && req.user) {
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      // Admin sees all bookings
    } else if (role === 'provider' || req.user.role === 'provider') {
      filter.providerId = req.user._id;
    } else {
      filter.customerId = req.user._id;
    }
  }

  if (status) {
    filter.status = normalizeBookingStatusInput(status);
  }

  const bookings = await Booking.find(filter)
    .populate('serviceId', 'title images basePrice category')
    .populate('customerId', 'fullName phoneNumber email')
    .populate('providerId', 'fullName phoneNumber avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: true,
    success: true,
    count: bookings.length,
    data: bookings,
    bookings
  });
});

export const getBookings = getMyBookings;

/**
 * @desc    Get single booking details
 * @route   GET /api/v1/bookings/:id
 * @access  Public / Optional Auth
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne(
    mongoose.Types.ObjectId.isValid(req.params.id) && String(req.params.id).length === 24
      ? { $or: [{ _id: req.params.id }, { bookingId: req.params.id }] }
      : { bookingId: req.params.id }
  )
    .populate('serviceId')
    .populate('customerId', 'fullName phoneNumber email')
    .populate('providerId', 'fullName phoneNumber email');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (req.user) {
    const isCustomer = booking.customerId?._id?.toString() === req.user._id.toString() ||
                       booking.customerId?.toString() === req.user._id.toString();
    const isProvider = booking.providerId?._id?.toString() === req.user._id.toString() ||
                       booking.providerId?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isCustomer && !isProvider && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to view this booking');
    }
  }

  res.status(200).json({
    status: true,
    success: true,
    data: booking,
    booking
  });
});

/**
 * @desc    Update booking status, schedule, provider assignment, or rating
 * @route   PUT /api/v1/bookings/:id/status | PUT /booking/update-status/:id | PATCH /booking/:id/status
 * @access  Public / Optional Auth
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const {
    status,
    note,
    scheduledDate,
    scheduledTimeSlot,
    userRating,
    userReview,
    providerId,
    providerName,
    providerContact,
    paymentStatus,
    cancellationReason
  } = req.body;

  const booking = await findBookingByIdOrCode(req.params.id);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (req.user && status) {
    const isCustomer = booking.customerId?.toString() === req.user._id.toString();
    const isProvider = booking.providerId?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (isCustomer && !isAdmin && !isProvider) {
      throw ApiError.forbidden('Customer cannot change booking status directly');
    }
  }

  if (status) {
    const normalizedStatus = normalizeBookingStatusInput(status);
    booking.status = normalizedStatus;
    booking.statusHistory.push({
      status: normalizedStatus,
      note: note || `Status updated to ${normalizedStatus}`
    });

    if (normalizedStatus === BookingStatus.COMPLETED) {
      booking.paymentStatus = PaymentStatus.PAID;
    }
    if (normalizedStatus === BookingStatus.CANCELLED && cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
  }

  if (scheduledDate) {
    booking.scheduledDate = resolveScheduledDate(scheduledDate);
  }
  if (scheduledTimeSlot) {
    booking.scheduledTimeSlot = scheduledTimeSlot;
  }
  if (userRating !== undefined) {
    booking.userRating = Math.min(5, Math.max(1, Number(userRating) || 5));
  }
  if (userReview !== undefined) {
    booking.userReview = String(userReview);
  }
  if (providerId && mongoose.Types.ObjectId.isValid(providerId)) {
    booking.providerId = providerId;
  }
  if (providerName) {
    booking.providerName = providerName;
  }
  if (providerContact) {
    booking.providerContact = providerContact;
  }
  if (paymentStatus) {
    booking.paymentStatus = String(paymentStatus).toLowerCase();
  }

  await booking.save();

  res.status(200).json({
    status: true,
    success: true,
    message: `Booking updated successfully`,
    data: booking,
    booking
  });
});

/**
 * @desc    Cancel booking by customer or admin
 * @route   POST /api/v1/bookings/:id/cancel
 * @access  Public / Optional Auth
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await findBookingByIdOrCode(req.params.id);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (req.user) {
    const isCustomer = booking.customerId?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isCustomer && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to cancel this booking');
    }
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, 'This booking is already cancelled');
  }
  if (booking.status === BookingStatus.COMPLETED) {
    throw new ApiError(400, 'Cannot cancel an already completed booking');
  }

  booking.status = BookingStatus.CANCELLED;
  booking.cancellationReason = reason || 'Cancelled by customer';
  booking.statusHistory.push({
    status: BookingStatus.CANCELLED,
    note: booking.cancellationReason
  });

  await booking.save();

  res.status(200).json({
    status: true,
    success: true,
    message: 'Booking cancelled successfully',
    data: booking,
    booking
  });
});
