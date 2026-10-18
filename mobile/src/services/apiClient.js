/**
 * @file apps/mobile/src/services/apiClient.js
 * @description Centralized, canonical API client for MyBigBazaar Mobile.
 * Connects directly to the live backend: https://backend.mybigbazaar.com
 * Handles authentication injection, session expiration (401), timeouts,
 * multipart form-data, and uniform structured error parsing.
 */

import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const TOKEN_STORAGE_KEY = '@bigbazaar_auth_token';
export const USER_STORAGE_KEY = '@bigbazaar_user_profile';

/**
 * Get the Metro bundler dev server host IP (e.g., 10.48.78.176)
 * when running Expo Go / development on a physical device.
 */
export const getDevServerHost = () => {
  try {
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest?.debuggerHost ||
      Constants?.manifest2?.extra?.expoClient?.hostUri ||
      Constants?.linkingUri;
    if (hostUri) {
      const cleaned = hostUri.replace(/^[a-z]+:\/\//i, '');
      const host = cleaned.split('/')[0]?.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    }
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1];
      const host = address ? address.split('/')[0]?.split(':')[0] : null;
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    }
  } catch (e) {}
  return '10.154.47.176';
};

export const PRODUCTION_API_URL = 'https://backend.mybigbazaar.com';

export const getLocalApiBase = () => {
  return PRODUCTION_API_URL;
};

/**
 * Resolve canonical backend URL pointing strictly to live backend
 */
export const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl !== 'undefined') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.includes('localhost') && !cleanUrl.includes('127.0.0.1')) {
      return cleanUrl;
    }
  }
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = resolveBaseUrl();

/**
 * Auth Token Helpers
 */
export const saveAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.log('[API_CLIENT] Failed to save auth token:', e);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
};

export const saveUserProfile = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.log('[API_CLIENT] Failed to save user profile:', e);
  }
};

export const getUserProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const clearAuthSession = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
  } catch (e) {
    console.log('[API_CLIENT] Failed to clear auth session:', e);
  }
};

/**
 * Core HTTP Request Dispatcher
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  const base = (API_BASE_URL && typeof API_BASE_URL === 'string' && API_BASE_URL !== 'undefined')
    ? API_BASE_URL.replace(/\/+$/, '')
    : (resolveBaseUrl() || getLocalApiBase() || 'http://10.154.47.176:5000').replace(/\/+$/, '');
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type'] && !headers['content-type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // 401 Interceptor: Clear session on expired/invalid auth
    if (response.status === 401) {
      console.log('[API_CLIENT] Session expired or unauthorized (HTTP 401). Clearing stored session.');
      await clearAuthSession();
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s connecting to server.`);
    }
    const isNetworkError =
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError');
    if (isNetworkError) {
      throw new Error(`Unable to reach backend server at ${API_BASE_URL}. Please check internet connection.`);
    }
    throw error;
  }
};

/**
 * Helper methods returning parsed JSON data or throwing structured errors
 */
export const apiGet = async (endpoint, options = {}) => {
  const response = await apiFetch(endpoint, { ...options, method: 'GET' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message || `GET ${endpoint} failed (HTTP ${response.status})`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiPost = async (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message || `POST ${endpoint} failed (HTTP ${response.status})`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiPut = async (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: isFormData ? body : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message || `PUT ${endpoint} failed (HTTP ${response.status})`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiPatch = async (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await apiFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: isFormData ? body : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message || `PATCH ${endpoint} failed (HTTP ${response.status})`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiDelete = async (endpoint, options = {}) => {
  const response = await apiFetch(endpoint, { ...options, method: 'DELETE' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message || `DELETE ${endpoint} failed (HTTP ${response.status})`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiUpload = async (endpoint, formData, options = {}) => {
  return apiPost(endpoint, formData, options);
};

export default {
  API_BASE_URL,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
  saveAuthToken,
  getAuthToken,
  saveUserProfile,
  getUserProfile,
  clearAuthSession,
};
