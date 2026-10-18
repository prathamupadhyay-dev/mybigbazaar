/**
 * @file apps/api/models/AuditLog.js
 * @description Administrative and security event audit trail
 */

import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'AuditLog'
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
