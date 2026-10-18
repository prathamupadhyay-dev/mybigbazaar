/**
 * @file apps/api/tests/smoke.test.js
 * @description Comprehensive automated smoke tests for MyBigBazaar Platform Core
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { seedAdmin } from '../seeds/seedAdmin.js';

let server;
let baseUrl;
let authToken;
let testListingId;
let testBookingId;
let testTransactionId;
let testConversationId;
let testMessageId;

before(async () => {
  const { env } = await import('../config/env.js');
  const testUri = env.MONGO_URI.replace(/\/([^/?]+)(\?|$)/, '/bigbazaar_qa_smoke_test$2');
  await connectDB(testUri);
  const { default: seedCategories } = await import('../seeds/seedCategories.js');
  const { seedAdmin } = await import('../seeds/seedAdmin.js');
  const { seedSampleData } = await import('../seeds/seedSampleData.js');
  await seedCategories();
  await seedAdmin();
  await seedSampleData();
  await new Promise((resolve) => {
    // Start on random ephemeral port
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[TEST_SERVER] Running on ${baseUrl}`);
      resolve();
    });
  });
});

after(async () => {
  if (testConversationId) {
    try {
      const { Conversation } = await import('../models/Conversation.js');
      const { Message } = await import('../models/Message.js');
      await Message.deleteMany({ conversationId: testConversationId });
      await Conversation.findByIdAndDelete(testConversationId);
    } catch {}
  }
  if (testListingId) {
    try {
      const { Listing } = await import('../models/Listing.js');
      const { Favorite } = await import('../models/Favorite.js');
      await Favorite.deleteMany({ listingId: testListingId });
      await Listing.findByIdAndDelete(testListingId);
    } catch {}
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection && mongoose.connection.name && mongoose.connection.name.includes('test')) {
      await mongoose.connection.dropDatabase();
      console.log(`[SMOKE_TEST] Dropped isolated QA test database: ${mongoose.connection.name}`);
    }
  } catch (err) {
    console.warn('[SMOKE_TEST] Failed to drop test database:', err.message);
  }
  await closeDB();
});

// Helper for fetch
const request = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

// ==========================================
// 1. HEALTH CHECKS
// ==========================================
test('GET /health returns healthy status', async () => {
  const { status, data } = await request('/health');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.status, 'healthy');
});

// ==========================================
// 2. AUTHENTICATION & LOGIN FLOW
// ==========================================
test('POST /api/v1/auth/login logs in seeded admin and returns JWT', async () => {
  const { status, data } = await request('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@bigbazaar.com',
      password: 'Admin@123456'
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.token);
  assert.equal(data.data.user.role, 'admin');

  authToken = data.data.token;
});

test('GET /api/v1/auth/me returns authenticated admin profile', async () => {
  const { status, data } = await request('/api/v1/auth/me');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.user.email, 'admin@bigbazaar.com');
  // Passwords and OTP must not be leaked
  assert.equal(data.data.user.password, undefined);
  assert.equal(data.data.user.otp, undefined);
});

// ==========================================
// 3. CATEGORIES & TAXONOMY
// ==========================================
test('GET /api/v1/categories/taxonomy returns structured category tree', async () => {
  const { status, data } = await request('/api/v1/categories/taxonomy');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data.marketplace));
  assert.ok(Array.isArray(data.data.services));
  assert.ok(data.data.marketplace.length > 0);
  assert.ok(data.data.services.length > 0);
});

// ==========================================
// 4. MARKETPLACE LISTINGS FLOW
// ==========================================
test('GET /api/v1/listings returns feed items with pagination', async () => {
  const { status, data } = await request('/api/v1/listings?limit=5');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.meta.total >= 0);
});

test('POST /api/v1/listings creates a new classified listing', async () => {
  const { status, data } = await request('/api/v1/listings', {
    method: 'POST',
    body: {
      title: 'Automated Test MacBook Pro 16 M2 Max',
      description: 'Used for automated smoke verification in build/platform-core.',
      price: 185000,
      category: 'Electronics',
      subcategory: 'Laptops & Computers',
      condition: 'Like New',
      location: { city: 'Kottayam', pincode: '686001' }
    }
  });

  assert.equal(status, 201);
  assert.equal(data.success, true);
  assert.ok(data.data._id);
  assert.equal(data.data.price, 185000);
  testListingId = data.data._id;
});

test('POST /api/v1/listings/:id/favorite toggles favorite on listing', async () => {
  const { status, data } = await request(`/api/v1/listings/${testListingId}/favorite`, {
    method: 'POST'
  });
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.isFavorite, true);
});

// ==========================================
// 5. HYPERLOCAL SERVICES & BOOKING FLOW
// ==========================================
test('GET /api/v1/services returns live service offerings', async () => {
  const { status, data } = await request('/api/v1/services');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
});

test('POST /api/v1/bookings creates a service booking', async () => {
  const servicesRes = await request('/api/v1/services?limit=1');
  const service = servicesRes.data.data[0];
  assert.ok(service, 'Seeded service required');

  const tomorrow = new Date(Date.now() + 86400000).toISOString();

  const { status, data } = await request('/api/v1/bookings', {
    method: 'POST',
    body: {
      serviceId: service._id,
      scheduledDate: tomorrow,
      scheduledTimeSlot: '11:00 AM - 01:00 PM',
      serviceAddress: { houseNo: 'Flat 4B', street: 'Baker Hill Road', city: 'Kottayam', pincode: '686001' },
      amount: service.basePrice,
      paymentMode: 'Cash on Delivery'
    }
  });

  assert.equal(status, 201);
  assert.equal(data.success, true);
  assert.ok(data.data.bookingId);
  testBookingId = data.data.bookingId;
});

test('PUT /api/v1/bookings/:id/status transitions booking status', async () => {
  const { status, data } = await request(`/api/v1/bookings/${testBookingId}/status`, {
    method: 'PUT',
    body: {
      status: 'in_progress',
      note: 'Technician reached customer location'
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'in_progress');
});

// ==========================================
// 6. PAYMENT MOCK ORCHESTRATION
// ==========================================
test('POST /api/v1/payments/initiate initiates mock payment session', async () => {
  const { status, data } = await request('/api/v1/payments/initiate', {
    method: 'POST',
    body: {
      amount: 499,
      purpose: 'booking',
      referenceId: testBookingId,
      idempotencyKey: `idemp_${Date.now()}`
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.transactionId);
  testTransactionId = data.data.transactionId;
});

test('POST /api/v1/payments/mock-success simulates capture and updates booking state', async () => {
  const { status, data } = await request('/api/v1/payments/mock-success', {
    method: 'POST',
    body: {
      transactionId: testTransactionId,
      gatewayPaymentId: `pay_mock_${Date.now()}`
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.payment.status, 'success');
});

// ==========================================
// 7. P2P CHAT & BARGAINING OFFERS FLOW
// ==========================================
test('POST /api/v1/chat/conversations creates conversation thread', async () => {
  const usersRes = await request('/api/v1/admin/users?q=seller@bigbazaar.com');
  const seller = usersRes.data.data.find((u) => u.email === 'seller@bigbazaar.com') || usersRes.data.data[0];
  assert.ok(seller, 'Seeded seller required');

  const { status, data } = await request('/api/v1/chat/conversations', {
    method: 'POST',
    body: {
      recipientId: seller._id,
      listingId: testListingId
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data._id);
  testConversationId = data.data._id;
});

test('POST /api/v1/chat/conversations/:id/messages sends bargaining offer', async () => {
  const { status, data } = await request(
    `/api/v1/chat/conversations/${testConversationId}/messages`,
    {
      method: 'POST',
      body: {
        text: 'Would you take 170000 for this?',
        messageType: 'offer',
        offerAmount: 170000
      }
    }
  );

  assert.equal(status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.messageType, 'offer');
  assert.equal(data.data.offerDetails.amount, 170000);
  testMessageId = data.data._id;
});

test('POST /api/v1/chat/messages/:id/offer accepts bargaining offer as recipient seller', async () => {
  // Login as seller to respond to offer
  const sellerLogin = await request('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'seller@bigbazaar.com', password: 'Seller@123456' }
  });
  const sellerToken = sellerLogin.data.data.token;

  const { status, data } = await request(`/api/v1/chat/messages/${testMessageId}/offer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: {
      action: 'accept'
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.offerDetails.status, 'accepted');
});

// ==========================================
// 8. ADMIN DASHBOARD & METRICS
// ==========================================
test('GET /api/v1/admin/dashboard returns operational metrics', async () => {
  const { status, data } = await request('/api/v1/admin/dashboard');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.metrics.totalUsers > 0);
  assert.ok(data.data.metrics.totalListings > 0);
});

// ==========================================
// 9. LEGACY COMPATIBILITY ROUTE TESTS
// ==========================================
test('Legacy: POST /auth/login returns user data for mobile/admin', async () => {
  const { status, data } = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@bigbazaar.com',
      password: 'Admin@123456'
    }
  });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.status, true);
  assert.ok(data.token); // Root level property
  assert.ok(data.user);  // Root level property
  assert.ok(data.data.token);
});

test('Legacy: POST /auth/google signs in or creates user', async () => {
  const { status, data } = await request('/auth/google', {
    method: 'POST',
    body: {
      email: 'googleuser@test.com',
      name: 'Google Test User'
    }
  });

  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(data.token);
  assert.ok(data.user);
});

test('Legacy: GET /auth/profile returns authenticated user', async () => {
  const { status, data } = await request('/auth/profile');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(data.user);
});

test('Legacy: GET /product-category/get-all returns categories', async () => {
  const { status, data } = await request('/product-category/get-all');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
});

test('Legacy: GET /product-subCategory/get-all filters properly by categoryId', async () => {
  const catRes = await request('/product-category/get-all');
  const catId = catRes.data.data[0]._id;

  const { status, data } = await request(`/product-subCategory/get-all?categoryId=${catId}`);
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
});

test('Legacy: GET /product/get-all returns products for mobile', async () => {
  const { status, data } = await request('/product/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
});

test('Legacy: GET /product/get/:id returns single product', async () => {
  const listRes = await request('/product/get-all');
  const productId = listRes.data.data[0]._id;

  const { status, data } = await request(`/product/get/${productId}`);
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(data.product);
});

test('Legacy: GET /logo/get-all returns brand logo asset', async () => {
  const { status, data } = await request('/logo/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(data.logo);
  assert.ok(data.logo.logo);
});

test('Legacy: GET /booking/get-all returns seeded service bookings', async () => {
  const { status, data } = await request('/booking/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(Array.isArray(data.bookings));
  assert.ok(data.bookings.length > 0);
});

test('Legacy: GET /kyc/get-all returns provider KYC profiles', async () => {
  const { status, data } = await request('/kyc/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(Array.isArray(data.kyc));
  assert.ok(data.kyc.length > 0);
});

test('Legacy: GET /report/get-all returns moderation reports', async () => {
  const { status, data } = await request('/report/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(Array.isArray(data.reports));
  assert.ok(data.reports.length > 0);
});

test('Legacy: GET /audit-log/get-all returns platform audit logs', async () => {
  const { status, data } = await request('/audit-log/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(Array.isArray(data.auditLogs));
  assert.ok(data.auditLogs.length > 0);
});

test('Legacy: GET /tax/get-all returns standard tax rates', async () => {
  const { status, data } = await request('/tax/get-all');
  assert.equal(status, 200);
  assert.equal(data.status, true);
  assert.ok(Array.isArray(data.data));
});

// ==========================================
// 10. ERROR HANDLING SANITY CHECKS
// ==========================================
test('404 handler returns structured JSON', async () => {
  const { status, data } = await request('/non-existent-endpoint');
  assert.equal(status, 404);
  assert.equal(data.success, false);
  assert.equal(data.statusCode, 404);
});

test('401 unauthorized handler rejects unauthenticated protected requests', async () => {
  const res = await fetch(`${baseUrl}/api/v1/admin/dashboard`);
  const data = await res.json();
  assert.equal(res.status, 401);
  assert.equal(data.success, false);
});
