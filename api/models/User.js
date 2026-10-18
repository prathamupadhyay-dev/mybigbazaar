/**
 * @file apps/api/models/User.js
 * @description Unified user model mapped to 'Auth' collection with secure hashing and RBAC
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, Roles } from '../config/constants.js';

const AddressSchema = new mongoose.Schema({
  type: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
  houseNo: { type: String, trim: true },
  street: { type: String, trim: true },
  landmark: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      lowercase: true
    },
    role: {
      type: String,
      default: Roles.BUYER,
      index: true
    },
    userTypes: {
      type: [String],
      default: ['buyer']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative']
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    addresses: [AddressSchema],
    otp: {
      type: String,
      default: null,
      select: false
    },
    otpExpiresAt: {
      type: Date,
      default: null,
      select: false
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    }
  },
  {
    timestamps: true,
    collection: 'Auth' // Preserves existing legacy collection name
  }
);

// Pre-save hook: Hash password if modified
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strips security fields from JSON and Object representations
const stripSecurityFields = (doc, ret) => {
  delete ret.password;
  delete ret.otp;
  delete ret.otpExpiresAt;
  delete ret.otpExpireAt;
  delete ret.passwordResetToken;
  delete ret.passwordResetExpires;
  delete ret.__v;
  return ret;
};

UserSchema.set('toJSON', { transform: stripSecurityFields });
UserSchema.set('toObject', { transform: stripSecurityFields });

export const User = mongoose.model('User', UserSchema);
export default User;
