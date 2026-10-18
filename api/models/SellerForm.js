/**
 * @file apps/api/models/SellerForm.js
 * @description Dynamic Seller Form schema for categories and subcategories
 */

import mongoose from 'mongoose';

const FormFieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'segmented', 'select', 'textarea', 'brand_model_variant'],
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: null
    },
    minValue: {
      type: Number,
      default: null
    },
    options: {
      type: [String],
      default: []
    },
    helperText: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const SellerFormSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      index: true
    },
    subCategory: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    categoryId: {
      type: String,
      default: null
    },
    subCategoryId: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    fields: {
      type: [FormFieldSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast lookup
SellerFormSchema.index({ category: 1, subCategory: 1 }, { unique: true });

export const SellerForm = mongoose.models.SellerForm || mongoose.model('SellerForm', SellerFormSchema);
export default SellerForm;
