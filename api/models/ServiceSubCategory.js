/**
 * @file apps/api/models/ServiceSubCategory.js
 * @description Service SubCategory model with base pricing and duration metadata
 */

import mongoose from 'mongoose';

const ServiceSubCategorySchema = new mongoose.Schema(
  {
    serviceCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Parent ServiceCategory ID is required'],
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
    basePrice: {
      type: Number,
      default: 0
    },
    estimatedDuration: {
      type: String,
      default: '1-2 hours'
    },
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
    collection: 'ServiceSubCategory'
  }
);

ServiceSubCategorySchema.index({ serviceCategoryId: 1, name: 1 }, { unique: true });

ServiceSubCategorySchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

export const ServiceSubCategory = mongoose.model('ServiceSubCategory', ServiceSubCategorySchema);
export default ServiceSubCategory;
