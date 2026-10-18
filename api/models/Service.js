/**
 * @file apps/api/models/Service.js
 * @description Hyperlocal service catalogue and provider ad model
 */

import mongoose from 'mongoose';

const ServicePackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, default: '1 hour' },
  description: { type: String, default: '' },
  features: { type: [String], default: [] },
  isPopular: { type: Boolean, default: false }
}, { _id: true });

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider reference is required'],
      index: true
    },
    providerName: {
      type: String,
      default: ''
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      index: true
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceSubCategory',
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      default: ''
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price must be positive'],
      index: true
    },
    packages: [ServicePackageSchema],
    variants: [ServicePackageSchema],
    images: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    timeEstimate: {
      type: String,
      default: '1-2 hours'
    },
    location: {
      type: String,
      default: 'Kottayam',
      index: true
    },
    serviceAreas: {
      type: [String],
      default: ['Kottayam', 'Changanassery', 'Pala']
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'live', 'paused', 'rejected'],
      default: 'live',
      index: true
    },
    itemType: {
      type: String,
      default: 'service'
    }
  },
  {
    timestamps: true,
    collection: 'Service'
  }
);

ServiceSchema.index({
  title: 'text',
  description: 'text',
  category: 'text'
});

ServiceSchema.index({ status: 1, category: 1, basePrice: 1 });
ServiceSchema.index({ providerId: 1, status: 1 });

export const Service = mongoose.model('Service', ServiceSchema);
export default Service;
