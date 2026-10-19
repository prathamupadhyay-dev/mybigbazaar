/**
 * @file packages/shared/index.js
 * @description Single source of truth for domain status enums, category hierarchies,
 * system constants, and business calculation helpers across MyBigBazaar.
 */

// ==========================================
// 1. BRAND & PLATFORM CONSTANTS
// ==========================================
export const APP_NAME = 'BigBazaar';
export const APP_TAGLINE = 'India’s Unified Hyperlocal Marketplace';
export const SUPPORT_EMAIL = 'support@bigbazaar.com';
export const SUPPORT_PHONE = '+1 555-0199';
export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';
export const PLATFORM_FEE_PERCENT = 2; // 2% platform fee

// ==========================================
// 2. DOMAIN STATUS ENUMS
// ==========================================

/**
 * Ad / Product listing moderation & availability statuses
 */
export const AdStatus = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  LIVE: 'live',
  SOLD: 'sold',
  PAUSED: 'paused',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
});

export const AD_STATUSES = Object.freeze(Object.values(AdStatus));

/**
 * Service booking lifecycle statuses
 */
export const BookingStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
});

export const BOOKING_STATUSES = Object.freeze(Object.values(BookingStatus));

/**
 * E-commerce physical order tracking statuses
 */
export const OrderStatus = Object.freeze({
  PLACED: 'placed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
});

export const ORDER_STATUSES = Object.freeze(Object.values(OrderStatus));

/**
 * Peer-to-peer bargaining / offer negotiation statuses
 */
export const OfferStatus = Object.freeze({
  PENDING: 'pending',
  COUNTERED: 'countered',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired'
});

export const OFFER_STATUSES = Object.freeze(Object.values(OfferStatus));

/**
 * Platform user access roles
 */
export const Role = Object.freeze({
  GUEST: 'guest',
  BUYER: 'buyer',
  SELLER: 'seller',
  PROVIDER: 'provider',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
});

export const ROLES = Object.freeze(Object.values(Role));

/**
 * Payment and Escrow transaction statuses
 */
export const PaymentStatus = Object.freeze({
  PENDING: 'pending',
  ESCROW_HELD: 'escrow_held',
  SUCCESS: 'success',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed'
});

export const PAYMENT_STATUSES = Object.freeze(Object.values(PaymentStatus));

/**
 * Supported payment methods
 */
export const PaymentMode = Object.freeze({
  UPI: 'UPI',
  CARD: 'Card',
  NETBANKING: 'NetBanking',
  CASH_ON_DELIVERY: 'Cash on Delivery',
  WALLET: 'Wallet'
});

export const PAYMENT_MODES = Object.freeze(Object.values(PaymentMode));

/**
 * Feed item discriminator
 */
export const ItemType = Object.freeze({
  PRODUCT: 'product',
  SERVICE: 'service'
});

export const ITEM_TYPES = Object.freeze(Object.values(ItemType));

/**
 * Second-hand product conditions
 */
export const ItemCondition = Object.freeze({
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair'
});

export const ITEM_CONDITIONS = Object.freeze(Object.values(ItemCondition));

// ==========================================
// 3. CATEGORIES CATALOG & TAXONOMY
// ==========================================

export const MARKETPLACE_CATEGORIES = Object.freeze([
  'Electronics',
  'Fashion',
  'Furniture',
  'Bikes',
  'Books',
  'Appliances',
  'Sports',
  'Other'
]);

export const SERVICE_CATEGORIES = Object.freeze([
  'Plumbing',
  'Electrician',
  'Tutoring',
  'Home Cleaning',
  'AC Repair',
  'Painting',
  'Carpentry',
  'Salon',
  'Pest Control'
]);

export const ALL_CATEGORIES = Object.freeze([
  ...MARKETPLACE_CATEGORIES,
  ...SERVICE_CATEGORIES
]);

export const CATEGORY_TAXONOMY = Object.freeze({
  // Marketplace Categories with Subcategories
  Electronics: [
    'Smartphones',
    'Laptops & Computers',
    'Audio & Headphones',
    'Cameras & Optics',
    'Accessories & Chargers',
    'Gaming & Consoles'
  ],
  Fashion: [
    'Men Clothing',
    'Women Clothing',
    'Footwear',
    'Watches & Wearables',
    'Bags & Luggage',
    'Jewelry & Accessories'
  ],
  Furniture: [
    'Living Room',
    'Bedroom Furniture',
    'Office & Study Desks',
    'Dining Tables & Chairs',
    'Storage & Wardrobes'
  ],
  Bikes: [
    'Motorcycles',
    'Scooters',
    'Bicycles',
    'Spare Parts & Helmets'
  ],
  Books: [
    'Fiction & Literature',
    'Academic & Textbooks',
    'Self-Help & Business',
    'Children & Comics'
  ],
  Appliances: [
    'Refrigerators',
    'Washing Machines',
    'Kitchen Appliances',
    'Microwaves & Ovens',
    'Air Purifiers'
  ],
  Sports: [
    'Fitness Equipment',
    'Outdoor Sports',
    'Athletic Footwear',
    'Sports Gear & Kits'
  ],
  Other: [
    'Collectibles & Antiques',
    'Musical Instruments',
    'Art & Craft',
    'Pet Supplies'
  ],

  // Service Categories with Subcategories
  Plumbing: [
    'Tap Leakage & Valve Repair',
    'Pipe Fitting & Drainage',
    'Water Heater & Geyser Installation',
    'Toilet & Sanitary Fitting',
    'Full Bathroom Renovation'
  ],
  Electrician: [
    'Switchboard & MCB Tripping',
    'Ceiling Fan & Light Installation',
    'Complete Home Wiring',
    'Appliance Repair & Servicing',
    'Inverter & Battery Setup'
  ],
  Tutoring: [
    'Class 1-5 Primary Foundation',
    'Class 6-10 Mathematics & Science',
    'Class 11-12 Board Exam Prep',
    'Language Learning (English, Hindi, etc.)',
    'Music & Guitar Lessons'
  ],
  'Home Cleaning': [
    'Full Home Deep Cleaning',
    'Bathroom Deep Clean',
    'Kitchen Degreasing & Clean',
    'Sofa & Carpet Dry Cleaning',
    'Balcony & Floor Scrubbing'
  ],
  'AC Repair': [
    'AC Servicing & Filter Deep Clean',
    'Gas Refill & Leak Check',
    'AC Installation & Uninstallation',
    'Cooling Coil & PCB Repair'
  ],
  Painting: [
    'Full Interior Home Painting',
    'Exterior Weatherproof Painting',
    'Waterproofing & Wall Sealing',
    'Accent Wall & Texture Finish'
  ],
  Carpentry: [
    'Furniture Assembly & Repair',
    'Door & Window Latch Fitting',
    'Lock & Handle Replacement',
    'Custom Shelving & Woodwork'
  ],
  Salon: [
    'Haircut & Beard Styling',
    'Facials & Skincare',
    'Waxing & Threading',
    'Manicure & Pedicure',
    'Deep Tissue Massage Therapy'
  ],
  'Pest Control': [
    'Cockroach & Ant Eradication',
    'Termite Treatment & Drill',
    'Bedbug Chemical Treatment',
    'Rodent & Mosquito Control'
  ]
});

// ==========================================
// 4. PROMOTIONAL COUPONS
// ==========================================

export const PROMOTIONAL_COUPONS = Object.freeze({
  FIRST20: {
    code: 'FIRST20',
    discountPercent: 20,
    maxDiscount: 200,
    minOrderValue: 299,
    description: 'Get 20% off on your first order up to ₹200'
  },
  BIGBAZAAR: {
    code: 'BIGBAZAAR',
    discountPercent: 10,
    maxDiscount: 500,
    minOrderValue: 499,
    description: 'Flat 10% discount on marketplace and services up to ₹500'
  }
});

// ==========================================
// 5. CALCULATION & FORMATTING HELPERS
// ==========================================

/**
 * Calculate coupon discount based on total and coupon code
 * @param {number} subtotal 
 * @param {string|null} couponCode 
 * @returns {{ discount: number, coupon: object|null, isValid: boolean, message: string }}
 */
export function calculateDiscount(subtotal, couponCode) {
  if (!couponCode || typeof couponCode !== 'string') {
    return { discount: 0, coupon: null, isValid: false, message: 'No coupon specified' };
  }
  const cleanCode = couponCode.trim().toUpperCase();
  const coupon = PROMOTIONAL_COUPONS[cleanCode];

  if (!coupon) {
    return { discount: 0, coupon: null, isValid: false, message: 'Invalid promo code' };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      discount: 0,
      coupon,
      isValid: false,
      message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
    };
  }

  const rawDiscount = Math.round((subtotal * coupon.discountPercent) / 100);
  const discount = Math.min(rawDiscount, coupon.maxDiscount);

  return {
    discount,
    coupon,
    isValid: true,
    message: `${coupon.discountPercent}% discount applied (saved ₹${discount})`
  };
}

/**
 * Calculate platform fee for safe escrow or transaction processing
 * @param {number} amount 
 * @returns {number}
 */
export function calculatePlatformFee(amount) {
  if (!amount || amount <= 0) return 0;
  return Math.round((amount * PLATFORM_FEE_PERCENT) / 100);
}

/**
 * Calculate complete order bill breakdown
 * @param {number} subtotal 
 * @param {string|null} [couponCode=null] 
 * @param {number} [deliveryFee=0] 
 * @returns {{ subtotal: number, discount: number, platformFee: number, deliveryFee: number, total: number }}
 */
export function calculateOrderSummary(subtotal, couponCode = null, deliveryFee = 0) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const { discount } = calculateDiscount(safeSubtotal, couponCode);
  const platformFee = calculatePlatformFee(safeSubtotal);
  const safeDelivery = Math.max(0, Number(deliveryFee) || 0);
  const total = Math.max(0, safeSubtotal - discount + platformFee + safeDelivery);

  return {
    subtotal: safeSubtotal,
    discount,
    platformFee,
    deliveryFee: safeDelivery,
    total
  };
}

/**
 * Format numeric value as Indian Rupee (INR) currency string
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

// ==========================================
// 6. CANONICAL MARKETING & LEGAL CONTENT
// ==========================================
export * from './content.js';

export default {
  APP_NAME,
  APP_TAGLINE,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  DEFAULT_CURRENCY,
  CURRENCY_SYMBOL,
  PLATFORM_FEE_PERCENT,
  AdStatus,
  AD_STATUSES,
  BookingStatus,
  BOOKING_STATUSES,
  OrderStatus,
  ORDER_STATUSES,
  OfferStatus,
  OFFER_STATUSES,
  Role,
  ROLES,
  PaymentStatus,
  PAYMENT_STATUSES,
  PaymentMode,
  PAYMENT_MODES,
  ItemType,
  ITEM_TYPES,
  ItemCondition,
  ITEM_CONDITIONS,
  MARKETPLACE_CATEGORIES,
  SERVICE_CATEGORIES,
  ALL_CATEGORIES,
  CATEGORY_TAXONOMY,
  PROMOTIONAL_COUPONS,
  calculateDiscount,
  calculatePlatformFee,
  calculateOrderSummary,
  formatCurrency
};
