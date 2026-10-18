import express from "express";
import upload from "../middleware/uploads.js";

import {
  createServiceSubCategory,
  getServiceSubCategories,
  getServiceSubCategoryById,
  updateServiceSubCategory,
  deleteServiceSubCategory,
} from "../controllers/serviceSubCategory.controller.js";

const router = express.Router();

// CREATE
router.post(
  "/create",
  upload.array("images", 10),
  createServiceSubCategory
);

// GET ALL
router.get(
  "/get-all",
  getServiceSubCategories
);

// GET BY ID
router.get(
  "/get-by-id/:id",
  getServiceSubCategoryById
);

// UPDATE
router.put(
  "/update/:id",
  upload.array("images", 10),
  updateServiceSubCategory
);

// DELETE
router.delete(
  "/delete/:id",
  deleteServiceSubCategory
);

export default router;