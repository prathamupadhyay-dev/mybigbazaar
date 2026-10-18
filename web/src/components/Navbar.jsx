/**
 * @file apps/web/src/components/Navbar.jsx
 * @description Master navigation bar for MyBigBazaar Web with Universal Search,
 * Category routing, Cart & Watchlist badges, Notifications dropdown, and User Session.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import { API_BASE } from '../config.js';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    isAuthenticated,
    openAuth,
    logout,
    watchlist,
    cart,
    unreadCount
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('site_logo') || '/client-logo-transparent.png');

  const navRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNotifOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch real site logo if available
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/logo/get-all`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d?.logo?.logo) {
          const full = d.logo.logo.startsWith('http')
            ? d.logo.logo
            : `${API_BASE}${d.logo.logo.startsWith('/') ? '' : '/'}${d.logo.logo}`;
          setLogoUrl(full);
          localStorage.setItem('site_logo', full);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && searchCategory === 'All') {
      navigate('/marketplace');
      return;
    }
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (searchCategory !== 'All') params.set('category', searchCategory);
    navigate(`/search?${params.toString()}`);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header className="navbar-wrapper" ref={navRef}>
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="MyBigBazaar Home">
          <img
            src={logoUrl}
            alt="MyBigBazaar Logo"
            className="brand-logo-img"
            onError={(e) => { e.target.src = '/client-logo-transparent.png'; }}
          />
          <span className="brand-logo-text">BigBazaar</span>
        </Link>

        {/* Global Search Bar */}
        <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="nav-search-category"
            aria-label="Category filter"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Furniture">Furniture</option>
            <option value="Bikes">Bikes</option>
            <option value="Appliances">Appliances</option>
            <option value="AC Repair">AC Repair</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Home Cleaning">Home Cleaning</option>
          </select>
          <div className="nav-search-input-wrap">
            <input
              type="text"
              placeholder="Search products, services, or verified pros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
            <button type="submit" className="nav-search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </form>

        {/* Primary Desktop Links */}
        <nav className="nav-links" aria-label="Primary Navigation">
          <a
            href="/#app-features"
            className="nav-link"
          >
            App Features
          </a>
          <a
            href="/#how-it-works"
            className="nav-link"
          >
            How It Works
          </a>
          <Link
            to="/safety"
            className={`nav-link ${location.pathname.startsWith('/safety') ? 'active' : ''}`}
          >
            Trust &amp; Safety
          </Link>
          <Link to="/partner" className="nav-partner-link" title="Become a Verified Partner">
            Partner
          </Link>
        </nav>

        {/* Actions (Download App, Watchlist, Cart, Notifs, Profile) */}
        <div className="nav-actions">
          {/* Download App Button */}
          <a href="/#download" className="btn-post-ad" title="Download MyBigBazaar Mobile App">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download App</span>
          </a>

          {/* Watchlist */}
          <Link to="/favorites" className="nav-icon-btn" title="Saved Favorites" aria-label="Watchlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {watchlist.length > 0 && <span className="nav-badge">{watchlist.length}</span>}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn" title="Service Cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalCartCount > 0 && <span className="nav-badge nav-badge-orange">{totalCartCount}</span>}
          </Link>

          {/* Notifications */}
          <div className="nav-notif-wrap" style={{ position: 'relative' }}>
            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="nav-badge nav-badge-red">{unreadCount}</span>}
            </button>
            {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          {/* User Account / Profile */}
          {isAuthenticated ? (
            <div className="nav-user-dropdown-wrap" style={{ position: 'relative' }}>
              <button
                type="button"
                className="nav-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="nav-user-avatar"
                />
                <span className="nav-user-name">{currentUser.name.split(' ')[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="nav-user-menu" onClick={() => setUserDropdownOpen(false)}>
                  <div className="nav-user-menu-header">
                    <strong>{currentUser.name}</strong>
                    <span className="nav-user-email">{currentUser.email}</span>
                    <span className="nav-user-role-badge">{currentUser.role || 'Member'}</span>
                  </div>
                  <Link to="/account" className="nav-user-menu-item">
                    👤 My Account &amp; Profile
                  </Link>
                  <Link to="/account?tab=ads" className="nav-user-menu-item">
                    🏷️ My Posted Ads ({currentUser.totalListings || 0})
                  </Link>
                  <Link to="/orders" className="nav-user-menu-item">
                    📦 My Orders &amp; Bookings
                  </Link>
                  <Link to="/chat" className="nav-user-menu-item">
                    💬 Chats &amp; Offers
                  </Link>
                  <div className="nav-user-menu-divider" />
                  <button type="button" onClick={logout} className="nav-user-menu-item nav-user-logout">
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn-primary btn-nav-login"
              onClick={() => openAuth('login')}
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="container mobile-drawer-inner">
            <form className="mobile-search-form" onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }}>
              <input
                type="text"
                placeholder="Search products or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="btn-primary mobile-search-btn">Search</button>
            </form>

            <a href="/#download" className="mobile-link" style={{ color: 'var(--brand-orange)', fontWeight: '700' }} onClick={() => setMobileMenuOpen(false)}>
              📲 Download Mobile App
            </a>
            <a href="/#app-features" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              ✨ What The App Does (Features)
            </a>
            <a href="/#how-it-works" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              ⚡ How It Works (Buy, Sell &amp; Book)
            </a>
            <Link to="/safety" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              🛡️ Trust &amp; Safety Guidelines
            </Link>
            <Link to="/favorites" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              ❤️ Watchlist ({watchlist.length})
            </Link>
            <Link to="/cart" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              🛍️ Service Cart ({totalCartCount})
            </Link>
            <Link to="/chat" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              💬 Chats &amp; Offers
            </Link>
            <Link to="/orders" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              📋 My Orders &amp; Bookings
            </Link>
            <Link to="/account" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              👤 Profile &amp; Account
            </Link>
            <Link to="/partner" className="mobile-link mobile-partner-link" onClick={() => setMobileMenuOpen(false)}>
              💼 Partner With Us
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                className="mobile-logout-btn"
                onClick={() => { logout(); setMobileMenuOpen(false); }}
              >
                Sign Out ({currentUser.name})
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary mobile-btn-cta"
                onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0;
          z-index: 999;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          gap: 16px;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .brand-logo-img {
          height: 38px;
          width: 38px;
          object-fit: contain;
        }
        .brand-logo-text {
          font-size: 20px;
          font-weight: 800;
          color: var(--brand-blue);
          letter-spacing: -0.5px;
        }
        .nav-search-bar {
          display: flex;
          align-items: center;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          padding: 4px 6px 4px 14px;
          flex: 1;
          max-width: 480px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .nav-search-bar:focus-within {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px rgba(21, 72, 166, 0.12);
          background: #FBFBFA;
        }
        .nav-search-category {
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          padding-right: 8px;
          border-right: 1px solid #E7E5E4;
          outline: none;
          cursor: pointer;
        }
        .nav-search-input-wrap {
          display: flex;
          align-items: center;
          flex: 1;
          padding-left: 10px;
        }
        .nav-search-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
        }
        .nav-search-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--brand-blue);
          color: #FBFBFA;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .nav-search-btn:hover {
          background: var(--brand-blue-hover);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .nav-link {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .nav-link:hover, .nav-link.active {
          color: var(--brand-blue);
        }
        .nav-partner-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--brand-orange);
          background: var(--brand-orange-light);
          padding: 6px 12px;
          border-radius: 8px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-post-ad {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, var(--brand-orange), #F97316);
          color: #FBFBFA;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(233, 109, 15, 0.25);
          transition: transform 0.15s;
        }
        .btn-post-ad:hover {
          transform: translateY(-1px);
        }
        .nav-icon-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .nav-icon-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--brand-blue);
        }
        .nav-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: var(--brand-blue);
          color: #FBFBFA;
          font-size: 10px;
          font-weight: 800;
          border-radius: 8px;
          padding: 1px 5px;
          min-width: 16px;
          text-align: center;
        }
        .nav-badge-orange {
          background: var(--brand-orange);
        }
        .nav-badge-red {
          background: #EF4444;
        }
        .nav-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: 8px;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          cursor: pointer;
        }
        .nav-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }
        .nav-user-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .nav-user-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background: #FBFBFA;
          border-radius: 12px;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.16);
          border: 1px solid #E7E5E4;
          padding: 8px 0;
          z-index: 1000;
        }
        .nav-user-menu-header {
          padding: 10px 16px 12px;
          border-bottom: 1px solid #E7E5E4;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-user-email {
          font-size: 11px;
          color: var(--text-muted);
        }
        .nav-user-role-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
          align-self: flex-start;
        }
        .nav-user-menu-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          transition: background 0.15s;
        }
        .nav-user-menu-item:hover {
          background: #EEEDE9;
          color: var(--brand-blue);
        }
        .nav-user-menu-divider {
          height: 1px;
          background: #EEEDE9;
          margin: 6px 0;
        }
        .nav-user-logout {
          color: #DC2626 !important;
          background: none;
          border: none;
          cursor: pointer;
        }
        .btn-nav-login {
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
        }
        .mobile-search-form {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .mobile-search-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 14px;
        }
        .mobile-search-btn {
          padding: 10px 16px;
          border-radius: 8px;
        }
        .mobile-logout-btn {
          width: 100%;
          padding: 12px;
          background: #FEE2E2;
          color: #DC2626;
          border-radius: 10px;
          font-weight: 700;
          margin-top: 12px;
          cursor: pointer;
        }
        @media (max-width: 900px) {
          .nav-search-bar {
            display: none;
          }
          .nav-links {
            display: none;
          }
          .btn-post-ad span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
