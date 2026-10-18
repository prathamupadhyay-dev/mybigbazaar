// ============================================================
// MyBigBazaar Admin Panel — macOS Native Desktop Sidebar
// System Settings / Finder Dimension Model
// - Standard Width: 206px (Resizable: 180px - 260px)
// - Collapsed Rail Width: 60px
// - Titlebar / Window Header: 52px with Minimal Center-aligned Collapse/Open Toggle
// - Selection Pill: 30px height, 6px radius, full soft pill
// - Real-time macOS System Settings Instant Search Filter
// - Interactive Edge Drag Resizer with double-click snap
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Briefcase,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Settings2,
  ChevronRight,
  ChevronDown,
  LogOut,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Package,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Layers,
  FileText,
  Calendar,
  Percent,
  Wallet,
  TrendingUp,
  Image,
  Bell,
  LifeBuoy,
  Star,
  AlertTriangle,
  Flag,
  History,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { clearAdminSession, apiFetch } from '../utils/api';
import { getAssetUrl } from '../config';
import { getFilteredNavStructure } from '../config/sidebarNavigation';

// Contextual Discord-style icons for each tab item
const ITEM_ICONS = {
  dashboard: LayoutDashboard,
  orders_pending: Clock,
  orders_completed: CheckCircle2,
  orders_cancelled: XCircle,
  users: Users,
  users_verification: ShieldCheck,
  marketplace_categories: Tag,
  marketplace_seller_forms: FileText,
  marketplace_listings: ShoppingBag,
  commerce_bookings: Calendar,
  commerce_invoices: FileText,
  commerce_payments: CreditCard,
  commerce_refunds: RotateCcw,
  commerce_taxes: Percent,
  commerce_wallets: Wallet,
  reports_sales: TrendingUp,
  reports_daily: Calendar,
  reports_payments: CreditCard,
  advertisement_banners: Image,
  advertisement_campaigns: Megaphone,
  comm_notifications: Bell,
  comm_support: LifeBuoy,
  comm_reviews: Star,
  cms_gallery: Image,
  cms_policies: FileText,
  config_roles: ShieldCheck,
  config_settings: Settings2
};

export default function Sidebar({
  isOpen,
  onClose,
  onToggle,
  sidebarWidth = 206,
  onResizeWidth,
  isResizing,
  setIsResizing,
  userName,
  userEmail,
  profileImage,
  onLogout
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [logoUrl, setLogoUrl] = useState(() => {
    const cached = localStorage.getItem('site_logo');
    return cached ? getAssetUrl(cached) : '';
  });

  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.getAttribute('data-mode') === 'dark' ||
      localStorage.getItem('admin-dark-mode') === 'true'
    );
  });


  // Discord style: By default ALL categories are fully open (expanded).
  // Users can click on a category header to toggle that specific category.
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('mbb_admin_sidebar_collapsed_groups');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      try {
        localStorage.setItem('mbb_admin_sidebar_collapsed_groups', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const resolvedUserName = userName || localStorage.getItem('adminName') || 'Administrator';

  // Role permissions filtering
  const [allowedTabs, setAllowedTabs] = useState(() => {
    const role = localStorage.getItem('adminRole') || '';
    if (!role || role.toLowerCase() === 'admin') return ['*'];
    try {
      const cached = localStorage.getItem('adminRolePermissions');
      if (cached) return JSON.parse(cached);
    } catch {}
    return ['*'];
  });

  useEffect(() => {
    const handleRoleUpdate = () => {
      const role = localStorage.getItem('adminRole') || '';
      if (!role || role.toLowerCase() === 'admin') {
        setAllowedTabs(['*']);
        return;
      }
      try {
        const cached = localStorage.getItem('adminRolePermissions');
        if (cached) setAllowedTabs(JSON.parse(cached));
      } catch {
        setAllowedTabs(['*']);
      }
    };
    window.addEventListener('role-permissions-updated', handleRoleUpdate);
    window.addEventListener('storage', handleRoleUpdate);
    return () => {
      window.removeEventListener('role-permissions-updated', handleRoleUpdate);
      window.removeEventListener('storage', handleRoleUpdate);
    };
  }, []);

  const baseNavGroups = useMemo(() => getFilteredNavStructure(allowedTabs), [allowedTabs]);

  // Live telemetry counts for pending action badges
  const [liveBadges, setLiveBadges] = useState({ kyc: 0, pendingListings: 0 });

  useEffect(() => {
    let mounted = true;
    const fetchBadgeCounts = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const [kycRes, prdRes] = await Promise.allSettled([
          apiFetch('/api/v1/providers/kyc', {}, token),
          apiFetch('/product/get-all', {}, token)
        ]);

        let kycCount = 0;
        let prdCount = 0;
        if (kycRes.status === 'fulfilled' && kycRes.value.ok) {
          const d = await kycRes.value.json().catch(() => ({}));
          const list = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
          kycCount = list.filter((k) => String(k.status).toLowerCase() === 'pending').length;
        }
        if (prdRes.status === 'fulfilled' && prdRes.value.ok) {
          const d = await prdRes.value.json().catch(() => ({}));
          const list = Array.isArray(d.data) ? d.data : Array.isArray(d.products) ? d.products : [];
          prdCount = list.filter((p) => String(p.status).toLowerCase() === 'pending').length;
        }
        if (mounted) {
          setLiveBadges({ kyc: kycCount, pendingListings: prdCount });
        }
      } catch {}
    };

    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);


  const isRouteActive = (prefix) => {
    if (prefix === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(prefix);
  };

  return (
    <>
      <style>{`
        /* macOS Custom Overlay Scrollbar */
        .macos-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(140, 135, 130, 0.32) transparent;
        }
        .macos-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .macos-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .macos-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(140, 135, 130, 0.32);
          border-radius: 999px;
        }
        .macos-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(140, 135, 130, 0.55);
        }

        /* macOS Nav Item Hover & Active Transitions */
        .macos-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 30px;
          margin: 1px 6px;
          padding: 0 8px 0 10px;
          border-radius: 6px;
          font-size: 13px;
          text-decoration: none;
          transition: background-color 100ms ease, color 100ms ease;
          box-sizing: border-box;
          user-select: none;
        }
        .macos-nav-item:hover:not(.active) {
          background-color: var(--hover-bg, rgba(0, 0, 0, 0.04));
        }

        /* Discord Category Header Styling */
        .discord-category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 24px;
          padding: 0 8px;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          transition: background-color 100ms ease, color 100ms ease;
        }
        .discord-category-header:hover {
          background-color: var(--hover-bg, rgba(0, 0, 0, 0.04));
        }
        .discord-category-header:hover .discord-cat-label,
        .discord-category-header:hover .discord-cat-chevron,
        .discord-category-header:hover .discord-cat-icon {
          color: var(--color-text-primary, #1C1917) !important;
        }

        /* Mobile vs Desktop responsive icons */
        .sidebar-mobile-x-icon {
          display: none;
        }
        .sidebar-desktop-collapse-icon {
          display: block;
        }
        @media (max-width: 991px) {
          .sidebar-mobile-x-icon {
            display: block !important;
          }
          .sidebar-desktop-collapse-icon {
            display: none !important;
          }
        }
      `}</style>

      <aside
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          borderRight: '1px solid var(--color-border, #E7E5E4)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {/* ======================================================== */}
        {/* 1. macOS WINDOW TITLEBAR / TOP HEADER (52px Height)       */}
        {/* ======================================================== */}
        <div
          style={{
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            padding: isOpen ? '0 12px 0 16px' : '0',
            borderBottom: '1px solid var(--color-border, #E7E5E4)',
            flexShrink: 0,
            backgroundColor: 'var(--color-panel, #FBFBFA)'
          }}
        >
          {isOpen ? (
            <>
              {/* Brand Identity */}
              <Link
                to="/dashboard"
                aria-label="MyBigBazaar Admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  minWidth: 0,
                  padding: '4px 6px',
                  borderRadius: '7px',
                  transition: 'background-color 120ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.04))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <img
                  src={logoUrl || (isDark ? '/client-logo-white-transparent.png' : '/client-logo-transparent.png')}
                  alt="MyBigBazaar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/favicon.svg';
                  }}
                  style={{
                    height: '24px',
                    maxWidth: '28px',
                    objectFit: 'contain',
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary, #1C1917)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    MyBigBazaar
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--color-text-metadata, #78716C)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      lineHeight: 1
                    }}
                  >
                    Admin Console
                  </div>
                </div>
              </Link>

              {/* Right: Minimal Beautiful Collapse Button */}
              <button
                type="button"
                onClick={onToggle || onClose}
                title="Collapse Sidebar (⌘B)"
                aria-label="Collapse Sidebar"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '7px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-metadata, #6F6A65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.05))';
                  e.currentTarget.style.borderColor = 'var(--color-border-hover, #D6D3D1)';
                  e.currentTarget.style.color = 'var(--color-text-primary, #1C1917)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--color-border, #E7E5E4)';
                  e.currentTarget.style.color = 'var(--color-text-metadata, #6F6A65)';
                }}
              >
                <X size={15} strokeWidth={2.2} className="sidebar-mobile-x-icon" />
                <PanelLeftClose size={16} strokeWidth={1.9} className="sidebar-desktop-collapse-icon" />
              </button>
            </>
          ) : (
            /* COLLAPSED TITLEBAR: Center-aligned minimal Expand Button */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <button
                type="button"
                onClick={onToggle || onClose}
                title="Expand Sidebar (⌘B)"
                aria-label="Expand Sidebar"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-metadata, #6F6A65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.05))';
                  e.currentTarget.style.borderColor = 'var(--color-border-hover, #D6D3D1)';
                  e.currentTarget.style.color = 'var(--color-text-primary, #1C1917)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--color-border, #E7E5E4)';
                  e.currentTarget.style.color = 'var(--color-text-metadata, #6F6A65)';
                }}
              >
                <PanelLeftOpen size={16} strokeWidth={1.9} />
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. NAVIGATION HIERARCHY (macOS Sizing & Density)          */}
        {/* ======================================================== */}
        <div
          className="macos-sidebar-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isOpen ? '4px 0 16px 0' : '6px 0 20px 0',
            boxSizing: 'border-box'
          }}
        >
          {isOpen ? (
            /* EXPANDED MODE */
            <>
              {baseNavGroups.map((group, groupIndex) => {
                const groupBadgeCount = group.id === 'people' && liveBadges.kyc > 0 ? liveBadges.kyc : null;

                  return (
                    <div key={group.id} style={{ marginBottom: '4px' }}>
                      {/* Minimal Category Header */}
                      <div
                        className="discord-category-header"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          height: '20px',
                          margin: groupIndex === 0 ? '6px 8px 2px 8px' : '12px 8px 2px 8px',
                          padding: '0 4px',
                          userSelect: 'none'
                        }}
                      >
                        <span
                          className="discord-cat-label"
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-metadata, #8C8782)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {group.label}
                        </span>

                        {groupBadgeCount && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '0 5px',
                              height: '15px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(217, 119, 6, 0.15)',
                              color: '#D97706',
                              fontFamily: 'var(--font-mono, monospace)'
                            }}
                          >
                            {groupBadgeCount}
                          </span>
                        )}
                      </div>

                      {/* Collection of tabs rendered directly under the category header */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          {group.items.map((item) => {
                            const ItemIcon = ITEM_ICONS[item.id] || group.icon;
                            const badge =
                              item.badgeKey === 'kyc' && liveBadges.kyc > 0
                                ? { label: liveBadges.kyc, color: '#D97706' }
                                : null;

                            return (
                              <NavLink
                                key={item.id}
                                to={item.to}
                                end={item.end !== false}
                                onClick={() => {
                                  if (typeof window !== 'undefined' && window.innerWidth <= 991 && onClose) {
                                    onClose();
                                  }
                                }}
                                className="macos-nav-item"
                                style={({ isActive }) => ({
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  height: '30px',
                                  margin: '1px 6px',
                                  padding: '0 8px 0 10px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  textDecoration: 'none',
                                  fontWeight: isActive ? 600 : 450,
                                  color: isActive
                                    ? 'var(--color-text-primary, #1C1917)'
                                    : 'var(--color-text-secondary, #57534E)',
                                  backgroundColor: isActive
                                    ? isDark
                                      ? 'rgba(255, 255, 255, 0.12)'
                                      : 'var(--color-sunken, #EEEDE9)'
                                    : 'transparent',
                                  transition: 'background-color 100ms ease, color 100ms ease'
                                })}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                  <ItemIcon
                                    size={14}
                                    strokeWidth={2}
                                    style={{
                                      flexShrink: 0,
                                      opacity: 0.85
                                    }}
                                  />
                                  <span
                                    style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.label}
                                  </span>
                                </div>

                                {badge && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      height: '17px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      padding: '0 6px',
                                      borderRadius: '999px',
                                      backgroundColor: badge.color ? `${badge.color}20` : 'var(--color-sunken, #EEEDE9)',
                                      color: badge.color || 'var(--color-text-secondary, #57534E)',
                                      fontFamily: 'var(--font-mono, monospace)'
                                    }}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
            </>
          ) : (
            /* COLLAPSED RAIL MODE: All tabs with icons & vertically scrollable */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                alignItems: 'center',
                width: '100%',
                padding: '2px 0 20px 0'
              }}
            >
              {baseNavGroups.map((group, groupIndex) => (
                <React.Fragment key={group.id}>
                  {/* Subtle Category Divider between groups */}
                  {groupIndex > 0 && (
                    <div
                      style={{
                        width: '24px',
                        height: '1px',
                        backgroundColor: 'var(--color-border, #E7E5E4)',
                        margin: '5px 0',
                        opacity: 0.7
                      }}
                    />
                  )}

                  {/* Render every tab in this category with its specific icon */}
                  {group.items.map((item) => {
                    const ItemIcon = ITEM_ICONS[item.id] || group.icon;
                    const hasBadge = item.badgeKey === 'kyc' && liveBadges.kyc > 0;

                    return (
                      <NavLink
                        key={item.id}
                        to={item.to}
                        end={item.end !== false}
                        title={item.label}
                        aria-label={item.label}
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.innerWidth <= 991 && onClose) {
                            onClose();
                          }
                        }}
                        style={({ isActive }) => ({
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '7px',
                          textDecoration: 'none',
                          position: 'relative',
                          backgroundColor: isActive
                            ? isDark
                              ? 'rgba(255, 255, 255, 0.14)'
                              : 'var(--color-sunken, #EEEDE9)'
                            : 'transparent',
                          color: isActive
                            ? 'var(--color-text-primary, #1C1917)'
                            : 'var(--color-text-secondary, #57534E)',
                          transition: 'background-color 100ms ease, color 100ms ease'
                        })}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.classList.contains('active')) {
                            e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.05))';
                            e.currentTarget.style.color = 'var(--color-text-primary, #1C1917)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.currentTarget.classList.contains('active')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary, #57534E)';
                          }
                        }}
                      >
                        {({ isActive }) => (
                          <>
                            <ItemIcon
                              size={15}
                              strokeWidth={isActive ? 2.3 : 1.9}
                              style={{
                                opacity: isActive ? 1 : 0.85
                              }}
                            />
                            {hasBadge && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#D97706'
                                }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. macOS USER PROFILE FOOTER (52px Height)               */}
        {/* ======================================================== */}
        <div
          style={{
            height: '52px',
            padding: isOpen ? '0 10px 0 12px' : '0 8px',
            borderTop: '1px solid var(--color-border, #E7E5E4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            flexShrink: 0,
            backgroundColor: 'var(--color-panel, #FBFBFA)'
          }}
        >
          {isOpen ? (
            <>
              {/* Apple ID style user identity tile */}
              <Link
                to="/dashboard/profile"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth <= 991 && onClose) {
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  minWidth: 0,
                  textDecoration: 'none',
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  transition: 'background-color 100ms ease'
                }}
                title="Account Settings (Profile)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.04))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-navy, #0B2545)',
                    color: '#FBFBFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {(resolvedUserName || 'A').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary, #1C1917)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {resolvedUserName}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--color-text-metadata, #78716C)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Administrator
                  </div>
                </div>
              </Link>

              {/* Quick Sign Out Action Button */}
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  else {
                    clearAdminSession();
                    navigate('/login');
                  }
                }}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-metadata, #78716C)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 120ms ease, background-color 120ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#BE123C';
                  e.currentTarget.style.backgroundColor = '#FFF1F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-metadata, #78716C)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Link
                to="/dashboard/profile"
                title={`${resolvedUserName} (Profile)`}
                aria-label="Profile"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-navy, #0B2545)',
                  color: '#FBFBFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                {(resolvedUserName || 'A').charAt(0).toUpperCase()}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
