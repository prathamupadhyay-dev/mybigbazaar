/**
 * @file apps/api/models/Banner.js
 * @description Promotional banner model mapped to HomeBanner collection
 */

import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Hero Banner',
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    linkUrl: {
      type: String,
      default: ''
    },
    targetScreen: {
      type: String,
      default: 'ProductList'
    },
    ctaText: {
      type: String,
      default: 'Shop Now'
    },
    tag: {
      type: String,
      default: 'Special Offer'
    },
    placement: {
      type: String,
      enum: ['home_hero', 'onboarding', 'services', 'promotions', 'home', 'marketplace'],
      default: 'home_hero',
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
    },
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    validUntil: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'HomeBanner'
  }
);

export const Banner = mongoose.model('Banner', BannerSchema);
export default Banner;
