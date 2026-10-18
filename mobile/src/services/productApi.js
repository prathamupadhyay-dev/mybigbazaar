/**
 * @file apps/mobile/src/services/productApi.js
 * @description Dynamic service for interacting with live Product & Listing endpoints.
 * Connects to /api/v1/listings and /product/* with full category attribute & media support.
 */

import { API_BASE_URL, apiGet, apiPost, apiPut, apiDelete } from './apiClient';

export const FALLBACK_PRODUCTS = [];

export const formatLocation = (loc) => {
  if (typeof loc === 'string' && loc.trim()) return loc.trim();
  if (loc && typeof loc === 'object') {
    return (
      [loc.address, loc.city, loc.state].filter(Boolean).join(', ') ||
      loc.city ||
      loc.state ||
      'Indore'
    );
  }
  return 'Indore';
};

export const resolveProductImageUrl = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return null;
  const trimmed = rawUri.trim();
  if (!trimmed) return null;
  const base = (API_BASE_URL || 'https://backend.mybigbazaar.com').replace(/\/+$/, '');
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, base);
  }
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

/**
 * Formats a concise, category-aware subtitle from dynamic listing attributes
 */
export const formatProductSubtitle = (item) => {
  if (!item) return '';
  if (item.subtitle && typeof item.subtitle === 'string' && item.subtitle.trim()) {
    return item.subtitle.trim();
  }

  let attrs = item.attributes || item.rawProduct?.attributes || {};
  if (typeof attrs === 'string') {
    try {
      attrs = JSON.parse(attrs);
    } catch {
      attrs = {};
    }
  }

  const year = attrs.year || item.year;
  const kmDriven = attrs.kmDriven || item.kmDriven;
  const fuel = attrs.fuel || item.fuel;

  // Cars / Bikes / Commercial Vehicles
  if (year && kmDriven) {
    const kmNum = Number(String(kmDriven).replace(/[^0-9]/g, ''));
    const kmStr = !isNaN(kmNum) && kmNum > 0 ? `${kmNum.toLocaleString('en-IN')} km` : `${kmDriven} km`;
    return [year, kmStr, fuel].filter(Boolean).join(' • ');
  }

  // Properties
  if (attrs.bhk || attrs.superBuiltupArea || attrs.propertyType) {
    const bhkStr = attrs.bhk ? (String(attrs.bhk).toLowerCase().includes('bhk') ? attrs.bhk : `${attrs.bhk} BHK`) : '';
    const areaStr = attrs.superBuiltupArea ? `${attrs.superBuiltupArea} sq.ft` : (attrs.carpetArea ? `${attrs.carpetArea} sq.ft` : '');
    return [bhkStr, areaStr, attrs.furnishing || attrs.propertyType].filter(Boolean).join(' • ');
  }

  // Mobiles
  if (attrs.ram || attrs.storage || attrs.batteryHealth) {
    return [attrs.ram, attrs.storage, attrs.network || attrs.batteryHealth].filter(Boolean).join(' • ');
  }

  // Jobs
  if (attrs.jobCategory || attrs.positionType || attrs.salaryFrom || attrs.salaryPeriod) {
    const sal = attrs.salaryFrom
      ? `₹${Number(attrs.salaryFrom).toLocaleString('en-IN')}${attrs.salaryTo ? ` - ₹${Number(attrs.salaryTo).toLocaleString('en-IN')}` : ''}`
      : '';
    return [attrs.positionType, sal, attrs.salaryPeriod].filter(Boolean).join(' • ');
  }

  // Electronics / Furniture / Fashion / Books / Pets / Services
  const summaryParts = [
    attrs.brand || attrs.providerBrand || attrs.companyName,
    attrs.model || attrs.applianceType || attrs.furnitureType || attrs.fashionCategory || attrs.itemType || attrs.petType || attrs.serviceType || attrs.vehicleType,
    attrs.size || attrs.material || attrs.breed || attrs.serviceMode || attrs.conditionGrade
  ].filter(Boolean);

  if (summaryParts.length > 0) {
    return summaryParts.slice(0, 2).join(' • ');
  }

  return item.category || '';
};

export const normalizeProduct = (item) => {
  if (!item) return null;

  let parsedAttributes = item.attributes || {};
  if (typeof parsedAttributes === 'string') {
    try {
      parsedAttributes = JSON.parse(parsedAttributes);
    } catch {
      parsedAttributes = {};
    }
  }

  const rawImages = Array.isArray(item.images)
    ? item.images
    : item.images
    ? [item.images]
    : item.imageUrl
    ? [item.imageUrl]
    : item.image
    ? [item.image]
    : [];

  const resolvedImages = rawImages.map(resolveProductImageUrl).filter(Boolean);
  const primaryImage =
    resolvedImages[0] ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';

  const priceVal =
    typeof item.price === 'number' && item.price > 0
      ? item.price
      : typeof item.productPrice === 'number'
      ? item.productPrice
      : Number(item.price || item.productPrice || 0);

  const origPriceVal = Number(item.originalPrice || priceVal || 0);
  const discPriceVal = Number(item.discountPrice || item.productDiscountPrice || priceVal || 0);

  const resolvedSellerName =
    item.sellerName ||
    (typeof item.sellerId === 'object' && item.sellerId !== null
      ? item.sellerId.fullName || item.sellerId.name
      : null) ||
    item.seller?.name ||
    'Verified Seller';

  const resolvedSellerPhone =
    item.sellerPhone ||
    (typeof item.sellerId === 'object' && item.sellerId !== null
      ? item.sellerId.phoneNumber || item.sellerId.phone
      : null) ||
    item.seller?.phone ||
    '';

  const resolvedCity =
    typeof item.location === 'object' && item.location !== null
      ? item.location.city || 'Indore'
      : item.city || 'Indore';

  const normalized = {
    ...item,
    id: item._id || item.id,
    _id: item._id || item.id,
    title: item.title || item.productName || 'Classified Item',
    productName: item.productName || item.title || 'Classified Item',
    price: priceVal,
    productPrice: priceVal,
    originalPrice: origPriceVal,
    discountPrice: discPriceVal,
    productDiscountPrice: discPriceVal,
    description: item.description || item.productDescription || '',
    productDescription: item.productDescription || item.description || '',
    category: item.category || 'General',
    categoryId:
      item.categoryId ||
      (Array.isArray(item.productCategorysId) ? item.productCategorysId[0] : item.productCategorysId) ||
      null,
    condition: item.condition || 'Good',
    location: formatLocation(item.location),
    city: resolvedCity,
    images: resolvedImages,
    imageUrl: primaryImage,
    sellerName: resolvedSellerName,
    sellerPhone: resolvedSellerPhone,
    attributes: parsedAttributes,
    views: typeof item.views === 'number' ? item.views : 0,
    isFeatured: Boolean(item.isFeatured),
  };

  normalized.subtitle = formatProductSubtitle(normalized);
  return normalized;
};

/**
 * Create a new Product / Listing on the live backend
 * Supports both /product/create and /api/v1/listings with full dynamic attributes
 */
export const createProductApi = async (payload) => {
  let body = payload;

  if (!(payload instanceof FormData)) {
    body = new FormData();
    const titleVal = payload.title || payload.productName || 'Untitled Listing';
    const descVal = payload.description || payload.productDescription || titleVal;
    const priceVal = String(payload.price ?? payload.productPrice ?? 0);
    const discVal = String(payload.discountPrice ?? payload.productDiscountPrice ?? priceVal);

    body.append('productName', titleVal);
    body.append('title', titleVal);
    body.append('productDescription', descVal);
    body.append('description', descVal);
    body.append('productPrice', priceVal);
    body.append('price', priceVal);
    body.append('productDiscountPrice', discVal);
    body.append('discountPrice', discVal);

    if (payload.taxId) body.append('taxId', String(payload.taxId));
    if (payload.authId) body.append('authId', String(payload.authId));
    if (payload.sellerId || payload.authId) {
      body.append('sellerId', String(payload.sellerId || payload.authId));
    }
    if (payload.sellerName) body.append('sellerName', String(payload.sellerName));
    if (payload.sellerPhone) body.append('sellerPhone', String(payload.sellerPhone));
    if (payload.category) body.append('category', String(payload.category));
    if (payload.categoryId) body.append('categoryId', String(payload.categoryId));
    if (payload.subcategory) body.append('subcategory', String(payload.subcategory));
    if (payload.subCategoryId) body.append('subCategoryId', String(payload.subCategoryId));
    if (payload.condition) body.append('condition', String(payload.condition));
    if (payload.city) body.append('city', String(payload.city));
    if (payload.state) body.append('state', String(payload.state));
    if (payload.pincode) body.append('pincode', String(payload.pincode));
    if (payload.address) body.append('address', String(payload.address));
    body.append('status', payload.status || 'active');

    if (payload.attributes && typeof payload.attributes === 'object') {
      body.append('attributes', JSON.stringify(payload.attributes));
    } else if (typeof payload.attributes === 'string') {
      body.append('attributes', payload.attributes);
    }

    // Array of category IDs
    if (Array.isArray(payload.productCategorysId)) {
      payload.productCategorysId.forEach((catId) => {
        if (catId) body.append('productCategorysId[]', String(catId));
      });
      if (!payload.categoryId && payload.productCategorysId[0]) {
        body.append('categoryId', String(payload.productCategorysId[0]));
      }
    } else if (payload.productCategorysId) {
      body.append('productCategorysId[]', String(payload.productCategorysId));
      if (!payload.categoryId) {
        body.append('categoryId', String(payload.productCategorysId));
      }
    }

    // Attach images (local URIs as multipart files, remote http URLs as imageUrls JSON)
    const remoteUrls = [];
    if (Array.isArray(payload.images)) {
      payload.images.slice(0, 20).forEach((img, index) => {
        if (typeof img === 'string') {
          if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads')) {
            remoteUrls.push(img);
          } else {
            body.append('images', {
              uri: img,
              name: `product_${Date.now()}_${index}.jpg`,
              type: 'image/jpeg',
            });
          }
        } else if (img && typeof img === 'object') {
          body.append('images', img);
        }
      });
    }
    if (remoteUrls.length > 0) {
      body.append('imageUrls', JSON.stringify(remoteUrls));
    }
  }

  try {
    return await apiPost('/product/create', body);
  } catch (error) {
    if (error.status === 404) {
      return await apiPost('/api/v1/listings', body);
    }
    throw error;
  }
};

/**
 * Fetch all live products from the backend.
 * Returns strictly the real database listings (no static mock padding).
 */
export const getProductsApi = async (params = {}) => {
  const queryParts = [];
  if (params.category && params.category !== 'All') {
    queryParts.push(`category=${encodeURIComponent(params.category)}`);
  }
  if (params.limit) {
    queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
  } else {
    queryParts.push('limit=100');
  }
  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '?limit=100';

  // 1. Try modern /api/v1/listings endpoint
  try {
    const data = await apiGet(`/api/v1/listings${qs}`);
    const list = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.listings)
      ? data.listings
      : Array.isArray(data)
      ? data
      : null;
    if (Array.isArray(list)) {
      return list.map(normalizeProduct).filter(Boolean);
    }
  } catch (_err) {
    // fallback to legacy route
  }

  // 2. Try legacy /product/get-all endpoint
  try {
    const data = await apiGet('/product/get-all');
    const list = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data)
      ? data
      : null;
    if (Array.isArray(list)) {
      return list.map(normalizeProduct).filter(Boolean);
    }
  } catch (_err) {
    // return empty array when offline
  }

  return [];
};

/**
 * Update an existing listing on the backend
 */
export const updateProductApi = async (id, updates) => {
  if (!id) return null;
  try {
    return await apiPut(`/api/v1/listings/${id}`, updates);
  } catch (_err) {
    return await apiPut(`/product/update/${id}`, updates);
  }
};

/**
 * Delete an existing listing on the backend
 */
export const deleteProductApi = async (id) => {
  if (!id) return null;
  try {
    return await apiDelete(`/api/v1/listings/${id}`);
  } catch (_err) {
    return await apiDelete(`/product/delete/${id}`);
  }
};

export default {
  createProductApi,
  getProductsApi,
  updateProductApi,
  deleteProductApi,
  formatProductSubtitle,
  normalizeProduct,
  resolveProductImageUrl,
};
