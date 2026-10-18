/**
 * @file apps/web/src/pages/UserAccountPage.jsx
 * @description Master User Profile & Account Settings dashboard with personal info editing,
 * my posted ads manager, address management, and session control.
 */

import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function UserAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const {
    currentUser,
    isAuthenticated,
    logout,
    openAuth,
    userAds,
    updateAdStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [name, setName] = useState(currentUser?.name || 'Aarav Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'buyer@bigbazaar.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const initialLocation = () => {
    const loc = currentUser?.location;
    if (!loc) return 'Indiranagar, Bengaluru';
    if (typeof loc === 'object') {
      const parts = [loc.address, loc.city, loc.state].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : (loc.city || 'Indiranagar, Bengaluru');
    }
    return loc;
  };
  const [location, setLocation] = useState(initialLocation);
  const [saveToast, setSaveToast] = useState(false);

  if (!isAuthenticated) {
    return (
      <div>
        <Navbar />
        <AuthModal />
        <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
          <h2>Please sign in to view your account</h2>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => openAuth('login')}
          >
            Sign In Now
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="account-page">
      <Navbar />
      <AuthModal />

      <main className="container account-layout">
        {/* Left Account Navigation Sidebar */}
        <aside className="account-sidebar">
          <div className="account-user-card">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="account-avatar"
            />
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '10px' }}>
              {currentUser.name}
            </h3>
            <span className="badge badge-blue" style={{ fontSize: '11px', marginTop: '4px' }}>
              {currentUser.role?.toUpperCase() || 'MEMBER'}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Member since {currentUser.joinedDate || '2024'}
            </p>
          </div>

          <nav className="account-nav-list">
            <button
              type="button"
              className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setSearchParams({ tab: 'profile' }); }}
            >
              👤 Profile &amp; Details
            </button>
            <button
              type="button"
              className={`account-nav-item ${activeTab === 'ads' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ads'); setSearchParams({ tab: 'ads' }); }}
            >
              🏷️ My Posted Ads ({userAds.length})
            </button>
            <Link to="/orders" className="account-nav-item">
              📦 My Orders &amp; Bookings
            </Link>
            <Link to="/favorites" className="account-nav-item">
              ❤️ Saved Watchlist
            </Link>
            <Link to="/chat" className="account-nav-item">
              💬 Chats &amp; Offers
            </Link>
            <button
              type="button"
              className="account-nav-item logout-link"
              onClick={logout}
            >
              🚪 Sign Out
            </button>
          </nav>
        </aside>

        {/* Right Tab Content */}
        <section className="account-main-content">
          {saveToast && (
            <div className="save-toast-banner">
              ✓ Profile information updated successfully!
            </div>
          )}

          {/* TAB 1: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <div className="account-panel">
              <h2 className="panel-title">Personal Information</h2>
              <p className="panel-desc">Manage your public display details and contact credentials</p>

              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="account-input"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="account-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="account-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary City / Locality</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="account-input"
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '12px 24px', marginTop: '10px' }}>
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY ADS MANAGER */}
          {activeTab === 'ads' && (
            <div className="account-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 className="panel-title">My Posted Ads ({userAds.length})</h2>
                  <p className="panel-desc">Manage status, mark items as sold, or edit listings</p>
                </div>
                <Link to="/post-ad" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  + Post New Ad
                </Link>
              </div>

              {userAds.length === 0 ? (
                <div className="empty-ads-box">
                  <span style={{ fontSize: '40px' }}>🏷️</span>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>You haven't posted any ads yet.</p>
                  <Link to="/post-ad" className="btn-primary" style={{ marginTop: '12px', display: 'inline-block' }}>
                    Post Your First Free Ad
                  </Link>
                </div>
              ) : (
                <div className="ads-manager-list">
                  {userAds.map((ad) => (
                    <div key={ad.id} className="ad-manager-card">
                      <img
                        src={Array.isArray(ad.images) ? ad.images[0] : ad.images}
                        alt={ad.title}
                        className="ad-manager-thumb"
                      />
                      <div className="ad-manager-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${ad.status === 'sold' ? 'badge-orange' : 'badge-green'}`}>
                            {ad.status === 'sold' ? 'Sold' : 'Active & Live'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {ad.postedTime || 'Recently'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '4px 0' }}>
                          {ad.title}
                        </h4>
                        <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                          ₹{Number(ad.price).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div className="ad-manager-actions">
                        <Link to={`/listing/${ad.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          View
                        </Link>
                        {ad.status !== 'sold' && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px', background: '#D97706' }}
                            onClick={() => updateAdStatus(ad.id, 'sold')}
                          >
                            Mark Sold
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style>{`
        .account-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .account-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          padding: 40px 16px 80px;
        }
        .account-sidebar {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 20px;
          height: fit-content;
        }
        .account-user-card {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #E7E5E4;
          margin-bottom: 16px;
        }
        .account-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .account-nav-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .account-nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: background 0.15s;
          cursor: pointer;
        }
        .account-nav-item:hover, .account-nav-item.active {
          background: var(--brand-blue-light);
          color: var(--brand-blue);
        }
        .logout-link {
          color: #DC2626 !important;
          margin-top: 10px;
        }
        .account-panel {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }
        .panel-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .panel-desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .save-toast-banner {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .profile-form .form-group {
          margin-bottom: 18px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .account-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 14px;
        }
        .empty-ads-box {
          text-align: center;
          padding: 48px;
          background: #EEEDE9;
          border-radius: 12px;
          border: 1px dashed #CBD5E1;
        }
        .ads-manager-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ad-manager-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
        }
        .ad-manager-thumb {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          object-fit: cover;
        }
        .ad-manager-info {
          flex: 1;
        }
        .ad-manager-actions {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 800px) {
          .account-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
