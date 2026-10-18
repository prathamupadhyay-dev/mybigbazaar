/**
 * @file apps/api/models/ProductSubCategory.js
 * @description Product SubCategory model linked to parent Category with indexes
 */

import mongoose from 'mongoose';

const ProductSubCategorySchema = new mongoose.Schema(
  {
    productCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      required: [true, 'Parent ProductCategory ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true
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
    isTestData: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'ProductSubCategory'
  }
);

ProductSubCategorySchema.index({ productCategoryId: 1, name: 1 }, { unique: true });

ProductSubCategorySchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

export const ProductSubCategory = mongoose.model('ProductSubCategory', ProductSubCategorySchema);
export default ProductSubCategory;
