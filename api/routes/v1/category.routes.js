/**
 * @file apps/api/routes/v1/category.routes.js
 * @description Category and taxonomy management routes (/api/v1/categories)
 */

import { Router } from 'express';
import {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  reorderProductCategories,
  getProductSubCategories,
  getProductSubCategoryById,
  createProductSubCategory,
  updateProductSubCategory,
  deleteProductSubCategory,
  reorderProductSubCategories,
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServiceSubCategories,
  getServiceSubCategoryById,
  createServiceSubCategory,
  updateServiceSubCategory,
  deleteServiceSubCategory,
  getAllTaxonomy
} from '../../controllers/category.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

// Full taxonomy tree
router.get('/taxonomy', getAllTaxonomy);

// Product categories & subcategories
router.get('/products', getProductCategories);
router.put('/products/reorder', authenticate, requireAdmin, reorderProductCategories);
router.get('/products/:id', getProductCategoryById);
router.post('/products', authenticate, requireAdmin, upload.array('images', 5), createProductCategory);
router.put('/products/:id', authenticate, requireAdmin, upload.array('images', 5), updateProductCategory);
router.delete('/products/:id', authenticate, requireAdmin, deleteProductCategory);

router.get('/products/sub/all', getProductSubCategories);
router.put('/products/sub/reorder', authenticate, requireAdmin, reorderProductSubCategories);
router.get('/products/sub/:id', getProductSubCategoryById);
router.post('/products/sub', authenticate, requireAdmin, upload.array('images', 5), createProductSubCategory);
router.put('/products/sub/:id', authenticate, requireAdmin, upload.array('images', 5), updateProductSubCategory);
router.delete('/products/sub/:id', authenticate, requireAdmin, deleteProductSubCategory);

// Service categories & subcategories
router.get('/services', getServiceCategories);
router.get('/services/:id', getServiceCategoryById);
router.post('/services', authenticate, requireAdmin, upload.array('images', 5), createServiceCategory);
router.put('/services/:id', authenticate, requireAdmin, upload.array('images', 5), updateServiceCategory);
router.delete('/services/:id', authenticate, requireAdmin, deleteServiceCategory);

router.get('/services/sub/all', getServiceSubCategories);
router.get('/services/sub/:id', getServiceSubCategoryById);
router.post('/services/sub', authenticate, requireAdmin, upload.array('images', 5), createServiceSubCategory);
router.put('/services/sub/:id', authenticate, requireAdmin, upload.array('images', 5), updateServiceSubCategory);
router.delete('/services/sub/:id', authenticate, requireAdmin, deleteServiceSubCategory);

export default router;
