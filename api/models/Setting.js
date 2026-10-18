/**
 * @file apps/api/models/Setting.js
 * @description Global platform settings model with key-value and structured store
 */

import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'global'
    },
    site_name: { type: String, default: 'MyBigBazaar' },
    site_tagline: { type: String, default: 'India’s Hyper-Local Marketplace & Home Services' },
    site_logo: { type: String, default: '/uploads/logo.png' },
    announcement_bar_text: { type: String, default: 'Free Delivery on Orders Above ₹500 | 100% Escrow Protection' },
    contact_phone: { type: String, default: '+91 98765 43210' },
    contact_email: { type: String, default: 'support@mybigbazaar.com' },
    contact_address: { type: String, default: 'Plot 45, Vijay Nagar, Indore, MP 452010' },
    operating_hours: { type: String, default: 'Mon - Sun: 08:00 AM - 10:00 PM' },
    default_gst_percent: { type: Number, default: 18 },
    invoice_prefix: { type: String, default: 'INV-2026' },
    hsn_default: { type: String, default: '998314' },
    default_commission_percent: { type: Number, default: 10 },
    min_wallet_redeem_amount: { type: Number, default: 500 },
    minWalletRedeemAmount: { type: Number, default: 500 },
    require_aadhaar_kyc: { type: Boolean, default: true },
    enforce_admin_2fa: { type: Boolean, default: false },
    session_timeout_mins: { type: Number, default: 120 },
    email_alerts_enabled: { type: Boolean, default: true },
    sms_booking_alerts: { type: Boolean, default: true },
    facebook_url: { type: String, default: 'https://facebook.com/mybigbazaar' },
    instagram_url: { type: String, default: 'https://instagram.com/mybigbazaar' },
    footer_text: { type: String, default: '© 2026 MyBigBazaar Technologies India Pvt. Ltd. All rights reserved.' },
    footer_tagline: { type: String, default: 'Empowering local merchants and trusted neighborhood professionals.' },
    customData: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true,
    collection: 'Setting'
  }
);

export const Setting = mongoose.model('Setting', SettingSchema);
export default Setting;
