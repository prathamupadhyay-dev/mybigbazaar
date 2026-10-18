/**
 * @file apps/web/src/pages/WatchlistPage.jsx
 * @description Watchlist & Favorites dashboard showing saved products and services.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ListingCard from '../components/ListingCard.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { webApi } from '../services/apiClient.js';

export default function WatchlistPage() {
  const { watchlist } = useApp();
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    webApi.getListings().then((data) => {
      setAllListings(data);
      setLoading(false);
    });
  }, []);

  const savedListings = allListings.filter((l) => watchlist.includes(l.id));

  return (
    <div className="watchlist-page">
      <Navbar />
      <AuthModal />

      <main className="container watchlist-container">
        <div className="watchlist-header">
          <div>
            <h1 className="watchlist-title">Saved Watchlist ({watchlist.length})</h1>
            <p className="watchlist-subtitle">
              Keep track of price drops and stay updated on your favorite marketplace deals.
            </p>
          </div>

          <Link to="/marketplace" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            + Explore More Deals
          </Link>
        </div>

        {loading ? (
          <p>Loading saved items...</p>
        ) : savedListings.length === 0 ? (
          <div className="watchlist-empty">
            <span style={{ fontSize: '54px' }}>❤️</span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '14px' }}>
              Your watchlist is empty
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '8px auto 20px' }}>
              Click the heart icon on any listing card to save it here for quick access and price tracking.
            </p>
            <Link to="/marketplace" className="btn-primary">
              Discover Marketplace Deals
            </Link>
          </div>
        ) : (
          <div className="watchlist-grid">
            {savedListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .watchlist-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .watchlist-container {
          padding: 40px 16px 80px;
        }
        .watchlist-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .watchlist-title {
          font-size: 26px;
          font-weight: 800;
        }
        .watchlist-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .watchlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .watchlist-empty {
          background: #FBFBFA;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 64px 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
