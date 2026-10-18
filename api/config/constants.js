/**
 * @file apps/api/config/constants.js
 * @description Central status enums, user roles, and platform constants
 */

export const Roles = Object.freeze({
  GUEST: 'guest',
  BUYER: 'buyer',
  SELLER: 'seller',
  PROVIDER: 'provider',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
});

export const ALL_ROLES = Object.values(Roles);

export const ListingStatus = Object.freeze({
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PENDING_APPROVAL: 'pending_approval',
  PENDING_MODERATION: 'pending_moderation',
  LIVE: 'live',
  SOLD: 'sold',
  PAUSED: 'paused',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
  EXPIRED: 'expired'
});

export const BookingStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
});

export const OrderStatus = Object.freeze({
  PLACED: 'placed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
});

export const OfferStatus = Object.freeze({
  PENDING: 'pending',
  COUNTERED: 'countered',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired'
});

export const PaymentStatus = Object.freeze({
  PENDING: 'pending',
  ESCROW_HELD: 'escrow_held',
  SUCCESS: 'success',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed'
});

export const KycStatus = Object.freeze({
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
});

export const ReportStatus = Object.freeze({
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
});
