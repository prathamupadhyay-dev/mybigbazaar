/**
 * @file apps/api/models/Tax.js
 * @description Model for GST and platform statutory tax slabs
 */

import mongoose from 'mongoose';

const TaxSchema = new mongoose.Schema(
  {
    taxName: {
      type: String,
      required: [true, 'Tax name is required'],
      trim: true
    },
    taxPercentage: {
      type: Number,
      required: [true, 'Tax percentage is required'],
      min: [0, 'Tax percentage cannot be negative'],
      max: [100, 'Tax percentage cannot exceed 100']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'tax' // Maps to existing MongoDB Atlas collection
  }
);

export const Tax = mongoose.model('Tax', TaxSchema);
export default Tax;
