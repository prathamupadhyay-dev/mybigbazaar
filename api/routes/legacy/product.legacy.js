/**
 * @file apps/api/routes/legacy/product.legacy.js
 * @description Backward-compatible /product and /tax routes for mobile clients
 */

import { Router } from 'express';
import {
  legacyCreateProduct,
  legacyGetProducts,
  legacyGetProductById,
  legacyUpdateProduct,
  legacyDeleteProduct,
  legacyGetTaxes
} from '../../controllers/legacy.controller.js';
import { upload } from '../../middleware/upload.middleware.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

export const productLegacyRouter = Router();
productLegacyRouter.post('/create', optionalAuth, upload.array('images', 10), legacyCreateProduct);
productLegacyRouter.get('/get-all', legacyGetProducts);
productLegacyRouter.get('/get/:id', legacyGetProductById);
productLegacyRouter.get('/:id', legacyGetProductById);
productLegacyRouter.put('/update/:id', optionalAuth, legacyUpdateProduct);
productLegacyRouter.put('/:id', optionalAuth, legacyUpdateProduct);
productLegacyRouter.patch('/:id', optionalAuth, legacyUpdateProduct);
productLegacyRouter.delete('/delete/:id', optionalAuth, legacyDeleteProduct);
productLegacyRouter.delete('/:id', optionalAuth, legacyDeleteProduct);

import { Tax } from '../../models/Tax.js';
import { asyncHandler, ApiError } from '../../middleware/error.middleware.js';

export const taxLegacyRouter = Router();

taxLegacyRouter.get('/get-all', asyncHandler(async (req, res) => {
  let taxes = await Tax.find().sort({ taxPercentage: 1 });
  if (!taxes || taxes.length === 0) {
    // Seed default statutory GST slabs if empty
    taxes = await Tax.create([
      { taxName: 'GST 5%', taxPercentage: 5, isActive: true },
      { taxName: 'GST 12%', taxPercentage: 12, isActive: true },
      { taxName: 'GST 18%', taxPercentage: 18, isActive: true },
      { taxName: 'GST 28%', taxPercentage: 28, isActive: true }
    ]);
  }
  res.status(200).json({
    status: true,
    success: true,
    count: taxes.length,
    data: taxes,
    taxes: taxes
  });
}));

taxLegacyRouter.post('/create', asyncHandler(async (req, res) => {
  const { taxName, taxPercentage, isActive = true } = req.body;
  if (!taxName || taxPercentage === undefined) {
    throw ApiError.badRequest('Tax name and tax percentage are required');
  }
  const tax = await Tax.create({
    taxName: taxName.trim(),
    taxPercentage: Number(taxPercentage),
    isActive: Boolean(isActive)
  });
  res.status(201).json({
    status: true,
    success: true,
    message: 'Tax slab created successfully',
    data: tax,
    tax
  });
}));

taxLegacyRouter.put('/update/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { taxName, taxPercentage, isActive } = req.body;
  const tax = await Tax.findById(id);
  if (!tax) throw ApiError.notFound('Tax slab not found');
  if (taxName) tax.taxName = taxName.trim();
  if (taxPercentage !== undefined) tax.taxPercentage = Number(taxPercentage);
  if (isActive !== undefined) tax.isActive = Boolean(isActive);
  await tax.save();
  res.status(200).json({
    status: true,
    success: true,
    message: 'Tax slab updated successfully',
    data: tax,
    tax
  });
}));

taxLegacyRouter.delete('/delete/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tax = await Tax.findById(id);
  if (!tax) throw ApiError.notFound('Tax slab not found');
  await tax.deleteOne();
  res.status(200).json({
    status: true,
    success: true,
    message: 'Tax slab deleted successfully'
  });
}));

export default {
  productLegacyRouter,
  taxLegacyRouter
};
