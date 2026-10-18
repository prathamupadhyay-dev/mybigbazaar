/**
 * @file apps/api/tests/stage2-upgrades.test.js
 * @description Automated verification for Stage 2 PRD API additions (CMS, Support, Dynamic Category Fields, RBAC)
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import ProductCategory from '../models/ProductCategory.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

let server;
let baseUrl;
let adminToken;

const api = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
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
  await connectDB();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Login admin to obtain token
  const { status, data } = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'admin@bigbazaar.com', password: 'Admin@123456' }
  });
  assert.equal(status, 200);
  adminToken = data.token;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDB();
});

describe('Stage 2 Backend Upgrades: Security & Full PRD Support', () => {
  test('verifyToken and requireRole are exported from auth.middleware.js', () => {
    assert.equal(typeof verifyToken, 'function');
    assert.equal(typeof requireRole, 'function');
  });

  test('GET /cms/:slug returns page or default fallback', async () => {
    const { status, data } = await api('/cms/privacy-policy');
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data.title);
  });

  test('PUT /cms/:slug updates page when authenticated as admin', async () => {
    const { status, data } = await api('/cms/terms-of-service', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Terms of Service',
        content: '# Terms of Service\n\nWelcome to MyBigBazaar.'
      }
    });
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.title, 'Terms of Service');
  });

  test('POST /support/contact registers a grievance/support ticket', async () => {
    const { status, data } = await api('/support/contact', {
      method: 'POST',
      body: {
        name: 'Suresh Kumar',
        email: 'suresh@example.com',
        phone: '+91 9876543210',
        subject: 'Inquiry regarding doorstep service',
        category: 'general_enquiry',
        message: 'Are appliance repairs covered by the 30-day warranty?'
      }
    });
    assert.equal(status, 201);
    assert.equal(data.success, true);
    assert.ok(data.data.ticketId);
    assert.equal(data.data.status, 'open');

    // Test ticket status lookup
    const lookup = await api(`/support/tickets/${data.data.ticketId}`);
    assert.equal(lookup.status, 200);
    assert.equal(lookup.data.data.name, 'Suresh Kumar');
  });

  test('GET /support/faqs returns structured FAQ directory', async () => {
    const { status, data } = await api('/support/faqs');
    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
  });

  test('Category models support dynamic fields array', async () => {
    const cat = await ProductCategory.findOne();
    assert.ok(cat, 'A seeded product category should exist');
    assert.ok(Array.isArray(cat.fields), 'Category must support fields array');
  });
});
