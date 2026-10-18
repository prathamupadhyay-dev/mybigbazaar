/**
 * @file apps/api/routes/legacy/productSubCategory.legacy.js
 * @description Backward-compatible /product-subCategory routes
 */

import { Router } from 'express';
import {
  getProductSubCategories,
  getProductSubCategoryById,
  createProductSubCategory,
  updateProductSubCategory,
  deleteProductSubCategory,
  reorderProductSubCategories
} from '../../controllers/category.controller.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/create', upload.array('images', 5), createProductSubCategory);
router.get('/get-all', getProductSubCategories);
router.put('/reorder', reorderProductSubCategories);
router.get('/get-by-id/:id', getProductSubCategoryById);
router.put('/update/:id', upload.array('images', 5), updateProductSubCategory);
router.delete('/delete/:id', deleteProductSubCategory);

export default router;
