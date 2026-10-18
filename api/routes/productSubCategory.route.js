import express from "express";

import upload from "../middleware/uploads.js";

import {
  createProductSubCategory,
  getProductSubCategories,
  getProductSubCategoryById,
  updateProductSubCategory,
  deleteProductSubCategory,
} from "../controllers/productSubCategory.controller.js";

const router = express.Router();

router.post(
  "/create",
  upload.array("images", 10),
  createProductSubCategory
);

router.get(
  "/get-all",
  getProductSubCategories
);

router.get(
  "/get-by-id/:id",
  getProductSubCategoryById
);

router.put(
  "/update/:id",
  upload.array("images", 10),
  updateProductSubCategory
);

router.delete(
  "/delete/:id",
  deleteProductSubCategory
);

export default router;