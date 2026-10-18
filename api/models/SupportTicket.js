/**
 * @file apps/api/models/SupportTicket.js
 * @description Support tickets and grievance redressal tracking model
 */

import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['grievance', 'general_enquiry', 'payment_issue', 'listing_fraud', 'service_complaint', 'account_deletion'],
      default: 'general_enquiry',
      index: true
    },
    message: {
      type: String,
      required: [true, 'Message is required']
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'SupportTickets'
  }
);

export const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);
export default SupportTicket;
