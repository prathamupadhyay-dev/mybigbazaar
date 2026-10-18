/**
 * @file apps/api/models/Notification.js
 * @description In-app user notifications and system alerts
 */

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['booking', 'order', 'offer', 'chat', 'system', 'moderation'],
      default: 'system'
    },
    referenceId: {
      type: String,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'Notification'
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
