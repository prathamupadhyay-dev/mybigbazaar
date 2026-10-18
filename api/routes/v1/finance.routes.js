/**
 * @file apps/api/routes/v1/finance.routes.js
 * @description Transactions ledger, refunds, taxes, invoices, and wallets routes
 * (/api/v1/transactions, /api/v1/refunds, /api/v1/taxes, /api/v1/invoices, /api/v1/wallets)
 */

import { Router } from 'express';
import mongoose from 'mongoose';
import Payment from '../../models/Payment.js';
import Refund from '../../models/Refund.js';
import Tax from '../../models/Tax.js';
import Booking from '../../models/Booking.js';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import { asyncHandler, ApiError } from '../../middleware/error.middleware.js';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

// Ensure all existing users start with 0 wallet balance on boot
let initialWalletResetDone = false;
const ensureZeroInitialWallets = async () => {
  if (initialWalletResetDone) return;
  if (mongoose.connection.readyState === 1) {
    initialWalletResetDone = true;
    await User.updateMany({ walletBalance: { $ne: 0 } }, { $set: { walletBalance: 0 } }).catch(() => null);
  }
};

// ==========================================
// 1. TRANSACTIONS ROUTER (/api/v1/transactions)
// ==========================================
export const transactionsRouter = Router();

transactionsRouter.use(optionalAuth);

const getTransactionsList = asyncHandler(async (req, res) => {
  const { status, paymentMode } = req.query;
  const query = {};
  if (status && status !== 'All') {
    const s = status.toLowerCase();
    if (s === 'success' || s === 'completed') {
      query.status = { $in: ['completed', 'success'] };
    } else {
      query.status = s;
    }
  }
  if (paymentMode && paymentMode !== 'All') {
    query.$or = [{ paymentMode }, { method: paymentMode }];
  }

  const [payments, orders] = await Promise.all([
    Payment.find(query)
      .populate('userId', 'fullName email phoneNumber')
      .populate('sellerId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 }),
    Order.find()
      .populate('buyerId', 'fullName email phoneNumber')
      .populate('sellerId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
  ]);

  // Map orders by orderNumber and _id for quick enrichment & deduplication
  const orderByNumber = new Map();
  orders.forEach((o) => {
    if (o.orderNumber) orderByNumber.set(o.orderNumber, o);
    if (o._id) orderByNumber.set(o._id.toString(), o);
  });

  const seenOrderNumbers = new Set();
  const formatted = [];

  payments.forEach((p, i) => {
    const refOrderNum = p.orderId || p.referenceId || '';
    const linkedOrder = orderByNumber.get(refOrderNum);
    if (refOrderNum) seenOrderNumbers.add(refOrderNum);
    if (linkedOrder?.orderNumber) seenOrderNumbers.add(linkedOrder.orderNumber);
    if (linkedOrder?._id) seenOrderNumbers.add(linkedOrder._id.toString());
    const amt = Number(p.amount) || 0;
    const subtotal = Number(p.subtotal || linkedOrder?.subtotal || Math.round((amt / 1.18) * 100) / 100);
    const taxAmount = p.taxAmount !== undefined && p.taxAmount > 0
      ? Number(p.taxAmount)
      : (linkedOrder?.taxAmount !== undefined ? Number(linkedOrder.taxAmount) : Math.max(0, Math.round((amt - subtotal) * 100) / 100));
    const taxName = p.taxName || linkedOrder?.taxName || 'GST 18%';
    const fee = Math.round(amt * 0.02);
    const commissionRate = 10;
    const net = Math.max(0, amt - Math.round((amt * commissionRate) / 100));

    let displayStatus = 'Success';
    const rawSt = String(p.status || 'completed').toLowerCase();
    if (rawSt === 'completed' || rawSt === 'success' || rawSt === 'paid') displayStatus = 'Success';
    else if (rawSt === 'refunded' || rawSt === 'cancelled') displayStatus = 'Refunded';
    else if (rawSt === 'failed') displayStatus = 'Failed';
    else if (rawSt === 'pending') displayStatus = 'Pending';

    const customerName =
      p.userName ||
      p.userId?.fullName ||
      linkedOrder?.buyerName ||
      linkedOrder?.buyerId?.fullName ||
      'Verified Buyer';
    const customerEmail =
      p.userEmail ||
      p.userId?.email ||
      linkedOrder?.buyerEmail ||
      linkedOrder?.buyerId?.email ||
      '';
    const customerPhone =
      p.userPhone ||
      p.userId?.phoneNumber ||
      linkedOrder?.buyerPhone ||
      linkedOrder?.buyerId?.phoneNumber ||
      '';
    const sellerName =
      p.sellerName ||
      p.sellerId?.fullName ||
      linkedOrder?.sellerName ||
      linkedOrder?.sellerId?.fullName ||
      'Verified Seller';
    const productTitle =
      p.productTitle ||
      linkedOrder?.productTitle ||
      (linkedOrder?.items && linkedOrder.items[0]?.title) ||
      (p.purpose === 'booking' ? 'Home Service Booking' : 'Marketplace Order');
    const mode = p.paymentMode || p.method || linkedOrder?.paymentMethod || linkedOrder?.paymentMode || 'UPI';

    formatted.push({
      id: p.transactionId || p._id.toString(),
      _id: p._id.toString(),
      transactionId: p.transactionId || `TXN-${100000 + i}`,
      refNumber: refOrderNum || p.transactionId || `TXN-${100000 + i}`,
      orderId: refOrderNum,
      date: p.createdAt ? p.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      createdAt: p.createdAt || new Date(),
      customerName,
      userName: customerName,
      customerEmail,
      customerPhone,
      sellerName,
      productTitle,
      type: p.type || 'payment',
      purpose: p.purpose === 'booking' ? 'Service Escrow' : (productTitle || 'Product Checkout'),
      subtotal,
      taxAmount,
      taxName,
      amount: amt,
      fee,
      commissionRate,
      netAmount: net,
      paymentMode: mode,
      method: mode,
      gateway: p.paymentGateway || 'Razorpay',
      gatewayRef: p.gatewayPaymentId || p.transactionId || `RZP-${p._id.toString().slice(-8).toUpperCase()}`,
      escrowStatus: displayStatus === 'Success' ? 'Settled / Verified' : displayStatus,
      ipAddress: '103.21.124.88',
      status: displayStatus
    });
  });

  // Also include any Orders that did not yet have a Payment record
  orders.forEach((o, idx) => {
    if ((o.orderNumber && seenOrderNumbers.has(o.orderNumber)) || (o._id && seenOrderNumbers.has(o._id.toString()))) return;
    const amt = Number(o.totalAmount) || 0;
    const subtotal = Number(o.subtotal || Math.round((amt / 1.18) * 100) / 100);
    const taxAmount = o.taxAmount !== undefined ? Number(o.taxAmount) : Math.max(0, amt - subtotal);
    const isCancelled = ['cancelled', 'canceled', 'returned'].includes(String(o.trackingStatus || o.status || '').toLowerCase());
    const displayStatus = isCancelled ? 'Refunded' : 'Success';
    const mode = o.paymentMethod || o.paymentMode || 'UPI';
    const customerName = o.buyerName || o.buyerId?.fullName || 'Verified Buyer';
    const customerEmail = o.buyerEmail || o.buyerId?.email || '';
    const sellerName = o.sellerName || o.sellerId?.fullName || 'Verified Seller';
    const productTitle = o.productTitle || (o.items && o.items[0]?.title) || 'Marketplace Order';

    formatted.push({
      id: `TXN-${o.orderNumber || o._id.toString().slice(-6).toUpperCase()}`,
      _id: o._id.toString(),
      transactionId: `TXN-${o.orderNumber || (200000 + idx)}`,
      refNumber: o.orderNumber || `ORD-${200000 + idx}`,
      orderId: o.orderNumber || o._id.toString(),
      date: o.createdAt ? o.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      createdAt: o.createdAt || new Date(),
      customerName,
      userName: customerName,
      customerEmail,
      customerPhone: o.buyerPhone || o.buyerId?.phoneNumber || '',
      sellerName,
      productTitle,
      type: 'payment',
      purpose: productTitle,
      subtotal,
      taxAmount,
      taxName: o.taxName || 'GST 18%',
      amount: amt,
      fee: Math.round(amt * 0.02),
      commissionRate: 10,
      netAmount: Math.max(0, amt - Math.round(amt * 0.1)),
      paymentMode: mode,
      method: mode,
      gateway: 'Razorpay',
      gatewayRef: `RZP-${o._id.toString().slice(-8).toUpperCase()}`,
      escrowStatus: displayStatus === 'Success' ? 'Settled / Verified' : displayStatus,
      ipAddress: '103.21.124.88',
      status: displayStatus
    });
  });

  res.status(200).json({
    success: true,
    status: true,
    data: formatted,
    transactions: formatted,
    count: formatted.length
  });
});

transactionsRouter.get('/', authenticate, requireAdmin, getTransactionsList);
transactionsRouter.get('/get-all', authenticate, requireAdmin, getTransactionsList);

transactionsRouter.post('/', asyncHandler(async (req, res) => {
  const {
    userId,
    userName,
    userEmail,
    userPhone,
    sellerId,
    sellerName,
    orderId,
    referenceId,
    productTitle,
    subtotal,
    taxAmount,
    taxName,
    amount,
    paymentMode,
    method,
    type = 'payment',
    purpose = 'order',
    status = 'completed'
  } = req.body;

  const payment = await Payment.create({
    transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : (req.user?._id || null),
    userName: userName || req.user?.fullName || 'Verified Buyer',
    userEmail: userEmail || req.user?.email || '',
    userPhone: userPhone || req.user?.phoneNumber || '',
    sellerId: sellerId && mongoose.Types.ObjectId.isValid(sellerId) ? sellerId : null,
    sellerName: sellerName || 'Verified Seller',
    orderId: orderId || referenceId || '',
    referenceId: referenceId || orderId || `REF-${Date.now()}`,
    productTitle: productTitle || 'Product Order',
    type,
    purpose,
    subtotal: Number(subtotal || amount || 0),
    taxAmount: Number(taxAmount || 0),
    taxName: taxName || 'GST 18%',
    amount: Number(amount || 0),
    status,
    paymentMode: paymentMode || method || 'UPI',
    method: method || paymentMode || 'UPI'
  });

  res.status(201).json({
    success: true,
    status: true,
    message: 'Transaction recorded successfully',
    data: payment
  });
}));

// ==========================================
// 2. REFUNDS ROUTER (/api/v1/refunds)
// ==========================================
export const refundsRouter = Router();

refundsRouter.get('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const dbRefunds = await Refund.find().sort({ createdAt: -1 });
  const refundedPayments = await Payment.find({
    $or: [{ status: 'refunded' }, { 'refundDetails.amount': { $gt: 0 } }]
  }).populate('userId', 'fullName email phoneNumber').sort({ updatedAt: -1 });

  const list = [];
  const seenIds = new Set();

  dbRefunds.forEach((r) => {
    seenIds.add(r._id.toString());
    seenIds.add(r.refundId);
    if (r.orderId) seenIds.add(r.orderId);
    list.push({
      id: r._id.toString(),
      _id: r._id.toString(),
      refNumber: r.refundId || `REF-${r._id.toString().slice(-6).toUpperCase()}`,
      refId: r.refundId,
      orderId: r.orderId || '',
      bookingId: r.bookingId || '',
      source: r.category || 'Product Return',
      customerName: r.customerName || 'Customer',
      customerEmail: r.customerEmail || '',
      customerPhone: r.customerPhone || '',
      amount: Number(r.amount) || 0,
      reason: r.reason || '',
      date: r.createdAt ? r.createdAt.toISOString().slice(0, 10) : '',
      status: r.status || 'Pending Approval',
      method: r.refundMethod === 'wallet' ? 'BigBazaar Wallet Credit' : 'Original Payment Source (UPI/Card)',
      notes: r.notes || r.adminNotes || '',
      adminNotes: r.adminNotes || r.notes || '',
      bankDetails: r.bankDetails || {}
    });
  });

  refundedPayments.forEach((p) => {
    const rid = p.refundDetails?.refundId || `REF-PAY-${p._id.toString().slice(-6)}`;
    const ordId = p.orderId || p.referenceId || '';
    if (!seenIds.has(p._id.toString()) && !seenIds.has(rid) && (!ordId || !seenIds.has(ordId))) {
      list.push({
        id: p._id.toString(),
        _id: p._id.toString(),
        refNumber: rid,
        refId: rid,
        orderId: ordId,
        bookingId: p.purpose === 'booking' ? p.referenceId : '',
        source: p.purpose === 'booking' ? 'Service Cancellation' : 'Product Return',
        customerName: p.userName || p.userId?.fullName || 'Customer',
        customerEmail: p.userEmail || p.userId?.email || '',
        customerPhone: p.userPhone || p.userId?.phoneNumber || '',
        amount: Number(p.refundDetails?.amount || p.amount) || 0,
        reason: p.refundDetails?.reason || 'Order cancellation / return',
        date: p.updatedAt ? p.updatedAt.toISOString().slice(0, 10) : '',
        status: 'Processed',
        method: 'Original Payment Source',
        notes: p.refundDetails?.adminNotes || '',
        adminNotes: p.refundDetails?.adminNotes || '',
        bankDetails: p.refundDetails?.bankDetails || {}
      });
    }
  });

  res.status(200).json({
    success: true,
    data: list,
    count: list.length
  });
}));

// Submit new refund request
refundsRouter.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    orderId,
    bookingId,
    paymentId,
    customerName,
    customerEmail,
    customerPhone,
    amount,
    category,
    reason,
    notes,
    bankDetails
  } = req.body;

  if (!reason || amount === undefined) {
    throw ApiError.badRequest('Refund reason and amount are required');
  }

  const targetName = customerName || (req.user ? req.user.fullName : 'Customer');
  const targetEmail = customerEmail || (req.user ? req.user.email : '');
  const targetPhone = customerPhone || (req.user ? req.user.phoneNumber : '');

  const newRefund = await Refund.create({
    orderId: orderId || '',
    bookingId: bookingId || '',
    paymentId: paymentId || null,
    customerId: req.user ? req.user._id : null,
    customerName: targetName,
    customerEmail: targetEmail,
    customerPhone: targetPhone,
    amount: Number(amount) || 0,
    category: category || 'Product Return',
    reason,
    notes: notes || '',
    status: 'Pending Approval',
    bankDetails: bankDetails || {}
  });

  res.status(201).json({
    success: true,
    message: 'Refund request created successfully',
    data: newRefund
  });
}));

// Approve refund
refundsRouter.post('/:id/approve', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { method, adminNotes, bankDetails } = req.body;

  let refDoc = await Refund.findById(id).catch(() => null);
  if (refDoc) {
    refDoc.status = 'Processed';
    refDoc.processedAt = new Date();
    if (req.user) refDoc.processedBy = req.user._id;
    if (adminNotes) refDoc.adminNotes = adminNotes;
    if (method) refDoc.refundMethod = method;
    if (bankDetails) refDoc.bankDetails = bankDetails;
    await refDoc.save();
  }

  let payment = await Payment.findById(id).catch(() => null);
  if (payment) {
    payment.status = 'refunded';
    payment.refundDetails = {
      ...(payment.refundDetails || {}),
      refundId: `REF-${Date.now().toString().slice(-6)}`,
      amount: payment.amount,
      refundedAt: new Date(),
      adminNotes: adminNotes || `Approved via ${method || 'Original Source'}`
    };
    if (bankDetails) payment.refundDetails.bankDetails = bankDetails;
    await payment.save();
  }

  res.status(200).json({
    success: true,
    message: `Refund ${id} processed successfully`,
    data: { id, status: 'Processed' }
  });
}));

// Reject refund
refundsRouter.post('/:id/reject', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, adminNotes } = req.body;

  let refDoc = await Refund.findById(id).catch(() => null);
  if (refDoc) {
    refDoc.status = 'Rejected';
    refDoc.rejectionReason = reason || 'Ineligible for refund';
    if (adminNotes) refDoc.adminNotes = adminNotes;
    refDoc.processedAt = new Date();
    if (req.user) refDoc.processedBy = req.user._id;
    await refDoc.save();
  }

  let payment = await Payment.findById(id).catch(() => null);
  if (payment) {
    payment.status = 'completed';
    payment.refundDetails = {
      ...(payment.refundDetails || {}),
      adminNotes: adminNotes || reason || 'Dispute rejected by administrator'
    };
    await payment.save();
  }

  res.status(200).json({
    success: true,
    message: `Refund ${id} rejected`,
    data: { id, status: 'Rejected' }
  });
}));

// Update admin notes
refundsRouter.put('/:id/notes', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, adminNotes, bankDetails } = req.body;

  let refDoc = await Refund.findById(id).catch(() => null);
  if (refDoc) {
    refDoc.adminNotes = adminNotes || notes || refDoc.adminNotes;
    if (bankDetails) refDoc.bankDetails = { ...refDoc.bankDetails, ...bankDetails };
    await refDoc.save();
  }

  let payment = await Payment.findById(id).catch(() => null);
  if (payment) {
    const existing = payment.refundDetails || {};
    payment.refundDetails = {
      ...existing,
      adminNotes: adminNotes || notes || existing.adminNotes || ''
    };
    if (bankDetails) {
      payment.refundDetails.bankDetails = {
        ...(existing.bankDetails || {}),
        ...bankDetails
      };
    }
    await payment.save();
  }

  res.status(200).json({
    success: true,
    message: 'Refund notes updated successfully',
    data: { id, adminNotes: adminNotes || notes }
  });
}));

// ==========================================
// 3. TAXES ROUTER (/api/v1/taxes)
// ==========================================
export const taxesRouter = Router();

taxesRouter.get('/', optionalAuth, asyncHandler(async (req, res) => {
  let taxes = await Tax.find().sort({ taxPercentage: 1 });
  if (!taxes || taxes.length === 0) {
    taxes = await Tax.create([
      { taxName: 'GST 5%', taxPercentage: 5, isActive: true },
      { taxName: 'GST 12%', taxPercentage: 12, isActive: true },
      { taxName: 'GST 18%', taxPercentage: 18, isActive: true },
      { taxName: 'GST 28%', taxPercentage: 28, isActive: true }
    ]);
  }
  const formatted = taxes.map((t) => ({
    _id: t._id.toString(),
    id: t._id.toString(),
    taxName: t.taxName || t.name,
    name: t.taxName || t.name,
    taxPercentage: t.taxPercentage !== undefined ? t.taxPercentage : t.rate,
    rate: t.taxPercentage !== undefined ? t.taxPercentage : t.rate,
    isActive: t.isActive !== false,
    status: t.isActive !== false ? 'active' : 'inactive',
    createdAt: t.createdAt
  }));

  res.status(200).json({
    success: true,
    status: true,
    data: formatted,
    taxes: formatted,
    count: formatted.length
  });
}));

taxesRouter.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const { taxName, name, taxPercentage, rate, isActive } = req.body;
  const targetName = taxName || name;
  const targetRate = taxPercentage !== undefined ? taxPercentage : rate;

  if (!targetName || targetRate === undefined) {
    throw ApiError.badRequest('Tax name and percentage are required');
  }

  const tax = await Tax.create({
    taxName: targetName.trim(),
    taxPercentage: Number(targetRate),
    isActive: isActive !== false
  });

  res.status(201).json({
    success: true,
    status: true,
    message: 'Tax slab created successfully',
    data: tax,
    tax
  });
}));

taxesRouter.put('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { taxName, name, taxPercentage, rate, isActive } = req.body;
  const targetName = taxName || name;
  const targetRate = taxPercentage !== undefined ? taxPercentage : rate;

  const tax = await Tax.findById(req.params.id);
  if (!tax) {
    throw ApiError.notFound('Tax slab not found');
  }

  if (targetName) tax.taxName = targetName.trim();
  if (targetRate !== undefined) tax.taxPercentage = Number(targetRate);
  if (isActive !== undefined) tax.isActive = Boolean(isActive);

  await tax.save();

  res.status(200).json({
    success: true,
    status: true,
    message: 'Tax slab updated successfully',
    data: tax,
    tax
  });
}));

taxesRouter.delete('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const tax = await Tax.findByIdAndDelete(req.params.id);
  if (!tax) {
    throw ApiError.notFound('Tax slab not found');
  }
  res.status(200).json({
    success: true,
    status: true,
    message: 'Tax slab deleted successfully'
  });
}));

// ==========================================
// 4. INVOICES ROUTER (/api/v1/invoices)
// ==========================================
export const invoicesRouter = Router();

invoicesRouter.use(optionalAuth);

invoicesRouter.get('/', asyncHandler(async (req, res) => {
  const [payments, orders] = await Promise.all([
    Payment.find()
      .populate('userId', 'fullName email phoneNumber')
      .populate('sellerId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(200),
    Order.find()
      .populate('buyerId', 'fullName email phoneNumber')
      .populate('sellerId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(200)
  ]);

  const orderByNumber = new Map();
  orders.forEach((o) => {
    if (o.orderNumber) orderByNumber.set(o.orderNumber, o);
  });

  const seenRefs = new Set();
  const invoices = [];

  payments.forEach((p, idx) => {
    const refNum = p.orderId || p.referenceId || p.transactionId || `TXN-${100000 + idx}`;
    seenRefs.add(refNum);
    const linkedOrder = orderByNumber.get(refNum);

    const rawAmt = Number(p.amount) || 0;
    const taxable = p.subtotal && p.subtotal > 0
      ? Number(p.subtotal)
      : (linkedOrder?.subtotal && linkedOrder.subtotal > 0
          ? Number(linkedOrder.subtotal)
          : Math.round((rawAmt / 1.18) * 100) / 100);
    const tax = p.taxAmount && p.taxAmount > 0
      ? Number(p.taxAmount)
      : (linkedOrder?.taxAmount !== undefined && linkedOrder.taxAmount > 0
          ? Number(linkedOrder.taxAmount)
          : Math.max(0, Math.round((rawAmt - taxable) * 100) / 100));
    const halfTax = Math.round((tax / 2) * 100) / 100;
    const invoiceNum = `INV-2026-${String(idx + 1).padStart(4, '0')}`;
    const dateStr = p.createdAt ? p.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    const customerName =
      p.userName ||
      p.userId?.fullName ||
      linkedOrder?.buyerName ||
      linkedOrder?.buyerId?.fullName ||
      'Verified Buyer';
    const customerEmail =
      p.userEmail ||
      p.userId?.email ||
      linkedOrder?.buyerEmail ||
      linkedOrder?.buyerId?.email ||
      '';
    const customerPhone =
      p.userPhone ||
      p.userId?.phoneNumber ||
      linkedOrder?.buyerPhone ||
      linkedOrder?.buyerId?.phoneNumber ||
      '';
    const customerState = linkedOrder?.shippingAddress?.state || 'Madhya Pradesh (23)';
    const sellerName =
      p.sellerName ||
      p.sellerId?.fullName ||
      linkedOrder?.sellerName ||
      linkedOrder?.sellerId?.fullName ||
      'Verified Seller';
    const itemTitle =
      p.productTitle ||
      linkedOrder?.productTitle ||
      (linkedOrder?.items && linkedOrder.items[0]?.title) ||
      (p.purpose === 'booking' ? 'Service Escrow Charge' : 'Product Order Settlement');

    const rawSt = String(p.status || 'completed').toLowerCase();
    const invStatus = (rawSt === 'completed' || rawSt === 'success' || rawSt === 'paid')
      ? 'Paid'
      : (rawSt === 'refunded' || rawSt === 'cancelled' ? 'Cancelled' : 'Generated');

    invoices.push({
      id: invoiceNum,
      invoiceNumber: invoiceNum,
      refNumber: refNum,
      orderId: linkedOrder?.orderNumber || refNum,
      date: dateStr,
      customerName,
      customerEmail,
      customerPhone,
      customerState,
      sellerName,
      productTitle: itemTitle,
      hsnCode: '998314',
      description: p.purpose === 'booking' ? 'Home Service Professional Booking' : itemTitle,
      taxableAmount: taxable,
      cgst: halfTax,
      sgst: halfTax,
      totalTax: tax,
      taxName: p.taxName || linkedOrder?.taxName || 'GST 18%',
      totalAmount: rawAmt,
      commissionRate: 10,
      paymentMode: p.paymentMode || p.method || linkedOrder?.paymentMethod || 'UPI',
      status: invStatus,
      items: (linkedOrder?.items && linkedOrder.items.length > 0)
        ? linkedOrder.items.map((it) => ({
            title: it.title || itemTitle,
            desc: it.title || itemTitle,
            hsn: '998314',
            qty: it.quantity || 1,
            rate: it.price || taxable,
            amount: (it.price || taxable) * (it.quantity || 1)
          }))
        : [
            {
              title: itemTitle,
              desc: itemTitle,
              hsn: '998314',
              qty: 1,
              rate: taxable,
              amount: taxable
            }
          ]
    });
  });

  // Also generate invoices for any Orders not yet in Payments
  orders.forEach((o) => {
    if (o.orderNumber && seenRefs.has(o.orderNumber)) return;
    const idx = invoices.length;
    const rawAmt = Number(o.totalAmount) || 0;
    const taxable = o.subtotal && o.subtotal > 0 ? Number(o.subtotal) : Math.round((rawAmt / 1.18) * 100) / 100;
    const tax = o.taxAmount !== undefined ? Number(o.taxAmount) : Math.max(0, Math.round((rawAmt - taxable) * 100) / 100);
    const halfTax = Math.round((tax / 2) * 100) / 100;
    const invoiceNum = `INV-2026-${String(idx + 1).padStart(4, '0')}`;
    const itemTitle = o.productTitle || (o.items && o.items[0]?.title) || 'Marketplace Order';
    const isCancelled = ['cancelled', 'canceled', 'returned'].includes(String(o.trackingStatus || o.status || '').toLowerCase());

    invoices.push({
      id: invoiceNum,
      invoiceNumber: invoiceNum,
      refNumber: o.orderNumber || `ORD-${idx + 1}`,
      orderId: o.orderNumber || o._id.toString(),
      date: o.createdAt ? o.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      customerName: o.buyerName || o.buyerId?.fullName || 'Verified Buyer',
      customerEmail: o.buyerEmail || o.buyerId?.email || '',
      customerPhone: o.buyerPhone || o.buyerId?.phoneNumber || '',
      customerState: o.shippingAddress?.state || 'Madhya Pradesh (23)',
      sellerName: o.sellerName || o.sellerId?.fullName || 'Verified Seller',
      productTitle: itemTitle,
      hsnCode: '998314',
      description: itemTitle,
      taxableAmount: taxable,
      cgst: halfTax,
      sgst: halfTax,
      totalTax: tax,
      taxName: o.taxName || 'GST 18%',
      totalAmount: rawAmt,
      commissionRate: 10,
      paymentMode: o.paymentMethod || o.paymentMode || 'UPI',
      status: isCancelled ? 'Cancelled' : 'Paid',
      items: [
        {
          title: itemTitle,
          desc: itemTitle,
          hsn: '998314',
          qty: 1,
          rate: taxable,
          amount: taxable
        }
      ]
    });
  });

  res.status(200).json({
    success: true,
    status: true,
    data: invoices,
    invoices,
    count: invoices.length
  });
}));

// ==========================================
// 5. WALLETS ROUTER (/api/v1/wallets)
// ==========================================
export const walletsRouter = Router();

walletsRouter.use(optionalAuth);

// GET /api/v1/wallets - Returns all users with their dynamic wallet balance (defaulting to 0 / ₹0)
walletsRouter.get('/', asyncHandler(async (req, res) => {
  await ensureZeroInitialWallets();

  const users = await User.find()
    .select('-password -otp -otpExpiresAt -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 });

  const formatted = users.map((u) => {
    const bal = Number(u.walletBalance) || 0;
    return {
      _id: u._id.toString(),
      id: u._id.toString(),
      userId: u._id.toString(),
      fullName: u.fullName || u.name || 'User',
      name: u.fullName || u.name || 'User',
      email: u.email || '',
      phoneNumber: u.phoneNumber || u.phone || '',
      phone: u.phoneNumber || u.phone || '',
      role: u.role || 'buyer',
      status: u.status || 'active',
      walletBalance: bal,
      balance: bal,
      createdAt: u.createdAt
    };
  });

  res.status(200).json({
    success: true,
    status: true,
    count: formatted.length,
    totalBalance: formatted.reduce((s, u) => s + u.walletBalance, 0),
    data: formatted,
    wallets: formatted,
    users: formatted
  });
}));

// POST /api/v1/wallets/adjust or /api/v1/wallets/topup - Credit, Debit, or Reset a user's wallet
const handleWalletAdjust = asyncHandler(async (req, res) => {
  await ensureZeroInitialWallets();

  const { userId, id, action = 'credit', type, amount, balance, reason = 'Admin wallet adjustment' } = req.body;
  const targetUserId = userId || id || req.params.id;

  if (!targetUserId) {
    throw ApiError.badRequest('userId is required');
  }

  let user = mongoose.Types.ObjectId.isValid(targetUserId) ? await User.findById(targetUserId) : null;
  if (!user) {
    user = await User.findOne({ $or: [{ email: targetUserId }, { phoneNumber: targetUserId }] });
  }
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const currentBalance = Number(user.walletBalance) || 0;
  const op = String(type || action || 'credit').toLowerCase();
  const numericAmount = Number(amount) || 0;

  let nextBalance = currentBalance;
  if (op === 'reset' || op === 'empty' || balance === 0) {
    nextBalance = 0;
  } else if (op === 'set' && balance !== undefined) {
    nextBalance = Math.max(0, Number(balance) || 0);
  } else if (op === 'debit' || op === 'subtract' || op === 'deduct') {
    nextBalance = Math.max(0, currentBalance - Math.abs(numericAmount));
  } else {
    // credit / topup / add
    nextBalance = Math.max(0, currentBalance + Math.abs(numericAmount));
  }

  user.walletBalance = nextBalance;
  await user.save();

  // Log wallet transaction if non-zero change
  const delta = Math.abs(nextBalance - currentBalance);
  if (delta > 0) {
    await Payment.create({
      transactionId: `TXN-WAL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: user._id,
      userName: user.fullName || 'User',
      userEmail: user.email || '',
      userPhone: user.phoneNumber || '',
      orderId: `WAL-${user._id.toString().slice(-6).toUpperCase()}`,
      referenceId: `WAL-${user._id.toString().slice(-6).toUpperCase()}`,
      productTitle: `Wallet ${nextBalance >= currentBalance ? 'Credit' : 'Debit'}: ${reason}`,
      type: nextBalance >= currentBalance ? 'wallet_credit' : 'wallet_debit',
      purpose: 'escrow',
      subtotal: delta,
      taxAmount: 0,
      amount: delta,
      status: 'completed',
      paymentMode: 'Wallet',
      method: 'Wallet'
    }).catch(() => null);
  }

  res.status(200).json({
    success: true,
    status: true,
    message: `Wallet balance updated to ₹${nextBalance}`,
    data: {
      _id: user._id.toString(),
      id: user._id.toString(),
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      walletBalance: nextBalance,
      balance: nextBalance
    }
  });
});

walletsRouter.post('/adjust', handleWalletAdjust);
walletsRouter.post('/topup', handleWalletAdjust);
walletsRouter.put('/:id', handleWalletAdjust);
walletsRouter.post('/:id/adjust', handleWalletAdjust);

// POST /api/v1/wallets/reset-all - Resets all users' wallets to ₹0 (0)
walletsRouter.post('/reset-all', asyncHandler(async (req, res) => {
  initialWalletResetDone = true;
  await User.updateMany({}, { $set: { walletBalance: 0 } });

  res.status(200).json({
    success: true,
    status: true,
    message: 'All platform wallets have been emptied and reset to ₹0',
    data: { walletBalance: 0 }
  });
}));

export default {
  transactionsRouter,
  refundsRouter,
  taxesRouter,
  invoicesRouter,
  walletsRouter
};
