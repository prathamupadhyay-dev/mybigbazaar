/**
 * @file apps/web/src/pages/SellerProfilePage.jsx
 * @description Public Seller Storefront with reputation badges, response metrics,
 * active listings catalog, and buyer reviews.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ListingCard from '../components/ListingCard.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_USERS, MOCK_LISTINGS, MOCK_REVIEWS } from '../data/mockData.js';

export default function SellerProfilePage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(MOCK_USERS[1]);
  const [sellerListings, setSellerListings] = useState([]);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reviews'

  useEffect(() => {
    webApi.getListings().then((all) => {
      // Find listings belonging to this seller or show subset
      const matches = all.filter((l) => l.seller?.id === id || l.seller?.name === seller.name);
      setSellerListings(matches.length > 0 ? matches : all.slice(0, 3));
    });
  }, [id, seller.name]);

  return (
    <div className="seller-profile-page">
      <Navbar />
      <AuthModal />

      {/* Seller Header Banner */}
      <section className="seller-header-banner">
        <div className="container seller-header-inner">
          <img
            src={seller.avatar}
            alt={seller.name}
            className="seller-big-avatar"
          />
          <div className="seller-title-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="seller-name">{seller.name}</h1>
              {seller.verified && (
                <span className="badge badge-green" style={{ fontSize: '11px' }}>
                  ✓ ID Verified
                </span>
              )}
            </div>
            <p className="seller-loc">📍 {typeof seller.location === 'object' && seller.location !== null
              ? ([seller.location.address, seller.location.city, seller.location.state].filter(Boolean).join(', ') || seller.location.city || 'Koramangala, Bengaluru')
              : (seller.location || 'Koramangala, Bengaluru')}</p>
            <div className="seller-metrics-line">
              <span style={{ color: '#F59E0B' }}>★</span>
              <strong>{seller.rating || '4.85'}</strong>
              <span style={{ color: 'var(--text-muted)' }}>({seller.successfulSales || 38} sales)</span>
              <span>•</span>
              <span>Member since {seller.joinedDate || 'Aug 2023'}</span>
              <span>•</span>
              <span>Response time: {seller.responseTime || '< 15 mins'}</span>
            </div>
          </div>

          <Link to="/chat" className="btn-primary" style={{ padding: '10px 20px', alignSelf: 'center' }}>
            💬 Contact Seller
          </Link>
        </div>
      </section>

      <main className="container seller-main">
        {/* Navigation Tabs */}
        <div className="seller-nav-tabs">
          <button
            type="button"
            className={`seller-tab ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            Active Listings ({sellerListings.length})
          </button>
          <button
            type="button"
            className={`seller-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Buyer Reviews ({MOCK_REVIEWS.length})
          </button>
        </div>

        {activeTab === 'listings' ? (
          <div className="seller-listings-grid">
            {sellerListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="seller-reviews-list">
            {MOCK_REVIEWS.map((rev) => (
              <div key={rev.id} className="seller-review-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <img src={rev.avatar} alt={rev.author} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <strong style={{ fontSize: '14px' }}>{rev.author}</strong>
                    <div style={{ fontSize: '12px', color: '#F59E0B' }}>★★★★★ • <small style={{ color: 'var(--text-muted)' }}>{rev.date}</small></div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .seller-profile-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .seller-header-banner {
          background: #FBFBFA;
          border-bottom: 1px solid #E2E8F0;
          padding: 36px 0;
        }
        .seller-header-inner {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .seller-big-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .seller-title-block {
          flex: 1;
        }
        .seller-name {
          font-size: 26px;
          font-weight: 800;
          margin: 0;
        }
        .seller-loc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 4px 0 8px;
        }
        .seller-metrics-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          flex-wrap: wrap;
        }
        .seller-main {
          padding: 32px 16px 80px;
        }
        .seller-nav-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .seller-tab {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        .seller-tab.active {
          background: var(--brand-blue-light);
          color: var(--brand-blue);
        }
        .seller-listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .seller-reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 680px;
        }
        .seller-review-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 18px;
        }
      `}</style>
    </div>
  );
}
