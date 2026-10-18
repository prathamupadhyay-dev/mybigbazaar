import ProductSubCategory from "../models/productSubCategory.model.js";
import ProductCategory from "../models/productCategory.model.js";


// CREATE PRODUCT SUB CATEGORY
export const createProductSubCategory = async (req, res) => {
  try {
    const { productCategoryId, name, title } = req.body;

    // Validate productCategoryId
    if (!productCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Validate name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check category exists
    const category = await ProductCategory.findById(productCategoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Product Category not found",
      });
    }

    // Multiple images
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    // Create sub category
    const newProductSubCategory =
      await ProductSubCategory.create({
        productCategoryId,
        name,
        title,
        images,
      });

    return res.status(201).json({
      success: true,
      message: "Product Sub Category created successfully",
      data: newProductSubCategory,
    });
  } catch (error) {
    console.error(
      "Create Product Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL PRODUCT SUB CATEGORIES
// ======================================================

export const getProductSubCategories = async (req, res) => {
  try {
    const productSubCategories =
      await ProductSubCategory.find()
        .populate("productCategoryId", "name title images")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: productSubCategories.length,
      data: productSubCategories,
    });
  } catch (error) {
    console.error(
      "Get Product Sub Categories Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PRODUCT SUB CATEGORY BY ID
export const getProductSubCategoryById = async (req, res) => {
  try {
    const productSubCategory =
      await ProductSubCategory.findById(req.params.id)
        .populate("productCategoryId", "name title images");

    if (!productSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Product Sub Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: productSubCategory,
    });
  } catch (error) {
    console.error(
      "Get Product Sub Category By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE PRODUCT SUB CATEGORY
export const updateProductSubCategory = async (req, res) => {
  try {
    const { productCategoryId, name, title } = req.body;

    // Find existing sub category
    const productSubCategory =
      await ProductSubCategory.findById(req.params.id);

    if (!productSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Product Sub Category not found",
      });
    }

    // If productCategoryId is provided, check category
    if (productCategoryId) {
      const category = await ProductCategory.findById(
        productCategoryId
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Product Category not found",
        });
      }

      productSubCategory.productCategoryId = productCategoryId;
    }

    // Update name
    if (name !== undefined) {
      productSubCategory.name = name;
    }

    // Update title
    if (title !== undefined) {
      productSubCategory.title = title;
    }

    // Update images if new images uploaded
    if (req.files && req.files.length > 0) {
      productSubCategory.images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    await productSubCategory.save();

    return res.status(200).json({
      success: true,
      message: "Product Sub Category updated successfully",
      data: productSubCategory,
    });
  } catch (error) {
    console.error(
      "Update Product Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE PRODUCT SUB CATEGORY
export const deleteProductSubCategory = async (req, res) => {
  try {
    const productSubCategory =
      await ProductSubCategory.findByIdAndDelete(
        req.params.id
      );

    if (!productSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Product Sub Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product Sub Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Product Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};