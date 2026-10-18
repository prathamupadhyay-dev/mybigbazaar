/**
 * @file apps/web/src/context/AppContext.jsx
 * @description Global state container for MyBigBazaar Web.
 * Manages Auth, Cart, Watchlist, Notifications, Live Chats, User Listings & Bookings.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  webApi,
  getStoredUser,
  setStoredUser,
  WATCHLIST_KEY,
  CART_KEY,
  ADS_KEY,
  BOOKINGS_KEY
} from '../services/apiClient.js';
import {
  MOCK_USERS,
  MOCK_NOTIFICATIONS,
  MOCK_CHATS
} from '../data/mockData.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Auth State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || MOCK_USERS[0]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'

  // 2. Watchlist / Favorites
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      return raw ? JSON.parse(raw) : ['list-01', 'list-02'];
    } catch {
      return ['list-01'];
    }
  });

  // 3. Cart / Service Bucket
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  // 4. Notifications
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // 5. Chats & Negotiations
  const [chats, setChats] = useState(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState('chat-01');

  // 6. User Ads & Bookings
  const [userAds, setUserAds] = useState(() => {
    try {
      const raw = localStorage.getItem(ADS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [userBookings, setUserBookings] = useState([]);

  // Load initial bookings
  useEffect(() => {
    webApi.getBookings().then(setUserBookings).catch(() => {});
  }, []);

  // Sync Watchlist
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  // Sync Cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // ---------------- AUTH METHODS ----------------
  const login = async (credentials) => {
    const res = await webApi.login(credentials);
    setCurrentUser(res.user);
    setAuthModalOpen(false);
    return res.user;
  };

  const loginPersona = (personaRole) => {
    const matched = MOCK_USERS.find((u) => u.role === personaRole) || MOCK_USERS[0];
    webApi.login({ email: matched.email, password: 'password', role: matched.role });
    setCurrentUser(matched);
    setAuthModalOpen(false);
  };

  const register = async (userData) => {
    const res = await webApi.register(userData);
    setCurrentUser(res.user);
    setAuthModalOpen(false);
    return res.user;
  };

  const logout = () => {
    webApi.logout();
    setCurrentUser(null);
  };

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuth = () => setAuthModalOpen(false);

  // ---------------- WATCHLIST METHODS ----------------
  const toggleWatchlist = (itemId) => {
    setWatchlist((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isWatched = (itemId) => watchlist.includes(itemId);

  // ---------------- CART METHODS ----------------
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateCartQty = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
  };

  const applyCoupon = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      setCouponDiscount(0);
      setCouponMessage('');
      setCouponCode('');
      return;
    }
    setCouponCode(clean);
    const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

    if (clean === 'FIRST20') {
      const discount = Math.min(Math.round(subtotal * 0.2), 300);
      setCouponDiscount(discount);
      setCouponMessage(`Code FIRST20 applied! You saved ₹${discount}`);
    } else if (clean === 'BIGBAZAAR') {
      const discount = Math.min(Math.round(subtotal * 0.1), 500);
      setCouponDiscount(discount);
      setCouponMessage(`Code BIGBAZAAR applied! You saved ₹${discount}`);
    } else {
      setCouponDiscount(0);
      setCouponMessage('Invalid promo code. Try FIRST20 or BIGBAZAAR');
    }
  };

  // Cart summary calculation
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const platformFee = cartSubtotal > 0 ? Math.max(15, Math.round(cartSubtotal * 0.02)) : 0;
  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + platformFee);

  // ---------------- NOTIFICATIONS METHODS ----------------
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ---------------- CHAT & OFFERS METHODS ----------------
  const sendMessage = (chatId, text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: text,
              lastTime: 'Just now',
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
  };

  const makeOffer = (chatId, offerAmount) => {
    const newMsg = {
      id: `msg-off-${Date.now()}`,
      sender: 'me',
      type: 'offer',
      offerAmount,
      offerStatus: 'pending',
      text: `Made an offer: ₹${Number(offerAmount).toLocaleString('en-IN')}`,
      time: 'Just now'
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: `Offer: ₹${Number(offerAmount).toLocaleString('en-IN')}`,
              lastTime: 'Just now',
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
  };

  const respondToOffer = (chatId, msgId, action, counterAmount) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const updatedMessages = c.messages.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              offerStatus: action === 'accept' ? 'accepted' : (action === 'decline' ? 'declined' : 'countered')
            };
          }
          return m;
        });

        if (action === 'counter' && counterAmount) {
          updatedMessages.push({
            id: `msg-cnt-${Date.now()}`,
            sender: 'me',
            type: 'offer',
            offerAmount: counterAmount,
            offerStatus: 'pending',
            text: `Counter-offer: ₹${Number(counterAmount).toLocaleString('en-IN')}`,
            time: 'Just now'
          });
        }

        return {
          ...c,
          messages: updatedMessages,
          lastMessage: action === 'accept' ? 'Offer accepted!' : (action === 'decline' ? 'Offer declined' : `Counter-offer: ₹${counterAmount}`),
          lastTime: 'Just now'
        };
      })
    );
  };

  // ---------------- USER ADS METHODS ----------------
  const postNewAd = async (adData) => {
    const created = await webApi.createListing(adData);
    setUserAds((prev) => [created, ...prev]);
    return created;
  };

  const updateAdStatus = (adId, newStatus) => {
    setUserAds((prev) =>
      prev.map((ad) => (ad.id === adId ? { ...ad, status: newStatus } : ad))
    );
  };

  // ---------------- BOOKINGS METHODS ----------------
  const createBooking = async (bookingData) => {
    const created = await webApi.createBooking(bookingData);
    setUserBookings((prev) => [created, ...prev]);
    clearCart();
    return created;
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginPersona,
        register,
        logout,
        authModalOpen,
        authModalTab,
        openAuth,
        closeAuth,

        // Watchlist
        watchlist,
        toggleWatchlist,
        isWatched,

        // Cart
        cart,
        cartSubtotal,
        platformFee,
        cartTotal,
        couponCode,
        couponDiscount,
        couponMessage,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        applyCoupon,

        // Notifications
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,

        // Chat
        chats,
        activeChatId,
        setActiveChatId,
        sendMessage,
        makeOffer,
        respondToOffer,

        // Ads & Bookings
        userAds,
        postNewAd,
        updateAdStatus,
        userBookings,
        createBooking
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
