/**
 * @file apps/api/models/ProviderProfile.js
 * @description Provider business profile, KYC verification, and availability state
 */

import mongoose from 'mongoose';
import { KycStatus } from '../config/constants.js';

const KycDocumentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Trade License', 'Driving License', 'Passport', 'Other'],
    required: true
  },
  docNumber: { type: String, trim: true },
  docUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date, default: null }
}, { _id: true });

const ProviderProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    },
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory'
      }
    ],
    serviceAreas: {
      type: [String],
      default: []
    },
    kycStatus: {
      type: String,
      enum: Object.values(KycStatus),
      default: KycStatus.UNVERIFIED,
      index: true
    },
    kycDocuments: [KycDocumentSchema],
    rejectionReason: {
      type: String,
      default: null
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      daysAvailable: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'ProviderProfile'
  }
);

export const ProviderProfile = mongoose.model('ProviderProfile', ProviderProfileSchema);
export default ProviderProfile;
