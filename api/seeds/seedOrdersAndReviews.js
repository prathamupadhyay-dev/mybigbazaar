/**
 * @file apps/api/seeds/seedOrdersAndReviews.js
 * @description Dynamic seeder for realistic production orders, customer reviews, audit logs, and settings
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';
import Setting from '../models/Setting.js';
import connectDB from '../config/db.js';

export const seedOrdersAndReviews = async () => {
  console.log('[SEED] Starting dynamic data initialization...');

  const users = await User.find({ status: 'active' }).limit(10);
  const listings = await Listing.find().limit(5);
  const services = await Service.find().limit(5);

  if (users.length === 0 || listings.length === 0) {
    console.warn('[SEED] Users or listings missing, skipping orders seed');
    return;
  }

  const buyer = users[0];
  const seller = users[1] || users[0];

  // 1. Seed Orders if count < 5
  const orderCount = await Order.countDocuments();
  if (orderCount < 5) {
    console.log(`[SEED] Seeding realistic orders (current count: ${orderCount})...`);

    const sampleOrders = [
      {
        orderNumber: 'ORD-88201',
        buyerId: buyer._id,
        sellerId: seller._id,
        items: [
          {
            listingId: listings[0]._id,
            title: listings[0].productName || listings[0].title || 'Samsung Galaxy S24',
            price: listings[0].productPrice || 74999,
            quantity: 1,
            image: listings[0].images?.[0] || '/uploads/logo.png'
          }
        ],
        subtotal: listings[0].productPrice || 74999,
        deliveryFee: 0,
        discount: 1000,
        totalAmount: (listings[0].productPrice || 74999) - 1000,
        shippingAddress: {
          houseNo: 'House 14B',
          street: 'Baker Hill Road',
          landmark: 'Near District Court',
          city: 'Kottayam',
          pincode: '686001',
          state: 'Kerala',
          phone: '+91 98765 43210'
        },
        paymentMode: 'UPI',
        paymentStatus: 'success',
        trackingStatus: 'shipped',
        trackingNumber: 'DELHIVERY-992144',
        statusHistory: [
          { status: 'placed', note: 'Order placed by buyer', changedAt: new Date(Date.now() - 86400000 * 2) },
          { status: 'processing', note: 'Verified by seller and packed', changedAt: new Date(Date.now() - 86400000) },
          { status: 'shipped', note: 'Dispatched via Delhivery Express Hub', changedAt: new Date() }
        ]
      },
      {
        orderNumber: 'ORD-88202',
        buyerId: buyer._id,
        sellerId: seller._id,
        items: [
          {
            listingId: listings[1]?._id || listings[0]._id,
            title: listings[1]?.productName || listings[1]?.title || 'OnePlus 12 5G',
            price: listings[1]?.productPrice || 59999,
            quantity: 1,
            image: listings[1]?.images?.[0] || '/uploads/logo.png'
          }
        ],
        subtotal: listings[1]?.productPrice || 59999,
        deliveryFee: 0,
        discount: 0,
        totalAmount: listings[1]?.productPrice || 59999,
        shippingAddress: {
          houseNo: 'Flat 402',
          street: 'Kaloor Kadavanthra Road',
          landmark: 'Opposite Metro Pillar 782',
          city: 'Ernakulam',
          pincode: '682017',
          state: 'Kerala',
          phone: '+91 98450 11223'
        },
        paymentMode: 'Card',
        paymentStatus: 'success',
        trackingStatus: 'delivered',
        trackingNumber: 'BLUEDART-881239',
        statusHistory: [
          { status: 'placed', note: 'Order placed', changedAt: new Date(Date.now() - 86400000 * 5) },
          { status: 'processing', note: 'Prepared for dispatch', changedAt: new Date(Date.now() - 86400000 * 4) },
          { status: 'shipped', note: 'Shipped from hub', changedAt: new Date(Date.now() - 86400000 * 3) },
          { status: 'delivered', note: 'Delivered securely to recipient with OTP confirmation', changedAt: new Date(Date.now() - 86400000) }
        ]
      },
      {
        orderNumber: 'ORD-88203',
        buyerId: buyer._id,
        sellerId: seller._id,
        items: [
          {
            listingId: listings[2]?._id || listings[0]._id,
            title: listings[2]?.productName || listings[2]?.title || 'Samsung Galaxy S25',
            price: listings[2]?.productPrice || 74999,
            quantity: 1,
            image: listings[2]?.images?.[0] || '/uploads/logo.png'
          }
        ],
        subtotal: listings[2]?.productPrice || 74999,
        deliveryFee: 49,
        discount: 500,
        totalAmount: (listings[2]?.productPrice || 74999) + 49 - 500,
        shippingAddress: {
          houseNo: 'Villa 12',
          street: 'Skyline Palms',
          landmark: 'Near Infopark Gate 1',
          city: 'Kakkanad',
          pincode: '682042',
          state: 'Kerala',
          phone: '+91 97441 55667'
        },
        paymentMode: 'Cash on Delivery',
        paymentStatus: 'pending',
        trackingStatus: 'placed',
        trackingNumber: null,
        statusHistory: [
          { status: 'placed', note: 'Order placed by buyer via Cash on Delivery', changedAt: new Date() }
        ]
      },
      {
        orderNumber: 'ORD-88204',
        buyerId: buyer._id,
        sellerId: seller._id,
        items: [
          {
            listingId: listings[3]?._id || listings[0]._id,
            title: listings[3]?.productName || listings[3]?.title || 'Admin Test Live Product',
            price: listings[3]?.productPrice || 1299,
            quantity: 2,
            image: listings[3]?.images?.[0] || '/uploads/logo.png'
          }
        ],
        subtotal: 2598,
        deliveryFee: 0,
        discount: 0,
        totalAmount: 2598,
        shippingAddress: {
          houseNo: '78 Palm Avenue',
          street: 'Civil Station Ward',
          landmark: 'Next to SBI Treasury Branch',
          city: 'Alappuzha',
          pincode: '688012',
          state: 'Kerala',
          phone: '+91 99951 88990'
        },
        paymentMode: 'UPI',
        paymentStatus: 'refunded',
        trackingStatus: 'cancelled',
        trackingNumber: null,
        statusHistory: [
          { status: 'placed', note: 'Order placed by buyer', changedAt: new Date(Date.now() - 86400000 * 3) },
          { status: 'cancelled', note: 'Cancelled by customer: Changed delivery destination', changedAt: new Date(Date.now() - 86400000 * 2) }
        ]
      },
      {
        orderNumber: 'ORD-88205',
        buyerId: buyer._id,
        sellerId: seller._id,
        items: [
          {
            listingId: listings[4]?._id || listings[0]._id,
            title: listings[4]?.productName || listings[4]?.title || 'High Performance Laptop',
            price: listings[4]?.productPrice || 79999,
            quantity: 1,
            image: listings[4]?.images?.[0] || '/uploads/logo.png'
          }
        ],
        subtotal: listings[4]?.productPrice || 79999,
        deliveryFee: 0,
        discount: 2000,
        totalAmount: (listings[4]?.productPrice || 79999) - 2000,
        shippingAddress: {
          houseNo: 'Green Gardens 8A',
          street: 'Chittoor Road',
          landmark: 'YMCA Junction',
          city: 'Kottayam',
          pincode: '686001',
          state: 'Kerala',
          phone: '+91 98765 43210'
        },
        paymentMode: 'NetBanking',
        paymentStatus: 'success',
        trackingStatus: 'delivered',
        trackingNumber: 'EKART-554421',
        statusHistory: [
          { status: 'placed', note: 'Order placed', changedAt: new Date(Date.now() - 86400000 * 7) },
          { status: 'processing', note: 'Dispatched from tech hub', changedAt: new Date(Date.now() - 86400000 * 6) },
          { status: 'shipped', note: 'In transit', changedAt: new Date(Date.now() - 86400000 * 5) },
          { status: 'delivered', note: 'Delivered and verified in-person', changedAt: new Date(Date.now() - 86400000 * 4) }
        ]
      }
    ];

    await Order.insertMany(sampleOrders);
    console.log(`[SEED] Created ${sampleOrders.length} realistic orders successfully.`);
  }

  // 2. Seed Reviews if count < 5
  const reviewCount = await Review.countDocuments();
  if (reviewCount < 5) {
    console.log(`[SEED] Seeding customer reviews (current count: ${reviewCount})...`);

    const sampleReviews = [
      {
        targetType: 'listing',
        targetId: listings[0]._id,
        reviewerId: buyer._id,
        reviewerName: buyer.fullName || 'Rahul Menon',
        rating: 5,
        reviewText: 'Flawless condition, verified battery health and serial number matched. Great transparency and daylight inspection made the purchase completely risk-free.',
        isVerifiedPurchase: true
      },
      {
        targetType: 'listing',
        targetId: listings[1]?._id || listings[0]._id,
        reviewerId: users[2]?._id || buyer._id,
        reviewerName: users[2]?.fullName || 'Ananya Nair',
        rating: 5,
        reviewText: 'Received brand new sealed piece with official manufacturer invoice. 10/10 purchase experience on MyBigBazaar.',
        isVerifiedPurchase: true
      },
      {
        targetType: 'service',
        targetId: services[0]?._id || listings[0]._id,
        reviewerId: buyer._id,
        reviewerName: 'Suresh Kumar',
        rating: 5,
        reviewText: 'The certified plumbing partner arrived strictly on time at 11 AM. Replaced worn-out washers and cleaned up after work. Very polite and professional.',
        isVerifiedPurchase: true
      },
      {
        targetType: 'service',
        targetId: services[1]?._id || listings[0]._id,
        reviewerId: users[3]?._id || buyer._id,
        reviewerName: 'Deepa Varma',
        rating: 4,
        reviewText: 'Very thorough inspection of electrical distribution panel. Identified loose wiring in circuit breaker quickly.',
        isVerifiedPurchase: true
      },
      {
        targetType: 'listing',
        targetId: listings[2]?._id || listings[0]._id,
        reviewerId: buyer._id,
        reviewerName: 'Karthik Pillai',
        rating: 5,
        reviewText: 'Genuine seller, smooth handoff in Vijay Nagar. App escrow protected payment until I inspected the device.',
        isVerifiedPurchase: true
      }
    ];

    await Review.insertMany(sampleReviews);
    console.log(`[SEED] Created ${sampleReviews.length} customer reviews successfully.`);
  }

  // 3. Seed Audit Logs if count < 5
  const auditCount = await AuditLog.countDocuments();
  if (auditCount < 5) {
    console.log(`[SEED] Seeding operational audit logs (current count: ${auditCount})...`);

    const sampleLogs = [
      {
        actorId: buyer._id,
        action: 'ORDER_FULFILLMENT_UPDATE',
        resourceType: 'Order',
        resourceId: 'ORD-88201',
        details: { status: 'shipped', carrier: 'Delhivery', trackingNumber: 'DELHIVERY-992144' },
        ipAddress: '10.154.47.176'
      },
      {
        actorId: buyer._id,
        action: 'USER_KYC_APPROVED',
        resourceType: 'User',
        resourceId: String(seller._id),
        details: { kycType: 'Aadhaar + PAN Verification', verifiedBy: 'System Auto-Verifier' },
        ipAddress: '127.0.0.1'
      },
      {
        actorId: buyer._id,
        action: 'PAYMENT_ESCROW_CAPTURED',
        resourceType: 'Payment',
        resourceId: 'TXN-9988214',
        details: { amount: 73999, currency: 'INR', gateway: 'Razorpay UPI' },
        ipAddress: '10.154.47.176'
      },
      {
        actorId: buyer._id,
        action: 'CMS_BANNER_PUBLISHED',
        resourceType: 'Banner',
        resourceId: 'PROMO-HERO-01',
        details: { title: 'Festive Electronics Super Sale', placement: 'home_hero' },
        ipAddress: '127.0.0.1'
      }
    ];

    await AuditLog.insertMany(sampleLogs);
    console.log(`[SEED] Created ${sampleLogs.length} audit logs successfully.`);
  }

  // 4. Ensure Setting exists
  let setting = await Setting.findOne({ key: 'global' });
  if (!setting) {
    setting = await Setting.create({ key: 'global' });
    console.log('[SEED] Global system settings initialized.');
  }

  console.log('[SEED] Dynamic data initialization complete!');
};

// Auto-run if executed directly
if (process.argv[1]?.includes('seedOrdersAndReviews')) {
  connectDB().then(async () => {
    await seedOrdersAndReviews();
    process.exit(0);
  }).catch((err) => {
    console.error('[SEED] Failed:', err);
    process.exit(1);
  });
}

export default seedOrdersAndReviews;
