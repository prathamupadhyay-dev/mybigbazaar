import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken, getUserProfile, clearAuthSession } from '../services/authApi';
import { API_BASE_URL, apiGet, apiPost, apiPut } from '../services/apiClient';

const APP_LOCK_ENABLED_KEY = '@app_lock_enabled';
const APP_LOCK_PROMPT_SHOWN_KEY = '@app_lock_prompt_shown';
const RECENTLY_VIEWED_KEY = '@bigbazaar_recently_viewed';

const initialAddresses = [];
const initialBookings = [];
const initialTransactions = [];
const initialTickets = [];
const initialBucket = [];

function normalizeBookingRecord(b) {
  const rawStatus = String(b.status || 'confirmed').toLowerCase();
  let uiStatus = 'Upcoming';
  if (rawStatus === 'completed') uiStatus = 'Completed';
  else if (rawStatus === 'cancelled' || rawStatus === 'canceled' || rawStatus === 'rejected') uiStatus = 'Cancelled';

  let addrStr = 'Indore, MP';
  if (typeof b.serviceAddress === 'string' && b.serviceAddress.trim()) {
    addrStr = b.serviceAddress;
  } else if (typeof b.serviceAddress === 'object' && b.serviceAddress !== null) {
    const parts = [
      b.serviceAddress.houseNo,
      b.serviceAddress.street,
      b.serviceAddress.city,
      b.serviceAddress.pincode
    ].filter(Boolean);
    if (parts.length > 0) addrStr = parts.join(', ');
  }

  let dateStr = 'Tomorrow';
  if (b.scheduledDate) {
    const parsed = new Date(b.scheduledDate);
    if (!isNaN(parsed.getTime())) {
      dateStr = parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      dateStr = String(b.scheduledDate);
    }
  }

  return {
    ...b,
    id: String(b._id || b.id || b.bookingId || `bk-${Date.now()}`),
    bookingId: b.bookingId || String(b._id || b.id || 'BB-10001'),
    serviceName: b.serviceName || b.serviceTitle || 'Home Service',
    subCategoryName: b.subCategoryName || b.serviceName || b.serviceTitle || 'Service Visit',
    category: b.category || 'Home Services',
    scheduledDate: dateStr,
    scheduledTimeSlot: b.scheduledTimeSlot || b.timeSlot || '10:00 AM - 12:00 PM',
    providerName: b.providerName || 'Assigned Certified Partner',
    providerContact: b.providerContact || '+91 98260 12345',
    providerRating: b.providerRating || 4.9,
    amount: Number(b.totalAmount ?? b.amount ?? 0),
    status: uiStatus,
    serviceAddress: addrStr,
    paymentMode: b.paymentMode || 'Cash on Delivery',
    userRating: b.userRating || undefined,
    userReview: b.userReview || undefined
  };
}

const defaultContextValue = {
  user: null,
  isAuthenticated: false,
  setAuthenticated: () => {},
  appLockEnabled: false,
  setAppLockEnabled: () => {},
  appLockPromptShown: false,
  setAppLockPromptShown: () => {},
  pendingAction: null,
  requireAuth: () => {},
  executePendingAction: () => {},
  updateUser: () => {},
  addresses: initialAddresses,
  activeAddress: initialAddresses[0] || null,
  setActiveAddress: () => {},
  addAddress: () => {},
  updateAddress: () => {},
  deleteAddress: () => {},
  setDefaultAddress: () => {},
  bucket: initialBucket,
  addToBucket: () => {},
  removeFromBucket: () => {},
  updateBucketQuantity: () => {},
  clearBucket: () => {},
  appliedCoupon: null,
  applyCoupon: () => ({ success: false, discount: 0, message: '' }),
  removeCoupon: () => {},
  getBucketTotals: () => ({ subtotal: 0, discount: 0, total: 0 }),
  bookings: initialBookings,
  refreshBookings: async () => [],
  createBookingFromBucket: async () => '',
  createInstantBooking: async () => '',
  cancelBooking: async () => {},
  rescheduleBooking: async () => {},
  rateBooking: async () => {},
  supportTickets: initialTickets,
  submitSupportTicket: async () => {},
  addTicketMessage: () => {},
  transactions: initialTransactions,
  watchlist: [],
  toggleWatchlist: () => {},
  recentlyViewed: [],
  addRecentlyViewed: () => {},
  clearRecentlyViewed: () => {},
  savedSearches: [],
  addSavedSearch: () => {},
  removeSavedSearch: () => {},
  clearSavedSearches: () => {},
  recentSearches: [],
  addRecentSearch: () => {},
  removeRecentSearch: () => {},
  clearRecentSearches: () => {},
  ads: [],
  addAd: () => {},
  updateAd: () => {},
  updateAdStatus: () => {},
  removeAd: () => {},
  logout: async () => {},
  currentLocation: {
    address: 'Plot 45, Vijay Nagar, Indore, Madhya Pradesh 452010',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    latitude: 22.7533,
    longitude: 75.8937
  },
  setCurrentLocation: () => {},
  locationPermissionGranted: false,
  setLocationPermissionGranted: () => {},
  notificationPermissionGranted: false,
  setNotificationPermissionGranted: () => {},
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  country: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  setCountryAndCurrency: () => {},
  formatPrice: (amount) => `₹${amount}`
};

const AppContext = createContext(defaultContextValue);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [appLockEnabled, setAppLockEnabledState] = useState(false);
  const [appLockPromptShown, setAppLockPromptShownState] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [activeAddress, setActiveAddress] = useState(initialAddresses[0] || null);
  const [bucket, setBucket] = useState(initialBucket);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [supportTickets, setSupportTickets] = useState(initialTickets);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [watchlist, setWatchlist] = useState([]);
  const [recentlyViewed, setRecentlyViewedState] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [ads, setAds] = useState([]);

  const [currentLocation, setCurrentLocationState] = useState({
    address: 'Plot 45, Vijay Nagar, Indore, Madhya Pradesh 452010',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    latitude: 22.7533,
    longitude: 75.8937
  });
  const [locationPermissionGranted, setLocationPermissionGrantedState] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGrantedState] = useState(false);
  const [language, setLanguageState] = useState('en');
  const [country, setCountryState] = useState('India');
  const [currency, setCurrencyState] = useState('INR');
  const [currencySymbol, setCurrencySymbolState] = useState('₹');

  const setCountryAndCurrency = (newCountry, newCurrency) => {
    const c = newCountry || 'India';
    const curr = newCurrency || (c === 'United States' ? 'USD' : 'INR');
    const symbol = curr === 'USD' ? '$' : '₹';

    setCountryState(c);
    setCurrencyState(curr);
    setCurrencySymbolState(symbol);

    AsyncStorage.setItem('@bigbazaar_country', c).catch(() => {});
    AsyncStorage.setItem('@bigbazaar_currency', curr).catch(() => {});
  };

  const formatPrice = (amount) => {
    const num = Number(amount) || 0;
    if (currency === 'USD') {
      return `$${num.toLocaleString('en-US')}`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const setLocationPermissionGranted = (granted) => {
    setLocationPermissionGrantedState(granted);
    AsyncStorage.setItem('@location_permission_granted', String(granted)).catch(() => {});
  };

  const setNotificationPermissionGranted = (granted) => {
    setNotificationPermissionGrantedState(granted);
    AsyncStorage.setItem('@notification_permission_granted', String(granted)).catch(() => {});
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    AsyncStorage.setItem('@bigbazaar_language', lang).catch(() => {});
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  const setCurrentLocation = (loc) => {
    if (!loc) return;
    const resolved = typeof loc === 'string'
      ? { address: loc, city: loc.split(',')[1]?.trim() || loc.split(',')[0]?.trim() || 'Indore', state: 'Madhya Pradesh', pincode: '452010' }
      : { ...loc, city: loc.city || (loc.address ? (loc.address.split(',')[1]?.trim() || 'Indore') : 'Indore') };
    setCurrentLocationState(resolved);
    AsyncStorage.setItem('@current_location', JSON.stringify(resolved)).catch(() => {});
  };

  const refreshBookings = useCallback(async (userOverride) => {
    try {
      const targetUser = userOverride || user;
      const userId = targetUser?._id || targetUser?.id;
      const endpoint = userId ? `/booking/get-by-user/${userId}` : '/booking/get-all';
      let res = await apiGet(endpoint).catch(() => null);
      let list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.bookings) ? res.bookings : []);
      if (list.length === 0 && userId) {
        res = await apiGet('/booking/get-all').catch(() => null);
        list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.bookings) ? res.bookings : []);
      }
      const normalized = list.map(normalizeBookingRecord);
      setBookings(normalized);
      return normalized;
    } catch (e) {
      return [];
    }
  }, [user]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedLock, storedPrompt, storedToken, storedProfile, storedLoc, storedLocPerm, storedNotifPerm, storedLang, storedCountry, storedCurrency, storedRecent] = await Promise.all([
          AsyncStorage.getItem(APP_LOCK_ENABLED_KEY),
          AsyncStorage.getItem(APP_LOCK_PROMPT_SHOWN_KEY),
          getAuthToken(),
          getUserProfile(),
          AsyncStorage.getItem('@current_location'),
          AsyncStorage.getItem('@location_permission_granted'),
          AsyncStorage.getItem('@notification_permission_granted'),
          AsyncStorage.getItem('@bigbazaar_language'),
          AsyncStorage.getItem('@bigbazaar_country'),
          AsyncStorage.getItem('@bigbazaar_currency'),
          AsyncStorage.getItem(RECENTLY_VIEWED_KEY),
        ]);
        if (storedRecent) {
          try {
            const parsed = JSON.parse(storedRecent);
            if (Array.isArray(parsed)) setRecentlyViewedState(parsed);
          } catch (e) {}
        }
        if (storedLang === 'hi' || storedLang === 'en') {
          setLanguageState(storedLang);
        }
        if (storedCountry) setCountryState(storedCountry);
        if (storedCurrency) {
          setCurrencyState(storedCurrency);
          setCurrencySymbolState(storedCurrency === 'USD' ? '$' : '₹');
        }
        setAppLockEnabledState(storedLock === 'true');
        setAppLockPromptShownState(storedPrompt === 'true');
        if (storedLoc) {
          try {
            setCurrentLocationState(JSON.parse(storedLoc));
          } catch (e) {}
        }
        if (storedLocPerm === 'true') setLocationPermissionGrantedState(true);
        if (storedNotifPerm === 'true') setNotificationPermissionGrantedState(true);

        if (storedToken && storedProfile) {
          const activeUser = {
            ...storedProfile,
            walletBalance: Number(storedProfile.walletBalance) || 0,
          };
          setUser(activeUser);
          setAuthenticated(true);
          refreshBookings(activeUser);
        } else {
          setUser(null);
          setAuthenticated(false);
          refreshBookings(null);
        }
      } catch (error) {
        setUser(null);
        setAuthenticated(false);
      }
    };
    restoreSession();
  }, []);

  const logout = async () => {
    await clearAuthSession();
    setUser(null);
    setAuthenticated(false);
    setAddresses([]);
    setActiveAddress(null);
    setBookings([]);
    setSupportTickets([]);
    setTransactions([]);
    setWatchlist([]);
    setAds([]);
  };

  const setAppLockEnabled = (enabled) => {
    setAppLockEnabledState(enabled);
    AsyncStorage.setItem(APP_LOCK_ENABLED_KEY, String(enabled)).catch(() => {});
  };

  const setAppLockPromptShown = (shown) => {
    setAppLockPromptShownState(shown);
    AsyncStorage.setItem(APP_LOCK_PROMPT_SHOWN_KEY, String(shown)).catch(() => {});
  };

  const addAd = (ad) => setAds((prev) => [ad, ...prev]);
  const updateAd = (id, updates) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };
  const updateAdStatus = (id, status) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };
  const removeAd = (id) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const requireAuth = (navigation, callback) => {
    if (isAuthenticated) {
      callback();
    } else {
      setPendingAction(() => callback);
      navigation.navigate('Login');
    }
  };

  const executePendingAction = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const toggleWatchlist = (itemOrId) => {
    const targetId = typeof itemOrId === 'object' && itemOrId !== null
      ? String(itemOrId.id || itemOrId._id || '')
      : String(itemOrId || '');
    if (!targetId) return;
    setWatchlist((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
    if (/^[0-9a-fA-F]{24}$/.test(targetId)) {
      apiPost(`/api/v1/listings/${targetId}/favorite`, {}).catch(() => {});
    }
  };

  const addRecentlyViewed = (item) => {
    if (!item) return;
    const itemId = String(item.id || item._id || '');
    if (!itemId) return;

    const locStr = typeof item.location === 'string' && item.location
      ? item.location
      : (item.location?.city || item.city || 'Indore');
    const catStr = typeof item.category === 'object' && item.category !== null
      ? (item.category.name || 'General')
      : (item.category || item.categoryName || 'General');

    setRecentlyViewedState((prev) => {
      const normalized = {
        id: itemId,
        title: item.title || item.productName || item.name || 'Product',
        price: Number(item.price ?? item.productPrice ?? 0),
        imageUrl: item.imageUrl || (Array.isArray(item.images) && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        location: locStr,
        category: catStr,
        subtitle: item.subtitle || '',
        isElite: Boolean(item.isElite),
        viewedAt: Date.now(),
        rawProduct: item
      };
      const filtered = prev.filter((p) => String(p.id) !== itemId);
      const updated = [normalized, ...filtered].slice(0, 20);
      AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedState([]);
    AsyncStorage.removeItem(RECENTLY_VIEWED_KEY).catch(() => {});
  };

  const addSavedSearch = (keyword) => {
    setSavedSearches((prev) => {
      if (prev.includes(keyword)) return prev;
      return [keyword, ...prev];
    });
  };

  const removeSavedSearch = (keyword) => {
    setSavedSearches((prev) => prev.filter((k) => k !== keyword));
  };

  const clearSavedSearches = () => {
    setSavedSearches([]);
  };

  const addRecentSearch = (keyword) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((k) => k !== keyword);
      return [keyword, ...filtered].slice(0, 10);
    });
  };

  const removeRecentSearch = (keyword) => {
    setRecentSearches((prev) => prev.filter((k) => k !== keyword));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = {
        ...(prev || {}),
        ...updates,
        walletBalance:
          updates?.walletBalance !== undefined
            ? Number(updates.walletBalance) || 0
            : Number(prev?.walletBalance) || 0,
      };
      AsyncStorage.setItem('@auth_user', JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const addAddress = (newAddr) => {
    const id = `addr-${Date.now()}`;
    const address = { ...newAddr, id };
    if (address.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })).concat(address));
      setActiveAddress(address);
    } else {
      setAddresses((prev) => [...prev, address]);
    }
  };

  const updateAddress = (id, updates) => {
    setAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id) {
          const updated = { ...addr, ...updates };
          if (updated.isDefault) {
            setActiveAddress(updated);
          }
          return updated;
        }
        return updates.isDefault ? { ...addr, isDefault: false } : addr;
      })
    );
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (activeAddress?.id === id && filtered.length > 0) {
        setActiveAddress(filtered[0]);
      }
      return filtered;
    });
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => {
        const isMatch = addr.id === id;
        if (isMatch) setActiveAddress(addr);
        return { ...addr, isDefault: isMatch };
      })
    );
  };

  const addToBucket = (item) => {
    const newItem = { ...item, id: `bkt-${Date.now()}` };
    setBucket((prev) => [...prev, newItem]);
  };

  const removeFromBucket = (id) => {
    setBucket((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBucketQuantity = (id, quantity) => {
    setBucket((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearBucket = () => {
    setBucket([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, discount: 0, message: 'Please enter a coupon code.' };
    const subtotal = bucket.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, orderAmount: subtotal })
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.valid && json.coupon) {
          const discountAmt = json.discount || 0;
          setAppliedCoupon({
            code: cleanCode,
            discount: discountAmt,
            discountType: json.coupon.discountType,
            discountValue: json.coupon.discountValue
          });
          return {
            success: true,
            discount: discountAmt,
            message: `Coupon ${cleanCode} applied! Saved ₹${discountAmt}.`
          };
        }
        return { success: false, discount: 0, message: json.reason || 'Coupon is not applicable.' };
      }
    } catch (e) {}

    return { success: false, discount: 0, message: 'Invalid coupon code.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getBucketTotals = () => {
    const subtotal = bucket.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    let discount = 0;
    if (appliedCoupon) {
      if (typeof appliedCoupon === 'object' && typeof appliedCoupon.discount === 'number') {
        discount = appliedCoupon.discount;
      }
    }
    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  };

  const createInstantBooking = async (bookingData) => {
    const payload = {
      serviceId: bookingData.serviceId,
      customerId: user?._id || user?.id,
      customer: {
        name: user?.fullName || user?.name || bookingData.customerName || 'Mobile Customer',
        phone: user?.phoneNumber || user?.phone || bookingData.customerPhone || '+91 98260 12345',
        email: user?.email || 'customer@bigbazaar.com'
      },
      serviceName: bookingData.serviceName || bookingData.subCategoryName || 'Home Service',
      subCategoryName: bookingData.subCategoryName || bookingData.serviceName || 'Service Visit',
      category: bookingData.category || 'Home Services',
      scheduledDate: bookingData.scheduledDate || 'Tomorrow',
      scheduledTimeSlot: bookingData.scheduledTimeSlot || '10:00 AM - 12:00 PM',
      providerName: bookingData.providerName || 'Assigned Certified Partner',
      providerContact: bookingData.providerContact || '+91 98260 12345',
      serviceAddress: bookingData.serviceAddress || currentLocation?.address || 'Indore, MP',
      amount: Number(bookingData.amount || 499),
      totalAmount: Number(bookingData.amount || 499),
      paymentMode: bookingData.paymentMode || 'Cash on Delivery',
      notes: bookingData.notes || ''
    };

    const res = await apiPost('/booking/create', payload);
    const created = res?.data || res?.booking || payload;
    const normalized = normalizeBookingRecord(created);

    setBookings((prev) => [normalized, ...prev.filter((b) => b.id !== normalized.id)]);

    const newTxn = {
      id: `tx-${Date.now()}`,
      transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      bookingId: normalized.bookingId,
      serviceName: normalized.subCategoryName,
      amount: normalized.amount,
      paymentMode: normalized.paymentMode,
      status: 'Success',
      date: 'Today'
    };
    setTransactions((prev) => [newTxn, ...prev]);

    return normalized.bookingId;
  };

  const createBookingFromBucket = async (paymentMode) => {
    const { total } = getBucketTotals();
    const primaryItem = bucket[0] || {
      serviceName: 'Home Service',
      subCategoryName: 'General Maintenance',
      categoryName: 'Home Service',
      serviceDate: 'Tomorrow',
      timeSlot: '10:00 AM - 12:00 PM'
    };

    const bookingId = await createInstantBooking({
      serviceId: primaryItem.serviceId || primaryItem.id,
      serviceName: primaryItem.serviceName,
      subCategoryName: primaryItem.subCategoryName,
      category: primaryItem.categoryName || 'General',
      scheduledDate: primaryItem.serviceDate || 'Tomorrow',
      scheduledTimeSlot: primaryItem.timeSlot || '10:00 AM - 12:00 PM',
      amount: total,
      serviceAddress: activeAddress
        ? `${activeAddress.houseNo || ''} ${activeAddress.street || ''}, ${activeAddress.city || ''}`.trim()
        : currentLocation?.address || 'Indore, MP',
      paymentMode
    });

    clearBucket();
    return bookingId;
  };

  const cancelBooking = async (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id || b.bookingId === id ? { ...b, status: 'Cancelled' } : b))
    );
    try {
      await apiPut(`/booking/update-status/${id}`, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by customer'
      });
    } catch (e) {}
  };

  const rescheduleBooking = async (id, newDate, newTimeSlot) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id || b.bookingId === id
          ? { ...b, scheduledDate: newDate, scheduledTimeSlot: newTimeSlot, status: 'Upcoming' }
          : b
      )
    );
    try {
      await apiPut(`/booking/update-status/${id}`, {
        status: 'confirmed',
        scheduledDate: newDate,
        scheduledTimeSlot: newTimeSlot,
        note: `Rescheduled to ${newDate} (${newTimeSlot})`
      });
    } catch (e) {}
  };

  const rateBooking = async (id, rating, review) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id || b.bookingId === id ? { ...b, userRating: rating, userReview: review } : b
      )
    );
    try {
      await apiPut(`/booking/update-status/${id}`, {
        userRating: rating,
        userReview: review
      });
    } catch (e) {}
  };

  const submitSupportTicket = async (ticketData) => {
    let ticketId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await apiPost('/api/enquiries', {
        name: user?.fullName || user?.name || ticketData.name || 'Customer',
        email: user?.email || ticketData.email || 'customer@bigbazaar.com',
        phone: user?.phoneNumber || user?.phone || ticketData.phone || '',
        subject: ticketData.subject || ticketData.category || 'Customer Support Request',
        category: ticketData.category || 'general_enquiry',
        message: ticketData.description || ticketData.message || 'Support request submitted'
      });
      if (res?.enquiryId) ticketId = res.enquiryId;
    } catch (e) {}

    const newTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketId,
      status: 'Open',
      createdAt: 'Just now',
      messages: [
        { sender: 'user', text: ticketData.description || ticketData.message, time: 'Just now' },
        { sender: 'support', text: 'We have received your ticket and an executive will contact you shortly.', time: 'Just now' }
      ]
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    return ticketId;
  };

  const addTicketMessage = (ticketId, message) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId || t.ticketId === ticketId) {
          return {
            ...t,
            messages: [...t.messages, { sender: 'user', text: message, time: 'Just now' }]
          };
        }
        return t;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        setAuthenticated,
        appLockEnabled,
        setAppLockEnabled,
        appLockPromptShown,
        setAppLockPromptShown,
        pendingAction,
        requireAuth,
        executePendingAction,
        updateUser,
        addresses,
        activeAddress,
        setActiveAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        bucket,
        addToBucket,
        removeFromBucket,
        updateBucketQuantity,
        clearBucket,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getBucketTotals,
        bookings,
        refreshBookings,
        createBookingFromBucket,
        createInstantBooking,
        cancelBooking,
        rescheduleBooking,
        rateBooking,
        supportTickets,
        submitSupportTicket,
        addTicketMessage,
        transactions,
        watchlist,
        toggleWatchlist,
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed,
        savedSearches,
        addSavedSearch,
        removeSavedSearch,
        clearSavedSearches,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        ads,
        addAd,
        updateAd,
        updateAdStatus,
        removeAd,
        logout,
        currentLocation,
        setCurrentLocation,
        locationPermissionGranted,
        setLocationPermissionGranted,
        notificationPermissionGranted,
        setNotificationPermissionGranted,
        language,
        setLanguage,
        toggleLanguage,
        country,
        currency,
        currencySymbol,
        setCountryAndCurrency,
        formatPrice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  return context || defaultContextValue;
};

export default AppContext;
