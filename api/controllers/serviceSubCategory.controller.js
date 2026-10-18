import ServiceSubCategory from "../models/serviceSubCategory.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";

// CREATE SERVICE SUB CATEGORY
export const createServiceSubCategory = async (req, res) => {
  try {
    const { serviceCategoryId, name, title } = req.body;

    if (!serviceCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Service Category ID is required",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check service category exists
    const serviceCategory =
      await ServiceCategory.findById(serviceCategoryId);

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Category not found",
      });
    }

    // Get uploaded images
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    // Create service sub category
    const serviceSubCategory = await ServiceSubCategory.create({
      serviceCategoryId,
      name,
      title,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Service Sub Category created successfully",
      data: serviceSubCategory,
    });
  } catch (error) {
    console.error("Create Service Sub Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL SERVICE SUB CATEGORIES
export const getServiceSubCategories = async (req, res) => {
  try {
    const serviceSubCategories =
      await ServiceSubCategory.find()
        .populate(
          "serviceCategoryId",
          "name title images"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: serviceSubCategories.length,
      data: serviceSubCategories,
    });
  } catch (error) {
    console.error("Get Service Sub Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET SERVICE SUB CATEGORY BY ID
export const getServiceSubCategoryById = async (req, res) => {
  try {
    const serviceSubCategory =
      await ServiceSubCategory.findById(req.params.id)
        .populate(
          "serviceCategoryId",
          "name title images"
        );

    if (!serviceSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Sub Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceSubCategory,
    });
  } catch (error) {
    console.error(
      "Get Service Sub Category By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE SERVICE SUB CATEGORY
export const updateServiceSubCategory = async (req, res) => {
  try {
    const { serviceCategoryId, name, title } = req.body;

    const serviceSubCategory =
      await ServiceSubCategory.findById(req.params.id);

    if (!serviceSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Sub Category not found",
      });
    }

    // Update service category
    if (serviceCategoryId) {
      const serviceCategory =
        await ServiceCategory.findById(serviceCategoryId);

      if (!serviceCategory) {
        return res.status(404).json({
          success: false,
          message: "Service Category not found",
        });
      }

      serviceSubCategory.serviceCategoryId =
        serviceCategoryId;
    }

    // Update name
    if (name !== undefined) {
      serviceSubCategory.name = name;
    }

    // Update title
    if (title !== undefined) {
      serviceSubCategory.title = title;
    }

    // Update images only if new images are uploaded
    if (req.files && req.files.length > 0) {
      serviceSubCategory.images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    await serviceSubCategory.save();

    return res.status(200).json({
      success: true,
      message: "Service Sub Category updated successfully",
      data: serviceSubCategory,
    });
  } catch (error) {
    console.error(
      "Update Service Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE SERVICE SUB CATEGORY
export const deleteServiceSubCategory = async (req, res) => {
  try {
    const serviceSubCategory =
      await ServiceSubCategory.findByIdAndDelete(
        req.params.id
      );

    if (!serviceSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Sub Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service Sub Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Service Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};