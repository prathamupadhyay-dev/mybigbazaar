import ServiceCategory from "../models/serviceCategory.model.js";

// CREATE SERVICE CATEGORY
export const createServiceCategory = async (req, res) => {
  try {
    const { name, title } = req.body;

    // Validate name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Get uploaded images
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    // Create service category
    const serviceCategory = await ServiceCategory.create({
      name,
      title,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Service Category created successfully",
      data: serviceCategory,
    });
  } catch (error) {
    console.error("Create Service Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL SERVICE CATEGORIES
export const getServiceCategories = async (req, res) => {
  try {
    const serviceCategories = await ServiceCategory.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: serviceCategories.length,
      data: serviceCategories,
    });
  } catch (error) {
    console.error("Get Service Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SERVICE CATEGORY BY ID
export const getServiceCategoryById = async (req, res) => {
  try {
    const serviceCategory = await ServiceCategory.findById(
      req.params.id
    );

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceCategory,
    });
  } catch (error) {
    console.error("Get Service Category By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE SERVICE CATEGORY
export const updateServiceCategory = async (req, res) => {
  try {
    const { name, title } = req.body;

    const serviceCategory = await ServiceCategory.findById(
      req.params.id
    );

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Category not found",
      });
    }

    // Update name
    if (name !== undefined) {
      serviceCategory.name = name;
    }

    // Update title
    if (title !== undefined) {
      serviceCategory.title = title;
    }

    // Update images only if new images are uploaded
    if (req.files && req.files.length > 0) {
      serviceCategory.images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    await serviceCategory.save();

    return res.status(200).json({
      success: true,
      message: "Service Category updated successfully",
      data: serviceCategory,
    });
  } catch (error) {
    console.error("Update Service Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE SERVICE CATEGORY
export const deleteServiceCategory = async (req, res) => {
  try {
    const serviceCategory =
      await ServiceCategory.findByIdAndDelete(req.params.id);

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: "Service Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};