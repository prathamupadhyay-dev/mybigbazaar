/**
 * @file apps/mobile/src/services/taxApi.js
 * @description Service for interacting with live Tax endpoints
 */

import { apiGet } from './apiClient';

/**
 * Fetch all active taxes from live backend
 * Checks GET /tax/get-all and GET /api/v1/taxes
 */
export const getTaxesApi = async () => {
  try {
    const data = await apiGet('/tax/get-all');
    if (data && Array.isArray(data.taxes)) {
      return data.taxes;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (_err) {
    // Fallback to /api/v1/taxes
  }

  try {
    const data = await apiGet('/api/v1/taxes');
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data && Array.isArray(data.taxes)) {
      return data.taxes;
    }
    return [];
  } catch (err) {
    console.log('[TAX_API] Failed to fetch taxes from live backend:', err.message);
    return [];
  }
};

/**
 * Fetch single tax rule by ID
 * Endpoint: GET /tax/get-by-id/:id
 */
export const getTaxByIdApi = async (id) => {
  try {
    const data = await apiGet(`/tax/get-by-id/${id}`);
    return data?.tax || data?.data || null;
  } catch (err) {
    console.log(`[TAX_API] Failed to fetch tax ${id}:`, err.message);
    return null;
  }
};

export default {
  getTaxesApi,
  getTaxByIdApi,
};
