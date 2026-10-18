/**
 * @file apps/api/routes/legacy/serviceCategory.legacy.js
 * @description Backward-compatible /service-category routes
 */

import { Router } from 'express';
import {
  getProductCategories as getServiceCategories,
  getProductCategoryById as getServiceCategoryById,
  createProductCategory as createServiceCategory,
  updateProductCategory as updateServiceCategory,
  deleteProductCategory as deleteServiceCategory
} from '../../controllers/category.controller.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/create', upload.array('images', 5), createServiceCategory);
router.get('/get-all', getServiceCategories);
router.get('/get-by-id/:id', getServiceCategoryById);
router.put('/update/:id', upload.array('images', 5), updateServiceCategory);
router.delete('/delete/:id', deleteServiceCategory);

export default router;
