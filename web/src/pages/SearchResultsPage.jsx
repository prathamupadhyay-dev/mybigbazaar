/**
 * @file apps/web/src/pages/SearchResultsPage.jsx
 * @description Universal Search Results Page querying both marketplace deals and home services.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ListingCard from '../components/ListingCard.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { webApi } from '../services/apiClient.js';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'products' | 'services'
  const [matchedListings, setMatchedListings] = useState([]);
  const [matchedServices, setMatchedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      webApi.getListings({ search: query, category: category !== 'All' ? category : undefined }),
      webApi.getServices({ search: query, category: category !== 'All' ? category : undefined })
    ]).then(([listings, services]) => {
      if (isMounted) {
        setMatchedListings(listings);
        setMatchedServices(services);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [query, category]);

  const totalResults = matchedListings.length + matchedServices.length;

  return (
    <div className="search-results-page">
      <Navbar />
      <AuthModal />

      <main className="container search-container">
        {/* Results Header */}
        <div className="search-header-bar">
          <div>
            <h1 className="search-main-heading">
              {query ? `Search results for "${query}"` : 'All Search Results'}
            </h1>
            <p className="search-sub-text">
              Found <strong>{totalResults}</strong> matching result{totalResults !== 1 ? 's' : ''} in {category === 'All' ? 'all categories' : category}
            </p>
          </div>

          <div className="search-type-tabs">
            <button
              type="button"
              className={`search-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({totalResults})
            </button>
            <button
              type="button"
              className={`search-tab-pill ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products ({matchedListings.length})
            </button>
            <button
              type="button"
              className={`search-tab-pill ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Services ({matchedServices.length})
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px' }}>Searching across BigBazaar...</p>
        ) : totalResults === 0 ? (
          <div className="search-empty-state">
            <span style={{ fontSize: '48px' }}>🔎</span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '12px' }}>
              No matches found for "{query}"
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '8px auto 20px' }}>
              Try searching with alternative keywords or explore our top categories.
            </p>
            <div className="suggested-queries">
              <span>Popular searches:</span>
              <Link to="/search?q=iPhone">iPhone</Link>
              <Link to="/search?q=AC">AC Service</Link>
              <Link to="/search?q=Cleaning">Home Cleaning</Link>
              <Link to="/search?q=Sofa">Sofa</Link>
              <Link to="/search?q=Bike">Bike</Link>
            </div>
          </div>
        ) : (
          <div className="search-results-content">
            {/* Products Section */}
            {(activeTab === 'all' || activeTab === 'products') && matchedListings.length > 0 && (
              <section className="search-results-block">
                <div className="block-title-row">
                  <h2 style={{ fontSize: '18px', fontWeight: '800' }}>
                    Marketplace Products ({matchedListings.length})
                  </h2>
                  <Link to="/marketplace" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    View in Marketplace &rarr;
                  </Link>
                </div>
                <div className="search-items-grid">
                  {matchedListings.map((item) => (
                    <ListingCard key={item.id} listing={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Services Section */}
            {(activeTab === 'all' || activeTab === 'services') && matchedServices.length > 0 && (
              <section className="search-results-block">
                <div className="block-title-row">
                  <h2 style={{ fontSize: '18px', fontWeight: '800' }}>
                    Home &amp; Repair Services ({matchedServices.length})
                  </h2>
                  <Link to="/services" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    View All Services &rarr;
                  </Link>
                </div>
                <div className="search-items-grid">
                  {matchedServices.map((item) => (
                    <ServiceCard key={item.id} service={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .search-results-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .search-container {
          padding: 32px 16px 80px;
        }
        .search-header-bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .search-main-heading {
          font-size: 26px;
          font-weight: 800;
        }
        .search-sub-text {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .search-type-tabs {
          display: flex;
          background: #EEEDE9;
          padding: 4px;
          border-radius: 10px;
        }
        .search-tab-pill {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
        }
        .search-tab-pill.active {
          background: #FBFBFA;
          color: var(--brand-blue);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .search-results-block {
          margin-bottom: 40px;
        }
        .block-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .search-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .search-empty-state {
          background: #FBFBFA;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
        }
        .suggested-queries {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          font-size: 13px;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }
        .suggested-queries a {
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          padding: 4px 10px;
          border-radius: 8px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
