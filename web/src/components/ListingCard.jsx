/**
 * @file apps/web/src/components/ListingCard.jsx
 * @description Standard product listing card with image, price, condition badge, and watchlist toggle.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_PRODUCT_PLACEHOLDER, getAssetUrl } from '../config';

export default function ListingCard({ listing }) {
  const { isWatched, toggleWatchlist } = useApp();
  const watched = isWatched(listing.id);

  const primaryImage =
    Array.isArray(listing.images) && listing.images.length > 0 && listing.images[0]
      ? getAssetUrl(listing.images[0])
      : DEFAULT_PRODUCT_PLACEHOLDER;

  const formattedPrice = `₹${Number(listing.price || 0).toLocaleString('en-IN')}`;
  const formattedOriginalPrice = listing.originalPrice
    ? `₹${Number(listing.originalPrice).toLocaleString('en-IN')}`
    : null;

  return (
    <div className="listing-card">
      <div className="listing-image-wrapper">
        <Link to={`/listing/${listing.id}`}>
          <img
            src={primaryImage}
            alt={listing.title}
            className="listing-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
            }}
          />
        </Link>
        <button
          type="button"
          className={`listing-fav-btn ${watched ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWatchlist(listing.id);
          }}
          aria-label={watched ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={watched ? '#EF4444' : 'none'}
            stroke={watched ? '#EF4444' : '#1E293B'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {listing.condition && (
          <span className="listing-condition-badge">{listing.condition}</span>
        )}
      </div>

      <div className="listing-details">
        <div className="listing-price-row tabular-nums">
          <span className="listing-price tabular-nums">{formattedPrice}</span>
          {formattedOriginalPrice && (
            <span className="listing-original-price tabular-nums">{formattedOriginalPrice}</span>
          )}
        </div>

        <Link to={`/listing/${listing.id}`} className="listing-title-link">
          <h3 className="listing-title" title={listing.title}>
            {listing.title}
          </h3>
        </Link>

        <div className="listing-meta-row">
          <span className="listing-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '3px' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {typeof listing.location === 'object' && listing.location !== null
              ? (listing.location.city || 'Bengaluru')
              : (listing.location || 'Bengaluru')}
          </span>
          <span className="listing-time">{listing.postedTime || 'Recently'}</span>
        </div>
      </div>

      <style>{`
        .listing-card {
          background: #FBFBFA;
          border-radius: 12px;
          border: 1px solid #E7E5E4;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.1);
        }
        .listing-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #EEEDE9;
          overflow: hidden;
        }
        .listing-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .listing-card:hover .listing-image {
          transform: scale(1.04);
        }
        .listing-fav-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(4px);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .listing-fav-btn:hover {
          background: #FBFBFA;
          transform: scale(1.1);
        }
        .listing-condition-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: #FBFBFA;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .listing-details {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .listing-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }
        .listing-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .listing-original-price {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .listing-title-link {
          margin-bottom: 8px;
          flex: 1;
        }
        .listing-title {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .listing-card:hover .listing-title {
          color: var(--brand-blue);
        }
        .listing-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px solid #E7E5E4;
        }
        .listing-location {
          display: flex;
          align-items: center;
          max-width: 65%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
