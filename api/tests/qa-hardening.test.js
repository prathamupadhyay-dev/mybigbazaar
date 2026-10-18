/**
 * @file apps/api/tests/qa-hardening.test.js
 * @description Comprehensive End-to-End QA, RBAC, Security & State-Machine Hardening Suite
 * Tests 11 operational domains across all personas with ALLOW/DENY verification.
 */

import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { seedAdmin } from '../seeds/seedAdmin.js';

let server;
let baseUrl;

// Persona tokens
let tokens = {
  admin: null,
  moderator: null,
  seller: null,
  provider: null,
  buyer: null
};

// Persona user objects
let users = {
  admin: null,
  moderator: null,
  seller: null,
  provider: null,
  buyer: null
};

// Helper for fetch with persona token
const api = async (path, options = {}, persona = null) => {
  const url = `${baseUrl}${path}`;
  const token = persona ? tokens[persona] : (options.token || null);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
};

before(async () => {
  const { env } = await import('../config/env.js');
  const testUri = env.MONGO_URI.replace(/\/([^/?]+)(\?|$)/, '/bigbazaar_qa_hardening_test$2');
  await connectDB(testUri);
  const { default: seedCategories } = await import('../seeds/seedCategories.js');
  const { seedAdmin } = await import('../seeds/seedAdmin.js');
  const { seedSampleData } = await import('../seeds/seedSampleData.js');
  await seedCategories();
  await seedAdmin();
  await seedSampleData();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[QA_SERVER] Hardening test runner online at ${baseUrl}`);
      resolve();
    });
  });

  // Login all 5 seeded operational personas
  const personas = [
    { key: 'admin', email: 'admin@bigbazaar.com', pass: 'Admin@123456' },
    { key: 'moderator', email: 'moderator@bigbazaar.com', pass: 'Mod@123456' },
    { key: 'seller', email: 'seller@bigbazaar.com', pass: 'Seller@123456' },
    { key: 'provider', email: 'provider@bigbazaar.com', pass: 'Provider@123456' },
    { key: 'buyer', email: 'buyer@bigbazaar.com', pass: 'Buyer@123456' }
  ];

  for (const p of personas) {
    const { status, data } = await api('/api/v1/auth/login', {
      method: 'POST',
      body: { email: p.email, password: p.pass }
    });
    assert.equal(status, 200, `Failed to authenticate persona ${p.key}: ${data.message}`);
    tokens[p.key] = data.token || data.data?.token;
    users[p.key] = data.user || data.data?.user;
  }
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection && mongoose.connection.name && mongoose.connection.name.includes('test')) {
      await mongoose.connection.dropDatabase();
      console.log(`[QA_SERVER] Dropped isolated QA test database: ${mongoose.connection.name}`);
    }
  } catch (err) {
    console.warn('[QA_SERVER] Failed to drop test database:', err.message);
  }
  await closeDB();
});

// ============================================================================
// 1. RUNTIME ENVIRONMENT, CORS, ERROR HANDLERS & SANITIZATION
// ============================================================================
describe('Domain 1: Runtime Environment, CORS & Error Handling', () => {
  test('GET /health returns 200 healthy status with system metadata', async () => {
    const { status, data } = await api('/health');
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.equal(data.status, 'healthy');
  });

  test('OPTIONS preflight request returns permissive CORS headers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST'
      }
    });
    assert.equal(res.status, 204);
    assert.ok(res.headers.get('access-control-allow-origin'));
  });

  test('GET /uploads returns static directory or 404 for missing asset', async () => {
    const res = await fetch(`${baseUrl}/uploads/nonexistent-file.png`);
    assert.equal(res.status, 404);
  });

  test('404 handler returns structured JSON with error message', async () => {
    const { status, data } = await api('/api/v1/unmapped-route-slug');
    assert.equal(status, 404);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('not found'));
  });

  test('400 bad request handler returns structured error for malformed body', async () => {
    const { status, data } = await api('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'bad' } // missing password
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
  });
});

// ============================================================================
// 2. AUTHENTICATION, PRIVILEGE ESCALATION & PASSWORD RESET HARDENING
// ============================================================================
describe('Domain 2: Authentication & Security Hardening', () => {
  const testEmail = `qa-user-${Date.now()}@example.com`;
  let signupDebugOtp;
  let resetToken;

  test('DENY: Public registration cannot self-promote to admin role', async () => {
    const { status, data } = await api('/api/v1/auth/signup', {
      method: 'POST',
      body: {
        fullName: 'Hacker Admin',
        email: `hacker-${Date.now()}@hack.com`,
        password: 'Password@123',
        role: 'admin'
      }
    });
    assert.equal(status, 403, 'Public signup with role=admin must be rejected with 403');
    assert.equal(data.success, false);
  });

  test('DENY: Public registration cannot self-promote to moderator role', async () => {
    const { status, data } = await api('/api/v1/auth/signup', {
      method: 'POST',
      body: {
        fullName: 'Hacker Mod',
        email: `hackermod-${Date.now()}@hack.com`,
        password: 'Password@123',
        role: 'moderator'
      }
    });
    assert.equal(status, 403, 'Public signup with role=moderator must be rejected with 403');
  });

  test('ALLOW: Standard buyer signup creates user with role buyer and dispatches OTP', async () => {
    const { status, data } = await api('/api/v1/auth/signup', {
      method: 'POST',
      body: {
        fullName: 'QA Test Buyer',
        email: testEmail,
        password: 'TestPassword@123',
        phoneNumber: '+91 9998887776'
      }
    });
    assert.equal(status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.role, 'buyer');
    // Ensure sensitive fields are stripped
    assert.equal(data.data.user.password, undefined);
    assert.equal(data.data.user.passwordResetToken, undefined);

    signupDebugOtp = data.otp || data.data.debugOtp;
  });

  test('ALLOW: Verify OTP validates account', async () => {
    const { status, data } = await api('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: {
        email: testEmail,
        otp: signupDebugOtp
      }
    });
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.user.isEmailVerified, true);
  });

  test('DENY: Unauthenticated password reset without resetToken is rejected', async () => {
    const { status, data } = await api('/api/v1/auth/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        newPassword: 'BrandNewPassword@999'
      }
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('token is required'));
  });

  test('DENY: Reset password with invalid / tampered resetToken is rejected', async () => {
    const { status, data } = await api('/api/v1/auth/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        resetToken: 'tampered-fake-token-hex-1234567890',
        newPassword: 'BrandNewPassword@999'
      }
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('invalid or has expired'));
  });

  test('ALLOW: Forgot password generates OTP and verifyForgotPasswordOtp issues cryptographic resetToken', async () => {
    const forgotRes = await api('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: { email: testEmail }
    });
    assert.equal(forgotRes.status, 200);
    const resetOtp = forgotRes.data.data?.debugOtp;

    const verifyRes = await api('/api/v1/auth/verify-forgot-password-otp', {
      method: 'POST',
      body: {
        email: testEmail,
        otp: resetOtp
      }
    });
    assert.equal(verifyRes.status, 200);
    assert.ok(verifyRes.data.data.resetToken);
    resetToken = verifyRes.data.data.resetToken;
  });

  test('ALLOW: Reset password succeeds with valid resetToken', async () => {
    const { status, data } = await api('/api/v1/auth/reset-password', {
      method: 'POST',
      body: {
        email: testEmail,
        resetToken,
        newPassword: 'BrandNewPassword@999'
      }
    });
    assert.equal(status, 200);
    assert.equal(data.success, true);

    // Verify user can now log in with the new password
    const loginRes = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'BrandNewPassword@999'
      }
    });
    assert.equal(loginRes.status, 200);
  });

  test('DENY: Tampered JWT token is rejected with 401', async () => {
    const { status, data } = await api('/api/v1/auth/me', {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature'
    });
    assert.equal(status, 401);
    assert.equal(data.success, false);
  });

  test('DENY: Suspended user is blocked from logging in', async () => {
    // Temporarily mark test user as suspended in DB
    await User.findOneAndUpdate({ email: testEmail }, { status: 'suspended' });

    const { status, data } = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'BrandNewPassword@999'
      }
    });
    assert.equal(status, 403);
    assert.ok(data.message.includes('suspended'));

    // Restore user
    await User.findOneAndUpdate({ email: testEmail }, { status: 'active' });
  });

  test('ALLOW: Google OAuth adapter creates or logs in user without password', async () => {
    const { status, data } = await api('/api/v1/auth/google', {
      method: 'POST',
      body: {
        email: `google-user-${Date.now()}@gmail.com`,
        fullName: 'Google Authenticated User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      }
    });
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
  });
});

// ============================================================================
// 3. ROLE-BASED ACCESS CONTROL (RBAC) E2E MATRIX
// ============================================================================
describe('Domain 3: RBAC Cross-Persona Matrix (ALLOW / DENY)', () => {
  test('DENY: Buyer is blocked from accessing Admin Dashboard (403)', async () => {
    const { status } = await api('/api/v1/admin/dashboard', {}, 'buyer');
    assert.equal(status, 403);
  });

  test('DENY: Buyer is blocked from accessing Admin Users list (403)', async () => {
    const { status } = await api('/api/v1/admin/users', {}, 'buyer');
    assert.equal(status, 403);
  });

  test('DENY: Seller is blocked from accessing Admin Dashboard (403)', async () => {
    const { status } = await api('/api/v1/admin/dashboard', {}, 'seller');
    assert.equal(status, 403);
  });

  test('DENY: Provider is blocked from accessing Admin Users list (403)', async () => {
    const { status } = await api('/api/v1/admin/users', {}, 'provider');
    assert.equal(status, 403);
  });

  test('DENY: Buyer is blocked from accessing Moderation Queue (403)', async () => {
    const { status } = await api('/api/v1/moderation/reports', {}, 'buyer');
    assert.equal(status, 403);
  });

  test('ALLOW: Moderator can access Moderation Queue (200)', async () => {
    const { status, data } = await api('/api/v1/moderation/reports', {}, 'moderator');
    assert.equal(status, 200);
    assert.equal(data.success, true);
  });

  test('DENY: Moderator is blocked from suspending users (Admin only) (403)', async () => {
    const { status } = await api(
      `/api/v1/moderation/users/${users.buyer._id}/suspension`,
      {
        method: 'PUT',
        body: { action: 'suspend' }
      },
      'moderator'
    );
    assert.equal(status, 403);
  });

  test('ALLOW: Admin can access Admin Dashboard (200)', async () => {
    const { status, data } = await api('/api/v1/admin/dashboard', {}, 'admin');
    assert.equal(status, 200);
    assert.ok(data.data.metrics.totalUsers !== undefined);
  });

  test('DENY: Admin cannot delete their own administrative account (400)', async () => {
    const { status, data } = await api(
      `/api/v1/admin/users/${users.admin._id}`,
      { method: 'DELETE' },
      'admin'
    );
    assert.equal(status, 400);
    assert.ok(data.message.includes('Cannot delete your own administrative account'));
  });

  test('DENY: Buyer is blocked from Finance Transactions Ledger (403)', async () => {
    const { status } = await api('/api/v1/transactions', {}, 'buyer');
    assert.equal(status, 403);
  });

  test('ALLOW: Admin can access Finance Transactions Ledger (200)', async () => {
    const { status, data } = await api('/api/v1/transactions', {}, 'admin');
    assert.equal(status, 200);
    assert.equal(data.success, true);
  });

  test('DENY: Buyer is blocked from Refunds Queue (403)', async () => {
    const { status } = await api('/api/v1/refunds', {}, 'buyer');
    assert.equal(status, 403);
  });

  test('ALLOW: Admin can access Refunds Queue (200)', async () => {
    const { status, data } = await api('/api/v1/refunds', {}, 'admin');
    assert.equal(status, 200);
    assert.equal(data.success, true);
  });

  test('DENY: Buyer cannot create Service offering (Provider required) (403)', async () => {
    const { status } = await api(
      '/api/v1/services',
      {
        method: 'POST',
        body: {
          title: 'Unauthorized House Painting',
          description: 'Hacked service creation',
          category: 'Painting',
          basePrice: 500
        }
      },
      'buyer'
    );
    assert.equal(status, 403);
  });

  test('ALLOW: Provider can create Service offering (201)', async () => {
    const { status, data } = await api(
      '/api/v1/services',
      {
        method: 'POST',
        body: {
          title: 'Certified Plumbing Inspection',
          description: 'Comprehensive pipeline and leak diagnostics',
          category: 'Plumbing',
          basePrice: 450
        }
      },
      'provider'
    );
    assert.equal(status, 201);
    assert.equal(data.success, true);
  });
});

// ============================================================================
// 4. MARKETPLACE & CLASSIFIEDS E2E
// ============================================================================
describe('Domain 4: Marketplace & Classifieds Lifecycle', () => {
  let listingId;

  test('ALLOW: Seller creates a classified listing', async () => {
    const { status, data } = await api(
      '/api/v1/listings',
      {
        method: 'POST',
        body: {
          title: 'Vintage Royal Enfield Bullet 350',
          description: 'Immaculate 1982 cast iron model in pristine condition',
          price: 135000,
          category: 'Vehicles',
          condition: 'Excellent',
          city: 'Kottayam'
        }
      },
      'seller'
    );
    assert.equal(status, 201);
    assert.equal(data.success, true);
    listingId = data.data._id;
  });

  test('ALLOW: Public/Buyer can view listing detail and increment view count', async () => {
    const { status, data } = await api(`/api/v1/listings/${listingId}`);
    assert.equal(status, 200);
    assert.equal(data.data.title, 'Vintage Royal Enfield Bullet 350');
    assert.ok(data.data.views >= 1);
  });

  test('DENY: Anonymous caller cannot update listing (401)', async () => {
    const { status } = await api(`/api/v1/listings/${listingId}`, {
      method: 'PUT',
      body: { price: 1000 }
    });
    assert.equal(status, 401);
  });

  test('DENY: Non-owner Buyer cannot modify Seller listing (403)', async () => {
    const { status } = await api(
      `/api/v1/listings/${listingId}`,
      {
        method: 'PUT',
        body: { price: 50000 }
      },
      'buyer'
    );
    assert.equal(status, 403);
  });

  test('DENY: Seller cannot feature own listing without admin/mod privileges', async () => {
    const { status, data } = await api(
      `/api/v1/listings/${listingId}`,
      {
        method: 'PUT',
        body: { isFeatured: true }
      },
      'seller'
    );
    assert.equal(status, 200);
    // isFeatured must NOT be true when requested by ordinary seller
    assert.equal(data.data.isFeatured, false);
  });

  test('ALLOW: Seller can update own listing details', async () => {
    const { status, data } = await api(
      `/api/v1/listings/${listingId}`,
      {
        method: 'PUT',
        body: { price: 130000, condition: 'Mint' }
      },
      'seller'
    );
    assert.equal(status, 200);
    assert.equal(data.data.price, 130000);
    assert.equal(data.data.condition, 'Mint');
  });

  test('ALLOW: Moderator can approve or reject listing', async () => {
    const { status, data } = await api(
      `/api/v1/moderation/listings/${listingId}`,
      {
        method: 'PUT',
        body: { action: 'approve' }
      },
      'moderator'
    );
    assert.equal(status, 200);
    assert.equal(data.data.status, 'live');
  });

  test('ALLOW: Buyer can toggle favorite and retrieve favorites list', async () => {
    const favRes = await api(`/api/v1/listings/${listingId}/favorite`, { method: 'POST' }, 'buyer');
    assert.equal(favRes.status, 200);
    assert.equal(favRes.data.isFavorite, true);

    const myFavs = await api('/api/v1/listings/my/favorites', {}, 'buyer');
    assert.equal(myFavs.status, 200);
    assert.ok(myFavs.data.data.some((l) => l._id.toString() === listingId));
  });

  test('ALLOW: Search & filter listings by keyword and category', async () => {
    const { status, data } = await api('/api/v1/listings?category=Vehicles&limit=5');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.data));
  });

  test('DENY: Non-owner Buyer cannot delete Seller listing (403)', async () => {
    const { status } = await api(`/api/v1/listings/${listingId}`, { method: 'DELETE' }, 'buyer');
    assert.equal(status, 403);
  });

  test('ALLOW: Seller can delete own listing', async () => {
    const { status } = await api(`/api/v1/listings/${listingId}`, { method: 'DELETE' }, 'seller');
    assert.equal(status, 200);
  });
});

// ============================================================================
// 5. SERVICES & BOOKINGS LIFECYCLE E2E
// ============================================================================
describe('Domain 5: Services & Doorstep Booking State Machine', () => {
  let testServiceId;
  let testBookingId;
  let testBookingDocId;

  before(async () => {
    // Get existing service or create one
    const services = await Service.find({ status: 'live' }).limit(1);
    if (services.length > 0) {
      testServiceId = services[0]._id.toString();
    } else {
      const s = await Service.create({
        title: 'AC Deep Cleaning & Coil Service',
        description: 'Comprehensive jet pump wash for indoor and outdoor AC units',
        providerId: users.provider._id,
        providerName: users.provider.fullName,
        category: 'AC Repair',
        basePrice: 899,
        status: 'live'
      });
      testServiceId = s._id.toString();
    }
  });

  test('ALLOW: Buyer creates doorstep service booking', async () => {
    const { status, data } = await api(
      '/api/v1/bookings',
      {
        method: 'POST',
        body: {
          serviceId: testServiceId,
          scheduledDate: '2026-10-15',
          scheduledTimeSlot: '10:00 AM - 12:00 PM',
          serviceAddress: {
            houseNo: '44B',
            street: 'Baker Hill Road',
            city: 'Kottayam',
            pincode: '686001'
          },
          paymentMode: 'Cash on Delivery'
        }
      },
      'buyer'
    );
    assert.equal(status, 201);
    assert.equal(data.success, true);
    testBookingId = data.data.bookingId;
    testBookingDocId = data.data._id;
  });

  test('DENY: Other user (Seller) cannot view Buyer booking (403)', async () => {
    const { status } = await api(`/api/v1/bookings/${testBookingId}`, {}, 'seller');
    assert.equal(status, 403);
  });

  test('ALLOW: Customer and Provider can view the booking (200)', async () => {
    const customerRes = await api(`/api/v1/bookings/${testBookingId}`, {}, 'buyer');
    assert.equal(customerRes.status, 200);

    const providerRes = await api(`/api/v1/bookings/${testBookingId}`, {}, 'provider');
    assert.equal(providerRes.status, 200);
  });

  test('DENY: Customer cannot arbitrarily mark booking as completed or assigned (403)', async () => {
    const { status } = await api(
      `/api/v1/bookings/${testBookingId}/status`,
      {
        method: 'PUT',
        body: { status: 'completed' }
      },
      'buyer'
    );
    assert.equal(status, 403);
  });

  test('ALLOW: Provider transitions booking from confirmed to in_progress (200)', async () => {
    const { status, data } = await api(
      `/api/v1/bookings/${testBookingId}/status`,
      {
        method: 'PUT',
        body: { status: 'in_progress', note: 'Technician arrived on site' }
      },
      'provider'
    );
    assert.equal(status, 200);
    assert.equal(data.data.status, 'in_progress');
  });

  test('DENY: Other user cannot cancel the booking (403)', async () => {
    const { status } = await api(
      `/api/v1/bookings/${testBookingId}/cancel`,
      {
        method: 'POST',
        body: { reason: 'Unauthorized cancellation' }
      },
      'seller'
    );
    assert.equal(status, 403);
  });

  test('ALLOW: Customer cancels the booking within legal state (200)', async () => {
    const { status, data } = await api(
      `/api/v1/bookings/${testBookingId}/cancel`,
      {
        method: 'POST',
        body: { reason: 'Schedule conflict' }
      },
      'buyer'
    );
    assert.equal(status, 200);
    assert.equal(data.data.status, 'cancelled');
  });

  test('DENY: Cannot cancel an already cancelled booking (400)', async () => {
    const { status, data } = await api(
      `/api/v1/bookings/${testBookingId}/cancel`,
      {
        method: 'POST',
        body: { reason: 'Double cancel' }
      },
      'buyer'
    );
    assert.equal(status, 400);
    assert.ok(data.message.includes('already cancelled'));
  });
});

// ============================================================================
// 6. CHAT & BARGAINING OFFER STATE MACHINE
// ============================================================================
describe('Domain 6: P2P Chat & Negotiation State Machine', () => {
  let conversationId;
  let offerMessageId;

  test('ALLOW: Buyer initiates conversation with Seller', async () => {
    const { status, data } = await api(
      '/api/v1/chat/conversations',
      {
        method: 'POST',
        body: {
          recipientId: users.seller._id
        }
      },
      'buyer'
    );
    assert.equal(status, 200);
    assert.equal(data.success, true);
    conversationId = data.data._id;
  });

  test('ALLOW: Buyer sends text message in conversation', async () => {
    const { status, data } = await api(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: { text: 'Hi! Is the item still available for sale?' }
      },
      'buyer'
    );
    assert.equal(status, 201);
    assert.equal(data.data.text, 'Hi! Is the item still available for sale?');
  });

  test('DENY: Non-participant (Provider) cannot read conversation messages (403)', async () => {
    const { status } = await api(`/api/v1/chat/conversations/${conversationId}/messages`, {}, 'provider');
    assert.equal(status, 403);
  });

  test('ALLOW: Buyer submits bargaining offer to Seller (201)', async () => {
    const { status, data } = await api(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: {
          messageType: 'offer',
          offerAmount: 18000,
          text: 'Offering ₹18,000 for quick deal'
        }
      },
      'buyer'
    );
    assert.equal(status, 201);
    assert.equal(data.data.messageType, 'offer');
    assert.equal(data.data.offerDetails.status, 'pending');
    offerMessageId = data.data._id;
  });

  test('DENY: Non-participant cannot respond to offer (403)', async () => {
    const { status } = await api(
      `/api/v1/chat/messages/${offerMessageId}/offer`,
      {
        method: 'POST',
        body: { action: 'accept' }
      },
      'provider'
    );
    assert.equal(status, 403);
  });

  test('DENY: Buyer cannot accept or decline their own offer (400)', async () => {
    const { status, data } = await api(
      `/api/v1/chat/messages/${offerMessageId}/offer`,
      {
        method: 'POST',
        body: { action: 'accept' }
      },
      'buyer'
    );
    assert.equal(status, 400);
    assert.ok(data.message.includes('Cannot respond to your own offer'));
  });

  test('ALLOW: Recipient Seller can counter the offer (200)', async () => {
    const { status, data } = await api(
      `/api/v1/chat/messages/${offerMessageId}/offer`,
      {
        method: 'POST',
        body: { action: 'counter', counterAmount: 19500 }
      },
      'seller'
    );
    assert.equal(status, 200);
    assert.equal(data.data.offerDetails.status, 'countered');
    assert.equal(data.data.offerDetails.counterAmount, 19500);
  });

  test('DENY: Cannot respond again to an already resolved/countered offer (400)', async () => {
    const { status, data } = await api(
      `/api/v1/chat/messages/${offerMessageId}/offer`,
      {
        method: 'POST',
        body: { action: 'accept' }
      },
      'seller'
    );
    assert.equal(status, 400);
    assert.ok(data.message.includes('already countered'));
  });
});

// ============================================================================
// 7. PAYMENTS, WEBHOOKS & IDEMPOTENCY
// ============================================================================
describe('Domain 7: Payment Orchestration, Webhooks & Idempotency', () => {
  let transactionId;
  const idempotencyKey = `idem_key_${Date.now()}`;

  test('ALLOW: Buyer initiates payment session', async () => {
    const { status, data } = await api(
      '/api/v1/payments/initiate',
      {
        method: 'POST',
        body: {
          amount: 1450,
          currency: 'INR',
          referenceId: 'BK-TEST-999',
          purpose: 'booking',
          idempotencyKey
        }
      },
      'buyer'
    );
    assert.equal(status, 200);
    assert.ok(data.data.transactionId);
    transactionId = data.data.transactionId;
  });

  test('ALLOW: Duplicate initiation with same idempotency key returns idempotent replay', async () => {
    const { status, data } = await api(
      '/api/v1/payments/initiate',
      {
        method: 'POST',
        body: {
          amount: 1450,
          currency: 'INR',
          referenceId: 'BK-TEST-999',
          purpose: 'booking',
          idempotencyKey
        }
      },
      'buyer'
    );
    assert.equal(status, 200);
    assert.equal(data.data.isIdempotentReplay, true);
    assert.equal(data.data.transactionId, transactionId);
  });

  test('DENY: Other user cannot inspect Buyer payment details (403)', async () => {
    const { status } = await api(`/api/v1/payments/status/${transactionId}`, {}, 'seller');
    assert.equal(status, 403);
  });

  test('ALLOW: Payment owner and Admin can inspect payment status (200)', async () => {
    const buyerRes = await api(`/api/v1/payments/status/${transactionId}`, {}, 'buyer');
    assert.equal(buyerRes.status, 200);
    assert.equal(buyerRes.data.data.amount, 1450);

    const adminRes = await api(`/api/v1/payments/status/${transactionId}`, {}, 'admin');
    assert.equal(adminRes.status, 200);
  });

  test('ALLOW: Simulate mock payment capture', async () => {
    const { status, data } = await api('/api/v1/payments/mock-success', {
      method: 'POST',
      body: {
        transactionId
      }
    });
    assert.equal(status, 200);
    assert.equal(data.data.payment.status, 'success');
  });

  test('ALLOW: Duplicate success simulation is idempotent', async () => {
    const { status, data } = await api('/api/v1/payments/mock-success', {
      method: 'POST',
      body: {
        transactionId
      }
    });
    assert.equal(status, 200);
    assert.equal(data.data.alreadyProcessed, true);
  });

  test('ALLOW: Webhook processes payment.captured event idempotently', async () => {
    const { status, data } = await api('/api/v1/payments/webhook', {
      method: 'POST',
      body: {
        event: 'payment.captured',
        payload: {
          transactionId,
          gatewayPaymentId: 'pay_gateway_mock_001'
        }
      }
    });
    assert.equal(status, 200);
    assert.equal(data.success, true);
  });

  test('DENY: Non-admin cannot trigger refund (403)', async () => {
    const { status } = await api(
      '/api/v1/payments/refund',
      {
        method: 'POST',
        body: { transactionId, reason: 'Customer requested' }
      },
      'buyer'
    );
    assert.equal(status, 403);
  });

  test('ALLOW: Admin processes refund on captured transaction (200)', async () => {
    const { status, data } = await api(
      '/api/v1/payments/refund',
      {
        method: 'POST',
        body: { transactionId, reason: 'Approved cancellation' }
      },
      'admin'
    );
    assert.equal(status, 200);
    assert.equal(data.data.payment.status, 'refunded');
  });
});

// ============================================================================
// 8. NOTIFICATIONS & BROADCAST
// ============================================================================
describe('Domain 8: User Notifications & Tenant Isolation', () => {
  let notificationId;

  before(async () => {
    const n = await Notification.create({
      userId: users.buyer._id,
      title: 'Order Dispatched',
      message: 'Your order is on the way',
      type: 'order'
    });
    notificationId = n._id.toString();
  });

  test('ALLOW: Buyer retrieves personal notifications', async () => {
    const { status, data } = await api('/api/v1/notifications', {}, 'buyer');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.some((n) => n._id.toString() === notificationId));
  });

  test('DENY: Seller does not see Buyer notifications', async () => {
    const { status, data } = await api('/api/v1/notifications', {}, 'seller');
    assert.equal(status, 200);
    assert.ok(!data.data.some((n) => n._id.toString() === notificationId));
  });

  test('DENY: Buyer cannot broadcast notifications (Admin only) (403)', async () => {
    const { status } = await api(
      '/api/v1/notifications/broadcast',
      {
        method: 'POST',
        body: { title: 'Spam', body: 'Hack message' }
      },
      'buyer'
    );
    assert.equal(status, 403);
  });

  test('ALLOW: Admin can broadcast notifications (200)', async () => {
    const { status, data } = await api(
      '/api/v1/notifications/broadcast',
      {
        method: 'POST',
        body: { title: 'Platform Maintenance Notice', body: 'System update tonight' }
      },
      'admin'
    );
    assert.ok([200, 201].includes(status));
    assert.equal(data.success, true);
  });
});

// ============================================================================
// 9. LEGACY COMPATIBILITY ENDPOINTS HARDENING
// ============================================================================
describe('Domain 9: Legacy Compatibility & Security Hardening', () => {
  test('DENY: Unauthenticated request to /auth/get-all-users is rejected (401)', async () => {
    const { status } = await api('/auth/get-all-users');
    assert.equal(status, 401);
  });

  test('DENY: Buyer request to /auth/get-all-users is forbidden (403)', async () => {
    const { status } = await api('/auth/get-all-users', {}, 'buyer');
    assert.equal(status, 403);
  });

  test('ALLOW: Admin request to /auth/get-all-users returns user list (200)', async () => {
    const { status, data } = await api('/auth/get-all-users', {}, 'admin');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.users));
  });

  test('DENY: Unauthenticated request to /booking/get-all is rejected (401)', async () => {
    const { status } = await api('/booking/get-all');
    assert.equal(status, 401);
  });

  test('ALLOW: Admin request to /booking/get-all returns bookings (200)', async () => {
    const { status, data } = await api('/booking/get-all', {}, 'admin');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.bookings));
  });

  test('DENY: Unauthenticated request to /kyc/get-all is rejected (401)', async () => {
    const { status } = await api('/kyc/get-all');
    assert.equal(status, 401);
  });

  test('ALLOW: Admin request to /kyc/get-all returns KYC profiles (200)', async () => {
    const { status, data } = await api('/kyc/get-all', {}, 'admin');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.data));
  });

  test('DENY: Unauthenticated request to /report/get-all is rejected (401)', async () => {
    const { status } = await api('/report/get-all');
    assert.equal(status, 401);
  });

  test('ALLOW: Moderator request to /report/get-all returns reports (200)', async () => {
    const { status, data } = await api('/report/get-all', {}, 'moderator');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.data));
  });

  test('DENY: Unauthenticated request to delete user via legacy endpoint is rejected (401)', async () => {
    const { status } = await api('/auth/delete/6abfeadbeb61df17de389599', { method: 'DELETE' });
    assert.equal(status, 401);
  });
});
