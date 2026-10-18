/**
 * @file apps/api/routes/legacy/productCategory.legacy.js
 * @description Backward-compatible /product-category routes
 */

import { Router } from 'express';
import {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  reorderProductCategories
} from '../../controllers/category.controller.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.put('/reorder', reorderProductCategories);
router.post('/create', upload.array('images', 5), createProductCategory);
router.get('/get-all', getProductCategories);
router.get('/get-by-id/:id', getProductCategoryById);
router.put('/update/:id', upload.array('images', 5), updateProductCategory);
router.delete('/delete/:id', deleteProductCategory);

export default router;
