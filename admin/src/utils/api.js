// ============================================================
// Centralized API & Authentication Utility with 401 Interceptor
// ============================================================
import { API_BASE } from '../config'
import {
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_PRODUCT_CATEGORIES,
  MOCK_ADMIN_SERVICE_CATEGORIES,
  MOCK_ADMIN_PRODUCTS,
  MOCK_ADMIN_BOOKINGS,
  MOCK_ADMIN_TAXES,
  MOCK_ADMIN_KYC,
  MOCK_ADMIN_MODERATION,
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_PROVIDERS,
  MOCK_ADMIN_SERVICES,
  MOCK_ADMIN_TRANSACTIONS,
  MOCK_ADMIN_REFUNDS,
  MOCK_ADMIN_BANNERS,
  MOCK_ADMIN_NOTIFICATIONS,
  MOCK_ADMIN_AUDIT_LOGS,
  MOCK_ADMIN_PRODUCT_SUBCATEGORIES,
  MOCK_ADMIN_AD_CAMPAIGNS,
  MOCK_ADMIN_ORDERS,
  MOCK_ADMIN_ANALYTICS_REPORTS
} from './mockAdminData'

export const LEGACY_MOCK_IDS = new Set([
  'usr-admin-01', 'usr-seller-01', 'usr-provider-01', 'usr-buyer-01', 'usr-pending-01', 'usr-flagged-01',
  'bkg-01', 'bkg-02', 'BKG-882194', 'BKG-771032',
  'TXN-90412', 'TXN-90413', 'TXN-90414', 'TXN-90415',
  'REF-5021', 'REF-5022',
  'KYC-101', 'KYC-102', 'KYC-103',
  'MOD-8421', 'MOD-8422', 'MOD-8423', 'MOD-8424', 'MOD-8425',
  'REP-301', 'REP-302', 'REP-303',
  'ord-101', 'ord-102', 'ORD-202410-101', 'ORD-202410-102',
  'tax-01', 'tax-02', 'tax-03',
  'rev-01', 'rev-02', 'rev-03', 'rev-04', 'rev-05',
  'conv-01', 'conv-02',
  'm1', 'm2', 'm3', 'm4',
  'bc-101', 'bc-102', 'bc-103',
  'BNR-01', 'BNR-02', 'BNR-03', 'BNR-04',
  'audit-01', 'audit-02', 'audit-03',
  'ad-01', 'ad-02', 'ad-03',
  'prod-01', 'prod-02', 'prod-03', 'prod-04', 'prod-05', 'prod-06',
  'SRV-01', 'SRV-02', 'SRV-03', 'SRV-04'
]);

export function cleanLegacyMocks(list = []) {
  if (!Array.isArray(list)) return [];
  return list.filter(item => {
    if (!item) return false;
    const id = item.id || item._id || item.orderNumber || item.refNumber || item.refId;
    return !LEGACY_MOCK_IDS.has(id);
  });
}

if (typeof localStorage !== 'undefined') {
  const keysToClean = [
    'mbb_admin_users',
    'mbb_admin_bookings',
    'mbb_admin_transactions',
    'mbb_admin_orders',
    'mbb_admin_refunds',
    'mbb_admin_kyc',
    'mbb_admin_moderation',
    'mbb_admin_reports',
    'admin_reports_data',
    'mbb_admin_customer_reviews',
    'mbb_admin_campaigns',
    'mbb_admin_banners',
    'mbb_admin_ad_campaigns',
    'mbb_admin_listings',
    'mbb_admin_taxes'
  ];
  try {
    localStorage.removeItem('admin_seller_forms_cache_v2');
    localStorage.removeItem('admin_seller_forms_cache');
  } catch (e) {}
  keysToClean.forEach(k => {
    try {
      const val = localStorage.getItem(k);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          const cleaned = cleanLegacyMocks(parsed);
          localStorage.setItem(k, JSON.stringify(cleaned));
        }
      }
    } catch (e) {}
  });
}

export function getMockAdminResponse(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  let data = { success: true, message: 'Processed via offline admin adapter' }

  if (url.includes('/auth/get-all-users') || url.includes('/api/v1/admin/users')) {
    let currentUsers = [];
    try {
      const stored = localStorage.getItem('mbb_admin_users');
      if (stored !== null) {
        currentUsers = cleanLegacyMocks(JSON.parse(stored));
      }
    } catch (e) {}

    if (method === 'GET') {
      data = { success: true, count: currentUsers.length, users: currentUsers, data: currentUsers };
    } else if (method === 'POST') {
      let payload = {};
      try { payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch (e) {}
      const newUser = {
        _id: `USR-${Date.now()}`,
        id: `USR-${Date.now()}`,
        fullName: payload.fullName || payload.name || 'New User',
        name: payload.fullName || payload.name || 'New User',
        email: payload.email || '',
        phoneNumber: payload.phoneNumber || payload.phone || '',
        phone: payload.phoneNumber || payload.phone || '',
        role: payload.role || 'user',
        status: payload.status || 'active',
        walletBalance: Number(payload.walletBalance) || 0,
        createdAt: new Date().toISOString()
      };
      currentUsers = [newUser, ...currentUsers];
      try { localStorage.setItem('mbb_admin_users', JSON.stringify(currentUsers)); } catch (e) {}
      data = { success: true, message: 'User account created successfully', data: newUser };
    } else if (method === 'PUT') {
      const idMatch = url.match(/\/users\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      let payload = {};
      try { payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch (e) {}
      currentUsers = currentUsers.map(u => (u._id === targetId || u.id === targetId ? { ...u, ...payload } : u));
      try { localStorage.setItem('mbb_admin_users', JSON.stringify(currentUsers)); } catch (e) {}
      data = { success: true, message: 'User updated successfully' };
    } else if (method === 'DELETE') {
      const idMatch = url.match(/\/users\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      currentUsers = currentUsers.filter(u => u._id !== targetId && u.id !== targetId);
      try { localStorage.setItem('mbb_admin_users', JSON.stringify(currentUsers)); } catch (e) {}
      data = { success: true, message: 'User deleted successfully' };
    }
  } else if (url.includes('/api/v1/admin/dashboard')) {
    let uCount = 0, pCount = 0, bCount = 0, revCount = 0;
    try {
      const u = JSON.parse(localStorage.getItem('mbb_admin_users') || '[]');
      uCount = Array.isArray(u) ? u.length : 0;
      const p = JSON.parse(localStorage.getItem('mbb_admin_listings') || '[]');
      pCount = Array.isArray(p) ? p.length : 0;
      const b = JSON.parse(localStorage.getItem('mbb_admin_bookings') || '[]');
      bCount = Array.isArray(b) ? b.length : 0;
      const pay = JSON.parse(localStorage.getItem('mbb_admin_transactions') || '[]');
      revCount = Array.isArray(pay) ? pay.reduce((s, it) => s + (Number(it.amount) || 0), 0) : 0;
    } catch (e) {}
    data = {
      success: true,
      stats: {
        totalRevenue: `₹${revCount.toLocaleString('en-IN')}`,
        activeListings: pCount,
        serviceBookings: bCount,
        verifiedUsers: uCount,
        pendingKYC: 0,
        pendingModeration: 0
      },
      data: {
        totalRevenue: `₹${revCount.toLocaleString('en-IN')}`,
        activeListings: pCount,
        serviceBookings: bCount,
        verifiedUsers: uCount,
        pendingKYC: 0,
        pendingModeration: 0
      }
    };
  } else if (url.includes('/product-category/get-all') || url.includes('/api/v1/categories/product')) {
    data = { success: true, data: MOCK_ADMIN_PRODUCT_CATEGORIES, count: MOCK_ADMIN_PRODUCT_CATEGORIES.length }
  } else if (url.includes('/product-subCategory')) {
    let currentSubs = [...MOCK_ADMIN_PRODUCT_SUBCATEGORIES];
    try {
      const stored = localStorage.getItem('mbb_admin_product_subcategories');
      if (stored !== null) {
        currentSubs = JSON.parse(stored);
      }
    } catch (e) {}

    if (method === 'GET') {
      const catMatch = url.match(/(?:categoryId|productCategoryId)=([^&]+)/);
      let filtered = currentSubs;
      if (catMatch && catMatch[1]) {
        filtered = currentSubs.filter(s => {
          const pid = s.productCategoryId?._id || s.productCategoryId?.id || s.productCategoryId;
          return String(pid) === String(catMatch[1]);
        });
      }
      data = { success: true, data: filtered, count: filtered.length };
    } else if (method === 'POST') {
      let payload = {};
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      const parentCat = MOCK_ADMIN_PRODUCT_CATEGORIES.find(c => c.id === (payload.productCategoryId || payload.categoryId) || c._id === (payload.productCategoryId || payload.categoryId)) || {
        _id: payload.productCategoryId,
        id: payload.productCategoryId,
        name: 'General'
      };
      const newSub = {
        _id: `psub-${Date.now()}`,
        id: `psub-${Date.now()}`,
        productCategoryId: parentCat,
        name: payload.name || 'New Subcategory',
        title: payload.title || payload.name || '',
        slug: (payload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: payload.icon || 'Tag',
        images: payload.images ? [payload.images] : [],
        sortOrder: Number(payload.sortOrder || currentSubs.length + 1),
        isActive: payload.isActive !== false && payload.status !== 'Inactive',
        status: payload.status || 'Active',
        createdAt: new Date().toISOString()
      };
      currentSubs = [newSub, ...currentSubs];
      try { localStorage.setItem('mbb_admin_product_subcategories', JSON.stringify(currentSubs)); } catch (e) {}
      data = { success: true, message: 'Product subcategory created', data: newSub };
    } else if (method === 'PUT') {
      const idMatch = url.match(/\/update\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      let payload = {};
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      currentSubs = currentSubs.map(s => {
        if (s.id === targetId || s._id === targetId) {
          return {
            ...s,
            ...payload,
            sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder) : s.sortOrder,
            status: payload.status || (payload.isActive !== undefined ? (payload.isActive ? 'Active' : 'Inactive') : s.status),
            isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : (payload.status ? payload.status === 'Active' : s.isActive)
          };
        }
        return s;
      });
      try { localStorage.setItem('mbb_admin_product_subcategories', JSON.stringify(currentSubs)); } catch (e) {}
      data = { success: true, message: 'Product subcategory updated' };
    } else if (method === 'DELETE') {
      const idMatch = url.match(/\/delete\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      currentSubs = currentSubs.filter(s => s.id !== targetId && s._id !== targetId);
      try { localStorage.setItem('mbb_admin_product_subcategories', JSON.stringify(currentSubs)); } catch (e) {}
      data = { success: true, message: 'Product subcategory deleted' };
    }
  } else if (url.includes('/service-category/get-all') || url.includes('/api/v1/categories/service')) {
    data = { success: true, data: MOCK_ADMIN_SERVICE_CATEGORIES, count: MOCK_ADMIN_SERVICE_CATEGORIES.length }
  } else if (url.includes('/service-subCategory/get-all')) {
    data = { success: true, data: [] }
  } else if (url.includes('/tax/get-all') || url.includes('/api/v1/taxes') || url.includes('/taxes')) {
    let currentTaxes = [];
    try {
      const stored = localStorage.getItem('mbb_admin_taxes');
      if (stored !== null) currentTaxes = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, count: currentTaxes.length, taxes: currentTaxes, data: currentTaxes }
  } else if (url.includes('/product/get-all') || url.includes('/api/v1/listings')) {
    let currentProds = [];
    try {
      const stored = localStorage.getItem('mbb_admin_listings');
      if (stored !== null) currentProds = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, count: currentProds.length, data: currentProds, products: currentProds }
  } else if (url.includes('/booking/get-all') || url.includes('/api/v1/bookings')) {
    let currentBookings = [];
    try {
      const stored = localStorage.getItem('mbb_admin_bookings');
      if (stored !== null) currentBookings = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, count: currentBookings.length, data: currentBookings, bookings: currentBookings }
  } else if (url.includes('/api/v1/deals') || url.includes('/deals')) {
    let currentDeals = [];
    try {
      const stored = localStorage.getItem('mbb_admin_deals');
      if (stored !== null) currentDeals = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, count: currentDeals.length, data: currentDeals }
  } else if (url.includes('/kyc/get-all') || url.includes('/api/v1/providers/kyc') || url.includes('/api/v1/kyc') || url.includes('/kyc')) {
    let currentKyc = [];
    try {
      const stored = localStorage.getItem('mbb_admin_kyc');
      if (stored !== null) currentKyc = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentKyc, count: currentKyc.length }
  } else if (url.includes('/moderation/queue') || url.includes('/api/v1/moderation/queue')) {
    let currentMod = [];
    try {
      const stored = localStorage.getItem('mbb_admin_moderation');
      if (stored !== null) currentMod = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentMod, count: currentMod.length }
  } else if (url.includes('/api/v1/orders') || url.includes('/order/get-all') || url.includes('/orders')) {
    let currentOrders = [];
    try {
      const stored = localStorage.getItem('mbb_admin_orders');
      if (stored !== null) {
        currentOrders = cleanLegacyMocks(JSON.parse(stored));
      }
    } catch (e) {}

    if (method === 'GET') {
      let filtered = [...currentOrders];
      if (url.includes('status=')) {
        const statusMatch = url.match(/status=([^&]+)/);
        const st = statusMatch ? statusMatch[1].toLowerCase() : '';
        if (st && st !== 'all') {
          filtered = filtered.filter(o => (o.trackingStatus || '').toLowerCase() === st);
        }
      }
      data = { success: true, count: filtered.length, data: filtered, meta: { total: filtered.length, page: 1, limit: 100 } };
    } else if (method === 'PUT' && (url.includes('/tracking') || url.includes('/status'))) {
      const idMatch = url.match(/\/orders\/([^/]+)\/(tracking|status)/);
      const targetId = idMatch ? idMatch[1] : null;
      let bodyData = {};
      if (typeof options.body === 'string') {
        try { bodyData = JSON.parse(options.body); } catch (e) {}
      } else if (options.body) {
        bodyData = options.body;
      }
      currentOrders = currentOrders.map(o => {
        if (o.id === targetId || o._id === targetId || o.orderNumber === targetId) {
          const nextStatus = bodyData.trackingStatus || bodyData.status || o.trackingStatus;
          const nextTrackNum = bodyData.trackingNumber !== undefined ? bodyData.trackingNumber : o.trackingNumber;
          const history = Array.isArray(o.statusHistory) ? [...o.statusHistory] : [];
          history.push({
            status: nextStatus,
            note: bodyData.note || `Status updated to ${nextStatus}`,
            changedAt: new Date().toISOString()
          });
          return {
            ...o,
            trackingStatus: nextStatus,
            trackingNumber: nextTrackNum,
            statusHistory: history,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      });
      try { localStorage.setItem('mbb_admin_orders', JSON.stringify(currentOrders)); } catch (e) {}
      data = { success: true, message: 'Order tracking status updated successfully' };
    }
  } else if (url.includes('/api/v1/admin/reports') || url.includes('/reports/analytics')) {
    let orders = [], txns = [], users = [];
    try {
      orders = cleanLegacyMocks(JSON.parse(localStorage.getItem('mbb_admin_orders') || '[]'));
      txns = cleanLegacyMocks(JSON.parse(localStorage.getItem('mbb_admin_transactions') || '[]'));
      users = cleanLegacyMocks(JSON.parse(localStorage.getItem('mbb_admin_users') || '[]'));
    } catch (e) {}
    const grossSales = txns.reduce((s, it) => s + (Number(it.amount) || 0), 0) + orders.reduce((s, it) => s + (Number(it.totalAmount || it.amount) || 0), 0);
    const dynamicReports = {
      sales: {
        kpis: {
          grossSales,
          netSales: Math.round(grossSales * 0.95),
          totalOrders: orders.length + txns.length,
          avgOrderValue: (orders.length + txns.length) > 0 ? Math.round(grossSales / (orders.length + txns.length)) : 0,
          commissionEarned: Math.round(grossSales * 0.1),
          marginPercent: grossSales > 0 ? 10 : 0
        },
        categories: [],
        topProducts: [],
        dailyBreakdown: []
      },
      daily: {
        today: {
          date: new Date().toISOString().split('T')[0],
          dayOrders: orders.length,
          dayRevenue: grossSales,
          daySignups: users.length,
          dayListings: 0,
          conversionRate: '0%',
          pendingShipments: orders.filter(o => !['delivered', 'completed', 'cancelled'].includes(String(o.trackingStatus).toLowerCase())).length,
          completedToday: orders.filter(o => ['delivered', 'completed'].includes(String(o.trackingStatus).toLowerCase())).length
        },
        hourlyDistribution: [],
        history: []
      },
      customers: {
        kpis: {
          totalCustomers: users.length,
          activeBuyers: users.filter(u => u.role !== 'admin').length,
          eliteMembers: 0,
          repeatPurchaseRate: '0%',
          avgLtv: users.length > 0 ? Math.round(grossSales / users.length) : 0,
          newThisMonth: users.length
        },
        tierBreakdown: [],
        topCustomers: [],
        cityDistribution: []
      },
      payments: {
        kpis: {
          totalProcessedVolume: grossSales,
          successRate: '100%',
          escrowBalance: grossSales,
          refundsProcessed: 0,
          gatewayFeeTotal: Math.round(grossSales * 0.02),
          disputeRate: '0%'
        },
        rails: [],
        transactions: txns
      }
    };
    if (url.includes('/sales')) {
      data = { success: true, data: dynamicReports.sales };
    } else if (url.includes('/daily')) {
      data = { success: true, data: dynamicReports.daily };
    } else if (url.includes('/customer')) {
      data = { success: true, data: dynamicReports.customers };
    } else if (url.includes('/payment')) {
      data = { success: true, data: dynamicReports.payments };
    } else {
      data = { success: true, data: dynamicReports };
    }
  } else if (url.includes('/report/get-all') || url.includes('/api/v1/moderation/reports')) {
    let currentReports = [];
    try {
      const stored = localStorage.getItem('mbb_admin_reports') || localStorage.getItem('admin_reports_data');
      if (stored !== null) currentReports = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentReports, count: currentReports.length }
  } else if (url.includes('/provider/get-all') || url.includes('/api/v1/providers')) {
    let currentProviders = [];
    try {
      const stored = localStorage.getItem('mbb_admin_providers');
      if (stored !== null) currentProviders = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentProviders, count: currentProviders.length }
  } else if (url.includes('/service/get-all') || url.includes('/api/v1/services')) {
    let currentServices = [];
    try {
      const stored = localStorage.getItem('mbb_admin_services');
      if (stored !== null) currentServices = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentServices, count: currentServices.length }
  } else if (url.includes('/transaction/get-all') || url.includes('/api/v1/transactions')) {
    let currentTxns = [];
    try {
      const stored = localStorage.getItem('mbb_admin_transactions');
      if (stored !== null) currentTxns = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentTxns, count: currentTxns.length, transactions: currentTxns }
  } else if (url.includes('/refund/get-all') || url.includes('/api/v1/refunds') || url.includes('/finance')) {
    let currentRefunds = [];
    try {
      const stored = localStorage.getItem('mbb_admin_refunds');
      if (stored !== null) currentRefunds = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentRefunds, count: currentRefunds.length, refunds: currentRefunds }
  } else if (url.includes('/api/v1/cms/banners') || url.includes('/banner')) {
    let currentBanners = [...MOCK_ADMIN_BANNERS];
    try {
      const stored = localStorage.getItem('mbb_admin_banners');
      if (stored !== null) {
        currentBanners = JSON.parse(stored);
      }
    } catch (e) {}

    if (method === 'GET') {
      let filtered = [...currentBanners];
      if (url.includes('placement=')) {
        const placementMatch = url.match(/placement=([^&]+)/);
        const p = placementMatch ? placementMatch[1] : '';
        if (p && p !== 'all') {
          filtered = filtered.filter(b => b.placement === p || (p === 'home_hero' && b.placement === 'home'));
        }
      }
      if (!url.includes('all=true') && !url.includes('all=1')) {
        filtered = filtered.filter(b => b.isActive !== false && b.status !== 'Inactive');
      }
      data = { success: true, count: filtered.length, data: filtered };
    } else if (method === 'POST') {
      let payload = {};
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      const newBanner = {
        _id: `BNR-${Date.now()}`,
        id: `BNR-${Date.now()}`,
        title: payload.title || 'New Banner',
        subtitle: payload.subtitle || '',
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        targetScreen: payload.targetScreen || 'ProductList',
        ctaText: payload.ctaText || 'Shop Now',
        tag: payload.tag || 'Special Offer',
        placement: payload.placement || 'home_hero',
        sortOrder: Number(payload.sortOrder || payload.order || 1),
        order: Number(payload.sortOrder || payload.order || 1),
        validUntil: payload.validUntil || '2026-12-31',
        isActive: payload.isActive !== 'false' && payload.status !== 'Inactive' && payload.isActive !== false,
        status: (payload.status === 'Inactive' || payload.isActive === 'false' || payload.isActive === false) ? 'Inactive' : 'Active',
        impressions: 0,
        clicks: 0,
        ctr: '0%'
      };
      currentBanners = [newBanner, ...currentBanners];
      try { localStorage.setItem('mbb_admin_banners', JSON.stringify(currentBanners)); } catch (e) {}
      data = { success: true, message: 'Banner created successfully', data: newBanner };
    } else if (method === 'PUT' && url.includes('/status')) {
      const idMatch = url.match(/\/banners\/([^/]+)\/status/);
      const targetId = idMatch ? idMatch[1] : null;
      let bodyData = {};
      if (typeof options.body === 'string') {
        try { bodyData = JSON.parse(options.body); } catch (e) {}
      }
      currentBanners = currentBanners.map(b => {
        if (b.id === targetId || b._id === targetId) {
          const nextActive = bodyData.status ? bodyData.status === 'Active' : !b.isActive;
          return { ...b, isActive: nextActive, status: nextActive ? 'Active' : 'Inactive' };
        }
        return b;
      });
      try { localStorage.setItem('mbb_admin_banners', JSON.stringify(currentBanners)); } catch (e) {}
      data = { success: true, message: 'Banner status updated' };
    } else if (method === 'PUT') {
      const idMatch = url.match(/\/banners\/([^/]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      let payload = {};
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      currentBanners = currentBanners.map(b => {
        if (b.id === targetId || b._id === targetId) {
          const nextActive = payload.status ? payload.status === 'Active' : (payload.isActive !== undefined ? Boolean(payload.isActive) : b.isActive);
          return {
            ...b,
            ...payload,
            sortOrder: payload.sortOrder ? Number(payload.sortOrder) : (payload.order ? Number(payload.order) : b.sortOrder),
            order: payload.sortOrder ? Number(payload.sortOrder) : (payload.order ? Number(payload.order) : b.order),
            isActive: nextActive,
            status: nextActive ? 'Active' : 'Inactive'
          };
        }
        return b;
      });
      try { localStorage.setItem('mbb_admin_banners', JSON.stringify(currentBanners)); } catch (e) {}
      data = { success: true, message: 'Banner updated successfully' };
    } else if (method === 'DELETE') {
      const idMatch = url.match(/\/banners\/([^/]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      currentBanners = currentBanners.filter(b => b.id !== targetId && b._id !== targetId);
      try { localStorage.setItem('mbb_admin_banners', JSON.stringify(currentBanners)); } catch (e) {}
      data = { success: true, message: 'Banner deleted successfully' };
    }
  } else if (url.includes('/api/v1/cms/banners/settings')) {
    let currentSettings = { autoplayIntervalSeconds: 4.5, autoPlayEnabled: true };
    try {
      const stored = localStorage.getItem('mbb_admin_banner_settings');
      if (stored) currentSettings = JSON.parse(stored);
    } catch (e) {}

    if (method === 'GET') {
      data = { success: true, data: currentSettings };
    } else {
      let payload = {};
      if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      currentSettings = { ...currentSettings, ...payload };
      try { localStorage.setItem('mbb_admin_banner_settings', JSON.stringify(currentSettings)); } catch (e) {}
      data = { success: true, message: 'Settings saved', data: currentSettings };
    }
  } else if (url.includes('/api/v1/cms/gallery')) {
    let currentGallery = [];
    try {
      const stored = localStorage.getItem('mbb_admin_gallery');
      if (stored) currentGallery = JSON.parse(stored);
    } catch (e) {}

    if (method === 'GET') {
      data = { success: true, count: currentGallery.length, data: currentGallery };
    } else if (method === 'POST') {
      const newItem = {
        id: `img-${Date.now()}`,
        filename: `upload-${Date.now()}.png`,
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        size: 245000,
        sizeFormatted: '245 KB',
        extension: 'PNG',
        createdAt: new Date()
      };
      currentGallery = [newItem, ...currentGallery];
      try { localStorage.setItem('mbb_admin_gallery', JSON.stringify(currentGallery)); } catch (e) {}
      data = { success: true, message: 'Image uploaded', data: [newItem] };
    } else if (method === 'DELETE') {
      data = { success: true, message: 'Image deleted' };
    }
  } else if (url.includes('/api/v1/advertisements/campaigns') || url.includes('/ad-campaign')) {
    let currentCampaigns = [...MOCK_ADMIN_AD_CAMPAIGNS];
    try {
      const stored = localStorage.getItem('mbb_admin_ad_campaigns');
      if (stored !== null) {
        currentCampaigns = JSON.parse(stored);
      }
    } catch (e) {}

    if (method === 'GET') {
      data = { success: true, count: currentCampaigns.length, data: currentCampaigns };
    } else if (method === 'POST') {
      let payload = {};
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      const newCampaign = {
        id: `ad-cmp-${Date.now()}`,
        _id: `ad-cmp-${Date.now()}`,
        name: payload.name || 'New Ad Campaign',
        advertiser: payload.advertiser || 'Advertiser',
        advertiserEmail: payload.advertiserEmail || '',
        type: payload.type || 'Featured Product Ad',
        placement: payload.placement || 'Homepage Featured Grid',
        targetCategory: payload.targetCategory || 'Electronics',
        budget: Number(payload.budget || 2000),
        dailyBudget: Number(payload.dailyBudget || 250),
        spent: 0,
        impressions: 0,
        clicks: 0,
        ctr: '0.0%',
        startDate: payload.startDate || new Date().toISOString().slice(0, 10),
        endDate: payload.endDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: payload.status || 'Active',
        creativeUrl: payload.creativeUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
        targetUrl: payload.targetUrl || '',
        createdAt: new Date().toISOString()
      };
      currentCampaigns = [newCampaign, ...currentCampaigns];
      try { localStorage.setItem('mbb_admin_ad_campaigns', JSON.stringify(currentCampaigns)); } catch (e) {}
      data = { success: true, message: 'Ad campaign created', data: newCampaign };
    } else if (method === 'PUT') {
      const idMatch = url.match(/\/campaigns\/([^/?]+)/) || url.match(/\/ad-campaign\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      let payload = {};
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try { payload = JSON.parse(options.body); } catch (e) {}
      }
      currentCampaigns = currentCampaigns.map(c => {
        if (c.id === targetId || c._id === targetId) {
          return {
            ...c,
            ...payload,
            budget: payload.budget !== undefined ? Number(payload.budget) : c.budget,
            dailyBudget: payload.dailyBudget !== undefined ? Number(payload.dailyBudget) : c.dailyBudget,
            status: payload.status || c.status
          };
        }
        return c;
      });
      try { localStorage.setItem('mbb_admin_ad_campaigns', JSON.stringify(currentCampaigns)); } catch (e) {}
      data = { success: true, message: 'Ad campaign updated' };
    } else if (method === 'DELETE') {
      const idMatch = url.match(/\/campaigns\/([^/?]+)/) || url.match(/\/ad-campaign\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      currentCampaigns = currentCampaigns.filter(c => c.id !== targetId && c._id !== targetId);
      try { localStorage.setItem('mbb_admin_ad_campaigns', JSON.stringify(currentCampaigns)); } catch (e) {}
      data = { success: true, message: 'Ad campaign deleted' };
    }
  } else if (url.includes('/api/v1/roles') || url.includes('/roles')) {
    const defaultAdminRole = {
      _id: 'system-admin-role',
      name: 'Admin',
      slug: 'admin',
      description: 'Primary platform administrator with full, unrestricted access to all tabs and features.',
      isSystem: true,
      cannotDelete: true,
      allowedTabs: ['*'],
      createdAt: new Date().toISOString()
    };
    let currentRoles = [defaultAdminRole];
    try {
      const stored = localStorage.getItem('mbb_admin_roles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentRoles = parsed;
        }
      }
    } catch (e) {}

    if (!currentRoles.find(r => r.name?.toLowerCase() === 'admin')) {
      currentRoles = [defaultAdminRole, ...currentRoles];
    }

    if (method === 'GET') {
      data = { success: true, count: currentRoles.length, data: currentRoles };
    } else if (method === 'POST') {
      let payload = {};
      try { payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch (e) {}
      const newRole = {
        _id: `role-${Date.now()}`,
        name: (payload.name || '').trim(),
        slug: (payload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: (payload.description || '').trim(),
        isSystem: false,
        cannotDelete: false,
        allowedTabs: Array.isArray(payload.allowedTabs) ? payload.allowedTabs : [],
        createdAt: new Date().toISOString()
      };
      currentRoles = [...currentRoles, newRole];
      try { localStorage.setItem('mbb_admin_roles', JSON.stringify(currentRoles)); } catch (e) {}
      data = { success: true, message: 'Role created successfully', data: newRole };
    } else if (method === 'PUT') {
      const idMatch = url.match(/\/roles\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      let payload = {};
      try { payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {}; } catch (e) {}
      currentRoles = currentRoles.map(r => {
        if (r._id === targetId || r.id === targetId) {
          return {
            ...r,
            name: r.isSystem ? r.name : (payload.name || r.name),
            description: payload.description !== undefined ? payload.description : r.description,
            allowedTabs: payload.allowedTabs || r.allowedTabs
          };
        }
        return r;
      });
      try { localStorage.setItem('mbb_admin_roles', JSON.stringify(currentRoles)); } catch (e) {}
      data = { success: true, message: 'Role updated successfully' };
    } else if (method === 'DELETE') {
      const idMatch = url.match(/\/roles\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      currentRoles = currentRoles.filter(r => (r._id !== targetId && r.id !== targetId) || r.cannotDelete);
      try { localStorage.setItem('mbb_admin_roles', JSON.stringify(currentRoles)); } catch (e) {}
      data = { success: true, message: 'Role deleted successfully' };
    }
  } else if (url.includes('/api/v1/reviews') || url.includes('/reviews')) {
    let currentReviews = [];
    try {
      const stored = localStorage.getItem('mbb_admin_customer_reviews');
      if (stored) {
        currentReviews = cleanLegacyMocks(JSON.parse(stored));
      }
    } catch (e) {}

    if (method === 'GET') {
      data = { success: true, count: currentReviews.length, data: currentReviews };
    } else if (method === 'DELETE') {
      const idMatch = url.match(/\/reviews\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;
      currentReviews = currentReviews.filter(r => r._id !== targetId && r.id !== targetId);
      try { localStorage.setItem('mbb_admin_customer_reviews', JSON.stringify(currentReviews)); } catch (e) {}
      data = { success: true, message: 'Review deleted successfully' };
    }
  } else if (url.includes('/api/v1/chat/admin/user') || url.includes('/chat/admin/user')) {
    let currentChats = [];
    try {
      const stored = localStorage.getItem('mbb_admin_chats');
      if (stored) currentChats = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = {
      success: true,
      data: currentChats
    };
  } else if (url.includes('/notification/get-all') || url.includes('/api/v1/notifications')) {
    let currentNotifs = [];
    try {
      const stored = localStorage.getItem('mbb_admin_campaigns') || localStorage.getItem('mbb_admin_notifications');
      if (stored) currentNotifs = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentNotifs, count: currentNotifs.length, total: currentNotifs.length };
  } else if (url.includes('/enquiries') || url.includes('/api/enquiries')) {
    data = { success: true, count: 0, total: 0, data: [], notifications: [] };
  } else if (url.includes('/audit-log/get-all')) {
    let currentAudit = [];
    try {
      const stored = localStorage.getItem('mbb_admin_audit_logs');
      if (stored) currentAudit = cleanLegacyMocks(JSON.parse(stored));
    } catch (e) {}
    data = { success: true, data: currentAudit, count: currentAudit.length };
  } else if (method !== 'GET') {
    data = { success: true, message: 'Operation processed successfully', data: options.body || {} }
  } else {
    data = { success: true, data: [] }
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getAuthToken = (explicitToken) => {
  const rawToken =
    explicitToken ||
    localStorage.getItem('token') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('af_admin_token') ||
    ''

  if (typeof rawToken === 'string') {
    let cleanToken = rawToken.replace(/^"|"$/g, '').trim()
    cleanToken = cleanToken.replace(/^Bearer\s+/i, '').trim()
    if (
      cleanToken === 'undefined' ||
      cleanToken === 'null' ||
      !cleanToken
    ) {
      return ''
    }
    return cleanToken
  }
  return ''
}

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem('admin_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const isAdminSessionValid = () => {
  const token = getAuthToken()
  if (!token) return false
  const user = getAdminUser()
  // If user object is cached, ensure role is admin
  if (user) {
    const role = String(
      user.role ||
      (Array.isArray(user.roles) ? user.roles[0] : '') ||
      user.userType ||
      ''
    ).toLowerCase().trim()
    const isAdmin =
      role === 'admin' ||
      (Array.isArray(user.roles) &&
        user.roles.map((r) => String(r).toLowerCase().trim()).includes('admin'))
    if (!isAdmin) return false
  }
  return true
}

export const isOfflineMode = () => {
  return localStorage.getItem('admin_offline_mode') === 'true'
}

export const clearAdminSession = () => {
  localStorage.removeItem('af_admin_token')
  localStorage.removeItem('token')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin_offline_mode')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('adminRole')
  localStorage.removeItem('adminAvatar')
  localStorage.removeItem('adminProfileImage')
  localStorage.removeItem('adminName')
  localStorage.removeItem('adminEmail')
  localStorage.removeItem('site_logo')
  localStorage.removeItem('af_reset_email')
  localStorage.removeItem('af_reset_token')
  window.dispatchEvent(new Event('admin-logout'))
}

export const getAuthHeaders = (explicitToken, isJson = true) => {
  const token = getAuthToken(explicitToken)
  const headers = {}
  if (isJson) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export const apiFetch = async (endpoint, options = {}, explicitToken) => {
  const token = getAuthToken(explicitToken)
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const headers = {
    ...(options.headers || {}),
  }

  // Auto-detect JSON vs FormData
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (!isFormData && !headers['Content-Type'] && !headers['content-type'] && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Dynamic Timeout: 120s for multipart FormData (image/file uploads), 2.5s for offline mode, 30s for standard REST
  const defaultTimeout = isFormData ? 120000 : (isOfflineMode() ? 2500 : 30000)
  const timeoutMs = options.timeout || defaultTimeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    })

    // Global 500+ / 502 Bad Gateway Failover (never mock /seller-forms)
    if (response.status >= 500 && isOfflineMode() && !url.includes('/seller-forms')) {
      const mockRes = getMockAdminResponse(url, options);
      if (mockRes) return mockRes;
    }

    // Global 401/403 Interceptor
    if (response.status === 401 || response.status === 403) {
      if (isOfflineMode() && !url.includes('/seller-forms')) {
        const mockRes = getMockAdminResponse(url, options)
        if (mockRes) return mockRes
      }
      if (url.includes('/auth/me') || url.includes('/profile') || url.includes('/verify-session')) {
        console.warn(`[ADMIN_API] Session expired or unauthorized request (HTTP ${response.status}). Clearing session.`)
        clearAdminSession()
      }
    }

    return response
  } catch (err) {
    clearTimeout(timeoutId)

    // Local fixtures are available only when the operator explicitly enables offline mode (never for /seller-forms).
    if (isOfflineMode() && !url.includes('/seller-forms')) {
      const mockRes = getMockAdminResponse(url, options)
      if (mockRes) return mockRes
    }
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s contacting ${url}`)
    }
    throw err
  }
}

/**
 * Convenience HTTP helpers returning parsed JSON or throwing formatted errors
 */
export const apiGet = async (endpoint, options = {}, explicitToken) => {
  const res = await apiFetch(endpoint, { ...options, method: 'GET' }, explicitToken)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `GET ${endpoint} failed (HTTP ${res.status})`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export const apiPost = async (endpoint, body, options = {}, explicitToken) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const res = await apiFetch(
    endpoint,
    {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    },
    explicitToken
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `POST ${endpoint} failed (HTTP ${res.status})`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export const apiPut = async (endpoint, body, options = {}, explicitToken) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const res = await apiFetch(
    endpoint,
    {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    },
    explicitToken
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `PUT ${endpoint} failed (HTTP ${res.status})`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export const apiPatch = async (endpoint, body, options = {}, explicitToken) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const res = await apiFetch(
    endpoint,
    {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    },
    explicitToken
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `PATCH ${endpoint} failed (HTTP ${res.status})`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export const apiDelete = async (endpoint, options = {}, explicitToken) => {
  const res = await apiFetch(endpoint, { ...options, method: 'DELETE' }, explicitToken)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `DELETE ${endpoint} failed (HTTP ${res.status})`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}
