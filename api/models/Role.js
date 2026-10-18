/**
 * @file apps/api/models/Role.js
 * @description Admin Role & Permissions model with tab-level access control
 */

import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    cannotDelete: {
      type: Boolean,
      default: false
    },
    allowedTabs: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model('Role', RoleSchema);
