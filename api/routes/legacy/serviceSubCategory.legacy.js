/**
 * @file apps/api/routes/legacy/serviceSubCategory.legacy.js
 * @description Backward-compatible /service-subCategory routes
 */

import { Router } from 'express';
import {
  getProductSubCategories as getServiceSubCategories,
  getProductSubCategoryById as getServiceSubCategoryById,
  createProductSubCategory as createServiceSubCategory,
  updateProductSubCategory as updateServiceSubCategory,
  deleteProductSubCategory as deleteServiceSubCategory
} from '../../controllers/category.controller.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/create', upload.array('images', 5), createServiceSubCategory);
router.get('/get-all', getServiceSubCategories);
router.get('/get-by-id/:id', getServiceSubCategoryById);
router.put('/update/:id', upload.array('images', 5), updateServiceSubCategory);
router.delete('/delete/:id', deleteServiceSubCategory);

export default router;
