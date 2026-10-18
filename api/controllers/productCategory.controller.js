import ProductCategory from "../models/productCategory.model.js";


export const createProductCategory = async (req, res) => {
  try {
    const { name, title } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Multiple images
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const newProductCategory = await ProductCategory.create({
      name,
      title,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Product Category created successfully",
      data: newProductCategory,
    });
  } catch (error) {
    console.error("Create Product Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL PRODUCT CATEGORIES
// ======================================================

export const getProductCategories = async (req, res) => {
  try {
    const productCategories = await ProductCategory.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: productCategories.length,
      data: productCategories,
    });
  } catch (error) {
    console.error("Get Product Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET PRODUCT CATEGORY BY ID
export const getProductCategoryById = async (req, res) => {
  try {
    const productCategory = await ProductCategory.findById(
      req.params.id
    );

    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: "Product Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: productCategory,
    });
  } catch (error) {
    console.error("Get Product Category By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE PRODUCT CATEGORY
export const updateProductCategory = async (req, res) => {
  try {
    const { name, title } = req.body;

    // Find existing category
    const productCategory = await ProductCategory.findById(
      req.params.id
    );

    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: "Product Category not found",
      });
    }

    // Update fields only if provided
    if (name !== undefined) {
      productCategory.name = name;
    }

    if (title !== undefined) {
      productCategory.title = title;
    }

    // Update images only when new images are uploaded
    if (req.files && req.files.length > 0) {
      productCategory.images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    await productCategory.save();

    return res.status(200).json({
      success: true,
      message: "Product Category updated successfully",
      data: productCategory,
    });
  } catch (error) {
    console.error("Update Product Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE PRODUCT CATEGORY
export const deleteProductCategory = async (req, res) => {
  try {
    const productCategory =
      await ProductCategory.findByIdAndDelete(req.params.id);

    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: "Product Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};