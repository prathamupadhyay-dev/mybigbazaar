/**
 * @file apps/api/models/Conversation.js
 * @description P2P Chat conversation thread between buyer & seller on a marketplace listing
 */

import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      }
    ],
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    buyerName: {
      type: String,
      default: ''
    },
    buyerPhone: {
      type: String,
      default: ''
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    sellerName: {
      type: String,
      default: ''
    },
    sellerPhone: {
      type: String,
      default: ''
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
      index: true
    },
    listingTitle: {
      type: String,
      default: ''
    },
    listingPrice: {
      type: Number,
      default: 0
    },
    listingImage: {
      type: String,
      default: ''
    },
    listingCategory: {
      type: String,
      default: ''
    },
    listingLocation: {
      type: String,
      default: ''
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true
    },
    lastMessage: {
      text: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      senderName: { type: String, default: '' },
      messageType: { type: String, default: 'text' },
      offerAmount: { type: Number, default: null },
      offerStatus: { type: String, default: null },
      createdAt: { type: Date, default: Date.now }
    },
    important: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked', 'flagged'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'Conversation'
  }
);

ConversationSchema.index({ participants: 1, updatedAt: -1 });
ConversationSchema.index({ buyerId: 1, sellerId: 1, listingId: 1 });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;
