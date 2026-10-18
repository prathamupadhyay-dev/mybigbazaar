/**
 * @file apps/mobile/src/services/homeApi.js
 * @description API service for homepage dynamic data, categories, banners, services, and location
 */

import { apiFetch, apiGet, apiPost } from './apiClient';

/**
 * Fetch aggregated home screen data (banners, category pills, nearby services, popular products)
 */
export const getHomeDataApi = async () => {
  try {
    const res = await apiGet('/api/v1/home/home-data');
    if (res && res.success && res.data) {
      return res.data;
    }
    return res?.data || res || null;
  } catch (error) {
    console.log('[HomeApi] Failed to fetch home data:', error.message);
    return null;
  }
};

/**
 * Fetch user saved / detected location from backend
 */
export const getUserLocationApi = async () => {
  try {
    const res = await apiGet('/api/v1/user/location');
    if (res && res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.log('[HomeApi] Failed to fetch user location:', error.message);
    return null;
  }
};

/**
 * Post notification permission status to backend
 */
export const updateNotificationPermissionApi = async (granted = true) => {
  try {
    const res = await apiPost('/api/v1/user/notification-permission', {
      granted,
      deviceToken: `token-${Date.now()}`,
      platform: 'mobile'
    });
    return res;
  } catch (error) {
    console.log('[HomeApi] Failed to update notification permission:', error.message);
    return null;
  }
};

/**
 * Fetch dynamic CMS banners by placement (e.g. 'onboarding', 'home_hero', 'promotions', 'services')
 */
export const getCmsBannersApi = async (placement = '') => {
  try {
    const url = placement ? `/api/v1/cms/banners?placement=${placement}` : '/api/v1/cms/banners';
    const res = await apiGet(url);
    if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  } catch (error) {
    console.log('[HomeApi] Failed to fetch CMS banners:', error.message);
    return null;
  }
};

/**
 * Track banner impression or click telemetry
 */
export const trackBannerEventApi = async (bannerId, type = 'impression') => {
  if (!bannerId) return;
  try {
    await apiPost(`/api/v1/cms/banners/${bannerId}/track`, { type });
  } catch (error) {
    // Non-blocking telemetry
  }
};

/**
 * Fetch hero banner settings (autoplay interval, dots, etc.)
 */
export const getBannerSettingsApi = async () => {
  try {
    const res = await apiGet('/api/v1/cms/banners/settings');
    if (res && res.success && res.data) {
      return res.data;
    }
    return res?.data || null;
  } catch (error) {
    return null;
  }
};

