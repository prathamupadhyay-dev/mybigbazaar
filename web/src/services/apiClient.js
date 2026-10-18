/**
 * @file apps/web/src/services/apiClient.js
 * @description Centralized API client & local mock adapter for MyBigBazaar Web.
 * Connects directly to backend API with automatic graceful fallback to deterministic
 * mock data when backend endpoints are offline or under construction (e.g. 404 / 500).
 */

import { API_BASE } from '../config.js';
import {
  MOCK_USERS,
  MOCK_CATEGORIES,
  MOCK_SERVICE_CATEGORIES,
  MOCK_LISTINGS,
  MOCK_SERVICES,
  MOCK_PROVIDERS,
  MOCK_NOTIFICATIONS,
  MOCK_CHATS,
  MOCK_BOOKINGS,
  MOCK_ORDERS
} from '../data/mockData.js';

export const TOKEN_KEY = 'mbb_web_token';
export const USER_KEY = 'mbb_web_user';
export const WATCHLIST_KEY = 'mbb_web_watchlist';
export const CART_KEY = 'mbb_web_cart';
export const ADS_KEY = 'mbb_web_user_ads';
export const BOOKINGS_KEY = 'mbb_web_bookings';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {}
};

/**
 * Base fetch wrapper with auth header & JSON parsing
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 6000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || `Request failed with HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ==========================================
// API ADAPTERS WITH REAL + MOCK FALLBACK
// ==========================================

export const webApi = {
  // Authentication
  login: async ({ email, password, role = 'buyer' }) => {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res?.token) {
        setAuthToken(res.token);
        const user = res.user || res.data || { email, role };
        setStoredUser(user);
        return { user, token: res.token };
      }
    } catch (e) {
      console.warn('[WEB_API] Live auth unavailable, using deterministic mock persona:', e.message);
    }
    // Fallback: match persona by email or role
    const matched = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.role === role
    ) || MOCK_USERS[0];
    const mockToken = `mock-token-${matched.id}-${Date.now()}`;
    setAuthToken(mockToken);
    setStoredUser(matched);
    return { user: matched, token: mockToken };
  },

  register: async (userData) => {
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (res?.token) {
        setAuthToken(res.token);
        const user = res.user || res.data || userData;
        setStoredUser(user);
        return { user, token: res.token };
      }
    } catch (e) {
      console.warn('[WEB_API] Live register unavailable, falling back to mock registration:', e.message);
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.fullName || userData.name || 'New BigBazaar User',
      email: userData.email,
      phone: userData.phone || '+91 99999 00000',
      role: userData.role || 'buyer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      location: userData.location || 'Bengaluru',
      verified: true,
      rating: 5.0,
      joinedDate: 'Today',
      savedAddresses: []
    };
    const mockToken = `mock-token-${newUser.id}`;
    setAuthToken(mockToken);
    setStoredUser(newUser);
    return { user: newUser, token: mockToken };
  },

  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },

  // Categories
  getProductCategories: async () => {
    try {
      const res = await apiRequest('/product-category/get-all');
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (list.length > 0) return list;
    } catch (e) {
      // Fallback
    }
    return MOCK_CATEGORIES;
  },

  getServiceCategories: async () => {
    try {
      const res = await apiRequest('/service-category/get-all');
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (list.length > 0) return list;
    } catch (e) {
      // Fallback
    }
    return MOCK_SERVICE_CATEGORIES;
  },

  // Marketplace Listings
  getListings: async (params = {}) => {
    // Helper to safely format any listing
    const formatItem = (item) => {
      if (!item) return null;
      const id = item._id || item.id;
      const title = item.title || item.productName || 'Untitled Listing';
      const price = Number(item.price || item.productPrice || 0);
      const originalPrice = item.originalPrice
        ? Number(item.originalPrice)
        : (item.productDiscountPrice ? Number(item.productDiscountPrice) : null);
      const category = item.category || item.categoryName || 'Electronics';
      const subcategory = item.subcategory || item.subcategoryName || '';
      const condition = item.condition || 'Like New';
      const status = item.status || 'live';

      let location = 'Bengaluru';
      if (typeof item.location === 'object' && item.location !== null) {
        const parts = [item.location.address, item.location.city, item.location.state].filter(Boolean);
        location = parts.length > 0 ? parts.join(', ') : (item.location.city || 'Bengaluru');
      } else if (typeof item.location === 'string' && item.location.trim()) {
        location = item.location;
      }

      const postedTime = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : (item.postedTime || 'Recent');

      let images = ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'];
      if (Array.isArray(item.images) && item.images.length > 0) {
        images = item.images.map((img) =>
          typeof img === 'string' && img.startsWith('http') ? img : (typeof img === 'string' ? `${API_BASE}${img}` : img)
        );
      }

      let seller = MOCK_USERS[1];
      if (item.sellerId && typeof item.sellerId === 'object') {
        seller = {
          id: item.sellerId._id || item.sellerId.id || 'seller-01',
          name: item.sellerId.fullName || item.sellerId.name || 'Seller',
          avatar: item.sellerId.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          phone: item.sellerId.phoneNumber || '',
          rating: 4.8,
          reviewsCount: 38,
          verified: true
        };
      } else if (item.seller) {
        seller = item.seller;
      }

      return {
        ...item,
        id,
        title,
        price,
        originalPrice,
        category,
        subcategory,
        condition,
        status,
        location,
        postedTime,
        images,
        seller,
        description: item.description || item.productDescription || '',
        specs: item.specs || { Condition: condition, Category: category }
      };
    };

    // 1. Try modern real v1 API: GET /api/v1/listings
    try {
      const qParams = {};
      if (params.search) qParams.q = params.search;
      if (params.category && params.category !== 'All') qParams.category = params.category;
      if (params.minPrice) qParams.minPrice = params.minPrice;
      if (params.maxPrice) qParams.maxPrice = params.maxPrice;
      if (params.condition && params.condition !== 'All') qParams.condition = params.condition;
      if (params.sortBy) qParams.sortBy = params.sortBy;
      const query = new URLSearchParams(qParams).toString();

      const res = await apiRequest(`/api/v1/listings${query ? `?${query}` : ''}`);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        return list.map(formatItem);
      }
    } catch (e) {
      // fallback to legacy /product/get-all
    }

    // 2. Try legacy endpoint: GET /product/get-all
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiRequest(`/product/get-all${query ? `?${query}` : ''}`);
      const list = Array.isArray(res) ? res : (res?.data || res?.products || []);
      if (list.length > 0) {
        return list.map(formatItem);
      }
    } catch (e) {
      // fallback
    }

    // Return mock listings merged with any locally created ads
    let localAds = [];
    try {
      const raw = localStorage.getItem(ADS_KEY);
      localAds = raw ? JSON.parse(raw) : [];
    } catch {}

    let combined = [...localAds, ...MOCK_LISTINGS].map(formatItem);

    if (params.category && params.category !== 'All') {
      combined = combined.filter((l) => l.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      combined = combined.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
      );
    }
    if (params.minPrice) {
      combined = combined.filter((l) => l.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      combined = combined.filter((l) => l.price <= Number(params.maxPrice));
    }
    if (params.condition && params.condition !== 'All') {
      combined = combined.filter((l) => l.condition.toLowerCase() === params.condition.toLowerCase());
    }
    if (params.sortBy === 'price_asc') {
      combined.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_desc') {
      combined.sort((a, b) => b.price - a.price);
    }

    return combined;
  },

  getListingById: async (id) => {
    const formatItem = (item) => {
      if (!item) return null;
      const itemId = item._id || item.id;
      const title = item.title || item.productName || 'Untitled Listing';
      const price = Number(item.price || item.productPrice || 0);
      const originalPrice = item.originalPrice
        ? Number(item.originalPrice)
        : (item.productDiscountPrice ? Number(item.productDiscountPrice) : null);
      const category = item.category || item.categoryName || 'Electronics';
      const subcategory = item.subcategory || item.subcategoryName || '';
      const condition = item.condition || 'Like New';
      const status = item.status || 'live';

      let location = 'Indiranagar, Bengaluru';
      if (typeof item.location === 'object' && item.location !== null) {
        const parts = [item.location.address, item.location.city, item.location.state].filter(Boolean);
        location = parts.length > 0 ? parts.join(', ') : (item.location.city || 'Indiranagar, Bengaluru');
      } else if (typeof item.location === 'string' && item.location.trim()) {
        location = item.location;
      }

      const postedTime = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : (item.postedTime || 'Recently');

      let images = ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'];
      if (Array.isArray(item.images) && item.images.length > 0) {
        images = item.images.map((img) =>
          typeof img === 'string' && img.startsWith('http') ? img : (typeof img === 'string' ? `${API_BASE}${img}` : img)
        );
      }

      let seller = MOCK_USERS[1];
      if (item.sellerId && typeof item.sellerId === 'object') {
        seller = {
          id: item.sellerId._id || item.sellerId.id || 'seller-01',
          name: item.sellerId.fullName || item.sellerId.name || 'Seller',
          avatar: item.sellerId.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          phone: item.sellerId.phoneNumber || '',
          rating: item.sellerId.rating || 4.8,
          reviewsCount: item.sellerId.reviewsCount || 38,
          verified: true
        };
      } else if (item.seller) {
        seller = item.seller;
      }

      return {
        ...item,
        id: itemId,
        title,
        price,
        originalPrice,
        category,
        subcategory,
        condition,
        status,
        location,
        postedTime,
        images,
        seller,
        description: item.description || item.productDescription || '',
        specs: item.specs || { Condition: condition, Category: category }
      };
    };

    try {
      const res = await apiRequest(`/api/v1/listings/${id}`);
      if (res?.data) return formatItem(res.data);
      if (res && (res._id || res.id)) return formatItem(res);
    } catch (e) {}

    try {
      const res = await apiRequest(`/product/get/${id}`);
      if (res?.data || res?.product) {
        return formatItem(res.data || res.product);
      }
    } catch (e) {}

    // Check local ads
    try {
      const raw = localStorage.getItem(ADS_KEY);
      const localAds = raw ? JSON.parse(raw) : [];
      const foundLocal = localAds.find((a) => a.id === id);
      if (foundLocal) return formatItem(foundLocal);
    } catch {}

    const found = MOCK_LISTINGS.find((l) => l.id === id);
    return formatItem(found || MOCK_LISTINGS[0]);
  },

  createListing: async (listingData) => {
    // 1. Try real v1 API: POST /api/v1/listings
    try {
      const res = await apiRequest('/api/v1/listings', {
        method: 'POST',
        body: JSON.stringify({
          title: listingData.title || listingData.productName,
          description: listingData.description || listingData.productDescription,
          price: Number(listingData.price || listingData.productPrice || 0),
          originalPrice: Number(listingData.originalPrice || listingData.price || 0),
          category: listingData.category,
          subcategory: listingData.subcategory,
          condition: listingData.condition || 'Like New',
          images: Array.isArray(listingData.images) ? listingData.images : [],
          location: typeof listingData.location === 'object' ? listingData.location : { city: listingData.location || 'Bengaluru' }
        })
      });
      if (res?.data) return res.data;
    } catch (e) {
      console.warn('[WEB_API] /api/v1/listings notice:', e.message);
    }

    // 2. Try legacy endpoint: POST /product/create
    try {
      const res = await apiRequest('/product/create', {
        method: 'POST',
        body: listingData
      });
      if (res?.data) return res.data;
    } catch (e) {
      console.warn('[WEB_API] /product/create notice, storing listing locally:', e.message);
    }

    const newAd = {
      ...listingData,
      id: `list-${Date.now()}`,
      status: 'live',
      postedTime: 'Just now',
      views: 1,
      favoritesCount: 0,
      images: listingData.images && listingData.images.length > 0
        ? listingData.images
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
      seller: getStoredUser() || MOCK_USERS[1]
    };

    try {
      const raw = localStorage.getItem(ADS_KEY);
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem(ADS_KEY, JSON.stringify([newAd, ...current]));
    } catch {}

    return newAd;
  },

  deleteListing: async (id) => {
    try {
      await apiRequest(`/api/v1/listings/${id}`, { method: 'DELETE' });
    } catch (e) {}
    try {
      const raw = localStorage.getItem(ADS_KEY);
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem(ADS_KEY, JSON.stringify(current.filter((a) => a.id !== id)));
    } catch {}
    return { success: true };
  },

  toggleFavorite: async (id) => {
    try {
      const res = await apiRequest(`/api/v1/listings/${id}/favorite`, { method: 'POST' });
      if (res?.isFavorite !== undefined) return res.isFavorite;
    } catch (e) {}
    return null;
  },

  // Services
  getServices: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiRequest(`/api/v1/services${query ? `?${query}` : ''}`);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        return list.map((s) => ({
          id: s._id || s.id,
          title: s.title,
          category: s.category,
          subcategory: s.subcategory,
          price: s.basePrice || s.price || 499,
          duration: s.duration || '60 mins',
          rating: s.rating || 4.9,
          reviewsCount: s.reviewsCount || 42,
          images: Array.isArray(s.images) && s.images.length > 0 ? s.images : ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80'],
          description: s.description,
          packages: s.packages || []
        }));
      }
    } catch (e) {}

    let list = [...MOCK_SERVICES];
    if (params.category && params.category !== 'All') {
      list = list.filter((s) => s.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return list;
  },

  getServiceById: async (id) => {
    try {
      const res = await apiRequest(`/api/v1/services/${id}`);
      if (res?.data) return res.data;
    } catch (e) {}
    return MOCK_SERVICES.find((s) => s.id === id) || MOCK_SERVICES[0];
  },

  // Service Providers
  getProviders: async () => {
    return MOCK_PROVIDERS;
  },

  getProviderById: async (id) => {
    return MOCK_PROVIDERS.find((p) => p.id === id) || MOCK_PROVIDERS[0];
  },

  // Bookings
  createBooking: async (bookingData) => {
    // 1. Try real v1 API: POST /api/v1/bookings
    try {
      const res = await apiRequest('/api/v1/bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: bookingData.serviceId || '6abfcf7a4c44e5120904fec5',
          scheduledDate: bookingData.scheduledDate || new Date().toISOString(),
          scheduledTimeSlot: bookingData.timeSlot || '10:00 AM - 12:00 PM',
          serviceAddress: typeof bookingData.address === 'object' ? bookingData.address : { city: 'Bengaluru', pincode: '560103' },
          amount: bookingData.amount || 799,
          paymentMode: bookingData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'
        })
      });
      if (res?.data) {
        return {
          ...res.data,
          id: res.data.bookingId || res.data._id,
          status: res.data.status || 'confirmed'
        };
      }
    } catch (e) {
      console.warn('[WEB_API] Live POST /api/v1/bookings notice, falling back to local store:', e.message);
    }

    const newBooking = {
      ...bookingData,
      id: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'assigned',
      date: bookingData.date || 'Tomorrow',
      timeSlot: bookingData.timeSlot || '10:00 AM - 12:00 PM',
      paymentStatus: bookingData.paymentMethod === 'cod' ? 'pending' : 'paid',
      timeline: [
        { step: 'Booked', time: 'Just now', done: true },
        { step: 'Confirmed', time: 'Just now', done: true },
        { step: 'Assigned', time: 'Just now', done: true },
        { step: 'On the Way', time: 'Scheduled', done: false },
        { step: 'In Progress', time: 'Scheduled', done: false },
        { step: 'Completed', time: 'Pending completion', done: false }
      ],
      provider: MOCK_PROVIDERS[0]
    };

    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([newBooking, ...current]));
    } catch {}

    return newBooking;
  },

  getBookings: async () => {
    try {
      const res = await apiRequest('/api/v1/bookings');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        return list.map((b) => ({
          id: b.bookingId || b._id,
          serviceTitle: b.serviceName,
          providerName: b.providerName || 'Assigned Partner',
          date: b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'Scheduled',
          timeSlot: b.scheduledTimeSlot,
          status: b.status,
          amount: b.totalAmount || b.amount,
          paymentStatus: b.paymentStatus
        }));
      }
    } catch (e) {}

    let local = [];
    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      local = raw ? JSON.parse(raw) : [];
    } catch {}
    return [...local, ...MOCK_BOOKINGS];
  },

  updateBookingStatus: async (bookingId, status, note = '') => {
    try {
      const res = await apiRequest(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note })
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return { success: true, bookingId, status };
  },

  cancelBooking: async (bookingId, reason = 'Cancelled by customer') => {
    try {
      const res = await apiRequest(`/api/v1/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return { success: true, bookingId, status: 'cancelled' };
  },

  // Orders
  getOrders: async () => {
    try {
      const res = await apiRequest('/api/v1/orders');
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.orders)
        ? res.orders
        : Array.isArray(res)
        ? res
        : null;
      if (Array.isArray(list)) return list;
    } catch (e) {}
    return [];
  },

  updateOrderStatus: async (orderId, status, note = '') => {
    try {
      const res = await apiRequest(`/api/v1/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          trackingStatus: status === 'completed' ? 'delivered' : status,
          note
        })
      });
      if (res?.data || res?.order) return res.data || res.order;
    } catch (e) {}
    return { id: orderId, status, trackingStatus: status === 'completed' ? 'delivered' : status };
  },

  // Notifications
  getNotifications: async () => {
    try {
      const res = await apiRequest('/api/v1/notifications');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (list.length > 0) return list;
    } catch (e) {}
    return MOCK_NOTIFICATIONS;
  },

  // Chats & Negotiations
  getChats: async () => {
    try {
      const res = await apiRequest('/api/v1/chat/conversations');
      const list = Array.isArray(res?.data) ? res.data : [];
      if (list.length > 0) {
        return list.map((c) => ({
          id: c._id,
          user: {
            name: c.buyerId?.fullName || c.sellerId?.fullName || 'BigBazaar User',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            online: true
          },
          listing: {
            id: c.listingId?._id || 'item-1',
            title: c.listingId?.title || 'Classified Item',
            price: c.listingId?.price || 5000,
            image: (Array.isArray(c.listingId?.images) && c.listingId.images[0]) || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80'
          },
          lastMessage: c.lastMessage || 'Active negotiation',
          lastTime: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          unread: 0,
          messages: []
        }));
      }
    } catch (e) {}
    return MOCK_CHATS;
  },

  sendMessage: async (conversationId, messageData) => {
    try {
      const res = await apiRequest(`/api/v1/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return { id: `msg-${Date.now()}`, ...messageData, timestamp: 'Just now' };
  },

  respondOffer: async (messageId, action, counterAmount) => {
    try {
      const res = await apiRequest(`/api/v1/chat/messages/${messageId}/offer`, {
        method: 'POST',
        body: JSON.stringify({ action, counterAmount })
      });
      if (res?.data) return res.data;
    } catch (e) {}
    return { success: true, action };
  }
};

export default webApi;
