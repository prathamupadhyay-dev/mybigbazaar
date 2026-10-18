/**
 * @file apps/web/src/components/ServiceCard.jsx
 * @description Standard Service Catalogue card with price, duration, rating, and booking actions.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_SERVICE_PLACEHOLDER, getAssetUrl } from '../config';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      category: service.category,
      duration: service.duration,
      type: 'service'
    });
    navigate('/checkout');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      category: service.category,
      duration: service.duration,
      type: 'service'
    });
  };

  const serviceImage = service.image ? getAssetUrl(service.image) : DEFAULT_SERVICE_PLACEHOLDER;

  return (
    <div className="service-card">
      <div className="service-image-wrapper">
        <Link to={`/service/${service.id}`}>
          <img
            src={serviceImage}
            alt={service.title}
            className="service-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_SERVICE_PLACEHOLDER;
            }}
          />
        </Link>
        <span className="service-category-badge">{service.category}</span>
        {service.popular && <span className="service-popular-badge">★ Popular</span>}
      </div>

      <div className="service-content">
        <div className="service-header-row">
          <div className="service-rating">
            <span style={{ color: '#F59E0B' }}>★</span>
            <span style={{ fontWeight: '700', fontSize: '12px' }}>{service.rating || '4.9'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              ({service.reviewsCount || 120})
            </span>
          </div>
          <span className="service-duration">⏱ {service.duration || '45 mins'}</span>
        </div>

        <Link to={`/service/${service.id}`} className="service-title-link">
          <h3 className="service-title" title={service.title}>
            {service.title}
          </h3>
        </Link>

        {Array.isArray(service.inclusions) && service.inclusions.length > 0 && (
          <ul className="service-inclusions-list">
            {service.inclusions.slice(0, 2).map((inc, i) => (
              <li key={i}>✓ {inc}</li>
            ))}
          </ul>
        )}

        <div className="service-action-row">
          <div className="service-price-block tabular-nums">
            <span className="service-price-label tabular-nums">Starts from</span>
            <div className="service-price-val tabular-nums">
              <span className="price-num tabular-nums">₹{Number(service.price).toLocaleString('en-IN')}</span>
              {service.originalPrice && (
                <span className="price-orig tabular-nums">₹{Number(service.originalPrice).toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>

          <div className="service-btn-group">
            <button
              type="button"
              className="btn-service-cart"
              onClick={handleAddToCart}
              title="Add to Cart"
            >
              +
            </button>
            <button
              type="button"
              className="btn-primary btn-service-book"
              onClick={handleBookNow}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .service-card {
          background: #FBFBFA;
          border-radius: 12px;
          border: 1px solid #E7E5E4;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.1);
        }
        .service-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #EEEDE9;
          overflow: hidden;
        }
        .service-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .service-card:hover .service-image {
          transform: scale(1.04);
        }
        .service-category-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          color: #FBFBFA;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .service-popular-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .service-content {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .service-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .service-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .service-duration {
          font-size: 11px;
          color: var(--text-secondary);
          background: #EEEDE9;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .service-title-link {
          margin-bottom: 8px;
        }
        .service-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .service-card:hover .service-title {
          color: var(--brand-blue);
        }
        .service-inclusions-list {
          list-style: none;
          padding: 0;
          margin: 0 0 12px 0;
        }
        .service-inclusions-list li {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .service-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #E7E5E4;
        }
        .service-price-block {
          display: flex;
          flex-direction: column;
        }
        .service-price-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        .service-price-val {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .price-num {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .price-orig {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .service-btn-group {
          display: flex;
          gap: 6px;
        }
        .btn-service-cart {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }
        .btn-service-cart:hover {
          background: var(--brand-blue-light);
          color: var(--brand-blue);
        }
        .btn-service-book {
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
