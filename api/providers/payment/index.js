/**
 * @file apps/api/providers/payment/index.js
 * @description Payment provider factory and export
 */

import env from '../../config/env.js';
import mockPaymentProvider from './mock.payment.js';

// When production provider (e.g. Razorpay) is added later, branch here:
export const paymentProvider = mockPaymentProvider;
export default paymentProvider;
