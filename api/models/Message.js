/**
 * @file apps/api/models/Message.js
 * @description Chat message schema supporting peer bargaining offers, seller replies, and admin moderator interventions
 */

import mongoose from 'mongoose';
import { OfferStatus } from '../config/constants.js';

const OfferDetailsSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    askingPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [...Object.values(OfferStatus), 'pending', 'accepted', 'declined', 'countered'],
      default: OfferStatus?.PENDING || 'pending'
    },
    counterAmount: { type: Number, default: null }
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation reference is required'],
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    senderName: {
      type: String,
      default: ''
    },
    senderRole: {
      type: String,
      enum: ['buyer', 'seller', 'admin', 'system'],
      default: 'buyer'
    },
    text: {
      type: String,
      trim: true,
      default: ''
    },
    messageType: {
      type: String,
      enum: ['text', 'offer', 'system', 'image', 'admin_notice'],
      default: 'text'
    },
    offerDetails: {
      type: OfferDetailsSchema,
      default: null
    },
    imageUrl: {
      type: String,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'Message'
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', MessageSchema);
export default Message;
