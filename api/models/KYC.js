/**
 * @file apps/api/models/KYC.js
 * @description Dedicated KYC verification application model for providers, sellers, and platform partners
 */

import mongoose from 'mongoose';

const DocumentItemSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true },
    docNumber: { type: String, default: '' },
    docUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const KYCSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    partnerName: {
      type: String,
      required: [true, 'Partner/Applicant name is required'],
      trim: true
    },
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    city: {
      type: String,
      trim: true,
      default: 'Indore'
    },
    applicantType: {
      type: String,
      enum: ['provider', 'seller', 'buyer', 'partner'],
      default: 'provider'
    },
    docType: {
      type: String,
      default: 'Trade License'
    },
    docNumber: {
      type: String,
      default: ''
    },
    docUrl: {
      type: String,
      default: ''
    },
    documents: [DocumentItemSchema],
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected', 'unverified'],
      default: 'pending_verification',
      index: true
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'kycs'
  }
);

export const KYC = mongoose.model('KYC', KYCSchema);
export default KYC;
