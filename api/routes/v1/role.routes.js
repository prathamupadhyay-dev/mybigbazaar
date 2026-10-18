/**
 * @file apps/api/routes/v1/role.routes.js
 * @description Role & Permissions management endpoints (/api/v1/roles)
 */

import { Router } from 'express';
import Role from '../../models/Role.js';
import { ApiError, asyncHandler } from '../../middleware/error.middleware.js';

const router = Router();

// Default system Admin role definition
const ensureAdminRole = async () => {
  let adminRole = await Role.findOne({ name: /^admin$/i });
  if (!adminRole) {
    adminRole = await Role.create({
      name: 'Admin',
      slug: 'admin',
      description: 'Primary platform administrator with full, unrestricted access to all tabs and features.',
      isSystem: true,
      cannotDelete: true,
      allowedTabs: ['*']
    });
  }
  return adminRole;
};

// GET /api/v1/roles - List all roles
router.get('/', asyncHandler(async (req, res) => {
  await ensureAdminRole();
  const roles = await Role.find().sort({ isSystem: -1, createdAt: 1 });
  res.status(200).json({
    success: true,
    data: roles
  });
}));

// POST /api/v1/roles - Create custom role
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, allowedTabs } = req.body;
  if (!name || !name.trim()) {
    throw ApiError.badRequest('Role name is required');
  }

  const existing = await Role.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  if (existing) {
    throw ApiError.badRequest(`Role with name "${name.trim()}" already exists`);
  }

  const role = await Role.create({
    name: name.trim(),
    slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: (description || '').trim(),
    isSystem: false,
    cannotDelete: false,
    allowedTabs: Array.isArray(allowedTabs) ? allowedTabs : []
  });

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: role
  });
}));

// PUT /api/v1/roles/:id - Update role
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findById(id);
  if (!role) {
    throw ApiError.notFound('Role not found');
  }

  const { name, description, allowedTabs } = req.body;

  if (role.isSystem || role.cannotDelete) {
    // For System Admin role, preserve system flags and root status
    if (description !== undefined) role.description = description;
    if (allowedTabs && Array.isArray(allowedTabs)) {
      role.allowedTabs = allowedTabs;
    }
  } else {
    if (name && name.trim()) {
      const duplicate = await Role.findOne({
        _id: { $ne: id },
        name: new RegExp(`^${name.trim()}$`, 'i')
      });
      if (duplicate) {
        throw ApiError.badRequest(`Another role with name "${name.trim()}" already exists`);
      }
      role.name = name.trim();
      role.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) role.description = description;
    if (allowedTabs && Array.isArray(allowedTabs)) {
      role.allowedTabs = allowedTabs;
    }
  }

  await role.save();

  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    data: role
  });
}));

// DELETE /api/v1/roles/:id - Delete custom role (Admin role cannot be deleted)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findById(id);
  if (!role) {
    throw ApiError.notFound('Role not found');
  }

  if (role.isSystem || role.cannotDelete || role.name.toLowerCase() === 'admin') {
    throw ApiError.badRequest('The Admin role is a protected system role and cannot be deleted.');
  }

  await role.deleteOne();

  res.status(200).json({
    success: true,
    message: `Role "${role.name}" deleted successfully`
  });
}));

export default router;
