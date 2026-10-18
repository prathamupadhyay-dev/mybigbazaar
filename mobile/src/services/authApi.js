import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL as RAW_API_BASE_URL, resolveBaseUrl as rawResolveBaseUrl } from './apiClient';

export const resolveBaseUrl = rawResolveBaseUrl;
export const API_BASE_URL =
  RAW_API_BASE_URL && typeof RAW_API_BASE_URL === 'string' && RAW_API_BASE_URL !== 'undefined'
    ? RAW_API_BASE_URL
    : (typeof rawResolveBaseUrl === 'function' ? rawResolveBaseUrl() : null) || 'http://10.154.47.176:5000';

export const TOKEN_STORAGE_KEY = '@bigbazaar_auth_token';
export const USER_STORAGE_KEY = '@bigbazaar_user_profile';
export const LOCATION_STORAGE_KEY = '@current_location';
export const ADDRESSES_STORAGE_KEY = '@bigbazaar_user_addresses';

/**
 * Save auth token to AsyncStorage
 */
export const saveAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.log('[AUTH] Failed to save auth token:', e);
  }
};

/**
 * Get stored auth token
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
};

/**
 * Save user profile to AsyncStorage
 */
export const saveUserProfile = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.log('[AUTH] Failed to save user profile:', e);
  }
};

/**
 * Get stored user profile
 */
export const getUserProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Clear full auth session (token and user profile)
 */
export const clearAuthSession = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
  } catch (e) {
    console.log('[AUTH] Failed to clear auth session:', e);
  }
};

/**
 * Check Email Existence API Call
 * POST /auth/check-email
 * Body: { email }
 */
export const checkEmailApi = async ({ email }) => {
  const payload = { email: email?.trim().toLowerCase() };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check email');
    }

    return {
      success: true,
      exists: Boolean(data.exists),
      message: data.message,
    };
  } catch (error) {
    console.log('[AUTH] checkEmailApi error:', error.message);
    throw error;
  }
};

/**
 * Send OTP API Call (Signup or Verification)
 * POST /auth/send-otp
 * Body: { email, purpose }
 */
export const sendOtpApi = async ({ email, purpose = 'signup' }) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    purpose,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }

    return {
      success: true,
      message: data.message || '4-digit verification code sent',
      otp: data.data?.debugOtp || data.otp,
      data,
    };
  } catch (error) {
    console.log('[AUTH] sendOtpApi error:', error.message);
    throw error;
  }
};

/**
 * Signup API Call
 * POST /auth/signup
 * Body: { fullName, email, password, phoneNumber, role, userTypes, status }
 */
export const signupApi = async ({
  fullName,
  email,
  password,
  phoneNumber,
  phone,
  role = 'user',
  userTypes = ['buyer', 'seller'],
  status = 'active',
}) => {
  const cleanEmail = email?.trim().toLowerCase();
  const payload = {
    fullName: (fullName || cleanEmail?.split('@')[0])?.trim(),
    email: cleanEmail,
    password,
    phoneNumber: (phoneNumber || phone)?.trim() || undefined,
    role,
    userTypes: Array.isArray(userTypes) ? userTypes : [userTypes],
    status,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Signup request failed with status ' + response.status);
    }

    if (data.token) {
      await saveAuthToken(data.token);
    }
    const userObj = data.user || data.data?.user;
    if (userObj) {
      await saveUserProfile(userObj);
    }

    return {
      success: true,
      message: data.message || 'Registration successful',
      email: payload.email,
      token: data.token || data.data?.token,
      user: userObj,
      otp: data.otp,
      data,
    };
  } catch (error) {
    console.log('[AUTH] Live API error on signup:', error.message);
    const friendlyMsg =
      error.name === 'AbortError' ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('timeout')
        ? `Backend service unavailable at ${API_BASE_URL}. Please check your connection or backend server.`
        : (error.message || 'Signup request failed');
    throw new Error(friendlyMsg);
  }
};

/**
 * Verify OTP API Call
 * POST /auth/verify-otp
 * Body: { email, otp }
 */
export const verifyOtpApi = async ({ email, otp }) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    otp: String(otp).trim(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    if (data.token) {
      await saveAuthToken(data.token);
    }
    if (data.user) {
      await saveUserProfile(data.user);
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || 'OTP verified successfully',
    };
  } catch (error) {
    console.log('[AUTH] Live API error on verify-otp:', error.message);
    const friendlyMsg =
      error.name === 'AbortError' ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('timeout')
        ? `Backend service unavailable at ${API_BASE_URL}. Please check your connection or backend server.`
        : (error.message || 'OTP verification failed');
    throw new Error(friendlyMsg);
  }
};

/**
 * Resend OTP API Call
 * POST /auth/resend-otp
 * Body: { email }
 */
export const resendOtpApi = async ({ email }) => {
  const payload = { email: email?.trim().toLowerCase() };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }

    return {
      success: true,
      message: data.message || 'A new OTP has been sent to your email',
      data,
    };
  } catch (error) {
    console.log('[AUTH] resendOtp error:', error.message);
    throw error;
  }
};

/**
 * Send Phone OTP API Call
 * POST /auth/send-phone-otp
 * Body: { phoneNumber }
 */
export const sendPhoneOtpApi = async ({ phoneNumber, phone }) => {
  const cleanPhone = String(phoneNumber || phone || '').replace(/[^0-9]/g, '').slice(-10);
  const payload = {
    phoneNumber: cleanPhone,
    phone: `+91${cleanPhone}`
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send phone OTP');
    }

    return {
      success: true,
      message: data.message || `Verification code sent to +91 ${cleanPhone}`,
      otp: data.data?.debugOtp || data.debugOtp || data.otp,
      data: data.data || data,
    };
  } catch (error) {
    console.log('[AUTH] sendPhoneOtpApi error:', error.message);
    throw error;
  }
};

/**
 * Verify Phone OTP and Login / Register API Call
 * POST /auth/verify-phone-otp
 * Body: { phoneNumber, otp }
 */
export const verifyPhoneOtpApi = async ({ phoneNumber, phone, otp }) => {
  const cleanPhone = String(phoneNumber || phone || '').replace(/[^0-9]/g, '').slice(-10);
  const payload = {
    phoneNumber: cleanPhone,
    phone: `+91${cleanPhone}`,
    otp: String(otp).trim()
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    if (token) {
      await saveAuthToken(token);
    }
    if (user) {
      await saveUserProfile(user);
    }

    return {
      success: true,
      token,
      user,
      message: data.message || 'Logged in successfully',
    };
  } catch (error) {
    console.log('[AUTH] verifyPhoneOtpApi error:', error.message);
    throw error;
  }
};

/**
 * Fetch User by ID from live backend
 * GET /auth/get-by-id/:id
 */
export const getUserByIdApi = async (userId) => {
  const token = await getAuthToken();
  const id = userId || (await getUserProfile())?._id || (await getUserProfile())?.id;
  if (!id) throw new Error('User ID is required to fetch profile');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/get-by-id/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }

    const user = data.data || data.user || data;
    if (user) {
      await saveUserProfile(user);
    }
    return user;
  } catch (error) {
    console.log('[AUTH] getUserById error:', error.message);
    throw error;
  }
};

/**
 * Login API Call
 * POST /auth/login
 */
export const loginApi = async ({ email, password }) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    password,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) {
      await saveAuthToken(data.token);
    }
    if (data.user) {
      await saveUserProfile(data.user);
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.log('[AUTH] Login error:', error.message);
    throw error;
  }
};

/**
 * Update Profile API Call
 * PUT /auth/profile
 */
export const updateProfileApi = async (profileData) => {
  const token = await getAuthToken();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(profileData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    if (data.user) {
      await saveUserProfile(data.user);
    }

    return {
      success: true,
      user: data.user,
      message: data.message || 'Profile updated successfully',
    };
  } catch (error) {
    console.log('[AUTH] updateProfile error, updating local device cache:', error.message);
    const current = (await getUserProfile()) || {};
    const updated = { ...current, ...profileData };
    await saveUserProfile(updated);
    return {
      success: true,
      user: updated,
      message: 'Profile updated on device',
    };
  }
};

/**
 * Change Password API Call
 * PUT /auth/change-password
 */
export const changePasswordApi = async ({ currentPassword, newPassword }) => {
  const token = await getAuthToken();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return {
      success: true,
      message: data.message || 'Password changed successfully',
    };
  } catch (error) {
    console.log('[AUTH] changePassword error:', error.message);
    throw error;
  }
};

/**
 * Delete Account API Call
 * Backend Developer Confirmed: DELETE /auth/delete/:id (with fallback to DELETE /auth/account)
 */
export const deleteAccountApi = async ({ id, password, reason } = {}) => {
  const token = await getAuthToken();
  const currentUser = await getUserProfile();
  const userId = id || currentUser?._id || currentUser?.id;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const deleteUrl = userId
      ? `${API_BASE_URL}/auth/delete/${userId}`
      : `${API_BASE_URL}/auth/account`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ password, reason }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }

    await clearAuthSession();

    return {
      success: true,
      message: data.message || 'Account deleted successfully',
    };
  } catch (error) {
    console.log('[AUTH] deleteAccount error:', error.message);
    throw error;
  }
};

/**
 * Reset Password API Call
 * Backend Developer Confirmed: POST /auth/reset-password
 * Body: { email, newPassword, confirmPassword }
 */
export const resetPasswordApi = async ({ email, newPassword, confirmPassword, password }) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    newPassword: newPassword || password,
    confirmPassword: confirmPassword || newPassword || password,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return {
      success: true,
      message: data.message || 'Password reset successfully',
    };
  } catch (error) {
    console.log('[AUTH] resetPassword error:', error.message);
    const friendlyMsg =
      error.name === 'AbortError' ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch')
        ? `Backend service unavailable at ${API_BASE_URL}. Please check your connection or backend server.`
        : (error.message || 'Password reset failed');
    throw new Error(friendlyMsg);
  }
};

/**
 * Google Sign-In API Call
 * POST /auth/google
 * Body: { idToken, email, name, avatar, googleId }
 */
export const googleLoginApi = async ({ idToken, email, name, fullName, avatar, photo, googleId } = {}) => {
  const payload = {
    idToken,
    email: email || '',
    name: name || fullName || '',
    avatar: avatar || photo || '',
    googleId: googleId || '',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Google Sign-In failed on backend');
    }

    if (data.token) {
      await saveAuthToken(data.token);
    }
    if (data.user) {
      await saveUserProfile(data.user);
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || 'Google Sign-In successful',
    };
  } catch (error) {
    console.log('[AUTH] Google Sign-In error:', error.message);
    const friendlyMsg =
      error.name === 'AbortError' ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch')
        ? `Backend service unavailable at ${API_BASE_URL}. Live Google authentication endpoint unreachable.`
        : (error.message || 'Google Sign-In failed');
    throw new Error(friendlyMsg);
  }
};
