/**
 * @file apps/mobile/src/screens/orders/orderStore.js
 * @description Persistent order management & live 6-stage shipment tracking service
 * syncing in real time with /api/v1/orders and /api/v1/reviews endpoints.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPost, apiPut } from '../../services/apiClient';

const ORDERS_STORAGE_KEY = '@mybigbazaar_orders';

let cachedOrders = null;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener(cachedOrders);
    } catch (e) {
      console.warn('Listener error in orderStore', e);
    }
  });
};

export const TRACKING_STAGE_DEFINITIONS = [
  {
    key: 'placed',
    step: 1,
    title: 'Order Placed',
    defaultPendingTime: 'Awaiting placement',
    defaultCompletedNote: 'Order received & payment verified'
  },
  {
    key: 'confirmed',
    step: 2,
    title: 'Order Confirmed',
    defaultPendingTime: 'Pending seller confirmation',
    defaultCompletedNote: 'Seller confirmed order & inventory'
  },
  {
    key: 'processing',
    step: 3,
    title: 'Packed & Processing',
    defaultPendingTime: 'Pending quality check & packing',
    defaultCompletedNote: 'Item packed & ready for courier pickup'
  },
  {
    key: 'shipped',
    step: 4,
    title: 'Shipped / In-Transit',
    defaultPendingTime: 'Pending courier dispatch',
    defaultCompletedNote: 'Dispatched via express courier'
  },
  {
    key: 'out_for_delivery',
    step: 5,
    title: 'Out for Delivery',
    defaultPendingTime: 'Pending local hub arrival',
    defaultCompletedNote: 'Out for doorstep delivery with local agent'
  },
  {
    key: 'delivered',
    step: 6,
    title: 'Delivered & Completed',
    defaultPendingTime: 'Pending doorstep handover',
    defaultCompletedNote: 'Delivered & verified by buyer'
  }
];

export const getTrackingStepNumber = (rawTracking, rawStatus) => {
  const s = String(rawStatus || '').toLowerCase();
  const t = String(rawTracking || '').toLowerCase();
  if (['cancelled', 'canceled', 'returned', 'rejected'].includes(s) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(t)) {
    return 0;
  }
  if (['completed', 'delivered'].includes(s) || ['completed', 'delivered'].includes(t)) {
    return 6;
  }
  if (t === 'out_for_delivery') return 5;
  if (t === 'shipped') return 4;
  if (t === 'processing') return 3;
  if (t === 'confirmed') return 2;
  return 1;
};

const normalizeOrderStatus = (rawStatus, rawTracking) => {
  const s = String(rawStatus || '').toLowerCase();
  const t = String(rawTracking || '').toLowerCase();
  if (['cancelled', 'canceled', 'returned', 'rejected'].includes(s) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(t)) {
    return 'cancelled';
  }
  if (['completed', 'delivered'].includes(s) || ['completed', 'delivered'].includes(t)) {
    return 'completed';
  }
  return 'pending';
};

/**
 * Dynamically builds the 6-stage tracking timeline from backend order state & statusHistory
 */
export const buildDynamicTrackingTimeline = (o) => {
  const normalizedStatus = normalizeOrderStatus(o.status, o.trackingStatus);
  const rawTrack = String(
    o.trackingStatus ||
      (normalizedStatus === 'completed'
        ? 'delivered'
        : normalizedStatus === 'cancelled'
        ? 'cancelled'
        : 'placed')
  ).toLowerCase();

  const currentStep = getTrackingStepNumber(rawTrack, normalizedStatus);
  const historyList = Array.isArray(o.statusHistory) ? o.statusHistory : [];
  const createdTimeStr = o.createdAt
    ? new Date(o.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : o.orderDate || 'Recently';
  const estDelivery = o.estimatedDelivery || '3-4 business days';

  // Find matching history entry for a stage key
  const findHistoryEntry = (stageKey) => {
    for (let i = historyList.length - 1; i >= 0; i--) {
      const h = historyList[i];
      const hs = String(h?.status || '').toLowerCase();
      if (hs === stageKey) return h;
      if (stageKey === 'placed' && hs === 'pending') return h;
      if (stageKey === 'delivered' && hs === 'completed') return h;
    }
    return null;
  };

  if (normalizedStatus === 'cancelled') {
    const cancelEntry =
      findHistoryEntry('cancelled') ||
      findHistoryEntry('returned') ||
      historyList[historyList.length - 1];
    const placedEntry = findHistoryEntry('placed') || historyList[0];

    return [
      {
        status: 'placed',
        step: 1,
        title: 'Order Placed',
        time: placedEntry?.changedAt
          ? new Date(placedEntry.changedAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          : createdTimeStr,
        completed: true,
        active: false,
        note: placedEntry?.note || `Paid via ${o.paymentMethod || o.paymentMode || 'UPI'}`
      },
      {
        status: 'cancelled',
        step: 0,
        title: rawTrack === 'returned' ? 'Order Returned & Refunded' : 'Order Cancelled & Refund Initiated',
        time: cancelEntry?.changedAt
          ? new Date(cancelEntry.changedAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Updated recently',
        completed: true,
        active: true,
        isCancelled: true,
        note:
          o.cancellationReason ||
          cancelEntry?.note ||
          'Order cancelled and refund processed to original payment method'
      }
    ];
  }

  return TRACKING_STAGE_DEFINITIONS.map((def) => {
    const isCompleted = currentStep >= def.step;
    const isCurrent = currentStep === def.step;
    const matchedHistory = findHistoryEntry(def.key);

    let timeLabel = def.defaultPendingTime;
    if (def.key === 'delivered' && !isCompleted) {
      timeLabel = `Expected by ${estDelivery}`;
    }
    if (isCompleted) {
      if (matchedHistory?.changedAt) {
        timeLabel = new Date(matchedHistory.changedAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (def.step === 1) {
        timeLabel = createdTimeStr;
      } else {
        timeLabel = 'Completed';
      }
    }

    let noteText = matchedHistory?.note || (isCompleted ? def.defaultCompletedNote : '');
    if (
      (def.key === 'shipped' || def.key === 'out_for_delivery') &&
      isCompleted &&
      (o.courierName || o.trackingNumber)
    ) {
      const courierTag = [o.courierName, o.trackingNumber ? `AWB: ${o.trackingNumber}` : '']
        .filter(Boolean)
        .join(' • ');
      if (courierTag && !noteText.includes(o.trackingNumber || o.courierName)) {
        noteText = `${noteText ? `${noteText} — ` : ''}${courierTag}`;
      }
    }

    return {
      status: def.key,
      step: def.step,
      title: def.title,
      time: timeLabel,
      completed: isCompleted,
      active: isCurrent,
      note: noteText
    };
  });
};

const mapBackendOrder = (o) => {
  const normalizedStatus = normalizeOrderStatus(o.status, o.trackingStatus);
  const rawTrack = String(
    o.trackingStatus ||
      (normalizedStatus === 'completed'
        ? 'delivered'
        : normalizedStatus === 'cancelled'
        ? 'cancelled'
        : 'placed')
  ).toLowerCase();
  const trackingStatus = rawTrack === 'pending' ? 'placed' : rawTrack;
  const currentStep = getTrackingStepNumber(trackingStatus, normalizedStatus);

  const rawItems =
    Array.isArray(o.items) && o.items.length > 0
      ? o.items.map((it) => ({
          id: it.listingId || it.productId || it._id || it.id,
          title: it.title || o.productTitle || o.title || 'Marketplace Item',
          price: Number(it.price ?? o.price ?? o.totalAmount ?? 0),
          quantity: Number(it.quantity) || 1,
          image: it.image || o.productImage || o.image || ''
        }))
      : [
          {
            id: o.productId || o._id || o.id,
            title: o.productTitle || o.title || 'Marketplace Item',
            price: Number(o.price ?? o.subtotal ?? o.totalAmount ?? 0),
            quantity: 1,
            image: o.productImage || o.image || ''
          }
        ];

  const subtotal = Number(o.subtotal ?? o.price ?? o.pricing?.subtotal ?? o.totalAmount ?? 0);
  const taxAmount = Number(o.taxAmount ?? o.tax ?? o.pricing?.tax ?? 0);
  const deliveryFee = Number(o.deliveryFee ?? o.pricing?.deliveryFee ?? 0);
  const discount = Number(o.discount ?? o.pricing?.discount ?? 0);
  const totalAmount = Number(
    o.totalAmount ?? o.pricing?.totalAmount ?? subtotal + taxAmount + deliveryFee - discount
  );

  return {
    id: o._id || o.id,
    _id: o._id || o.id,
    orderNumber:
      o.orderNumber || `ORD-${String(o._id || o.id || Date.now()).slice(-6).toUpperCase()}`,
    orderDate: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : o.orderDate || 'Today',
    updatedAt: o.updatedAt || o.createdAt || new Date().toISOString(),
    estimatedDelivery: o.estimatedDelivery || '3-4 business days',
    status: normalizedStatus,
    trackingStatus,
    currentStep,
    courierName: o.courierName || '',
    trackingNumber: o.trackingNumber || '',
    cancellationReason: o.cancellationReason || '',
    paymentMode: o.paymentMethod || o.paymentMode || 'UPI',
    paymentMethod: o.paymentMethod || o.paymentMode || 'UPI',
    paymentStatus: o.paymentStatus || 'paid',
    transactionId:
      o.transactionId || o.orderNumber || `TXN-${String(o._id || Date.now()).slice(-8)}`,
    buyerName: o.buyerName || o.shippingAddress?.fullName || 'Verified Buyer',
    buyerPhone: o.buyerPhone || o.shippingAddress?.phone || '',
    sellerName: o.sellerName || 'Verified Seller',
    productId: o.productId || rawItems[0]?.id || '',
    title: o.productTitle || o.title || rawItems[0]?.title || 'Marketplace Item',
    price: subtotal,
    taxAmount,
    totalAmount,
    shippingAddress: o.shippingAddress || {
      type: 'Home',
      fullName: o.buyerName || 'Verified Buyer',
      phone: o.buyerPhone || '',
      houseNo: '',
      street: typeof o.shippingAddress === 'string' ? o.shippingAddress : 'Indore',
      city: 'Indore',
      pincode: '452010'
    },
    items: rawItems,
    pricing: {
      subtotal,
      deliveryFee,
      discount,
      tax: taxAmount,
      totalAmount
    },
    userReview: o.userReview || null,
    statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory : [],
    trackingHistory: buildDynamicTrackingTimeline(o)
  };
};

/**
 * Loads orders from storage and live backend API (/api/v1/orders)
 */
export const getOrders = async () => {
  if (!cachedOrders) {
    try {
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        cachedOrders = Array.isArray(parsed) ? parsed.map(mapBackendOrder) : [];
      } else {
        cachedOrders = [];
      }
    } catch (_error) {
      cachedOrders = [];
    }
  }

  try {
    const res = await apiGet('/api/v1/orders').catch(() => apiGet('/orders'));
    const orderList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.orders)
      ? res.orders
      : Array.isArray(res)
      ? res
      : null;

    if (Array.isArray(orderList)) {
      const liveOrders = orderList.map(mapBackendOrder);
      const map = new Map();
      liveOrders.forEach((o) => {
        const key = o.orderNumber || o.id;
        const existing = (cachedOrders || []).find(
          (c) => c.orderNumber === o.orderNumber || c.id === o.id
        );
        map.set(key, {
          ...o,
          userReview: o.userReview || existing?.userReview || null
        });
      });
      cachedOrders = Array.from(map.values());
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
      notifyListeners();
    }
  } catch (_err) {
    // Graceful offline tolerance
  }

  return cachedOrders || [];
};

/**
 * Fetches latest live tracking details for a single order from /api/v1/orders/:id
 */
export const refreshOrderTracking = async (orderId) => {
  if (!orderId) return null;
  try {
    const res = await apiGet(`/api/v1/orders/${orderId}`);
    const rawOrder = res?.data || res?.order || null;
    if (rawOrder) {
      const mapped = mapBackendOrder(rawOrder);
      cachedOrders = (cachedOrders || []).map((o) => {
        if (o.id === orderId || o._id === orderId || o.orderNumber === orderId || o.orderNumber === mapped.orderNumber) {
          return {
            ...mapped,
            userReview: mapped.userReview || o.userReview || null
          };
        }
        return o;
      });
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
      notifyListeners();
      return mapped;
    }
  } catch (_err) {
    // Fallback to full list refresh
  }
  const all = await getOrders();
  return all.find((o) => o.id === orderId || o._id === orderId || o.orderNumber === orderId) || null;
};

/**
 * Places a new order and posts to /api/v1/orders (and /orders)
 */
export const placeOrder = async ({
  items = [],
  shippingAddress,
  paymentMode = 'UPI',
  pricing = {},
  orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
  buyerName,
  buyerPhone,
  sellerName,
  productId,
  title,
  price,
  taxAmount,
  totalAmount
}) => {
  const currentOrders = await getOrders();
  const now = new Date();
  const deliveryDateObj = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const deliveryFormatted = deliveryDateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const primaryItem = items[0] || {};
  const resolvedProductId = productId || primaryItem.id || primaryItem._id || '';
  const resolvedTitle = title || primaryItem.title || primaryItem.serviceName || 'Marketplace Item';
  const resolvedPrice = Number(price ?? pricing.subtotal ?? primaryItem.price ?? 0);
  const resolvedTax = Number(taxAmount ?? pricing.tax ?? 0);
  const resolvedTotal = Number(
    totalAmount ?? pricing.totalAmount ?? resolvedPrice + resolvedTax + Number(pricing.deliveryFee || 0)
  );
  const resolvedBuyerName = buyerName || shippingAddress?.fullName || 'Verified Buyer';
  const resolvedBuyerPhone = buyerPhone || shippingAddress?.phone || '';
  const resolvedSellerName = sellerName || primaryItem.sellerName || 'Verified Seller';

  const backendPayload = {
    orderNumber,
    productId: resolvedProductId,
    title: resolvedTitle,
    price: resolvedPrice,
    subtotal: resolvedPrice,
    taxAmount: resolvedTax,
    deliveryFee: Number(pricing.deliveryFee || 0),
    discount: Number(pricing.discount || 0),
    totalAmount: resolvedTotal,
    paymentMethod: paymentMode,
    paymentMode,
    paymentStatus: 'paid',
    status: 'pending',
    trackingStatus: 'placed',
    estimatedDelivery: deliveryFormatted,
    buyerName: resolvedBuyerName,
    buyerPhone: resolvedBuyerPhone,
    sellerName: resolvedSellerName,
    shippingAddress,
    items: items.map((it) => ({
      listingId: /^[0-9a-fA-F]{24}$/.test(String(it.id || '')) ? it.id : undefined,
      productId: it.id,
      title: it.title || resolvedTitle,
      price: Number(it.price || resolvedPrice),
      quantity: Number(it.quantity) || 1,
      image: it.image || ''
    })),
    pricing: {
      subtotal: resolvedPrice,
      discount: Number(pricing.discount || 0),
      deliveryFee: Number(pricing.deliveryFee || 0),
      tax: resolvedTax,
      totalAmount: resolvedTotal
    }
  };

  let createdBackendOrder = null;
  try {
    const res = await apiPost('/api/v1/orders', backendPayload).catch(() =>
      apiPost('/orders', backendPayload)
    );
    createdBackendOrder = res?.data || res?.order || null;
  } catch (err) {
    console.log('[orderStore] Live order sync notice:', err?.message);
  }

  const newOrder = mapBackendOrder(
    createdBackendOrder || {
      ...backendPayload,
      _id: `ord-${Date.now()}`,
      createdAt: now.toISOString(),
      statusHistory: [
        {
          status: 'placed',
          note: `Order placed via ${paymentMode}`,
          changedAt: now.toISOString()
        }
      ]
    }
  );

  cachedOrders = [newOrder, ...currentOrders];
  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
  notifyListeners();

  return newOrder;
};

/**
 * Update an order's status (e.g. 'completed' or 'cancelled') and sync with PUT /api/v1/orders/:id
 */
export const updateOrderStatus = async (orderId, nextStatus, note = '') => {
  const currentOrders = await getOrders();
  const normalized = normalizeOrderStatus(nextStatus, nextStatus);
  const trackingStatus =
    normalized === 'completed'
      ? 'delivered'
      : normalized === 'cancelled'
      ? 'cancelled'
      : nextStatus || 'placed';

  let targetOrder = null;
  cachedOrders = currentOrders.map((order) => {
    if (order.id === orderId || order._id === orderId || order.orderNumber === orderId) {
      targetOrder = order;
      const nextHistory = [
        ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
        {
          status: trackingStatus,
          note:
            note ||
            (normalized === 'completed'
              ? 'Order received & confirmed by buyer'
              : normalized === 'cancelled'
              ? 'Cancelled by buyer'
              : `Order updated to ${trackingStatus}`),
          changedAt: new Date().toISOString()
        }
      ];
      return mapBackendOrder({
        ...order,
        status: normalized,
        trackingStatus,
        cancellationReason: normalized === 'cancelled' ? note || 'Cancelled by buyer' : order.cancellationReason,
        paymentStatus:
          normalized === 'cancelled' && order.paymentStatus === 'paid'
            ? 'refunded'
            : normalized === 'completed'
            ? 'completed'
            : order.paymentStatus,
        statusHistory: nextHistory
      });
    }
    return order;
  });

  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
  notifyListeners();

  const backendId = targetOrder?._id || targetOrder?.id || orderId;
  try {
    await apiPut(`/api/v1/orders/${backendId}`, {
      status: normalized,
      trackingStatus,
      cancellationReason: normalized === 'cancelled' ? note : undefined,
      note
    }).catch(() => {});
  } catch (_e) {}

  return true;
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId, reason = 'Cancelled by buyer') => {
  return updateOrderStatus(orderId, 'cancelled', reason);
};

/**
 * Mark an order as received / completed
 */
export const completeOrder = async (orderId, note = 'Order received & confirmed by buyer') => {
  return updateOrderStatus(orderId, 'completed', note);
};

/**
 * Submit a buyer Rating & Review for an order to POST /api/v1/reviews
 */
export const submitOrderReview = async (
  orderId,
  { targetId, targetName, targetType = 'product', rating = 5, reviewText = '', reviewerName = 'Verified Buyer' }
) => {
  const payload = {
    targetType,
    targetId: /^[0-9a-fA-F]{24}$/.test(String(targetId || '')) ? targetId : undefined,
    targetName: targetName || 'Marketplace Product',
    reviewerName: reviewerName || 'Verified Buyer',
    rating: Number(rating) || 5,
    reviewText: reviewText.trim() || 'Great product and smooth delivery!',
    status: 'published'
  };

  let createdReview = null;
  try {
    const res = await apiPost('/api/v1/reviews', payload).catch(() =>
      apiPost('/reviews', payload)
    );
    createdReview = res?.data || res?.review || payload;
  } catch (err) {
    console.log('[orderStore] Review submission notice:', err?.message);
    createdReview = payload;
  }

  const currentOrders = await getOrders();
  cachedOrders = currentOrders.map((o) => {
    if (o.id === orderId || o._id === orderId || o.orderNumber === orderId) {
      return {
        ...o,
        userReview: {
          rating: Number(rating) || 5,
          reviewText: payload.reviewText,
          reviewerName: payload.reviewerName,
          createdAt: new Date().toISOString()
        }
      };
    }
    return o;
  });

  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
  notifyListeners();

  return createdReview;
};

/**
 * Subscribe to order store changes
 */
export const subscribeOrders = (callback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
