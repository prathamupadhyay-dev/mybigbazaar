/**
 * @file apps/api/models/CMSPage.js
 * @description CMS dynamic pages for legal documents, company disclosures, and static content
 */

import mongoose from 'mongoose';

const CMSPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Page content is required']
    },
    metaTitle: {
      type: String,
      trim: true,
      default: ''
    },
    metaDescription: {
      type: String,
      trim: true,
      default: ''
    },
    published: {
      type: Boolean,
      default: true,
      index: true
    },
    youtubeUrl: {
      type: String,
      default: ''
    },
    supportPhone: {
      type: String,
      default: ''
    },
    supportEmail: {
      type: String,
      default: ''
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'CMSPages'
  }
);

export const CMSPage = mongoose.model('CMSPage', CMSPageSchema);
export default CMSPage;
