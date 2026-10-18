/**
 * @file apps/api/models/Listing.js
 * @description Marketplace Classified Ad and Product listing model with lifecycle management
 */

import mongoose from 'mongoose';
import { ListingStatus } from '../config/constants.js';

const ListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      index: true
    },
    productName: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    productDescription: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
      index: true
    },
    productPrice: {
      type: Number,
      default: 0
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      index: true
    },
    productCategorysId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory'
      }
    ],
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductSubCategory',
      index: true
    },
    productSubCategorysId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSubCategory'
      }
    ],
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
    condition: {
      type: String,
      default: 'Good',
      index: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
      index: true
    },
    sellerName: {
      type: String,
      default: ''
    },
    sellerPhone: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    location: {
      city: { type: String, default: 'Kottayam', index: true },
      pincode: { type: String, default: '' },
      state: { type: String, default: 'Kerala' },
      address: { type: String, default: '' },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined
      }
    },
    status: {
      type: String,
      enum: Object.values(ListingStatus),
      default: ListingStatus.LIVE,
      index: true
    },
    views: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    itemType: {
      type: String,
      default: 'product'
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    rejectionReason: {
      type: String,
      default: null
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        reason: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'products' // Preserves existing legacy collection name
  }
);

// Full-text search index
ListingSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  subcategory: 'text'
});

// Common compound indexes for feed sorting and filtering
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
ListingSchema.index({ status: 1, category: 1, price: 1 });
ListingSchema.index({ 'location.city': 1, status: 1 });

export const Listing = mongoose.model('Listing', ListingSchema);
export default Listing;
