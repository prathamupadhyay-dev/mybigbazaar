/**
 * @file apps/web/src/pages/ServicesPage.jsx
 * @description Comprehensive Service Catalogue directory with category pills,
 * search filtering, service cards, guarantee guarantees, and direct cart actions.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_SERVICE_CATEGORIES } from '../data/mockData.js';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [categories, setCategories] = useState(MOCK_SERVICE_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    setSelectedCat(cat);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    webApi.getServices({ category: selectedCat, search: searchQuery })
      .then((data) => {
        if (isMounted) {
          setServices(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedCat, searchQuery]);

  const handleSelectCat = (catName) => {
    setSelectedCat(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') newParams.delete('category');
    else newParams.set('category', catName);
    setSearchParams(newParams);
  };

  return (
    <div className="services-catalogue-page">
      <Navbar />
      <AuthModal />

      {/* Services Hero Banner */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content">
            <span className="badge badge-orange">Trusted Local Professionals</span>
            <h1 className="services-hero-title">Expert Home &amp; Professional Services</h1>
            <p className="services-hero-subtitle">
              Book certified AC technicians, electricians, plumbers, and home cleaning squads. Upfront fixed pricing with 30-day BigBazaar guarantee.
            </p>

            {/* In-page Service Search */}
            <div className="services-search-wrapper">
              <input
                type="text"
                placeholder="Search services (e.g. AC deep clean, tap leak, sofa wash)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="services-search-field"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="services-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Category Rail */}
          <div className="services-cat-rail">
            <button
              type="button"
              className={`cat-pill ${selectedCat === 'All' ? 'active' : ''}`}
              onClick={() => handleSelectCat('All')}
            >
              ⚡ All Services
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cat-pill ${selectedCat === c.name ? 'active' : ''}`}
                onClick={() => handleSelectCat(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillar Guarantees */}
      <section className="container guarantees-strip">
        <div className="guarantee-col">
          <span className="guarantee-icon">🛡️</span>
          <div>
            <strong>30-Day Service Warranty</strong>
            <p>Free rework if anything goes wrong post-service.</p>
          </div>
        </div>
        <div className="guarantee-col">
          <span className="guarantee-icon">👨‍🔧</span>
          <div>
            <strong>Background-Verified Pros</strong>
            <p>Police verified, skills tested, and top customer ratings.</p>
          </div>
        </div>
        <div className="guarantee-col">
          <span className="guarantee-icon">🏷️</span>
          <div>
            <strong>Transparent Upfront Pricing</strong>
            <p>Zero hidden charges. Pay after service or via secure escrow.</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <main className="container services-main">
        <div className="services-header-row">
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
              {selectedCat === 'All' ? 'All Popular Services' : `${selectedCat} Services`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
              Showing {services.length} services with guaranteed delivery
            </p>
          </div>

          <Link to="/providers" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Browse Service Providers &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="services-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="service-skeleton-card" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="services-empty">
            <span style={{ fontSize: '48px' }}>🔍</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '12px' }}>
              No services found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 16px' }}>
              Try searching for "AC", "cleaning", or select a different category.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => { setSelectedCat('All'); setSearchQuery(''); }}
            >
              View All Services
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((item) => (
              <ServiceCard key={item.id} service={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .services-catalogue-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .services-hero {
          background: linear-gradient(180deg, #FFF7ED 0%, #FAFAFA 100%);
          padding: 36px 0 20px;
          border-bottom: 1px solid #E2E8F0;
        }
        .services-hero-content {
          max-width: 680px;
        }
        .services-hero-title {
          font-size: 32px;
          font-weight: 800;
          margin-top: 8px;
          letter-spacing: -0.5px;
        }
        .services-hero-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          margin-top: 6px;
        }
        .services-search-wrapper {
          position: relative;
          margin-top: 18px;
        }
        .services-search-field {
          width: 100%;
          padding: 12px 18px;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .services-search-field:focus {
          border-color: var(--brand-blue);
        }
        .services-search-clear {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
        }
        .services-cat-rail {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 24px 0 4px;
          scrollbar-width: none;
        }
        .services-cat-rail::-webkit-scrollbar {
          display: none;
        }
        .guarantees-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 24px 16px;
          margin-top: 16px;
        }
        .guarantee-col {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 16px;
        }
        .guarantee-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        .guarantee-col strong {
          display: block;
          font-size: 14px;
          color: var(--text-primary);
        }
        .guarantee-col p {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .services-main {
          padding: 24px 16px 64px;
        }
        .services-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .service-skeleton-card {
          height: 340px;
          background: #E2E8F0;
          border-radius: 12px;
          animation: pulse 1.5s infinite;
        }
        .services-empty {
          background: #FBFBFA;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
        }
        @media (max-width: 800px) {
          .guarantees-strip {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
