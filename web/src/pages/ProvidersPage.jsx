/**
 * @file apps/web/src/pages/ProvidersPage.jsx
 * @description Local Service Professionals Directory with verification badges, ratings, and booking CTAs.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_PROVIDERS } from '../data/mockData.js';

export default function ProvidersPage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [tradeFilter, setTradeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    webApi.getProviders().then((data) => {
      setProviders(data);
      setLoading(false);
    });
  }, []);

  const filtered = tradeFilter === 'All'
    ? providers
    : providers.filter((p) => p.trade.toLowerCase().includes(tradeFilter.toLowerCase()));

  return (
    <div className="providers-page">
      <Navbar />
      <AuthModal />

      <section className="providers-hero">
        <div className="container">
          <span className="badge badge-green">100% Background Verified</span>
          <h1 className="providers-hero-title">Verified Local Service Professionals</h1>
          <p className="providers-hero-subtitle">
            Hire background-checked, top-rated technicians and handymen in your neighborhood. Guaranteed work with 30-day BigBazaar warranty.
          </p>

          <div className="trade-filter-bar">
            {['All', 'Electrician', 'Plumber', 'Cleaning', 'AC Specialist'].map((t) => (
              <button
                key={t}
                type="button"
                className={`trade-filter-btn ${tradeFilter === t ? 'active' : ''}`}
                onClick={() => setTradeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container providers-main">
        <div className="providers-grid">
          {filtered.map((pro) => (
            <div key={pro.id} className="provider-card">
              <div className="provider-card-top">
                <img src={pro.avatar} alt={pro.name} className="provider-card-avatar" />
                <div className="provider-card-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                      {pro.name}
                    </h3>
                    {pro.verified && (
                      <span title="Verified Pro" style={{ color: 'var(--brand-green)', fontSize: '16px' }}>✓</span>
                    )}
                  </div>
                  <p className="provider-trade">{pro.trade}</p>
                  <div className="provider-rating-row">
                    <span style={{ color: '#F59E0B' }}>★</span>
                    <strong>{pro.rating}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      ({pro.reviewsCount} jobs)
                    </span>
                    <span>•</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{pro.experience}</span>
                  </div>
                </div>
              </div>

              <p className="provider-bio">{pro.bio}</p>

              <div className="provider-badges-list">
                {pro.badges.map((b) => (
                  <span key={b} className="provider-badge-tag">{b}</span>
                ))}
              </div>

              <div className="provider-card-footer">
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  📍 {pro.location}
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => navigate('/services')}
                >
                  Book Pro &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      <style>{`
        .providers-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .providers-hero {
          background: linear-gradient(180deg, #ECFDF5 0%, #FAFAFA 100%);
          padding: 40px 0 24px;
          border-bottom: 1px solid #E2E8F0;
        }
        .providers-hero-title {
          font-size: 32px;
          font-weight: 800;
          margin-top: 8px;
        }
        .providers-hero-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          margin-top: 6px;
          max-width: 620px;
        }
        .trade-filter-bar {
          display: flex;
          gap: 8px;
          margin-top: 20px;
          overflow-x: auto;
        }
        .trade-filter-btn {
          padding: 8px 16px;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .trade-filter-btn.active {
          background: var(--brand-blue);
          border-color: var(--brand-blue);
          color: #FBFBFA;
        }
        .providers-main {
          padding: 32px 16px 64px;
        }
        .providers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }
        .provider-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
        }
        .provider-card-top {
          display: flex;
          gap: 16px;
          margin-bottom: 14px;
        }
        .provider-card-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
        }
        .provider-trade {
          font-size: 13px;
          color: var(--brand-blue);
          font-weight: 600;
          margin: 2px 0;
        }
        .provider-rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }
        .provider-bio {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 14px;
          flex: 1;
        }
        .provider-badges-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .provider-badge-tag {
          background: #EEEDE9;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .provider-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #E7E5E4;
        }
      `}</style>
    </div>
  );
}
