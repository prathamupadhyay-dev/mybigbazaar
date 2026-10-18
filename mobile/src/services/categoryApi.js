/**
 * @file apps/mobile/src/services/categoryApi.js
 * @description Centralized Category & SubCategory API client for MyBigBazaar Mobile.
 * Connects directly to the backend developer's live endpoints:
 * - GET /product-category/get-all
 * - GET /product-subCategory/get-all
 * - GET /service-category/get-all
 * - GET /service-subCategory/get-all
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, resolveBaseUrl, getLocalApiBase } from './apiClient';

/**
 * Bulletproof resolver that guarantees a valid HTTP protocol URL
 * and prevents any 'undefined/' string interpolation.
 */
export const getEffectiveBaseUrl = () => {
  if (API_BASE_URL && typeof API_BASE_URL === 'string' && API_BASE_URL !== 'undefined') {
    return API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof resolveBaseUrl === 'function') {
    const resolved = resolveBaseUrl();
    if (resolved && typeof resolved === 'string' && resolved !== 'undefined') {
      return resolved.replace(/\/+$/, '');
    }
  }
  if (typeof getLocalApiBase === 'function') {
    const local = getLocalApiBase();
    if (local && typeof local === 'string' && local !== 'undefined') {
      return local.replace(/\/+$/, '');
    }
  }
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl !== 'undefined') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://10.154.47.176:5000';
};

export const FALLBACK_PRODUCT_CATEGORIES = [
  { _id: 'cat-props', name: 'Properties', title: 'Properties', slug: 'properties', icon: 'business', sortOrder: 1 },
  { _id: 'cat-mobs', name: 'Mobiles', title: 'Mobiles', slug: 'mobiles', icon: 'phone-portrait', sortOrder: 2 },
  { _id: 'cat-jobs', name: 'Jobs', title: 'Jobs', slug: 'jobs', icon: 'briefcase', sortOrder: 3 },
  { _id: 'cat-bikes', name: 'Bikes', title: 'Bikes', slug: 'bikes', icon: 'bicycle', sortOrder: 4 },
  { _id: 'cat-elec', name: 'Electronics & Appliances', title: 'Electronics & Appliances', slug: 'electronics-appliances', icon: 'tv', sortOrder: 5 },
  { _id: 'cat-comm', name: 'Commercial Vehicles & Spares', title: 'Commercial Vehicles & Spares', slug: 'commercial-vehicles', icon: 'bus', sortOrder: 6 },
  { _id: 'cat-furn', name: 'Furniture', title: 'Furniture', slug: 'furniture', icon: 'bed', sortOrder: 7 },
  { _id: 'cat-fash', name: 'Fashion', title: 'Fashion', slug: 'fashion', icon: 'shirt', sortOrder: 8 },
  { _id: 'cat-books', name: 'Books, Sports & Hobbies', title: 'Books, Sports & Hobbies', slug: 'books-sports-hobbies', icon: 'football', sortOrder: 9 },
  { _id: 'cat-pets', name: 'Pets', title: 'Pets', slug: 'pets', icon: 'paw', sortOrder: 10 },
  { _id: 'cat-serv', name: 'Services', title: 'Services', slug: 'services', icon: 'construct', sortOrder: 11 }
];

export const FALLBACK_SERVICE_CATEGORIES = [
  { _id: 'scat-elec', name: 'Electrical & AC', slug: 'electrical-ac' },
  { _id: 'scat-plumb', name: 'Plumbing & Water', slug: 'plumbing-water' },
  { _id: 'scat-clean', name: 'Home Cleaning', slug: 'home-cleaning' },
  { _id: 'scat-apprepair', name: 'Appliance Repair', slug: 'appliance-repair' },
  { _id: 'scat-tutor', name: 'Tutoring & Classes', slug: 'tutoring-classes' },
  { _id: 'scat-beauty', name: 'Salon & Spa at Home', slug: 'salon-spa' }
];

export const FALLBACK_PRODUCT_SUBCATEGORIES = [
  // Bikes
  { _id: 'sub-bk1', name: 'Motorcycles', categoryId: 'cat-bikes', categorySlug: 'bikes' },
  { _id: 'sub-bk2', name: 'Scooters', categoryId: 'cat-bikes', categorySlug: 'bikes' },
  { _id: 'sub-bk3', name: 'Spare Parts', categoryId: 'cat-bikes', categorySlug: 'bikes' },
  { _id: 'sub-bk4', name: 'Bicycles', categoryId: 'cat-bikes', categorySlug: 'bikes' },

  // Properties
  { _id: 'sub-pr1', name: 'For Sale: Houses & Apartments', categoryId: 'cat-props', categorySlug: 'properties' },
  { _id: 'sub-pr2', name: 'For Rent: Houses & Apartments', categoryId: 'cat-props', categorySlug: 'properties' },
  { _id: 'sub-pr3', name: 'For Sale: New Projects & Properties', categoryId: 'cat-props', categorySlug: 'properties' },
  { _id: 'sub-pr4', name: 'Lands & Plots', categoryId: 'cat-props', categorySlug: 'properties' },
  { _id: 'sub-pr5', name: 'For Rent: Shops & Offices', categoryId: 'cat-props', categorySlug: 'properties' },
  { _id: 'sub-pr6', name: 'For Sale: Shops & Offices', categoryId: 'cat-props', categorySlug: 'properties' },
  { _id: 'sub-pr7', name: 'PG & Guest Houses', categoryId: 'cat-props', categorySlug: 'properties' },

  // Electronics & Appliances
  { _id: 'sub-el1', name: 'TVs, Video - Audio', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el2', name: 'Kitchen & Other Appliances', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el3', name: 'Computers & Laptops', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el4', name: 'Cameras & Lenses', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el5', name: 'Games & Entertainment', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el6', name: 'Fridges', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el7', name: 'Computer Accessories', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el8', name: 'Hard Disks, Printers & Monitors', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el9', name: 'ACs', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },
  { _id: 'sub-el10', name: 'Washing Machines', categoryId: 'cat-elec', categorySlug: 'electronics-appliances' },

  // Mobiles
  { _id: 'sub-mb1', name: 'Mobile Phones', categoryId: 'cat-mobs', categorySlug: 'mobiles' },
  { _id: 'sub-mb2', name: 'Accessories', categoryId: 'cat-mobs', categorySlug: 'mobiles' },
  { _id: 'sub-mb3', name: 'Tablets', categoryId: 'cat-mobs', categorySlug: 'mobiles' },

  // Commercial Vehicles & Spares
  { _id: 'sub-cv1', name: 'Commercial & Other Vehicles', categoryId: 'cat-comm', categorySlug: 'commercial-vehicles' },
  { _id: 'sub-cv2', name: 'Spare Parts', categoryId: 'cat-comm', categorySlug: 'commercial-vehicles' },

  // Jobs
  { _id: 'sub-jb1', name: 'Data entry & Back office', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb2', name: 'Sales & Marketing', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb3', name: 'BPO & Telecaller', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb4', name: 'Driver', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb5', name: 'Office Assistant', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb6', name: 'Delivery & Collection', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb7', name: 'Teacher', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb8', name: 'Cook', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb9', name: 'Receptionist & Front office', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb10', name: 'Operator & Technician', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb11', name: 'IT Engineer & Developer', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb12', name: 'Hotel & Travel Executive', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb13', name: 'Accountant', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb14', name: 'Designer', categoryId: 'cat-jobs', categorySlug: 'jobs' },
  { _id: 'sub-jb15', name: 'Warehouse Staff', categoryId: 'cat-jobs', categorySlug: 'jobs', isNew: true },
  { _id: 'sub-jb16', name: 'Security Guard', categoryId: 'cat-jobs', categorySlug: 'jobs', isNew: true },
  { _id: 'sub-jb17', name: 'Other Jobs', categoryId: 'cat-jobs', categorySlug: 'jobs' },

  // Furniture
  { _id: 'sub-fn1', name: 'Sofa & Dining', categoryId: 'cat-furn', categorySlug: 'furniture' },
  { _id: 'sub-fn2', name: 'Beds & Wardrobes', categoryId: 'cat-furn', categorySlug: 'furniture' },
  { _id: 'sub-fn3', name: 'Home Decor & Garden', categoryId: 'cat-furn', categorySlug: 'furniture' },
  { _id: 'sub-fn4', name: 'Kids Furniture', categoryId: 'cat-furn', categorySlug: 'furniture' },
  { _id: 'sub-fn5', name: 'Other Household Items', categoryId: 'cat-furn', categorySlug: 'furniture' },

  // Fashion
  { _id: 'sub-fs1', name: 'Men', categoryId: 'cat-fash', categorySlug: 'fashion' },
  { _id: 'sub-fs2', name: 'Women', categoryId: 'cat-fash', categorySlug: 'fashion' },
  { _id: 'sub-fs3', name: 'Kids', categoryId: 'cat-fash', categorySlug: 'fashion' },

  // Books, Sports & Hobbies
  { _id: 'sub-bk1', name: 'Books', categoryId: 'cat-books', categorySlug: 'books-sports-hobbies' },
  { _id: 'sub-bk2', name: 'Gym & Fitness', categoryId: 'cat-books', categorySlug: 'books-sports-hobbies' },
  { _id: 'sub-bk3', name: 'Musical Instruments', categoryId: 'cat-books', categorySlug: 'books-sports-hobbies' },
  { _id: 'sub-bk4', name: 'Sports Equipment', categoryId: 'cat-books', categorySlug: 'books-sports-hobbies' },
  { _id: 'sub-bk5', name: 'Other Hobbies', categoryId: 'cat-books', categorySlug: 'books-sports-hobbies' },

  // Pets
  { _id: 'sub-pt1', name: 'Fishes & Aquarium', categoryId: 'cat-pets', categorySlug: 'pets' },
  { _id: 'sub-pt2', name: 'Pet Food & Accessories', categoryId: 'cat-pets', categorySlug: 'pets' },
  { _id: 'sub-pt3', name: 'Dogs', categoryId: 'cat-pets', categorySlug: 'pets' },
  { _id: 'sub-pt4', name: 'Other Pets', categoryId: 'cat-pets', categorySlug: 'pets' },

  // Services (Screenshot media_1791345408868.png)
  { _id: 'sub-sv1', name: 'Education & Classes', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv2', name: 'Tours & Travel', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv3', name: 'Electronics Repair & Services', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv4', name: 'Health & Beauty', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv5', name: 'Home Renovation & Repair', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv6', name: 'Cleaning & Pest Control', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv7', name: 'Legal & Documentation Services', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv8', name: 'Packers & Movers', categoryId: 'cat-serv', categorySlug: 'services' },
  { _id: 'sub-sv9', name: 'Other Services', categoryId: 'cat-serv', categorySlug: 'services' }
];

export const FALLBACK_SERVICE_SUBCATEGORIES = [
  { _id: 'sub-s1', name: 'Split AC Deep Cleaning & Service', categoryId: 'scat-elec', price: 799, description: 'Complete indoor & outdoor unit foam jet cleaning, gas pressure check and filter wash.' },
  { _id: 'sub-s2', name: 'Electrical Safety Inspection & Short Circuit Fix', categoryId: 'scat-elec', price: 499, description: 'Certified electrician diagnostic, fuse box check, switchboard wiring replacement.' },
  { _id: 'sub-s3', name: 'Comprehensive Bathroom Leakage & Tap Fix', categoryId: 'scat-plumb', price: 399, description: 'Fix dripping faucets, pipe joint leaks, and water pressure regulator setup.' },
  { _id: 'sub-s4', name: 'Water Purifier RO Filter Service & Repair', categoryId: 'scat-plumb', price: 549, description: 'Sediment and carbon filter replacement, membrane sanitization, TDS test.' },
  { _id: 'sub-s5', name: 'Complete 2BHK Deep Home Cleaning', categoryId: 'scat-clean', price: 1499, description: 'Floor scrubbing with single-disc machine, window mesh degreasing, bathroom sanitization.' },
  { _id: 'sub-s6', name: 'Kitchen Chimney & Hob Deep Degreasing', categoryId: 'scat-clean', price: 899, description: 'Full baffle filter caustic bath, motor housing wipe-down, blower degreasing.' },
  { _id: 'sub-s7', name: 'Washing Machine Drum & Motor Repair', categoryId: 'scat-apprepair', price: 650, description: 'Top/front load spin repair, drain pump unblocking, bearing noise fix.' },
  { _id: 'sub-s8', name: 'Mathematics & Science 1-on-1 Home Tutor', categoryId: 'scat-tutor', price: 600, description: 'Experienced CBSE/ICSE personal tutor for classes 8-12, trial class included.' }
];

/**
 * Fetch all product categories from live backend
 * @returns {Promise<Array<{ _id: string, name: string, slug?: string, icon?: string }>>}
 */
export const getProductCategoriesApi = async (activeOnly = true) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const baseUrl = getEffectiveBaseUrl();
    const url = `${baseUrl}/product-category/get-all${activeOnly ? '?activeOnly=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load categories (HTTP ${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    const list = Array.isArray(data) ? data : (data.data || []);
    const filtered = activeOnly ? list.filter(c => c.isActive !== false && c.status !== 'Inactive') : list;
    filtered.sort((a, b) => {
      const oA = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
      const oB = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
      if (oA !== oB) return oA - oB;
      return (a.name || '').localeCompare(b.name || '');
    });

    if (filtered.length > 0) {
      if (activeOnly) {
        AsyncStorage.setItem('@cached_active_categories', JSON.stringify(filtered)).catch(() => {});
      }
      return filtered;
    }
    return activeOnly ? FALLBACK_PRODUCT_CATEGORIES : [];
  } catch (error) {
    console.log('[CATEGORY_API] getProductCategories error, checking cache / fallback:', error.message);
    try {
      const cached = await AsyncStorage.getItem('@cached_active_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return activeOnly ? parsed.filter(c => c.isActive !== false && c.status !== 'Inactive') : parsed;
        }
      }
    } catch (cacheErr) {
      // ignore
    }
    return FALLBACK_PRODUCT_CATEGORIES;
  }
};

/**
 * Fetch all product subcategories from live backend
 * @param {string|object} [categoryOrId]
 * @returns {Promise<Array<{ _id: string, name: string, categoryId?: string, slug?: string }>>}
 */
export const getProductSubCategoriesApi = async (categoryOrId, fallbackSlug, fallbackName) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const targetId = typeof categoryOrId === 'object' && categoryOrId !== null ? categoryOrId._id : categoryOrId;
    const targetSlug = typeof categoryOrId === 'object' && categoryOrId !== null ? (categoryOrId.slug || categoryOrId.name?.toLowerCase()) : fallbackSlug;
    const targetName = typeof categoryOrId === 'object' && categoryOrId !== null ? (categoryOrId.name || categoryOrId.title) : fallbackName;

    const baseUrl = getEffectiveBaseUrl();
    const endpoint = targetId
      ? `${baseUrl}/product-subCategory/get-all?categoryId=${encodeURIComponent(targetId)}`
      : `${baseUrl}/product-subCategory/get-all`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load subcategories (HTTP ${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    let list = Array.isArray(data) ? data : (data.data || []);

    // Filter out inactive subcategories AND subcategories whose parent is deactivated
    list = list.filter(s => {
      if (s.isActive === false || s.status === 'Inactive') return false;
      if (s.productCategoryId && typeof s.productCategoryId === 'object') {
        if (s.productCategoryId.isActive === false || s.productCategoryId.status === 'Inactive') return false;
      }
      return true;
    });

    if ((targetId || targetSlug || targetName) && list.length > 0) {
      list = list.filter((item) => {
        const itemCatId = item.productCategoryId?._id || item.productCategoryId || item.categoryId?._id || item.categoryId || item.category;
        const itemCatSlug = item.productCategoryId?.slug || item.categorySlug;
        const itemCatName = item.productCategoryId?.name || item.productCategoryId?.title || item.categoryName;

        return (
          (targetId && String(itemCatId) === String(targetId)) ||
          (targetSlug && (
            (itemCatSlug && String(itemCatSlug).toLowerCase() === String(targetSlug).toLowerCase()) ||
            (itemCatName && String(itemCatName).toLowerCase() === String(targetSlug).toLowerCase())
          )) ||
          (targetName && (
            (itemCatName && String(itemCatName).toLowerCase() === String(targetName).toLowerCase()) ||
            (itemCatSlug && String(itemCatSlug).toLowerCase() === String(targetName).toLowerCase())
          ))
        );
      });
    }

    list.sort((a, b) => {
      const oA = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
      const oB = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
      if (oA !== oB) return oA - oB;
      return (a.name || '').localeCompare(b.name || '');
    });

    if (list.length > 0) return list;

    return (targetId || targetSlug || targetName)
      ? FALLBACK_PRODUCT_SUBCATEGORIES.filter((s) => 
          (targetId && (s.categoryId === targetId || String(s.categoryId).toLowerCase() === String(targetId).toLowerCase())) ||
          (targetSlug && (
            s.categorySlug === targetSlug || 
            s.categoryId === targetSlug || 
            String(s.categorySlug).toLowerCase() === String(targetSlug).toLowerCase()
          )) ||
          (targetName && (
            String(s.categorySlug).toLowerCase() === String(targetName).toLowerCase() ||
            (s.name && String(s.name).toLowerCase() === String(targetName).toLowerCase())
          ))
        )
      : FALLBACK_PRODUCT_SUBCATEGORIES;
  } catch (error) {
    console.log('[CATEGORY_API] getProductSubCategories error, using fallback:', error.message);
    const targetId = typeof categoryOrId === 'object' && categoryOrId !== null ? categoryOrId._id : categoryOrId;
    const targetSlug = typeof categoryOrId === 'object' && categoryOrId !== null ? (categoryOrId.slug || categoryOrId.name?.toLowerCase()) : fallbackSlug;
    const targetName = typeof categoryOrId === 'object' && categoryOrId !== null ? (categoryOrId.name || categoryOrId.title) : fallbackName;

    return (targetId || targetSlug || targetName)
      ? FALLBACK_PRODUCT_SUBCATEGORIES.filter((s) => 
          (targetId && (s.categoryId === targetId || String(s.categoryId).toLowerCase() === String(targetId).toLowerCase())) ||
          (targetSlug && (
            s.categorySlug === targetSlug || 
            s.categoryId === targetSlug || 
            String(s.categorySlug).toLowerCase() === String(targetSlug).toLowerCase()
          )) ||
          (targetName && (
            String(s.categorySlug).toLowerCase() === String(targetName).toLowerCase() ||
            (s.name && String(s.name).toLowerCase() === String(targetName).toLowerCase())
          ))
        )
      : FALLBACK_PRODUCT_SUBCATEGORIES;
  }
};

/**
 * Fetch all service categories from live backend
 * @returns {Promise<Array<{ _id: string, name: string, slug?: string, icon?: string }>>}
 */
export const getServiceCategoriesApi = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const baseUrl = getEffectiveBaseUrl();
    const response = await fetch(`${baseUrl}/service-category/get-all`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load service categories (HTTP ${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    const list = Array.isArray(data) ? data : (data.data || []);
    return list.length > 0 ? list : FALLBACK_SERVICE_CATEGORIES;
  } catch (error) {
    console.log('[CATEGORY_API] getServiceCategories error, using fallback:', error.message);
    return FALLBACK_SERVICE_CATEGORIES;
  }
};

/**
 * Fetch all service subcategories from live backend
 * @param {string} [categoryId]
 * @returns {Promise<Array<{ _id: string, name: string, categoryId?: string, slug?: string }>>}
 */
export const getServiceSubCategoriesApi = async (categoryId) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const baseUrl = getEffectiveBaseUrl();
    const endpoint = categoryId
      ? `${baseUrl}/service-subCategory/get-all?categoryId=${encodeURIComponent(categoryId)}`
      : `${baseUrl}/service-subCategory/get-all`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load service subcategories (HTTP ${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    let list = Array.isArray(data) ? data : (data.data || []);

    if (categoryId && list.length > 0) {
      list = list.filter((item) => {
        const itemCatId = item.categoryId?._id || item.categoryId || item.category;
        return String(itemCatId) === String(categoryId);
      });
    }

    if (list.length > 0) return list;
    return categoryId
      ? FALLBACK_SERVICE_SUBCATEGORIES.filter((s) => s.categoryId === categoryId)
      : FALLBACK_SERVICE_SUBCATEGORIES;
  } catch (error) {
    console.log('[CATEGORY_API] getServiceSubCategories error, using fallback:', error.message);
    return categoryId
      ? FALLBACK_SERVICE_SUBCATEGORIES.filter((s) => s.categoryId === categoryId)
      : FALLBACK_SERVICE_SUBCATEGORIES;
  }
};
