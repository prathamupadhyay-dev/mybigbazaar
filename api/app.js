/**
 * @file apps/api/app.js
 * @description Express application setup, middleware pipeline, static uploads, and route mounting
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { generalLimiter as globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Versioned API Router
import v1Router from './routes/v1/index.js';
import authRoutes from './routes/v1/auth.routes.js';
import userRoutes from './routes/v1/user.routes.js';
import serviceRoutes from './routes/v1/service.routes.js';
import orderRoutes from './routes/v1/order.routes.js';
import reviewRoutes from './routes/v1/review.routes.js';
import cmsRoutes, { bannerRouter } from './routes/v1/cms.routes.js';
import sellerFormRoutes from './routes/v1/sellerForm.routes.js';
import providerRoutes from './routes/v1/provider.routes.js';
import { walletsRouter, transactionsRouter, refundsRouter, invoicesRouter } from './routes/v1/finance.routes.js';
import moderationRoutes from './routes/v1/moderation.routes.js';
import supportRoutes from './routes/v1/support.routes.js';
import notificationRoutes from './routes/v1/notification.routes.js';

// Legacy Compatibility Routers (Admin & Web Direct Endpoints)
import {
  adminLegacyRouter,
  enquiriesRouter,
  categoryLegacyRouter,
  subCategoryLegacyRouter,
  productLegacyRouter,
  serviceCategoryLegacyRouter,
  serviceSubCategoryLegacyRouter,
  bookingLegacyRouter,
  taxLegacyRouter,
  couponLegacyRouter,
  kycLegacyRouter,
  userLegacyRouter,
  analyticsLegacyRouter,
  auditLogLegacyRouter
} from './routes/legacy/admin.legacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security & CORS Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: (!env.CORS_ORIGINS || env.CORS_ORIGINS.includes('*')) ? '*' : env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 2. Request Logging & Body Parsing
if (env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
    });
    next();
  });
}
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 3. Static Asset Serving (Uploads)
app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

// 4. Rate Limiting
app.use('/api', globalRateLimiter);

// 5. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'MyBigBazaar Unified API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 6. Primary Versioned API (/api/v1/*)
app.use('/api/v1', v1Router);

// 7. Legacy / Root Compatibility Routes (for existing Admin, Mobile & Web clients)
app.use('/auth', authRoutes);
app.use('/admin', adminLegacyRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/enquiries', enquiriesRouter);
app.use('/category', categoryLegacyRouter);
app.use('/product-category', categoryLegacyRouter);
app.use('/product-categories', categoryLegacyRouter);
app.use('/sub-category', subCategoryLegacyRouter);
app.use('/product-subCategory', subCategoryLegacyRouter);
app.use('/product-subcategory', subCategoryLegacyRouter);
app.use('/product-sub-category', subCategoryLegacyRouter);
app.use('/product-subCategories', subCategoryLegacyRouter);
app.use('/product', productLegacyRouter);
app.use('/products', productLegacyRouter);
app.use('/service', serviceRoutes);
app.use('/services', serviceRoutes);
app.use('/service-category', serviceCategoryLegacyRouter);
app.use('/service-sub-category', serviceSubCategoryLegacyRouter);
app.use('/booking', bookingLegacyRouter);
app.use('/bookings', bookingLegacyRouter);
app.use('/provider', providerRoutes);
app.use('/providers', providerRoutes);
app.use('/banner', bannerRouter);
app.use('/banners', bannerRouter);
app.use('/tax', taxLegacyRouter);
app.use('/taxes', taxLegacyRouter);
app.use('/coupon', couponLegacyRouter);
app.use('/coupons', couponLegacyRouter);
app.use('/kyc', kycLegacyRouter);
app.use('/user', userLegacyRouter);
app.use('/users', userRoutes);
app.use('/order', orderRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/cms', cmsRoutes);
app.use('/seller-form', sellerFormRoutes);
app.use('/seller-forms', sellerFormRoutes);
app.use('/wallets', walletsRouter);
app.use('/transactions', transactionsRouter);
app.use('/payment', transactionsRouter);
app.use('/payments', transactionsRouter);
app.use('/refund', refundsRouter);
app.use('/refunds', refundsRouter);
app.use('/invoice', invoicesRouter);
app.use('/invoices', invoicesRouter);
app.use('/moderation', moderationRoutes);
app.use('/reports', moderationRoutes);
app.use('/report', moderationRoutes);
app.use('/support', supportRoutes);
app.use('/audit-log', auditLogLegacyRouter);
app.use('/analytics', analyticsLegacyRouter);
app.use('/notifications', notificationRoutes);
app.use('/notification', notificationRoutes);

const logoRouter = express.Router();
logoRouter.get('/get-all', (req, res) => {
  res.status(200).json({
    status: true,
    success: true,
    logo: {
      logo: '/uploads/client-logo-header.png',
      lightLogo: '/uploads/client-logo-purewhite.png',
      darkLogo: '/uploads/client-logo-header.png'
    }
  });
});
app.use('/logo', logoRouter);

// 8. 404 & Global Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
