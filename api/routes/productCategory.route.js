import express from "express";

import upload from "../middleware/uploads.js";

import {
  createProductCategory,
  getProductCategories,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory,
} from "../controllers/productCategory.controller.js";

const router = express.Router();



router.post(
  "/create",
  upload.array("images", 1),
  createProductCategory
);



router.get(
  "/get-all",
  getProductCategories
);


router.get(
  "/get-by-id/:id",
  getProductCategoryById
);


router.put(
  "/update/:id",
  upload.array("images", 1),
  updateProductCategory
);


router.delete(
  "/delete/:id",
  deleteProductCategory
);

export default router;