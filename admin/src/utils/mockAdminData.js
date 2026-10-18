/**
 * @file apps/admin/src/utils/mockAdminData.js
 * @description Clean baseline data structures for MyBigBazaar Admin Panel.
 * Ensures zero fake static records appear when database is offline or empty.
 * All collections default to empty arrays so data is strictly dynamic.
 */

export const MOCK_ADMIN_USERS = [];

export const MOCK_ADMIN_PRODUCT_CATEGORIES = [];

export const MOCK_ADMIN_PRODUCT_SUBCATEGORIES = [];

export const MOCK_ADMIN_SERVICE_CATEGORIES = [];

export const MOCK_ADMIN_PRODUCTS = [];

export const MOCK_ADMIN_BOOKINGS = [];

export const MOCK_ADMIN_TAXES = [];

export const MOCK_ADMIN_KYC = [];

export const MOCK_ADMIN_MODERATION = [];

export const MOCK_ADMIN_REPORTS = [];

export const MOCK_ADMIN_PROVIDERS = [];

export const MOCK_ADMIN_SERVICES = [];

export const MOCK_ADMIN_TRANSACTIONS = [];

export const MOCK_ADMIN_REFUNDS = [];

export const MOCK_ADMIN_BANNERS = [];

export const MOCK_ADMIN_NOTIFICATIONS = [];

export const MOCK_ADMIN_AUDIT_LOGS = [];

export const MOCK_ADMIN_AD_CAMPAIGNS = [];

export const MOCK_ADMIN_ORDERS = [];

export const MOCK_ADMIN_ANALYTICS_REPORTS = {
  sales: {
    kpis: {
      grossSales: 0,
      netSales: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      commissionEarned: 0,
      marginPercent: 0
    },
    categories: [],
    topProducts: [],
    dailyBreakdown: []
  },
  daily: {
    today: {
      date: new Date().toISOString().split('T')[0],
      dayOrders: 0,
      dayRevenue: 0,
      daySignups: 0,
      dayListings: 0,
      conversionRate: '0%',
      pendingShipments: 0,
      completedToday: 0
    },
    hourlyDistribution: [],
    history: []
  },
  customers: {
    kpis: {
      totalCustomers: 0,
      activeBuyers: 0,
      eliteMembers: 0,
      repeatPurchaseRate: '0%',
      avgLtv: 0,
      newThisMonth: 0
    },
    tierBreakdown: [],
    topCustomers: [],
    cityDistribution: []
  },
  payments: {
    kpis: {
      totalProcessedVolume: 0,
      successRate: '100%',
      escrowBalance: 0,
      refundsProcessed: 0,
      gatewayFeeTotal: 0,
      disputeRate: '0%'
    },
    rails: [],
    transactions: []
  }
};
