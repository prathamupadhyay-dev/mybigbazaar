/**
 * @file apps/api/models/FAQ.js
 * @description FAQ items model for Help Center and Legal Hub
 */

import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['general', 'classifieds', 'services', 'payments', 'safety', 'partners'],
      default: 'general',
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'FAQs'
  }
);

export const FAQ = mongoose.model('FAQ', FAQSchema);
export default FAQ;
