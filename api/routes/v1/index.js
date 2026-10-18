/**
 * @file apps/api/routes/v1/index.js
 * @description Master v1 API Router mounting all domain sub-routers
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import listingRoutes from './listing.routes.js';
import categoryRoutes from './category.routes.js';
import serviceRoutes from './service.routes.js';
import bookingRoutes from './booking.routes.js';
import orderRoutes from './order.routes.js';
import chatRoutes from './chat.routes.js';
import reviewRoutes from './review.routes.js';
import cmsRoutes, { bannerRouter } from './cms.routes.js';
import supportRoutes from './support.routes.js';
import adminRoutes from './admin.routes.js';
import { transactionsRouter, refundsRouter, taxesRouter, invoicesRouter, walletsRouter } from './finance.routes.js';
import couponRoutes from './coupon.routes.js';
import providerRoutes from './provider.routes.js';
import sellerFormRoutes from './sellerForm.routes.js';
import kycRoutes from './kyc.routes.js';
import moderationRoutes from './moderation.routes.js';
import paymentRoutes from './payment.routes.js';
import notificationRoutes from './notification.routes.js';
import { enquiriesRouter, kycLegacyRouter } from '../legacy/admin.legacy.js';

const router = Router();

// Domain Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/booking', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/order', orderRoutes);
router.use('/chats', chatRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cms', cmsRoutes);
router.use('/banners', bannerRouter);
router.use('/banner', bannerRouter);
router.use('/support', supportRoutes);
router.use('/enquiries', enquiriesRouter);
router.use('/admin', adminRoutes);
router.use('/taxes', taxesRouter);
router.use('/coupons', couponRoutes);
router.use('/transactions', transactionsRouter);
router.use('/refunds', refundsRouter);
router.use('/invoices', invoicesRouter);
router.use('/wallets', walletsRouter);
router.use('/providers', providerRoutes);
router.use('/provider', providerRoutes);
router.use('/seller-forms', sellerFormRoutes);
router.use('/kyc', kycLegacyRouter);
router.use('/moderation', moderationRoutes);
router.use('/reports', moderationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/notification', notificationRoutes);

export default router;
