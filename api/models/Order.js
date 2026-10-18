/**
 * @file apps/api/models/Order.js
 * @description Physical product order model with multi-item support and shipment tracking
 */

import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus } from '../config/constants.js';

const OrderLineItemSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    default: null
  },
  productId: { type: String, default: '' },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  image: { type: String, default: '' },
  taxAmount: { type: Number, default: 0 },
  taxName: { type: String, default: '' }
}, { _id: true });

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    buyerName: {
      type: String,
      default: 'Customer'
    },
    buyerEmail: {
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
      default: 'Verified Seller'
    },
    productId: {
      type: String,
      default: ''
    },
    productTitle: {
      type: String,
      default: ''
    },
    productImage: {
      type: String,
      default: ''
    },
    items: [OrderLineItemSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    taxName: {
      type: String,
      default: 'GST 18%'
    },
    taxPercentage: {
      type: Number,
      default: 18
    },
    discount: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    shippingAddress: {
      houseNo: { type: String, default: '' },
      street: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Indore' },
      pincode: { type: String, default: '452001' },
      state: { type: String, default: 'Madhya Pradesh' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    paymentMode: {
      type: String,
      default: 'UPI'
    },
    paymentMethod: {
      type: String,
      default: 'UPI'
    },
    paymentStatus: {
      type: String,
      default: PaymentStatus.SUCCESS,
      index: true
    },
    status: {
      type: String,
      default: 'pending',
      index: true
    },
    trackingStatus: {
      type: String,
      default: OrderStatus.PLACED,
      index: true
    },
    trackingNumber: {
      type: String,
      default: null
    },
    courierName: {
      type: String,
      default: ''
    },
    estimatedDelivery: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        courierName: { type: String, default: '' },
        trackingNumber: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'Order'
  }
);

OrderSchema.pre('save', function () {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }
});

OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });

export const Order = mongoose.model('Order', OrderSchema);
export default Order;
