import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  CircleHelp,
  Bell,
  CircleUserRound
} from 'lucide-react';
import { API_BASE, getAssetUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../config';
import { apiFetch } from '../utils/api';
import CommandSearchModal from './common/CommandSearchModal';
import NotificationPopover from './ui/NotificationPopover';
import ProfilePopover from './ui/ProfilePopover';
import CreatePopover from './ui/CreatePopover';
import HelpModal from './ui/HelpModal';

/**
 * Header - macOS Desktop Top Toolbar (56px)
 * Left: PanelLeft sidebar toggle + Context Breadcrumb
 * Center: Understated [⌘K] Command search trigger
 * Right (Strict Sequence): [+] Create -> SunMoon Theme -> CircleHelp Help -> Bell Notifs -> CircleUserRound Profile
 */
export default function Header({ onMenuToggle, profileImage, token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [avatar, setAvatar] = useState(() => {
    const cached = localStorage.getItem('adminAvatar') || localStorage.getItem('site_logo') || profileImage;
    return cached ? getAssetUrl(cached) : '';
  });

  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Popover / Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCommandSearch, setShowCommandSearch] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('admin-theme') || 'mybigbazaar');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    if (saved !== null) return saved === 'true';
    return false;
  });



  // Dynamic brand logo updates
  useEffect(() => {
    const handleLogoUpdate = () => {
      const updated = localStorage.getItem('site_logo');
      if (updated) setAvatar(getAssetUrl(updated));
    };
    window.addEventListener('logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('logo-updated', handleLogoUpdate);
  }, []);

  // Sync theme & dark mode to DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin-theme', theme);
    localStorage.setItem('admin-dark-mode', String(isDark));
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark } }));
  }, [theme, isDark]);

  // Global Keyboard Shortcuts (⌘K for command palette, ⌘B for sidebar, G-sequences, N for create)
  useEffect(() => {
    let lastKey = null;
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

      // Escape -> Close all popovers and modals
      if (e.key === 'Escape') {
        setShowCreate(false);
        setShowNotif(false);
        setShowProfile(false);
        setShowHelp(false);
        setShowCommandSearch(false);
        return;
      }

      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandSearch(prev => !prev);
        return;
      }

      // ⌘B or Ctrl+B -> Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (onMenuToggle) onMenuToggle();
        return;
      }

      // Shortcuts below this line only activate when NOT focused in text inputs
      if (isInputActive || e.metaKey || e.ctrlKey || e.altKey) return;

      // / -> Focus command palette search
      if (e.key === '/') {
        e.preventDefault();
        setShowCommandSearch(true);
        return;
      }

      // N -> Quick Create Popover
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowCreate(prev => !prev);
        return;
      }

      // G then key sequence (e.g. G then D, G then U, G then L, G then S)
      const now = Date.now();
      const lowerKey = e.key.toLowerCase();
      if (lowerKey === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
        return;
      }

      if (lastKey === 'g' && (now - lastKeyTime) < 1200) {
        lastKey = null;
        if (lowerKey === 'd') {
          e.preventDefault();
          navigate('/dashboard');
        } else if (lowerKey === 'u') {
          e.preventDefault();
          navigate('/dashboard/users');
        } else if (lowerKey === 'l') {
          e.preventDefault();
          navigate('/dashboard/listings');
        } else if (lowerKey === 's') {
          e.preventDefault();
          navigate('/dashboard/settings');
        } else if (lowerKey === 'b') {
          e.preventDefault();
          navigate('/dashboard/bookings');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onMenuToggle, navigate]);

  const toggleTheme = (darkState) => {
    setIsDark(darkState);
    if (token) {
      fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dark_mode: darkState ? 1 : 0 })
      }).catch(() => {});
    }
  };

  // Context breadcrumb calculation
  const getBreadcrumb = (path) => {
    if (path === '/dashboard' || path === '/dashboard/') {
      return { section: 'Overview', page: 'Dashboard' };
    }
    if (path.includes('/users/suspended')) return { section: 'Users', page: 'Suspended Accounts' };
    if (path.includes('/users/verification')) return { section: 'Users', page: 'Verification' };
    if (path.includes('/users')) return { section: 'Users', page: 'Users' };
    if (path.includes('/listings/pending')) return { section: 'Products', page: 'Pending Moderation' };
    if (path.includes('/listings/categories')) return { section: 'Products', page: 'Product Categories' };
    if (path.includes('/listings')) return { section: 'Products', page: 'Products' };
    if (path.includes('/promotions')) return { section: 'Commerce', page: 'Coupons' };
    if (path.includes('/services/categories')) return { section: 'Services', page: 'Service Categories' };
    if (path.includes('/services/packages')) return { section: 'Services', page: 'Packages' };
    if (path.includes('/services')) return { section: 'Services', page: 'Services' };
    if (path.includes('/providers/kyc')) return { section: 'Services', page: 'Provider KYC' };
    if (path.includes('/providers')) return { section: 'Services', page: 'Service Providers' };
    if (path.includes('/bookings') || path.includes('/deals')) return { section: 'Commerce', page: 'Bookings' };
    if (path.includes('/payments/invoices')) return { section: 'Commerce', page: 'Invoices' };
    if (path.includes('/payments/taxes') || path.includes('/taxes')) return { section: 'Commerce', page: 'Taxes' };
    if (path.includes('/payments/transactions')) return { section: 'Commerce', page: 'Payments' };
    if (path.includes('/payments/refunds')) return { section: 'Commerce', page: 'Refunds' };
    if (path.includes('/notifications')) return { section: 'Communication', page: 'Notifications' };
    if (path.includes('/support')) return { section: 'Communication', page: 'Support' };
    if (path.includes('/reviews')) return { section: 'Communication', page: 'Customer Reviews' };
    if (path.includes('/cms/banners')) return { section: 'CMS', page: 'Banners' };
    if (path.includes('/cms/gallery')) return { section: 'CMS', page: 'Media' };
    if (path.includes('/cms/policies') || path.includes('/cms/pages') || path.includes('/cms/legal')) return { section: 'CMS', page: 'Pages' };
    if (path.includes('/settings/roles')) return { section: 'Settings', page: 'Roles & Permissions' };
    if (path.includes('/settings')) return { section: 'Settings', page: 'Platform Settings' };
    if (path.includes('/profile')) return { section: 'Account', page: 'Profile' };
    return { section: 'Overview', page: 'Dashboard' };
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  // User details
  let userEmail = localStorage.getItem('adminEmail') || 'admin@mybigbazaar.com';
  let userName = localStorage.getItem('adminName') || 'Administrator';
  let userRole = 'Super Administrator';
  try {
    const rawUser = localStorage.getItem('admin_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.name || u.fullName) userName = u.name || u.fullName;
      if (u.email) userEmail = u.email;
      if (u.role) userRole = u.role;
    }
  } catch {}

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/enquiries/notifications');
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotifCount(data.total ?? data.count ?? (Array.isArray(data) ? data.length : (Array.isArray(data.data) ? data.data.length : 0)));
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [token]);

  const handleOpenNotifs = async () => {
    setShowCreate(false);
    setShowProfile(false);
    setShowHelp(false);

    if (!showNotif) {
      setLoadingNotifs(true);
      try {
        const res = await apiFetch('/api/enquiries?status=pending');
        if (res && res.ok) {
          const data = await res.json().catch(() => ([]));
          const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
          setNotifications(list.slice(0, 6));
        }
      } catch {}
      finally {
        setLoadingNotifs(false);
      }
    }
    setShowNotif(prev => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/enquiries/mark-read', {
        method: 'PUT'
      });
      setNotifCount(0);
      setShowNotif(false);
    } catch {}
  };

  return (
    <header
      className="desktop-app-header"
      style={{
        height: '56px',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderBottom: '1px solid var(--color-border, #E7E5E4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        userSelect: 'none'
      }}
    >
      <style>{`
        .header-mobile-hamburger-btn {
          display: none;
        }
        @media (max-width: 991px) {
          .header-mobile-hamburger-btn {
            display: inline-flex !important;
          }
          .header-telemetry-badge {
            display: none !important;
          }
          .header-breadcrumb-section {
            display: none !important;
          }
        }
      `}</style>
      {/* LEFT: macOS Context Breadcrumb + Offline Mode Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="header-mobile-hamburger-btn"
          aria-label="Open Navigation Sidebar"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            border: '1px solid var(--color-border, #E7E5E4)',
            backgroundColor: 'var(--color-card, #FFFFFF)',
            color: 'var(--color-text-primary, #1C1917)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>MyBigBazaar</span>
          <span className="header-breadcrumb-section" style={{ color: 'var(--text-muted)', fontSize: '0.70rem' }}>/</span>
          <span className="header-breadcrumb-section" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{breadcrumb.section}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.70rem' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {breadcrumb.page}
          </span>
        </div>
      </div>

      {/* CENTER: Understated Global [⌘K] Command Search Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, maxWidth: '420px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => setShowCommandSearch(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-sunken, #EEEDE9)',
            border: '1px solid var(--color-border, #E7E5E4)',
            color: 'var(--color-text-secondary, #57534E)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'border-color 140ms ease, background-color 140ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-navy, #0B2545)';
            e.currentTarget.style.backgroundColor = 'var(--color-panel, #FBFBFA)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border, #E7E5E4)';
            e.currentTarget.style.backgroundColor = 'var(--color-sunken, #EEEDE9)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} strokeWidth={2.2} color="var(--color-text-metadata, #6F6A65)" />
            <span style={{ color: 'var(--color-text-metadata, #6F6A65)' }}>Search commands & pages...</span>
          </div>
          <kbd
            style={{
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              border: '1px solid var(--color-border, #E7E5E4)',
              fontSize: '0.66rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary, #57534E)',
              fontFamily: 'var(--font-mono, monospace)'
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* RIGHT: Quick Actions Toolbar in Exact Prescribed Sequence */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

        {/* 1. [+] Create Popover */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowCreate(prev => !prev);
              setShowNotif(false);
              setShowProfile(false);
              setShowHelp(false);
            }}
            title="Create New (Product, Category, Service)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              border: '1px solid var(--border-color)',
              backgroundColor: showCreate ? 'var(--active-bg)' : 'transparent',
              color: showCreate ? 'var(--accent-color)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 120ms ease, color 120ms ease'
            }}
            onMouseEnter={(e) => {
              if (!showCreate) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              if (!showCreate) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Plus size={16} strokeWidth={2.2} />
          </button>

          <CreatePopover
            isOpen={showCreate}
            onClose={() => setShowCreate(false)}
          />
        </div>

        {/* 2. Sun/Moon Theme Switch */}
        <button
          type="button"
          onClick={() => toggleTheme(!isDark)}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            border: '1px solid var(--border-color)',
            backgroundColor: isDark ? 'var(--active-bg)' : 'transparent',
            color: isDark ? '#F59E0B' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 140ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'var(--active-bg)' : 'transparent')}
        >
          {isDark ? (
            <Sun size={16} strokeWidth={2.2} style={{ color: '#F59E0B' }} />
          ) : (
            <Moon size={16} strokeWidth={2.2} style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>

        {/* 3. CircleHelp Help & Shortcuts */}
        <button
          type="button"
          onClick={() => {
            setShowHelp(true);
            setShowCreate(false);
            setShowNotif(false);
            setShowProfile(false);
          }}
          title="Help & Shortcuts"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            border: '1px solid var(--border-color)',
            backgroundColor: showHelp ? 'var(--active-bg)' : 'transparent',
            color: showHelp ? 'var(--accent-color)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 120ms ease, color 120ms ease'
          }}
          onMouseEnter={(e) => {
            if (!showHelp) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            if (!showHelp) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <CircleHelp size={16} strokeWidth={2} />
        </button>

        {/* 4. Bell Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={handleOpenNotifs}
            title="Notifications"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              border: '1px solid var(--border-color)',
              backgroundColor: showNotif ? 'var(--active-bg)' : 'transparent',
              color: showNotif ? 'var(--accent-color)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 120ms ease'
            }}
            onMouseEnter={(e) => {
              if (!showNotif) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              if (!showNotif) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell size={16} strokeWidth={2} />
            {notifCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '999px',
                  backgroundColor: '#BE123C',
                  color: '#FBFBFA',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 0 2px #FBFBFA'
                }}
              >
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          <NotificationPopover
            isOpen={showNotif}
            onClose={() => setShowNotif(false)}
            notifications={notifications}
            notifCount={notifCount}
            loading={loadingNotifs}
            onMarkAllRead={handleMarkAllRead}
            onViewAll={() => {
              setShowNotif(false);
              navigate('/dashboard/notifications');
            }}
          />
        </div>

        {/* 5. CircleUserRound Profile / Account */}
        <div style={{ position: 'relative', marginLeft: '4px' }}>
          <button
            type="button"
            onClick={() => {
              setShowProfile(prev => !prev);
              setShowCreate(false);
              setShowNotif(false);
              setShowHelp(false);
            }}
            title="Administrator Account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '2px 8px 2px 3px',
              borderRadius: '18px',
              border: '1px solid #E7E5E4',
              backgroundColor: showProfile ? '#EEEDE9' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 120ms ease'
            }}
            onMouseEnter={(e) => {
              if (!showProfile) e.currentTarget.style.backgroundColor = '#EEEDE9';
            }}
            onMouseLeave={(e) => {
              if (!showProfile) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#0B2545',
                color: '#FBFBFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.74rem'
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Admin"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setAvatar('')}
                />
              ) : (
                <CircleUserRound size={18} color="#FBFBFA" />
              )}
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                maxWidth: '90px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {userName}
            </span>
          </button>

          <ProfilePopover
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            avatarUrl={avatar}
            onLogout={onLogout}
          />
        </div>
      </div>

      {/* Global Command Search Palette */}
      <CommandSearchModal
        isOpen={showCommandSearch}
        onClose={() => setShowCommandSearch(false)}
      />

      {/* Help & Shortcuts Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </header>
  );
}