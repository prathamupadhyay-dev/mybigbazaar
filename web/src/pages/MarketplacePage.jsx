/**
 * @file apps/web/src/pages/MarketplacePage.jsx
 * @description Comprehensive marketplace & classifieds discovery with category tabs,
 * multi-attribute filters (price, condition, sort), responsive grid, and empty/loading states.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ListingCard from '../components/ListingCard.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_CATEGORIES } from '../data/mockData.js';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live product categories
  useEffect(() => {
    let isMounted = true;
    webApi.getProductCategories()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c, idx) => ({
            id: c._id || c.id || `cat-${idx}`,
            name: c.name || c.categoryName || c.title || 'Category',
            count: c.productCount || c.count || c.itemCount || null
          }));
          setCategories(formatted);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Sync category param
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch listings on filter change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    webApi.getListings({
      category: selectedCategory,
      search: searchQuery,
      minPrice,
      maxPrice,
      condition,
      sortBy
    })
      .then((data) => {
        if (isMounted) {
          setListings(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedCategory, searchQuery, minPrice, maxPrice, condition, sortBy]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') newParams.delete('category');
    else newParams.set('category', catName);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('All');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="marketplace-page">
      <Navbar />
      <AuthModal />

      {/* Marketplace Header Banner */}
      <section className="mkt-hero-banner">
        <div className="container">
          <div className="mkt-hero-text">
            <span className="badge badge-blue">Verified Pre-Owned Deals</span>
            <h1 className="mkt-hero-title">Hyperlocal Marketplace</h1>
            <p className="mkt-hero-subtitle">
              Buy and sell verified electronics, furniture, vehicles, and appliances directly with neighbors in your locality.
            </p>
          </div>

          {/* Category Rail Pills */}
          <div className="mkt-category-rail">
            <button
              type="button"
              className={`cat-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('All')}
            >
              🏷️ All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-pill ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat.name)}
              >
                {cat.name}{cat.count !== null && cat.count !== undefined ? ` (${cat.count})` : ''}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Browse & Filter Layout */}
      <main className="container mkt-main-layout">
        {/* Left Filter Sidebar */}
        <aside className="mkt-filter-sidebar">
          <div className="filter-header-row">
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Filters</h3>
            <button type="button" className="filter-reset-link" onClick={handleResetFilters}>
              Reset all
            </button>
          </div>

          {/* Search in Marketplace */}
          <div className="filter-section">
            <label className="filter-label">Search Keywords</label>
            <input
              type="text"
              placeholder="e.g. iPhone, Solid Teak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Category Tree */}
          <div className="filter-section">
            <label className="filter-label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <label className="filter-label">Price Range (₹)</label>
            <div className="filter-price-inputs tabular-nums">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="filter-input-half"
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="filter-input-half"
              />
            </div>
          </div>

          {/* Item Condition */}
          <div className="filter-section">
            <label className="filter-label">Condition</label>
            <div className="filter-radio-group">
              {['All', 'New', 'Like New', 'Good', 'Fair'].map((c) => (
                <label key={c} className="filter-radio-label">
                  <input
                    type="radio"
                    name="condition"
                    value={c}
                    checked={condition === c}
                    onChange={(e) => setCondition(e.target.value)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trust Banner Callout */}
          <div className="filter-trust-card">
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>🛡️</div>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
              BigBazaar Safe-Deal
            </strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Funds held in escrow until in-person inspection and handover. Zero scam guarantee.
            </p>
          </div>
        </aside>

        {/* Listings Content */}
        <section className="mkt-listings-content">
          {/* Top Bar: Count & Sort */}
          <div className="mkt-toolbar">
            <div className="mkt-count-info">
              <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>
                {listings.length}
              </span>{' '}
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                items available in {selectedCategory === 'All' ? 'Marketplace' : selectedCategory}
              </span>
            </div>

            <div className="mkt-sort-wrap">
              <label htmlFor="sort-select" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mkt-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(selectedCategory !== 'All' || searchQuery || minPrice || maxPrice || condition !== 'All') && (
            <div className="active-filters-bar">
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                Active:
              </span>
              {selectedCategory !== 'All' && (
                <span className="active-filter-tag">
                  {selectedCategory}
                  <button type="button" onClick={() => handleCategorySelect('All')}>×</button>
                </span>
              )}
              {searchQuery && (
                <span className="active-filter-tag">
                  "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')}>×</button>
                </span>
              )}
              {condition !== 'All' && (
                <span className="active-filter-tag">
                  {condition}
                  <button type="button" onClick={() => setCondition('All')}>×</button>
                </span>
              )}
              <button type="button" className="filter-clear-all" onClick={handleResetFilters}>
                Clear all
              </button>
            </div>
          )}

          {/* Listings Grid / Loading / Empty */}
          {loading ? (
            <div className="mkt-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="mkt-skeleton-card" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="mkt-empty-state">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>No matching listings found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '8px auto 20px' }}>
                We couldn't find any items matching your exact filters. Try broadening your search or resetting filters.
              </p>
              <button type="button" className="btn-primary" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="mkt-grid">
              {listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style>{`
        .marketplace-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F6F5F2;
        }
        .mkt-hero-banner {
          background: linear-gradient(180deg, #EEF3FC 0%, #FAFAFA 100%);
          padding: 36px 0 24px;
          border-bottom: 1px solid #E2E8F0;
        }
        .mkt-hero-title {
          font-size: 32px;
          font-weight: 800;
          margin-top: 8px;
          letter-spacing: -0.5px;
        }
        .mkt-hero-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 600px;
          margin-top: 6px;
        }
        .mkt-category-rail {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 20px 0 4px;
          scrollbar-width: none;
        }
        .mkt-category-rail::-webkit-scrollbar {
          display: none;
        }
        .cat-pill {
          padding: 8px 16px;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cat-pill:hover {
          border-color: var(--brand-blue);
          color: var(--brand-blue);
        }
        .cat-pill.active {
          background: var(--brand-blue);
          border-color: var(--brand-blue);
          color: #FBFBFA;
        }
        .mkt-main-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
          padding: 32px 16px;
          flex: 1;
        }
        .mkt-filter-sidebar {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 20px;
          height: fit-content;
        }
        .filter-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #E7E5E4;
          margin-bottom: 16px;
        }
        .filter-reset-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-blue);
          cursor: pointer;
        }
        .filter-section {
          margin-bottom: 18px;
        }
        .filter-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 8px;
        }
        .filter-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        }
        .filter-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          background: #FBFBFA;
        }
        .filter-price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-input-half {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        }
        .filter-radio-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .filter-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .filter-trust-card {
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 14px;
          margin-top: 24px;
        }
        .mkt-listings-content {
          display: flex;
          flex-direction: column;
        }
        .mkt-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .mkt-sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mkt-sort-select {
          padding: 6px 12px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          background: #FBFBFA;
        }
        .active-filters-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .active-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
        }
        .active-filter-tag button {
          font-size: 14px;
          font-weight: 700;
          color: var(--brand-blue);
        }
        .filter-clear-all {
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-orange);
          cursor: pointer;
        }
        .mkt-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .mkt-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .mkt-skeleton-card {
          height: 320px;
          background: #E2E8F0;
          border-radius: 12px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        .mkt-empty-state {
          background: #FBFBFA;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 64px 20px;
          text-align: center;
        }
        @media (max-width: 900px) {
          .mkt-main-layout {
            grid-template-columns: 1fr;
          }
          .mkt-filter-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
