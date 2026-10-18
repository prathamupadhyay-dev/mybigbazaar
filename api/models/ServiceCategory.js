/**
 * @file apps/api/models/ServiceCategory.js
 * @description Service Category model for hyperlocal services
 */

import mongoose from 'mongoose';

const ServiceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service Category name is required'],
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
    commission: {
      type: Number,
      default: 12
    },
    commissionRate: {
      type: Number,
      default: 10
    },
    isTestData: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'ServiceCategory'
  }
);

ServiceCategorySchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

export const ServiceCategory = mongoose.model('ServiceCategory', ServiceCategorySchema);
export default ServiceCategory;
