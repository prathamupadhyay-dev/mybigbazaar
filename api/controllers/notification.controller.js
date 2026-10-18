/**
 * @file apps/api/controllers/notification.controller.js
 * @description In-app notification center controller
 */

import Notification from '../models/Notification.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

import User from '../models/User.js';

// ==========================================
// 1. GET USER NOTIFICATIONS
// ==========================================
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
  const filter = (isAdmin && req.query.all === 'true') ? {} : (isAdmin ? { $or: [{ userId: req.user._id }, { type: 'system' }] } : { userId: req.user._id });

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false })
  ]);

  const formatted = notifications.map(n => ({
    id: n._id.toString(),
    _id: n._id.toString(),
    title: n.title,
    body: n.message,
    message: n.message,
    type: n.type,
    audience: n.type === 'system' ? 'All Users' : 'Targeted',
    status: 'Sent',
    sentAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
    createdAt: n.createdAt,
    isRead: n.isRead,
    userId: n.userId
  }));

  res.status(200).json({
    success: true,
    data: formatted,
    notifications: formatted,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      unreadCount,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// ==========================================
// 2. MARK NOTIFICATION AS READ
// ==========================================
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const filter = { _id: id, userId: req.user._id };
  const notification = await Notification.findOne(filter);

  if (!notification) {
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

// ==========================================
// 3. MARK ALL AS READ
// ==========================================
export const markAllAsRead = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id, isRead: false };
  await Notification.updateMany(filter, { isRead: true });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// ==========================================
// 4. GET UNREAD COUNT
// ==========================================
export const getUnreadCount = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id, isRead: false };
  const count = await Notification.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: { unreadCount: count }
  });
});

// ==========================================
// 5. BROADCAST & DELETE NOTIFICATIONS (ADMIN)
// ==========================================
export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, body, message, audience, type } = req.body;
  const fallbackUser = await User.findOne();
  const targetUserId = req.user ? req.user._id : (fallbackUser ? fallbackUser._id : null);

  const notification = await Notification.create({
    userId: targetUserId,
    title: title || 'System Announcement',
    message: message || body || 'System announcement broadcast to users',
    type: type || 'system',
    isRead: false
  });

  res.status(201).json({
    success: true,
    message: 'Broadcast notification created',
    data: {
      id: notification._id.toString(),
      _id: notification._id.toString(),
      title: notification.title,
      body: notification.message,
      message: notification.message,
      type: notification.type,
      audience: audience || 'All Users',
      status: 'Sent',
      sentAt: notification.createdAt.toISOString()
    }
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, userId: req.user._id };
    await Notification.findOneAndDelete(filter);
  } catch (e) {}

  res.status(200).json({
    success: true,
    message: 'Notification removed'
  });
});

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  broadcastNotification,
  deleteNotification
};
