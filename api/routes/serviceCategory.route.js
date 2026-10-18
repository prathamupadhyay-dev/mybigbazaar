import express from "express";
import upload from "../middleware/uploads.js";

import {
  createServiceCategory,
  getServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  deleteServiceCategory,
} from "../controllers/serviceCategory.controller.js";

const router = express.Router();

// CREATE
router.post(
  "/create",
  upload.array("images", 10),
  createServiceCategory
);

// GET ALL
router.get(
  "/get-all",
  getServiceCategories
);

// GET BY ID
router.get(
  "/get-by-id/:id",
  getServiceCategoryById
);

// UPDATE
router.put(
  "/update/:id",
  upload.array("images", 10),
  updateServiceCategory
);

// DELETE
router.delete(
  "/delete/:id",
  deleteServiceCategory
);

export default router;