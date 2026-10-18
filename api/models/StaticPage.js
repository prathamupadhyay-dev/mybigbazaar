/**
 * @file apps/api/models/StaticPage.js
 * @description CMS Static Pages (About, Terms, Privacy, Refund)
 */

import mongoose from 'mongoose';

const StaticPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'StaticPage'
  }
);

export const StaticPage = mongoose.model('StaticPage', StaticPageSchema);
export default StaticPage;
