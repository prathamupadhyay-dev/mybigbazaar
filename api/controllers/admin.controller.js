/**
 * @file apps/api/controllers/admin.controller.js
 * @description Administrative operations, analytics dashboard, and user management
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Report from '../models/Report.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { Roles, KycStatus, ReportStatus, PaymentStatus } from '../config/constants.js';

// ==========================================
// 1. DASHBOARD ANALYTICS OVERVIEW
// ==========================================
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalListings,
    totalBookings,
    totalOrders,
    pendingKyc,
    pendingReports,
    revenueAgg
  ] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Booking.countDocuments(),
    Order.countDocuments(),
    ProviderProfile.countDocuments({ kycStatus: KycStatus.PENDING }),
    Report.countDocuments({ status: ReportStatus.PENDING }),
    Payment.aggregate([
      { $match: { status: { $in: [PaymentStatus.SUCCESS, 'completed', 'paid'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ])
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // Breakdown by roles
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        totalListings,
        totalBookings,
        totalOrders,
        totalRevenue,
        pendingKyc,
        pendingReports
      },
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    }
  });
});

// ==========================================
// 2. GET ALL USERS (ADMIN)
// ==========================================
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, q, page = 1, limit = 200 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (role) query.role = role.toLowerCase();
  if (status) query.status = status;
  if (q && q.trim()) {
    query.$or = [
      { fullName: new RegExp(q.trim(), 'i') },
      { email: new RegExp(q.trim(), 'i') },
      { phoneNumber: new RegExp(q.trim(), 'i') },
      { username: new RegExp(q.trim(), 'i') }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -otp -otpExpiresAt -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: users,
    users,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// ==========================================
// 3. GET USER BY ID (ADMIN)
// ==========================================
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password -otp -otpExpiresAt -passwordResetToken -passwordResetExpires'
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Fetch user's listings and bookings count
  const [listingCount, bookingCount] = await Promise.all([
    Listing.countDocuments({ sellerId: user._id }),
    Booking.countDocuments({ customerId: user._id })
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...user.toJSON(),
      activity: {
        listingCount,
        bookingCount
      }
    }
  });
});

// ==========================================
// 4. CREATE USER (ADMIN)
// ==========================================
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, name, email, phoneNumber, phone, password, role, status, userTypes, walletBalance } = req.body;
  const targetName = fullName || name;
  const rawPhone = phoneNumber || phone;
  const targetPhone = rawPhone && String(rawPhone).trim().length > 0 ? String(rawPhone).trim() : undefined;
  const targetEmail = email ? email.toLowerCase().trim() : '';

  if (!targetName || !targetEmail) {
    throw ApiError.badRequest('Full name and email are required');
  }

  const existing = await User.findOne({ email: targetEmail });
  if (existing) {
    throw ApiError.conflict('User with this email already exists');
  }

  if (targetPhone) {
    const existingPhone = await User.findOne({ phoneNumber: targetPhone });
    if (existingPhone) {
      throw ApiError.conflict('User with this phone number already exists');
    }
  }

  let assignedRole = (role || Roles.BUYER).toString().trim().toLowerCase();
  if (assignedRole === 'user') assignedRole = Roles.BUYER;
  const assignedTypes = Array.isArray(userTypes) && userTypes.length > 0 ? userTypes : [assignedRole];

  const parsedWallet = Number(walletBalance);
  const initialWallet = !isNaN(parsedWallet) && parsedWallet >= 0 ? parsedWallet : 0;

  const newUser = new User({
    fullName: targetName,
    email: targetEmail,
    phoneNumber: targetPhone,
    password: password || 'BigBazaar@2026',
    role: assignedRole,
    userTypes: assignedTypes,
    status: (status || 'active').toLowerCase(),
    walletBalance: initialWallet,
    isEmailVerified: true
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: 'User account created successfully',
    data: newUser.toJSON()
  });
});

// ==========================================
// 5. UPDATE USER ROLE / STATUS / DETAILS
// ==========================================
export const updateUserRole = asyncHandler(async (req, res) => {
  const { fullName, name, email, phoneNumber, phone, password, role, status, userTypes, walletBalance } = req.body;
  const targetId = req.params.id;
  let user = mongoose.isValidObjectId(targetId) ? await User.findById(targetId) : null;
  if (!user) {
    user = await User.findOne({ $or: [{ email: targetId }, { phoneNumber: targetId }] });
  }

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (fullName || name) user.fullName = (fullName || name).trim();
  if (email) user.email = email.toLowerCase().trim();
  if (phoneNumber || phone) user.phoneNumber = (phoneNumber || phone).trim();
  if (password && password.trim().length >= 6) user.password = password.trim();

  if (role) {
    let targetRole = role.toString().trim().toLowerCase();
    if (targetRole === 'user') targetRole = Roles.BUYER;
    user.role = targetRole;
    if (!Array.isArray(userTypes)) user.userTypes = [targetRole];
  }

  if (status) user.status = status.toLowerCase();
  if (Array.isArray(userTypes)) user.userTypes = userTypes;

  if (walletBalance !== undefined && walletBalance !== null) {
    const parsedWallet = Number(walletBalance);
    if (!isNaN(parsedWallet) && parsedWallet >= 0) {
      user.walletBalance = parsedWallet;
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User account updated successfully',
    data: user.toJSON()
  });
});

// ==========================================
// 5. DELETE USER
// ==========================================
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent deleting oneself
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('Cannot delete your own administrative account');
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User account deleted successfully'
  });
});

// ==========================================
// 6. ANALYTICS & OPERATIONAL REPORTS (DYNAMIC DB AGGREGATIONS)
// ==========================================
export const getAdminReport = asyncHandler(async (req, res) => {
  const { type = 'sales' } = req.params;
  const reportType = type.toLowerCase();

  if (reportType === 'sales') {
    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      trackingStatus: { $ne: 'cancelled' }
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    const grossSales = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(grossSales / totalOrders) : 0;
    const commissionEarned = Math.round(grossSales * 0.08);
    const netSales = Math.max(0, grossSales - commissionEarned);

    const dailyMap = {};
    const productMap = {};
    for (const o of orders) {
      const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, orders: 0, units: 0, grossSales: 0, discounts: 0, refunds: 0, netSales: 0, aov: 0 };
      }
      const amt = Number(o.totalAmount) || 0;
      dailyMap[dateStr].orders += 1;
      dailyMap[dateStr].units += Number(o.quantity) || 1;
      dailyMap[dateStr].grossSales += amt;
      dailyMap[dateStr].netSales += Math.round(amt * 0.92);
      dailyMap[dateStr].aov = Math.round(dailyMap[dateStr].grossSales / dailyMap[dateStr].orders);

      const title = o.productTitle || o.items?.[0]?.title || 'Marketplace Order';
      if (!productMap[title]) {
        productMap[title] = { name: title, category: 'Marketplace', unitsSold: 0, revenue: 0, grossRevenue: 0, netRevenue: 0, returnRate: '0%', avgPrice: 0 };
      }
      productMap[title].unitsSold += Number(o.quantity) || 1;
      productMap[title].revenue += amt;
      productMap[title].grossRevenue = productMap[title].revenue;
      productMap[title].netRevenue = Math.round(productMap[title].revenue * 0.92);
      productMap[title].avgPrice = Math.round(productMap[title].revenue / productMap[title].unitsSold);
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          grossSales,
          netSales,
          totalOrders,
          avgOrderValue,
          commissionEarned,
          marginPercent: totalOrders > 0 ? 8.0 : 0
        },
        categories: [],
        topProducts: Object.values(productMap).slice(0, 10),
        dailyBreakdown: Object.values(dailyMap)
      }
    });
  } else if (reportType === 'daily') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayOrders, todayUsers, todayListings, completedOrdersToday, pendingShipmentsCount] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Listing.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({
        createdAt: { $gte: startOfToday },
        $or: [{ status: 'completed' }, { trackingStatus: { $in: ['delivered', 'completed'] } }]
      }),
      Order.countDocuments({
        $or: [{ status: 'pending' }, { trackingStatus: { $in: ['placed', 'processing', 'shipped', 'pending'] } }]
      })
    ]);

    const dayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const conversionRate = todayUsers > 0 && todayOrders.length > 0
      ? `${((todayOrders.length / todayUsers) * 100).toFixed(1)}%`
      : '0.0%';

    res.status(200).json({
      success: true,
      data: {
        today: {
          date: new Date().toISOString().split('T')[0],
          dayOrders: todayOrders.length,
          dayRevenue,
          daySignups: todayUsers,
          dayListings: todayListings,
          conversionRate,
          pendingShipments: pendingShipmentsCount,
          completedToday: completedOrdersToday
        },
        hourlyDistribution: [],
        history: []
      }
    });
  } else if (reportType === 'customers' || reportType === 'customer') {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [totalUsers, uniqueBuyers, newThisMonth] = await Promise.all([
      User.countDocuments(),
      Order.distinct('buyerId'),
      User.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    const activeBuyers = uniqueBuyers.length;
    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      trackingStatus: { $ne: 'cancelled' }
    }).limit(500);
    const grossSales = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const avgLtv = totalUsers > 0 && grossSales > 0 ? Math.round(grossSales / totalUsers) : 0;
    const repeatRate = activeBuyers > 0 && orders.length > activeBuyers
      ? `${(((orders.length - activeBuyers) / orders.length) * 100).toFixed(1)}%`
      : '0.0%';

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalCustomers: totalUsers,
          activeBuyers,
          eliteMembers: 0,
          repeatPurchaseRate: repeatRate,
          avgLtv,
          newThisMonth
        },
        tierBreakdown: [],
        topCustomers: [],
        cityDistribution: []
      }
    });
  } else if (reportType === 'payments' || reportType === 'payment') {
    const [payments, refundDocs] = await Promise.all([
      Payment.find().sort({ createdAt: -1 }).limit(500).lean(),
      Payment.find({ $or: [{ status: 'refunded' }, { 'refundDetails.amount': { $gt: 0 } }] }).lean()
    ]);

    const completedPayments = payments.filter(p => p.status === 'completed' || p.status === 'success' || p.status === 'paid');
    const totalVolume = completedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const refundsTotal = refundDocs.reduce((sum, p) => sum + (Number(p.refundDetails?.amount || p.amount) || 0), 0);
    const escrowHeld = payments.filter(p => p.status === 'pending' || p.status === 'escrow_held');
    const escrowBalance = escrowHeld.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const successRate = payments.length > 0
      ? `${((completedPayments.length / payments.length) * 100).toFixed(1)}%`
      : '100%';

    const txRows = payments.slice(0, 50).map((p, idx) => {
      const amt = Number(p.amount) || 0;
      const fee = Math.round(amt * 0.02);
      const dateStr = p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return {
        id: p.razorpayPaymentId || p.gatewayTransactionId || `TXN-${String(p._id).slice(-6).toUpperCase() || idx + 1}`,
        orderId: p.orderId || p.referenceId || 'ORD-LIVE',
        orderRef: p.orderId || p.referenceId || 'ORD-LIVE',
        customer: p.userName || 'Verified Buyer',
        seller: p.sellerName || 'Verified Seller',
        amount: amt,
        fee,
        net: Math.max(0, amt - fee),
        taxAmount: Number(p.taxAmount) || 0,
        mode: p.method || 'UPI',
        status: p.status === 'completed' || p.status === 'success' || p.status === 'paid' ? 'Settled' : (p.status || 'Pending'),
        date: dateStr,
        timestamp: dateStr
      };
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalProcessedVolume: totalVolume,
          successRate,
          escrowBalance,
          refundsProcessed: refundsTotal,
          gatewayFeeTotal: Math.round(totalVolume * 0.02),
          disputeRate: '0.0%'
        },
        rails: [],
        transactions: txRows
      }
    });
  } else {
    res.status(200).json({
      success: true,
      message: 'Report processed'
    });
  }
});

export default {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminReport
};
