/**
 * @file apps/api/controllers/category.controller.js
 * @description Category and SubCategory controller for Marketplace & Hyperlocal Services
 */

import ProductCategory from '../models/ProductCategory.js';
import ProductSubCategory from '../models/ProductSubCategory.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { storageProvider } from '../providers/storage/index.js';

// ==========================================
// 1. PRODUCT CATEGORIES
// ==========================================

export const getProductCategories = asyncHandler(async (req, res) => {
  const filter = {};
  const includeAll = req.query.all === 'true' || req.query.includeInactive === 'true';
  if (!includeAll || req.query.activeOnly === 'true') {
    filter.isActive = { $ne: false };
  }
  const categories = await ProductCategory.find(filter);
  categories.sort((a, b) => {
    const oA = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
    const oB = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
    if (oA !== oB) return oA - oB;
    return (a.name || '').localeCompare(b.name || '');
  });
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

export const getProductCategoryById = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Product category not found');
  }
  res.status(200).json({
    success: true,
    data: category
  });
});

export const createProductCategory = asyncHandler(async (req, res) => {
  const { name, title, description, sortOrder, commissionRate, commission, status, isActive, image } = req.body;
  if (!name) {
    throw ApiError.badRequest('Category name is required');
  }

  let images = image ? [image] : [];
  let icon = req.body.icon || (image || null);

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
    if (!icon) icon = images[0];
  } else if (req.file) {
    const url = storageProvider.getFileUrl(req.file.filename);
    images = [url];
    if (!icon) icon = url;
  }

  const category = await ProductCategory.create({
    name: name.trim(),
    title: title ? title.trim() : undefined,
    description: description ? description.trim() : undefined,
    images,
    icon,
    sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
    isActive: status !== undefined ? status === 'Active' : (isActive !== undefined ? Boolean(isActive) : true),
    commissionRate: commissionRate !== undefined ? parseFloat(commissionRate) : (commission !== undefined ? parseFloat(commission) : 5)
  });

  res.status(201).json({
    success: true,
    message: 'Product category created successfully',
    data: category
  });
});

export const updateProductCategory = asyncHandler(async (req, res) => {
  const { name, title, description, sortOrder, isActive, status, commissionRate, commission, icon, image } = req.body;
  const category = await ProductCategory.findById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Product category not found');
  }

  if (name) category.name = name.trim();
  if (title !== undefined) category.title = title.trim();
  if (description !== undefined) category.description = description.trim();
  if (sortOrder !== undefined) category.sortOrder = parseInt(sortOrder, 10);
  if (isActive !== undefined) category.isActive = (isActive === true || isActive === 'true');
  if (status !== undefined) {
    category.status = status;
    category.isActive = status === 'Active';
  }
  if (commissionRate !== undefined) category.commissionRate = parseFloat(commissionRate);
  else if (commission !== undefined) category.commissionRate = parseFloat(commission);
  if (icon !== undefined) category.icon = icon;
  if (image) {
    category.images = [image];
    if (!category.icon) category.icon = image;
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    category.images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
    if (!category.icon) category.icon = category.images[0];
  } else if (req.file) {
    const url = storageProvider.getFileUrl(req.file.filename);
    category.images = [url];
    category.icon = url;
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Product category updated successfully',
    data: category
  });
});

export const deleteProductCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Product category not found');
  }

  // Cascade cleanup child subcategories
  await ProductSubCategory.deleteMany({ productCategoryId: category._id });
  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product category and child subcategories deleted successfully'
  });
});

export const reorderProductCategories = asyncHandler(async (req, res) => {
  const { orderedIds, categoryIds, categories: inputCategories } = req.body;
  const ids = Array.isArray(orderedIds)
    ? orderedIds
    : Array.isArray(categoryIds)
    ? categoryIds
    : Array.isArray(inputCategories)
    ? inputCategories.map(c => c._id || c.id)
    : [];

  if (ids.length > 0) {
    const bulkOps = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index + 1 } }
      }
    }));
    await ProductCategory.bulkWrite(bulkOps);
  }

  const updated = await ProductCategory.find({}).sort({ sortOrder: 1 });
  res.status(200).json({
    success: true,
    message: 'Product categories reordered successfully',
    data: updated
  });
});

// ==========================================
// 2. PRODUCT SUBCATEGORIES
// ==========================================

export const getProductSubCategories = asyncHandler(async (req, res) => {
  const filter = {};
  const catId = req.query.categoryId || req.query.productCategoryId;
  if (catId) {
    filter.productCategoryId = catId;
  }
  const includeAll = req.query.all === 'true' || req.query.includeInactive === 'true';
  if (!includeAll || req.query.activeOnly === 'true') {
    filter.isActive = { $ne: false };
  }

  let subCategories = await ProductSubCategory.find(filter)
    .populate('productCategoryId', 'name slug title isActive')
    .sort({ sortOrder: 1, name: 1 });

  // Exclude subcategories whose parent category is deactivated
  if (!includeAll) {
    subCategories = subCategories.filter(s => s.productCategoryId && s.productCategoryId.isActive !== false);
  }

  res.status(200).json({
    success: true,
    count: subCategories.length,
    data: subCategories
  });
});

export const getProductSubCategoryById = asyncHandler(async (req, res) => {
  const subCategory = await ProductSubCategory.findById(req.params.id).populate(
    'productCategoryId',
    'name slug title'
  );
  if (!subCategory) {
    throw ApiError.notFound('Product subcategory not found');
  }
  res.status(200).json({
    success: true,
    data: subCategory
  });
});

export const createProductSubCategory = asyncHandler(async (req, res) => {
  const { productCategoryId, categoryId, name, title, sortOrder } = req.body;
  const parentId = productCategoryId || categoryId;

  if (!parentId || !name) {
    throw ApiError.badRequest('Parent productCategoryId and subcategory name are required');
  }

  const parent = await ProductCategory.findById(parentId);
  if (!parent) {
    throw ApiError.notFound('Parent product category does not exist');
  }

  let images = [];
  if (req.files && Array.isArray(req.files)) {
    images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  } else if (req.file) {
    images = [storageProvider.getFileUrl(req.file.filename)];
  }

  const subCategory = await ProductSubCategory.create({
    productCategoryId: parent._id,
    name: name.trim(),
    title: title ? title.trim() : undefined,
    images,
    sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0
  });

  res.status(201).json({
    success: true,
    message: 'Product subcategory created successfully',
    data: subCategory
  });
});

export const updateProductSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await ProductSubCategory.findById(req.params.id);
  if (!subCategory) {
    throw ApiError.notFound('Product subcategory not found');
  }

  const { name, title, sortOrder, isActive, productCategoryId } = req.body;
  if (name) subCategory.name = name.trim();
  if (title !== undefined) subCategory.title = title.trim();
  if (sortOrder !== undefined) subCategory.sortOrder = parseInt(sortOrder, 10);
  if (isActive !== undefined) subCategory.isActive = Boolean(isActive);
  if (productCategoryId) {
    const parent = await ProductCategory.findById(productCategoryId);
    if (!parent) throw ApiError.notFound('New parent category not found');
    subCategory.productCategoryId = parent._id;
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    subCategory.images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  }

  await subCategory.save();

  res.status(200).json({
    success: true,
    message: 'Product subcategory updated successfully',
    data: subCategory
  });
});

export const deleteProductSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await ProductSubCategory.findById(req.params.id);
  if (!subCategory) {
    throw ApiError.notFound('Product subcategory not found');
  }
  await subCategory.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Product subcategory deleted successfully'
  });
});

export const reorderProductSubCategories = asyncHandler(async (req, res) => {
  const { subcategories } = req.body;
  if (!Array.isArray(subcategories)) {
    throw ApiError.badRequest('Subcategories array is required');
  }

  const bulkOps = subcategories.map((sub, index) => {
    const id = sub._id || sub.id;
    const sortOrder = typeof sub.sortOrder === 'number' ? sub.sortOrder : index + 1;
    return {
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder } }
      }
    };
  });

  if (bulkOps.length > 0) {
    await ProductSubCategory.bulkWrite(bulkOps);
  }

  res.status(200).json({
    success: true,
    message: 'Product subcategories reordered successfully'
  });
});

// ==========================================
// 3. SERVICE CATEGORIES
// ==========================================

export const getServiceCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === 'true') {
    filter.isActive = true;
  }
  const categories = await ServiceCategory.find(filter).sort({ sortOrder: 1, name: 1 });
  res.status(200).json({
    success: true,
    data: categories
  });
});

export const getServiceCategoryById = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Service category not found');
  }
  res.status(200).json({
    success: true,
    data: category
  });
});

export const createServiceCategory = asyncHandler(async (req, res) => {
  const { name, title, description, sortOrder, commission, commissionRate } = req.body;
  if (!name) {
    throw ApiError.badRequest('Service category name is required');
  }

  let images = [];
  let icon = req.body.icon || null;

  if (req.files && Array.isArray(req.files)) {
    images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
    if (images.length > 0 && !icon) icon = images[0];
  } else if (req.file) {
    const url = storageProvider.getFileUrl(req.file.filename);
    images = [url];
    icon = url;
  }

  const effectiveCommission = commissionRate !== undefined ? parseFloat(commissionRate) : (commission !== undefined ? parseFloat(commission) : 12);

  const category = await ServiceCategory.create({
    name: name.trim(),
    title: title ? title.trim() : undefined,
    description: description ? description.trim() : undefined,
    images,
    icon,
    commission: effectiveCommission,
    commissionRate: effectiveCommission,
    sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0
  });

  res.status(201).json({
    success: true,
    message: 'Service category created successfully',
    data: category
  });
});

export const updateServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Service category not found');
  }

  const { name, title, description, sortOrder, isActive, commission, commissionRate, icon } = req.body;
  if (name) category.name = name.trim();
  if (title !== undefined) category.title = title.trim();
  if (description !== undefined) category.description = description.trim();
  if (icon !== undefined) category.icon = icon ? icon.trim() : null;
  if (sortOrder !== undefined) category.sortOrder = parseInt(sortOrder, 10);
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  const effectiveCommission = commissionRate !== undefined ? parseFloat(commissionRate) : (commission !== undefined ? parseFloat(commission) : undefined);
  if (effectiveCommission !== undefined) {
    category.commission = effectiveCommission;
    category.commissionRate = effectiveCommission;
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    category.images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Service category updated successfully',
    data: category
  });
});

export const deleteServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    throw ApiError.notFound('Service category not found');
  }

  await ServiceSubCategory.deleteMany({ serviceCategoryId: category._id });
  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Service category and child subcategories deleted successfully'
  });
});

// ==========================================
// 4. SERVICE SUBCATEGORIES
// ==========================================

export const getServiceSubCategories = asyncHandler(async (req, res) => {
  const filter = {};
  const catId = req.query.categoryId || req.query.serviceCategoryId;
  if (catId) {
    filter.serviceCategoryId = catId;
  }
  if (req.query.activeOnly === 'true') {
    filter.isActive = true;
  }

  const subCategories = await ServiceSubCategory.find(filter)
    .populate('serviceCategoryId', 'name slug title')
    .sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    data: subCategories
  });
});

export const getServiceSubCategoryById = asyncHandler(async (req, res) => {
  const subCategory = await ServiceSubCategory.findById(req.params.id).populate(
    'serviceCategoryId',
    'name slug title'
  );
  if (!subCategory) {
    throw ApiError.notFound('Service subcategory not found');
  }
  res.status(200).json({
    success: true,
    data: subCategory
  });
});

export const createServiceSubCategory = asyncHandler(async (req, res) => {
  const { serviceCategoryId, categoryId, name, title, basePrice, estimatedDuration, sortOrder } = req.body;
  const parentId = serviceCategoryId || categoryId;

  if (!parentId || !name) {
    throw ApiError.badRequest('Parent serviceCategoryId and subcategory name are required');
  }

  const parent = await ServiceCategory.findById(parentId);
  if (!parent) {
    throw ApiError.notFound('Parent service category does not exist');
  }

  let images = [];
  if (req.files && Array.isArray(req.files)) {
    images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  } else if (req.file) {
    images = [storageProvider.getFileUrl(req.file.filename)];
  }

  const subCategory = await ServiceSubCategory.create({
    serviceCategoryId: parent._id,
    name: name.trim(),
    title: title ? title.trim() : undefined,
    basePrice: basePrice ? parseFloat(basePrice) : 0,
    estimatedDuration: estimatedDuration || '1-2 hours',
    images,
    sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0
  });

  res.status(201).json({
    success: true,
    message: 'Service subcategory created successfully',
    data: subCategory
  });
});

export const updateServiceSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await ServiceSubCategory.findById(req.params.id);
  if (!subCategory) {
    throw ApiError.notFound('Service subcategory not found');
  }

  const { name, title, basePrice, estimatedDuration, sortOrder, isActive } = req.body;
  if (name) subCategory.name = name.trim();
  if (title !== undefined) subCategory.title = title.trim();
  if (basePrice !== undefined) subCategory.basePrice = parseFloat(basePrice);
  if (estimatedDuration) subCategory.estimatedDuration = estimatedDuration;
  if (sortOrder !== undefined) subCategory.sortOrder = parseInt(sortOrder, 10);
  if (isActive !== undefined) subCategory.isActive = Boolean(isActive);

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    subCategory.images = req.files.map((f) => storageProvider.getFileUrl(f.filename));
  }

  await subCategory.save();

  res.status(200).json({
    success: true,
    message: 'Service subcategory updated successfully',
    data: subCategory
  });
});

export const deleteServiceSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await ServiceSubCategory.findById(req.params.id);
  if (!subCategory) {
    throw ApiError.notFound('Service subcategory not found');
  }
  await subCategory.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Service subcategory deleted successfully'
  });
});

// ==========================================
// 5. UNIFIED TAXONOMY TREE
// ==========================================
export const getAllTaxonomy = asyncHandler(async (req, res) => {
  const [productCats, productSubs, serviceCats, serviceSubs] = await Promise.all([
    ProductCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }),
    ProductSubCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }),
    ServiceCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }),
    ServiceSubCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
  ]);

  const marketplaceTree = productCats.map((cat) => ({
    ...cat.toJSON(),
    subcategories: productSubs.filter((sub) => sub.productCategoryId.toString() === cat._id.toString())
  }));

  const servicesTree = serviceCats.map((cat) => ({
    ...cat.toJSON(),
    subcategories: serviceSubs.filter((sub) => sub.serviceCategoryId.toString() === cat._id.toString())
  }));

  res.status(200).json({
    success: true,
    data: {
      marketplace: marketplaceTree,
      services: servicesTree
    }
  });
});

export default {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductSubCategories,
  getProductSubCategoryById,
  createProductSubCategory,
  updateProductSubCategory,
  deleteProductSubCategory,
  reorderProductSubCategories,
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServiceSubCategories,
  getServiceSubCategoryById,
  createServiceSubCategory,
  updateServiceSubCategory,
  deleteServiceSubCategory,
  getAllTaxonomy
};
