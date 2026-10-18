/**
 * @file apps/mobile/src/services/logoApi.js
 * @description Centralized Brand Logo API client for MyBigBazaar Mobile.
 * Connects to live endpoints:
 * - GET /logo/get-all
 * - GET /logo/get-by-id/:id
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiClient';

export const LOGO_STORAGE_KEY = '@bigbazaar_site_logo';

export const getBaseUrl = () => {
  if (API_BASE_URL && typeof API_BASE_URL === 'string' && API_BASE_URL !== 'undefined') {
    return API_BASE_URL.replace(/\/+$/, '');
  }
  return 'http://10.154.47.176:5000';
};

/**
 * Format asset URL with backend host if relative
 * @param {string} path
 * @returns {string}
 */
export const resolveLogoUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${cleanPath}`;
};

/**
 * Fetch authoritative brand logo from live backend
 * @returns {Promise<{ _id?: string, url: string } | null>}
 */
export const getLogoApi = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${getBaseUrl()}/logo/get-all`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching logo`);
    }

    const data = await response.json().catch(() => ({}));
    const logoObj = data?.logo;
    if (logoObj && logoObj.logo) {
      const fullUrl = resolveLogoUrl(logoObj.logo);
      await AsyncStorage.setItem(LOGO_STORAGE_KEY, fullUrl).catch(() => {});
      return {
        _id: logoObj._id,
        url: fullUrl,
        rawPath: logoObj.logo,
      };
    }
    return null;
  } catch (error) {
    console.log('[LOGO_API] getLogoApi error:', error.message);
    const cached = await AsyncStorage.getItem(LOGO_STORAGE_KEY).catch(() => null);
    if (cached) {
      return { url: cached };
    }
    return null;
  }
};

/**
 * Get cached logo URL from local storage
 * @returns {Promise<string|null>}
 */
export const getCachedLogoUrl = async () => {
  try {
    return await AsyncStorage.getItem(LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
};
