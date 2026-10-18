/**
 * @file apps/api/models/Favorite.js
 * @description User favorites and watchlist model
 */

import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    targetType: {
      type: String,
      enum: ['listing', 'service'],
      default: 'listing',
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target reference ID is required'],
      refPath: 'targetModel'
    },
    targetModel: {
      type: String,
      enum: ['Listing', 'Service'],
      default: function () {
        return this.targetType === 'service' ? 'Service' : 'Listing';
      }
    }
  },
  {
    timestamps: true,
    collection: 'Favorite'
  }
);

FavoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', FavoriteSchema);
export default Favorite;
