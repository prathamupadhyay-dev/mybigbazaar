/**
 * @file apps/admin/src/config/sidebarNavigation.js
 * @description Centralized Single Source of Truth for Sidebar Navigation and Role Permissions.
 * Any addition or update here automatically reflects in both Sidebar navigation and Roles & Permissions editor.
 */

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Megaphone,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  Settings2,
  Package,
  BarChart3
} from 'lucide-react';

export const SIDEBAR_NAV_STRUCTURE = [
  {
    id: 'overview',
    label: 'Main',
    icon: LayoutDashboard,
    railPath: '/dashboard',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/dashboard', end: true }
    ]
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: Package,
    railPath: '/dashboard/orders/pending',
    items: [
      { id: 'orders_pending', label: 'Pending Orders', to: '/dashboard/orders/pending', end: true },
      { id: 'orders_completed', label: 'Completed Orders', to: '/dashboard/orders/completed', end: true },
      { id: 'orders_cancelled', label: 'Cancelled Orders', to: '/dashboard/orders/cancelled', end: true }
    ]
  },
  {
    id: 'people',
    label: 'Users',
    icon: Users,
    railPath: '/dashboard/users',
    items: [
      { id: 'users', label: 'Users', to: '/dashboard/users', end: true },
      { id: 'users_verification', label: 'Verification', to: '/dashboard/users/verification', end: true, badgeKey: 'kyc' }
    ]
  },
  {
    id: 'marketplace',
    label: 'Market',
    icon: ShoppingBag,
    railPath: '/dashboard/marketplace/categories',
    items: [
      { id: 'marketplace_categories', label: 'Categories', to: '/dashboard/marketplace/categories', end: true },
      { id: 'marketplace_seller_forms', label: 'Seller Form', to: '/dashboard/marketplace/seller-forms', end: true },
      { id: 'marketplace_listings', label: 'Listings', to: '/dashboard/marketplace/listings', end: true }
    ]
  },
  {
    id: 'commerce',
    label: 'Finance',
    icon: CreditCard,
    railPath: '/dashboard/bookings',
    items: [
      { id: 'commerce_bookings', label: 'Bookings', to: '/dashboard/bookings', end: true },
      { id: 'commerce_invoices', label: 'Invoices', to: '/dashboard/payments/invoices', end: true },
      { id: 'commerce_payments', label: 'Payments', to: '/dashboard/payments/transactions', end: true },
      { id: 'commerce_refunds', label: 'Refunds', to: '/dashboard/payments/refunds', end: true },
      { id: 'commerce_taxes', label: 'Taxes', to: '/dashboard/payments/taxes', end: true },
      { id: 'commerce_wallets', label: 'Wallets', to: '/dashboard/payments/wallets', end: true }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    railPath: '/dashboard/reports/sales',
    items: [
      { id: 'reports_sales', label: 'Sales Report', to: '/dashboard/reports/sales', end: true },
      { id: 'reports_daily', label: 'Daily Report', to: '/dashboard/reports/daily', end: true },
      { id: 'reports_payments', label: 'Payment Report', to: '/dashboard/reports/payments', end: true }
    ]
  },
  {
    id: 'advertisement',
    label: 'Ads',
    icon: Megaphone,
    railPath: '/dashboard/advertisement/campaigns',
    items: [
      { id: 'advertisement_banners', label: 'Banners', to: '/dashboard/cms/banners', end: true },
      { id: 'advertisement_campaigns', label: 'Ad Campaign', to: '/dashboard/advertisement/campaigns', end: true }
    ]
  },
  {
    id: 'communication',
    label: 'Inbox',
    icon: MessageSquare,
    railPath: '/dashboard/notifications',
    items: [
      { id: 'comm_notifications', label: 'Notifications', to: '/dashboard/notifications', end: true },
      { id: 'comm_support', label: 'Support', to: '/dashboard/support/tickets', end: true },
      { id: 'comm_reviews', label: 'Customer Reviews', to: '/dashboard/communication/reviews', end: true }
    ]
  },
  {
    id: 'content',
    label: 'CMS',
    icon: Smartphone,
    railPath: '/dashboard/cms/gallery',
    items: [
      { id: 'cms_gallery', label: 'Media', to: '/dashboard/cms/gallery', end: true },
      { id: 'cms_policies', label: 'Pages', to: '/dashboard/cms/policies', end: true }
    ]
  },
  {
    id: 'setting',
    label: 'Settings',
    icon: Settings2,
    railPath: '/dashboard/settings',
    items: [
      { id: 'config_roles', label: 'Roles & Permissions', to: '/dashboard/settings/roles', end: true },
      { id: 'config_settings', label: 'Settings', to: '/dashboard/settings', end: true }
    ]
  }
];

/**
 * Returns a flat list of all selectable tabs across all navigation groups.
 */
export function getAllTabs() {
  const tabs = [];
  SIDEBAR_NAV_STRUCTURE.forEach(group => {
    group.items.forEach(item => {
      tabs.push({
        groupId: group.id,
        groupLabel: group.label,
        ...item
      });
    });
  });
  return tabs;
}

/**
 * Checks whether a given role or permission set has access to a specific tab item.
 */
export function canAccessTab(allowedTabs, tabItem) {
  if (!allowedTabs) return true; // Default fallback open for admin
  if (Array.isArray(allowedTabs)) {
    if (allowedTabs.includes('*') || allowedTabs.includes('all')) return true;
    return (
      allowedTabs.includes(tabItem.id) ||
      allowedTabs.includes(tabItem.to) ||
      (tabItem.id === 'advertisement_banners' && (allowedTabs.includes('cms_banners') || allowedTabs.includes('/dashboard/cms/banners'))) ||
      (tabItem.id === 'cms_banners' && (allowedTabs.includes('advertisement_banners') || allowedTabs.includes('/dashboard/cms/banners')))
    );
  }
  if (typeof allowedTabs === 'string') {
    return (
      allowedTabs === '*' ||
      allowedTabs === tabItem.id ||
      allowedTabs === tabItem.to ||
      (tabItem.id === 'advertisement_banners' && (allowedTabs === 'cms_banners' || allowedTabs === '/dashboard/cms/banners')) ||
      (tabItem.id === 'cms_banners' && (allowedTabs === 'advertisement_banners' || allowedTabs === '/dashboard/cms/banners'))
    );
  }
  return false;
}

/**
 * Filters the sidebar navigation structure according to the given allowedTabs list.
 * Groups with zero allowed tabs are hidden.
 */
export function getFilteredNavStructure(allowedTabs) {
  // If full access (Admin or wildcard)
  if (!allowedTabs || allowedTabs.includes('*') || allowedTabs.includes('all')) {
    return SIDEBAR_NAV_STRUCTURE;
  }

  return SIDEBAR_NAV_STRUCTURE.map(group => {
    const visibleItems = group.items.filter(item => canAccessTab(allowedTabs, item));
    return {
      ...group,
      items: visibleItems
    };
  }).filter(group => group.items.length > 0);
}
