/**
 * @file apps/api/controllers/order.controller.js
 * @description E-commerce physical order management and tracking controller
 */

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Tax from '../models/Tax.js';
import Notification from '../models/Notification.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { OrderStatus, PaymentStatus } from '../config/constants.js';

// ==========================================
// 1. CREATE ORDER
// ==========================================
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    productId,
    listingId,
    productTitle,
    title,
    productImage,
    image,
    price,
    quantity = 1,
    buyerId: bodyBuyerId,
    buyerName: bodyBuyerName,
    buyerEmail: bodyBuyerEmail,
    buyerPhone: bodyBuyerPhone,
    sellerId: bodySellerId,
    sellerName: bodySellerName,
    subtotal: bodySubtotal,
    taxAmount: bodyTaxAmount,
    taxName: bodyTaxName,
    taxPercentage: bodyTaxPercentage,
    totalAmount: bodyTotalAmount,
    shippingAddress = {},
    paymentMode,
    paymentMethod,
    paymentStatus: bodyPaymentStatus,
    status: bodyStatus,
    trackingStatus: bodyTrackingStatus,
    discount = 0
  } = req.body;

  // 1. Resolve Buyer Info
  let buyerObjectId = null;
  const rawBuyerId = bodyBuyerId || (req.user && req.user._id);
  if (rawBuyerId && mongoose.Types.ObjectId.isValid(rawBuyerId)) {
    buyerObjectId = rawBuyerId;
  }

  let buyerDoc = null;
  if (buyerObjectId) {
    buyerDoc = await User.findById(buyerObjectId).lean().catch(() => null);
  }
  if (!buyerObjectId && req.user && req.user._id) {
    buyerObjectId = req.user._id;
    buyerDoc = req.user;
  }

  const resolvedBuyerName =
    bodyBuyerName ||
    buyerDoc?.fullName ||
    buyerDoc?.name ||
    req.user?.fullName ||
    shippingAddress?.name ||
    'Verified Buyer';
  const resolvedBuyerEmail =
    bodyBuyerEmail ||
    buyerDoc?.email ||
    req.user?.email ||
    '';
  const resolvedBuyerPhone =
    bodyBuyerPhone ||
    buyerDoc?.phoneNumber ||
    buyerDoc?.phone ||
    req.user?.phoneNumber ||
    shippingAddress?.phone ||
    '';

  // 2. Resolve Items & Seller Info
  let computedSubtotal = 0;
  const lineItems = [];
  let primarySellerId = bodySellerId && mongoose.Types.ObjectId.isValid(bodySellerId) ? bodySellerId : null;
  let resolvedSellerName = bodySellerName || '';

  const rawItems = Array.isArray(items) && items.length > 0
    ? items
    : (productId || listingId || productTitle || title)
      ? [{
          listingId: listingId || productId,
          productId: productId || listingId || '',
          title: productTitle || title || 'Marketplace Product',
          price: Number(price ?? bodySubtotal ?? bodyTotalAmount ?? 0),
          quantity: Number(quantity) || 1,
          image: productImage || image || ''
        }]
      : [];

  if (rawItems.length === 0) {
    throw ApiError.badRequest('Order must contain at least one item or product details');
  }

  for (const item of rawItems) {
    const targetListingId = item.listingId || item.productId || item._id || item.id;
    let listing = null;
    if (targetListingId && mongoose.Types.ObjectId.isValid(targetListingId)) {
      listing = await Listing.findById(targetListingId).lean().catch(() => null);
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const unitPrice = item.price !== undefined ? Number(item.price) : (listing ? Number(listing.price) : 0);
    const itemTotal = unitPrice * qty;
    computedSubtotal += itemTotal;

    if (!primarySellerId && listing?.sellerId && mongoose.Types.ObjectId.isValid(listing.sellerId)) {
      primarySellerId = listing.sellerId;
    }
    if (!resolvedSellerName && listing?.sellerName) {
      resolvedSellerName = listing.sellerName;
    }

    lineItems.push({
      listingId: listing ? listing._id : (mongoose.Types.ObjectId.isValid(targetListingId) ? targetListingId : null),
      productId: String(targetListingId || listing?._id || ''),
      title: item.title || item.productTitle || listing?.title || 'Marketplace Product',
      price: unitPrice,
      quantity: qty,
      image: item.image || item.productImage || (listing?.images && listing.images[0]) || ''
    });
  }

  if (!resolvedSellerName && primarySellerId) {
    const sellerDoc = await User.findById(primarySellerId).lean().catch(() => null);
    if (sellerDoc) {
      resolvedSellerName = sellerDoc.fullName || sellerDoc.name || 'Verified Seller';
    }
  }
  if (!resolvedSellerName) {
    resolvedSellerName = 'Verified Seller';
  }

  // 3. Resolve Subtotal, Tax & Total Amount
  const finalSubtotal = bodySubtotal !== undefined ? Number(bodySubtotal) : computedSubtotal;

  let activeTaxSlab = null;
  if (bodyTaxAmount === undefined || !bodyTaxName) {
    activeTaxSlab = await Tax.findOne({ isActive: true }).sort({ createdAt: -1 }).lean().catch(() => null);
  }
  const finalTaxName = bodyTaxName || activeTaxSlab?.taxName || 'GST 18%';
  const finalTaxPercentage = bodyTaxPercentage !== undefined
    ? Number(bodyTaxPercentage)
    : (activeTaxSlab?.taxPercentage !== undefined ? Number(activeTaxSlab.taxPercentage) : 18);

  const finalTaxAmount = bodyTaxAmount !== undefined
    ? Number(bodyTaxAmount)
    : Math.round((finalSubtotal * finalTaxPercentage) / 100);

  const deliveryFee = req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : 0;
  const disc = parseFloat(discount) || 0;
  const finalTotalAmount = bodyTotalAmount !== undefined
    ? Number(bodyTotalAmount)
    : Math.max(0, finalSubtotal + finalTaxAmount + deliveryFee - disc);

  const resolvedPaymentMethod = paymentMethod || paymentMode || 'UPI';
  const normalizedStatus = (bodyStatus || bodyTrackingStatus || 'pending').toLowerCase();
  const isOrderCancelled = ['cancelled', 'canceled'].includes(normalizedStatus);
  const isOrderCompleted = ['completed', 'delivered'].includes(normalizedStatus);

  const finalStatus = isOrderCancelled ? 'cancelled' : (isOrderCompleted ? 'completed' : 'pending');
  const finalTrackingStatus = isOrderCancelled
    ? 'cancelled'
    : (isOrderCompleted ? (bodyTrackingStatus || 'completed') : (bodyTrackingStatus || 'placed'));

  const finalPaymentStatus = bodyPaymentStatus || (isOrderCancelled ? 'refunded' : 'completed');

  const primaryItem = lineItems[0] || {};
  const finalShippingAddress = {
    houseNo: shippingAddress?.houseNo || '',
    street: shippingAddress?.street || shippingAddress?.address || '',
    landmark: shippingAddress?.landmark || '',
    city: shippingAddress?.city || 'Indore',
    pincode: shippingAddress?.pincode || '452001',
    state: shippingAddress?.state || 'Madhya Pradesh',
    phone: shippingAddress?.phone || resolvedBuyerPhone || '',
    address: shippingAddress?.address || ''
  };

  const order = await Order.create({
    orderNumber: req.body.orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    buyerId: buyerObjectId,
    buyerName: resolvedBuyerName,
    buyerEmail: resolvedBuyerEmail,
    buyerPhone: resolvedBuyerPhone,
    sellerId: primarySellerId,
    sellerName: resolvedSellerName,
    productId: primaryItem.productId || String(primaryItem.listingId || ''),
    productTitle: primaryItem.title || productTitle || title || 'Marketplace Product',
    productImage: primaryItem.image || productImage || image || '',
    items: lineItems,
    subtotal: finalSubtotal,
    taxAmount: finalTaxAmount,
    taxName: finalTaxName,
    taxPercentage: finalTaxPercentage,
    deliveryFee,
    discount: disc,
    totalAmount: finalTotalAmount,
    shippingAddress: finalShippingAddress,
    paymentMode: resolvedPaymentMethod,
    paymentMethod: resolvedPaymentMethod,
    paymentStatus: finalPaymentStatus,
    status: finalStatus,
    trackingStatus: finalTrackingStatus,
    trackingNumber: req.body.trackingNumber || null,
    courierName: req.body.courierName || '',
    estimatedDelivery:
      req.body.estimatedDelivery ||
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
    statusHistory: [
      {
        status: finalTrackingStatus,
        note: `Order placed via ${resolvedPaymentMethod}`,
        courierName: req.body.courierName || '',
        trackingNumber: req.body.trackingNumber || '',
        changedAt: new Date()
      }
    ]
  });

  // 4. Automatically create a corresponding Transaction (Payment) record in MongoDB
  // so it immediately appears in Admin Panel Payments (Transactions.jsx) & Invoices (Invoices.jsx)
  const paymentRecord = await Payment.create({
    transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: buyerObjectId,
    userName: resolvedBuyerName,
    userEmail: resolvedBuyerEmail,
    userPhone: resolvedBuyerPhone,
    sellerId: primarySellerId,
    sellerName: resolvedSellerName,
    orderId: order.orderNumber,
    referenceId: order.orderNumber,
    productTitle: order.productTitle,
    productImage: order.productImage,
    type: 'payment',
    purpose: 'order',
    subtotal: finalSubtotal,
    taxAmount: finalTaxAmount,
    taxName: finalTaxName,
    amount: finalTotalAmount,
    currency: 'INR',
    status: isOrderCancelled ? 'refunded' : 'completed',
    paymentMode: resolvedPaymentMethod,
    method: resolvedPaymentMethod,
    paymentGateway: 'Razorpay'
  });

  // Notify seller if present
  if (primarySellerId) {
    await Notification.create({
      userId: primarySellerId,
      title: 'New Order Received',
      message: `You have received a new order (${order.orderNumber}) for ₹${finalTotalAmount}`,
      type: 'order',
      referenceId: order.orderNumber
    }).catch(() => null);
  }

  res.status(201).json({
    success: true,
    status: true,
    message: 'Order placed and payment recorded successfully',
    data: order,
    order,
    transaction: paymentRecord
  });
});

// ==========================================
// 2. GET ORDERS (BUYER, SELLER, ADMIN)
// ==========================================
export const getOrders = asyncHandler(async (req, res) => {
  const { role, status, trackingStatus, buyerId, sellerId, page = 1, limit = 100 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  const isAdmin = !req.user || ['admin', 'super_admin', 'moderator'].includes(req.user.role) || req.query.all === 'true';

  if (isAdmin) {
    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) query.buyerId = buyerId;
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) query.sellerId = sellerId;
  } else if (role === 'seller') {
    query.sellerId = req.user._id;
  } else if (role === 'buyer' && req.user) {
    query.buyerId = req.user._id;
  }

  const targetStatus = status || trackingStatus;
  if (targetStatus && targetStatus.toLowerCase() !== 'all') {
    const s = targetStatus.toLowerCase();
    if (s === 'pending') {
      query.$or = [
        { status: 'pending' },
        { trackingStatus: { $in: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'pending'] } }
      ];
    } else if (s === 'completed' || s === 'delivered') {
      query.$or = [
        { status: 'completed' },
        { trackingStatus: { $in: ['delivered', 'completed'] } }
      ];
    } else if (s === 'cancelled' || s === 'canceled') {
      query.$or = [
        { status: 'cancelled' },
        { trackingStatus: { $in: ['cancelled', 'canceled', 'returned', 'rejected'] } }
      ];
    } else {
      query.$or = [{ status: s }, { trackingStatus: s }];
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('buyerId', 'fullName email phoneNumber avatarUrl')
      .populate('sellerId', 'fullName email phoneNumber avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    status: true,
    count: orders.length,
    data: orders,
    orders,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

const getOrderQuery = (id) => {
  if (!id) return { _id: null };
  return /^[0-9a-fA-F]{24}$/.test(id) ? { $or: [{ _id: id }, { orderNumber: id }] } : { orderNumber: id };
};

// ==========================================
// 3. GET ORDER BY ID
// ==========================================
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne(getOrderQuery(req.params.id))
    .populate('buyerId', 'fullName email phoneNumber avatarUrl')
    .populate('sellerId', 'fullName email phoneNumber avatarUrl');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  res.status(200).json({
    success: true,
    status: true,
    data: order,
    order
  });
});

// ==========================================
// 4. UPDATE ORDER / TRACKING STATUS
// ==========================================
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const {
    status,
    trackingStatus,
    paymentStatus,
    trackingNumber,
    courierName,
    estimatedDelivery,
    cancellationReason,
    note
  } = req.body;
  const rawNextStatus = status || trackingStatus;

  if (
    !rawNextStatus &&
    !paymentStatus &&
    trackingNumber === undefined &&
    courierName === undefined &&
    estimatedDelivery === undefined
  ) {
    throw ApiError.badRequest('Status or tracking update details are required');
  }

  const order = await Order.findOne(getOrderQuery(req.params.id));
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber;
  }
  if (courierName !== undefined) {
    order.courierName = courierName;
  }
  if (estimatedDelivery !== undefined) {
    order.estimatedDelivery = estimatedDelivery;
  }

  if (rawNextStatus) {
    const lower = String(rawNextStatus).toLowerCase();
    if (['cancelled', 'canceled', 'returned', 'rejected'].includes(lower)) {
      order.status = 'cancelled';
      order.trackingStatus = lower === 'returned' ? 'returned' : 'cancelled';
      order.paymentStatus = 'refunded';
      order.cancellationReason =
        cancellationReason || note || order.cancellationReason || 'Order cancelled';

      // Sync corresponding Payment & Refund records
      const payment = await Payment.findOne({
        $or: [{ orderId: order.orderNumber }, { referenceId: order.orderNumber }]
      });
      if (payment) {
        payment.status = 'refunded';
        payment.refundDetails = {
          ...(payment.refundDetails || {}),
          refundId: payment.refundDetails?.refundId || `REF-${Date.now().toString().slice(-6)}`,
          amount: order.totalAmount,
          reason: order.cancellationReason,
          refundedAt: new Date(),
          customerName: order.buyerName || 'Customer',
          customerEmail: order.buyerEmail || '',
          customerPhone: order.buyerPhone || '',
          bankDetails: payment.refundDetails?.bankDetails || {}
        };
        await payment.save();
      }

      const existingRefund = await Refund.findOne({ orderId: order.orderNumber });
      if (!existingRefund) {
        await Refund.create({
          orderId: order.orderNumber,
          paymentId: payment ? payment._id : null,
          customerId: order.buyerId || null,
          customerName: order.buyerName || 'Customer',
          customerEmail: order.buyerEmail || '',
          customerPhone: order.buyerPhone || '',
          amount: order.totalAmount || 0,
          category: 'Order Cancellation',
          reason: order.cancellationReason,
          status: 'Processed'
        }).catch(() => null);
      }
    } else if (['completed', 'delivered'].includes(lower)) {
      order.status = 'completed';
      order.trackingStatus = 'delivered';
      order.paymentStatus = 'completed';

      // Ensure corresponding Payment is marked completed
      const payment = await Payment.findOne({
        $or: [{ orderId: order.orderNumber }, { referenceId: order.orderNumber }]
      });
      if (payment) {
        payment.status = 'completed';
        await payment.save();
      } else {
        await Payment.create({
          transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: order.buyerId,
          userName: order.buyerName || 'Customer',
          userEmail: order.buyerEmail || '',
          userPhone: order.buyerPhone || '',
          sellerId: order.sellerId,
          sellerName: order.sellerName || 'Verified Seller',
          orderId: order.orderNumber,
          referenceId: order.orderNumber,
          productTitle: order.productTitle || (order.items && order.items[0]?.title) || 'Product Order',
          productImage: order.productImage || (order.items && order.items[0]?.image) || '',
          type: 'payment',
          purpose: 'order',
          subtotal: order.subtotal || order.totalAmount,
          taxAmount: order.taxAmount || 0,
          taxName: order.taxName || 'GST 18%',
          amount: order.totalAmount,
          status: 'completed',
          paymentMode: order.paymentMethod || order.paymentMode || 'UPI',
          method: order.paymentMethod || order.paymentMode || 'UPI'
        });
      }
    } else {
      order.status = 'pending';
      order.trackingStatus = lower === 'pending' ? 'placed' : lower;
    }

    order.statusHistory.push({
      status: order.trackingStatus,
      note:
        note ||
        (order.courierName || order.trackingNumber
          ? `Status updated to ${order.trackingStatus} (${[order.courierName, order.trackingNumber].filter(Boolean).join(' • ')})`
          : `Order status updated to ${order.trackingStatus}`),
      courierName: order.courierName || '',
      trackingNumber: order.trackingNumber || '',
      changedAt: new Date()
    });
  } else if (note || courierName !== undefined || trackingNumber !== undefined) {
    order.statusHistory.push({
      status: order.trackingStatus || 'placed',
      note:
        note ||
        `Tracking details updated (${[order.courierName, order.trackingNumber].filter(Boolean).join(' • ')})`,
      courierName: order.courierName || '',
      trackingNumber: order.trackingNumber || '',
      changedAt: new Date()
    });
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  if (order.buyerId) {
    await Notification.create({
      userId: order.buyerId,
      title: `Order Update: ${(order.trackingStatus || order.status).toUpperCase().replace(/_/g, ' ')}`,
      message: `Your order ${order.orderNumber} is now: ${(order.trackingStatus || order.status).replace(/_/g, ' ')}${order.trackingNumber ? ` (Tracking: ${order.trackingNumber})` : ''}`,
      type: 'order',
      referenceId: order.orderNumber
    }).catch(() => null);
  }

  res.status(200).json({
    success: true,
    status: true,
    message: `Order status updated to ${order.trackingStatus || order.status}`,
    data: order,
    order
  });
});

export const updateTrackingStatus = updateOrderStatus;

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateTrackingStatus,
  updateOrderStatus
};
