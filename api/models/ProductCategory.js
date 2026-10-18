/**
 * @file apps/api/models/ProductCategory.js
 * @description Product Category model with slug, icon, and sorting
 */

import mongoose from 'mongoose';

const ProductCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: null
    },
    images: {
      type: [String],
      default: []
    },
    fields: [
      {
        name: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        type: {
          type: String,
          enum: ['text', 'number', 'select', 'multiselect', 'radio', 'checkbox', 'date'],
          default: 'text'
        },
        options: [{ type: String, trim: true }],
        isRequired: { type: Boolean, default: false },
        placeholder: { type: String, default: '' },
        unit: { type: String, default: '' },
        sortOrder: { type: Number, default: 0 }
      }
    ],
    sortOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    commissionRate: {
      type: Number,
      default: 5
    },
    isTestData: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'ProductCategory'
  }
);

ProductCategorySchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

export const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);
export default ProductCategory;
