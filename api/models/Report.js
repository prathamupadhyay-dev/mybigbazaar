/**
 * @file apps/api/models/Report.js
 * @description Moderation flags, abuse reports, and case management
 */

import mongoose from 'mongoose';
import { ReportStatus } from '../config/constants.js';

const ReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true
    },
    reporterName: {
      type: String,
      default: 'Anonymous'
    },
    targetType: {
      type: String,
      default: 'listing',
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    targetTitle: {
      type: String,
      default: ''
    },
    targetUser: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    severity: {
      type: String,
      default: 'medium'
    },
    status: {
      type: String,
      default: 'pending',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'Report'
  }
);

ReportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', ReportSchema);
export default Report;
