/**
 * @file packages/types/index.js
 * @description Shared Domain Type Definitions (JSDoc) & Entity Factories
 * Pure JavaScript with full IDE auto-completion and runtime object factories.
 */

/**
 * @typedef {'guest'|'buyer'|'seller'|'provider'|'moderator'|'admin'|'super_admin'} UserRole
 */

/**
 * @typedef {'draft'|'pending_approval'|'live'|'sold'|'paused'|'rejected'|'expired'} AdStatusType
 */

/**
 * @typedef {'pending'|'confirmed'|'assigned'|'in_progress'|'completed'|'cancelled'|'disputed'} BookingStatusType
 */

/**
 * @typedef {'placed'|'processing'|'shipped'|'delivered'|'cancelled'|'returned'} OrderStatusType
 */

/**
 * @typedef {'pending'|'countered'|'accepted'|'declined'|'expired'} OfferStatusType
 */

/**
 * @typedef {'pending'|'escrow_held'|'success'|'released'|'refunded'|'failed'} PaymentStatusType
 */

/**
 * @typedef {Object} Address
 * @property {string} [id]
 * @property {'Home'|'Office'|'Other'} [type]
 * @property {string} houseNo
 * @property {string} street
 * @property {string} [landmark]
 * @property {string} city
 * @property {string} pincode
 * @property {string} [state]
 * @property {boolean} [isDefault]
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} phoneNumber
 * @property {UserRole} role
 * @property {string[]} [userTypes]
 * @property {string} [avatarUrl]
 * @property {boolean} [isVerified]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} ListingItem
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {string} category
 * @property {string} [subcategory]
 * @property {'New'|'Like New'|'Good'|'Fair'} [condition]
 * @property {string} sellerId
 * @property {string} [sellerName]
 * @property {number} [sellerRating]
 * @property {string[]} images
 * @property {string} [location]
 * @property {AdStatusType} status
 * @property {number} [views]
 * @property {boolean} [isFeatured]
 * @property {'product'} itemType
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} ServicePackage
 * @property {string} name
 * @property {number} price
 * @property {string} duration
 * @property {string} [description]
 * @property {string[]} [features]
 * @property {boolean} [isPopular]
 */

/**
 * @typedef {Object} ServiceItem
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} providerId
 * @property {string} [providerName]
 * @property {string} category
 * @property {string} [subcategory]
 * @property {number} basePrice
 * @property {ServicePackage[]} [packages]
 * @property {string[]} images
 * @property {number} [rating]
 * @property {number} [reviewCount]
 * @property {boolean} isAvailable
 * @property {string} [timeEstimate]
 * @property {string} [location]
 * @property {'service'} itemType
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} BookingItem
 * @property {string} id
 * @property {string} bookingId
 * @property {string} customerId
 * @property {string} [providerId]
 * @property {string} [serviceId]
 * @property {string} serviceName
 * @property {string} [subCategoryName]
 * @property {string} category
 * @property {string} scheduledDate
 * @property {string} scheduledTimeSlot
 * @property {string} providerName
 * @property {string} [providerContact]
 * @property {number} [providerRating]
 * @property {number} amount
 * @property {number} [discount]
 * @property {number} totalAmount
 * @property {string} [couponApplied]
 * @property {BookingStatusType} status
 * @property {string} serviceAddress
 * @property {string} paymentMode
 * @property {string} [paymentStatus]
 * @property {number} [userRating]
 * @property {string} [userReview]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} OrderLineItem
 * @property {string} listingId
 * @property {string} title
 * @property {number} price
 * @property {number} quantity
 * @property {string} [image]
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} id
 * @property {string} orderNumber
 * @property {string} buyerId
 * @property {string} [sellerId]
 * @property {OrderLineItem[]} items
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} deliveryFee
 * @property {number} totalAmount
 * @property {Address} shippingAddress
 * @property {string} paymentMode
 * @property {string} paymentStatus
 * @property {OrderStatusType} trackingStatus
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} OfferDetails
 * @property {number} amount
 * @property {OfferStatusType} status
 * @property {number} [counterAmount]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} [id]
 * @property {string} senderId
 * @property {string} text
 * @property {'text'|'offer'|'system'|'image'} messageType
 * @property {OfferDetails} [offerDetails]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} ChatConversation
 * @property {string} id
 * @property {string[]} participants
 * @property {string} [listingId]
 * @property {string} [serviceId]
 * @property {ChatMessage} [lastMessage]
 * @property {ChatMessage[]} messages
 * @property {'active'|'archived'|'blocked'} status
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ReviewItem
 * @property {string} id
 * @property {'service'|'product'|'provider'|'listing'} targetType
 * @property {string} targetId
 * @property {string} reviewerId
 * @property {string} [reviewerName]
 * @property {number} rating
 * @property {string} reviewText
 * @property {string[]} [images]
 * @property {boolean} [isVerified]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} PaymentTransaction
 * @property {string} id
 * @property {string} transactionId
 * @property {string} userId
 * @property {number} amount
 * @property {string} currency
 * @property {'booking'|'order'|'seller_package'|'escrow'} purpose
 * @property {string} [referenceId]
 * @property {PaymentStatusType} status
 * @property {string} paymentMode
 * @property {string} [paymentGateway]
 * @property {string} [couponApplied]
 * @property {string} [createdAt]
 */

// ==========================================
// RUNTIME OBJECT FACTORIES
// ==========================================

export function createUserProfile(overrides = {}) {
  return {
    id: `usr-${Date.now()}`,
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'buyer',
    userTypes: ['buyer'],
    avatarUrl: '',
    isVerified: false,
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function createListing(overrides = {}) {
  return {
    id: `lst-${Date.now()}`,
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'Electronics',
    subcategory: '',
    condition: 'Good',
    sellerId: '',
    sellerName: 'Local Seller',
    sellerRating: 4.8,
    images: [],
    location: 'Kottayam',
    status: 'live',
    views: 0,
    isFeatured: false,
    itemType: 'product',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function createService(overrides = {}) {
  return {
    id: `srv-${Date.now()}`,
    title: '',
    description: '',
    providerId: '',
    providerName: 'Certified Professional',
    category: 'Plumbing',
    subcategory: '',
    basePrice: 0,
    packages: [],
    images: [],
    rating: 4.8,
    reviewCount: 0,
    isAvailable: true,
    timeEstimate: '1-2 hours',
    location: 'Kottayam',
    itemType: 'service',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function createBooking(overrides = {}) {
  return {
    id: `bk-${Date.now()}`,
    bookingId: `BB-${Math.floor(10000 + Math.random() * 90000)}`,
    customerId: '',
    providerId: '',
    serviceId: '',
    serviceName: '',
    subCategoryName: '',
    category: '',
    scheduledDate: '',
    scheduledTimeSlot: '',
    providerName: 'Assigned Certified Partner',
    providerContact: '+1 555-0101',
    providerRating: 4.8,
    amount: 0,
    discount: 0,
    totalAmount: 0,
    couponApplied: null,
    status: 'pending',
    serviceAddress: '',
    paymentMode: 'Cash on Delivery',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function createOrder(overrides = {}) {
  return {
    id: `ord-${Date.now()}`,
    orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    buyerId: '',
    sellerId: '',
    items: [],
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    totalAmount: 0,
    shippingAddress: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      pincode: '',
      state: ''
    },
    paymentMode: 'UPI',
    paymentStatus: 'pending',
    trackingStatus: 'placed',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export default {
  createUserProfile,
  createListing,
  createService,
  createBooking,
  createOrder
};
