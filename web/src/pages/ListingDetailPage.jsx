/**
 * @file apps/web/src/pages/ListingDetailPage.jsx
 * @description Master Listing Detail view with high-res photo gallery, seller card,
 * direct chat action, make-an-offer modal, specs table, and related items.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ListingCard from '../components/ListingCard.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_LISTINGS } from '../data/mockData.js';
import { DEFAULT_PRODUCT_PLACEHOLDER, getAssetUrl } from '../config.js';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWatched, toggleWatchlist, makeOffer, isAuthenticated, openAuth } = useApp();

  const [listing, setListing] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedListings, setRelatedListings] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    webApi.getListingById(id)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setListing(data);
            setOfferAmount(Math.round((data.price || 0) * 0.9)); // preset 10% lower
          } else {
            setError(true);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="listing-detail-page">
        <Navbar />
        <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Loading listing details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-detail-page">
        <Navbar />
        <div className="container" style={{ padding: '80px 16px', textAlign: 'center', minHeight: '50vh' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Listing Not Found</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px' }}>
            This item may have been sold, removed by the seller, or the link is incorrect.
          </p>
          <Link to="/marketplace" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>
            Browse Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rawImages = Array.isArray(listing.images) && listing.images.length > 0
    ? listing.images
    : [DEFAULT_PRODUCT_PLACEHOLDER];
  const images = rawImages.map(img => getAssetUrl(img));

  const watched = isWatched(listing.id);
  const formattedPrice = `₹${Number(listing.price || 0).toLocaleString('en-IN')}`;
  const formattedOriginalPrice = listing.originalPrice
    ? `₹${Number(listing.originalPrice).toLocaleString('en-IN')}`
    : null;

  const handleStartChat = () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    navigate('/chat');
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    makeOffer('chat-01', Number(offerAmount));
    setOfferSuccess(true);
    setTimeout(() => {
      setOfferSuccess(false);
      setOfferModalOpen(false);
      navigate('/chat');
    }, 1200);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch live related listings from backend
  useEffect(() => {
    if (!listing) return;
    let isMounted = true;
    webApi.getListings({
      category: listing.category
    })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          const filtered = data
            .filter((l) => String(l.id) !== String(listing.id))
            .slice(0, 4);
          setRelatedListings(filtered);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [listing?.id, listing?.category]);

  const similarListings = relatedListings.length > 0
    ? relatedListings
    : MOCK_LISTINGS.filter((l) => l.id !== listing.id && (l.category === listing.category || true)).slice(0, 3);

  return (
    <div className="listing-detail-page">
      <Navbar />
      <AuthModal />

      {/* Breadcrumb Bar */}
      <div className="container" style={{ padding: '16px 16px 0' }}>
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/marketplace">Marketplace</Link>
          <span>/</span>
          <Link to={`/marketplace?category=${listing.category}`}>{listing.category}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{listing.title}</span>
        </nav>
      </div>

      <main className="container detail-main-layout">
        {/* Left Column: Gallery & Description & Specs */}
        <section className="detail-media-column">
          {/* Main Large Image */}
          <div className="detail-main-image-wrap">
            <img
              src={images[activeImageIdx] || DEFAULT_PRODUCT_PLACEHOLDER}
              alt={listing.title}
              className="detail-main-image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
              }}
            />
            <span className="detail-condition-pill">{listing.condition || 'Verified'}</span>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="detail-thumb-strip">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`detail-thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Overview & Description */}
          <div className="detail-card-panel">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
              Item Description
            </h2>
            <p className="detail-desc-text">
              {listing.description || 'Verified product in excellent working condition with original parts and accessories.'}
            </p>
          </div>

          {/* Specifications Table */}
          {listing.specs && (
            <div className="detail-card-panel">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>
                Key Specifications
              </h2>
              <div className="detail-specs-grid">
                {Object.entries(listing.specs).map(([key, val]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}</span>
                    <span className="spec-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Warning */}
          <div className="detail-safety-box">
            <div style={{ fontSize: '24px' }}>🛡️</div>
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                BigBazaar Buyer Safety Guidelines
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                Always inspect the item in a public place before final acceptance. With our Escrow Protection, payments remain locked safely until you confirm satisfaction.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Pricing, Primary Actions & Seller Card */}
        <aside className="detail-action-column">
          <div className="detail-buy-box">
            <div className="buy-box-header">
              <span className="badge badge-green">Available Now</span>
              <div className="buy-box-fav-share">
                <button
                  type="button"
                  className={`icon-circle-btn ${watched ? 'active-fav' : ''}`}
                  onClick={() => toggleWatchlist(listing.id)}
                  title={watched ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={watched ? '#EF4444' : 'none'} stroke={watched ? '#EF4444' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="icon-circle-btn"
                  onClick={handleShare}
                  title="Share Listing"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>

            {copied && <div className="share-toast">Link copied to clipboard!</div>}

            <h1 className="detail-product-title">{listing.title}</h1>

            <div className="detail-price-section tabular-nums">
              <span className="detail-price-main tabular-nums">{formattedPrice}</span>
              {formattedOriginalPrice && (
                <span className="detail-price-strike tabular-nums">{formattedOriginalPrice}</span>
              )}
            </div>

            <div className="detail-meta-list">
              <div className="meta-row">
                <span className="meta-icon">📍</span>
                <span>
                  {typeof listing.location === 'object' && listing.location !== null
                    ? ([listing.location.address, listing.location.city, listing.location.state].filter(Boolean).join(', ') || listing.location.city || 'Indiranagar, Bengaluru')
                    : (listing.location || 'Indiranagar, Bengaluru')}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">⏱️</span>
                <span>Posted {listing.postedTime || 'Recently'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">👁️</span>
                <span>{listing.views || 250} views • {listing.favoritesCount || 18} interested</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="detail-cta-stack">
              <button
                type="button"
                className="btn-primary btn-cta-block"
                onClick={handleStartChat}
              >
                💬 Chat with Seller
              </button>
              <button
                type="button"
                className="btn-secondary btn-cta-block"
                onClick={() => setOfferModalOpen(true)}
              >
                🤝 Make an Offer
              </button>
            </div>
          </div>

          {/* Seller Card */}
          <div className="detail-seller-card">
            <div className="seller-header">
              <img
                src={listing.seller?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={listing.seller?.name || 'Seller'}
                className="seller-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#334155"/><circle cx="32" cy="24" r="12" fill="#94a3b8"/><path d="M12 54c0-11 9-20 20-20s20 9 20 20z" fill="#94a3b8"/></svg>')}`;
                }}
              />
              <div className="seller-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
                    {listing.seller?.name || 'Priya Patel'}
                  </h4>
                  {listing.seller?.verified && (
                    <span title="Verified Seller" style={{ color: 'var(--brand-green)', fontSize: '14px' }}>✓</span>
                  )}
                </div>
                <div className="seller-rating-line">
                  <span style={{ color: '#F59E0B' }}>★</span>
                  <strong style={{ fontSize: '13px' }}>{listing.seller?.rating || '4.9'}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    ({listing.seller?.reviewsCount || 38} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="seller-stats-strip">
              <div>
                <small>Response Time</small>
                <strong>{listing.seller?.responseTime || '< 15 mins'}</strong>
              </div>
              <div>
                <small>Member Since</small>
                <strong>{listing.seller?.memberSince || 'Aug 2023'}</strong>
              </div>
            </div>

            <Link
              to={`/seller/${listing.seller?.id || 'usr-seller-01'}`}
              className="btn-view-seller"
            >
              View Seller Storefront &rarr;
            </Link>
          </div>
        </aside>
      </main>

      {/* Similar Listings Carousel / Grid */}
      <section className="container" style={{ padding: '32px 16px 60px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px' }}>
          Similar Listings in {listing.category}
        </h2>
        <div className="similar-grid">
          {similarListings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </section>

      {/* Make an Offer Modal */}
      {offerModalOpen && (
        <div className="offer-modal-overlay" onClick={() => setOfferModalOpen(false)}>
          <div className="offer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="offer-close-btn"
              onClick={() => setOfferModalOpen(false)}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
              Make an Offer
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Propose a fair price for <strong>{listing.title}</strong>. The seller can accept, decline, or send a counter-offer.
            </p>

            <div className="offer-current-price tabular-nums">
              <span>Listing Price:</span>
              <strong>{formattedPrice}</strong>
            </div>

            {offerSuccess ? (
              <div className="offer-success-message">
                ✓ Offer of ₹{Number(offerAmount).toLocaleString('en-IN')} sent to seller! Redirecting to chat...
              </div>
            ) : (
              <form onSubmit={handleSendOffer}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    Your Offer Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={listing.price * 1.5}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="offer-input"
                    required
                  />
                </div>

                <div className="offer-quick-pills">
                  {[0.9, 0.85, 0.8].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      className="offer-pct-pill"
                      onClick={() => setOfferAmount(Math.round(listing.price * pct))}
                    >
                      {Math.round((1 - pct) * 100)}% Off (₹{Math.round(listing.price * pct).toLocaleString('en-IN')})
                    </button>
                  ))}
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '12px' }}>
                  Submit Offer
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .listing-detail-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .detail-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .detail-breadcrumbs a:hover {
          color: var(--brand-blue);
        }
        .detail-main-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          padding: 24px 16px;
        }
        .detail-media-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .detail-main-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #0B2545;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        .detail-main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .detail-condition-pill {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          color: #FBFBFA;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }
        .detail-thumb-strip {
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }
        .detail-thumb-btn {
          width: 80px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          background: #E2E8F0;
          cursor: pointer;
        }
        .detail-thumb-btn.active {
          border-color: var(--brand-blue);
        }
        .detail-thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .detail-card-panel {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 24px;
        }
        .detail-desc-text {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        .detail-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .spec-item {
          background: #EEEDE9;
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
        }
        .spec-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }
        .spec-val {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 2px;
        }
        .detail-safety-box {
          display: flex;
          gap: 16px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 12px;
          padding: 18px;
        }
        .detail-action-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .detail-buy-box {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }
        .buy-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .buy-box-fav-share {
          display: flex;
          gap: 8px;
        }
        .icon-circle-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #E7E5E4;
          background: #EEEDE9;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .icon-circle-btn:hover {
          background: #EEEDE9;
        }
        .active-fav {
          border-color: #FCA5A5;
          background: #FEF2F2;
        }
        .share-toast {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 12px;
          text-align: center;
        }
        .detail-product-title {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.35;
          margin-bottom: 16px;
        }
        .detail-price-section {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #E7E5E4;
          margin-bottom: 16px;
        }
        .detail-price-main {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .detail-price-strike {
          font-size: 16px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .detail-meta-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .detail-cta-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .btn-cta-block {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 12px;
          text-align: center;
        }
        .detail-seller-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 20px;
        }
        .seller-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .seller-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        .seller-rating-line {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
        }
        .seller-stats-strip {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: #EEEDE9;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 14px;
        }
        .seller-stats-strip small {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
        }
        .seller-stats-strip strong {
          font-size: 12px;
          color: var(--text-primary);
        }
        .btn-view-seller {
          display: block;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-blue);
          padding: 8px;
        }
        .similar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .offer-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .offer-modal-content {
          background: #FBFBFA;
          border-radius: 12px;
          max-width: 440px;
          width: 100%;
          padding: 28px;
          position: relative;
        }
        .offer-close-btn {
          position: absolute;
          top: 16px; right: 18px;
          font-size: 24px;
          color: var(--text-muted);
          cursor: pointer;
        }
        .offer-current-price {
          background: #EEEDE9;
          padding: 10px 14px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .offer-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 700;
          outline: none;
        }
        .offer-quick-pills {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }
        .offer-pct-pill {
          padding: 6px 10px;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
        .offer-success-message {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          padding: 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }
        @media (max-width: 900px) {
          .detail-main-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
