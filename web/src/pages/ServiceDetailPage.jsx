/**
 * @file apps/web/src/pages/ServiceDetailPage.jsx
 * @description Master Service Detail page with package inclusions/exclusions, warranty guarantees,
 * customer reviews, and interactive date & time slot booking panel.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_SERVICES, MOCK_PROVIDERS, MOCK_REVIEWS } from '../data/mockData.js';
import { DEFAULT_SERVICE_PLACEHOLDER, getAssetUrl } from '../config.js';

const AVAILABLE_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[0]);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    webApi.getServiceById(id)
      .then((s) => {
        if (isMounted) {
          setService(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setService(MOCK_SERVICES[0]);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [id]);

  if (loading || !service) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <p>Loading service details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBookNow = () => {
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      category: service.category,
      duration: service.duration,
      date: selectedDate,
      timeSlot: selectedSlot,
      type: 'service'
    });
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      category: service.category,
      duration: service.duration,
      date: selectedDate,
      timeSlot: selectedSlot,
      type: 'service'
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  return (
    <div className="service-detail-page">
      <Navbar />
      <AuthModal />

      {/* Breadcrumbs */}
      <div className="container" style={{ padding: '16px 16px 0' }}>
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/services">Services</Link>
          <span>/</span>
          <Link to={`/services?category=${service.category}`}>{service.category}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{service.title}</span>
        </nav>
      </div>

      <main className="container service-detail-layout">
        {/* Left Column: Media & Service Inclusions */}
        <section className="service-info-column">
          <div className="service-hero-card">
            <img
              src={service.image ? getAssetUrl(service.image) : DEFAULT_SERVICE_PLACEHOLDER}
              alt={service.title}
              className="service-hero-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_SERVICE_PLACEHOLDER;
              }}
            />
            <div className="service-hero-overlay">
              <span className="badge badge-orange">{service.category}</span>
              <h1 className="service-main-title">{service.title}</h1>
              <div className="service-rating-chip">
                <span>★ {service.rating || '4.92'}</span>
                <span>•</span>
                <span>{service.reviewsCount || 180} verified reviews</span>
                <span>•</span>
                <span>⏱ {service.duration || '45 mins'}</span>
              </div>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="service-panel-card">
            <h2 className="panel-heading">Service Overview</h2>
            <p className="panel-text">{service.description}</p>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="service-panel-card">
            <h2 className="panel-heading">What’s Included &amp; Excluded</h2>
            <div className="inclusions-grid">
              <div className="inclusions-box">
                <h4 style={{ color: 'var(--brand-green)', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>
                  ✓ What is Included
                </h4>
                <ul className="inc-list">
                  {(service.inclusions || [
                    'Complete diagnostic and inspection',
                    'High pressure washing and sanitization',
                    '30-day post service warranty'
                  ]).map((inc, i) => (
                    <li key={i}>{inc}</li>
                  ))}
                </ul>
              </div>

              <div className="exclusions-box">
                <h4 style={{ color: '#DC2626', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>
                  ✕ What is Excluded
                </h4>
                <ul className="exc-list">
                  {(service.exclusions || [
                    'Cost of replacement spare parts',
                    'Masonry or external structural repair'
                  ]).map((exc, i) => (
                    <li key={i}>{exc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Top Assigned Provider Showcase */}
          <div className="service-panel-card">
            <h2 className="panel-heading">Certified Service Partner</h2>
            <div className="partner-highlight-box">
              <img
                src={MOCK_PROVIDERS[0].avatar}
                alt={MOCK_PROVIDERS[0].name}
                className="partner-photo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#334155"/><circle cx="32" cy="24" r="12" fill="#94a3b8"/><path d="M12 54c0-11 9-20 20-20s20 9 20 20z" fill="#94a3b8"/></svg>')}`;
                }}
              />
              <div className="partner-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    {MOCK_PROVIDERS[0].name}
                  </h4>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>Verified Pro</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 6px' }}>
                  {MOCK_PROVIDERS[0].trade} • {MOCK_PROVIDERS[0].experience}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {MOCK_PROVIDERS[0].badges.map((b) => (
                    <span key={b} className="pro-badge-pill">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="service-panel-card">
            <h2 className="panel-heading">Customer Reviews ({MOCK_REVIEWS.length})</h2>
            <div className="reviews-list">
              {MOCK_REVIEWS.map((rev) => (
                <div key={rev.id} className="review-card">
                  <div className="review-header">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="review-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#334155"/><circle cx="32" cy="24" r="12" fill="#94a3b8"/><path d="M12 54c0-11 9-20 20-20s20 9 20 20z" fill="#94a3b8"/></svg>')}`;
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px' }}>{rev.author}</strong>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ color: '#F59E0B', fontSize: '12px' }}>★★★★★</span>
                        <small style={{ color: 'var(--text-muted)' }}>{rev.date}</small>
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Slot Picker & Booking Widget */}
        <aside className="service-booking-column">
          <div className="booking-widget-card">
            <div className="booking-price-header tabular-nums">
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                  Standard Fixed Rate
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{Number(service.price).toLocaleString('en-IN')}
                  </span>
                  {service.originalPrice && (
                    <span style={{ fontSize: '15px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{Number(service.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <span className="badge badge-green">Save {service.originalPrice ? Math.round((1 - service.price / service.originalPrice) * 100) : 25}%</span>
            </div>

            {addedNotice && (
              <div className="cart-notice">
                ✓ Added to cart! View cart or proceed to checkout.
              </div>
            )}

            {/* Date Selection */}
            <div className="booking-field-group">
              <label className="field-label">1. Select Preferred Date</label>
              <div className="date-pill-grid">
                {['Today', 'Tomorrow', 'Day After'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`date-pill ${selectedDate === d ? 'active' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="booking-field-group">
              <label className="field-label">2. Select Time Window</label>
              <div className="slot-pill-list">
                {AVAILABLE_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-pill ${selectedSlot === slot ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span>⏱ {slot}</span>
                    {selectedSlot === slot && <span style={{ color: 'var(--brand-blue)' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Inclusions Bullet Highlights */}
            <div className="booking-perks">
              <div>🛡️ 30-Day Service Guarantee</div>
              <div>⚡ Free cancellation up to 2 hours before</div>
              <div>💳 Pay online or Cash after service</div>
            </div>

            {/* CTAs */}
            <div className="booking-action-stack">
              <button
                type="button"
                className="btn-primary booking-main-cta"
                onClick={handleBookNow}
              >
                Proceed to Book ({selectedDate})
              </button>
              <button
                type="button"
                className="btn-secondary booking-sec-cta"
                onClick={handleAddToCart}
              >
                + Add to Cart
              </button>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      <style>{`
        .service-detail-page {
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
        .service-detail-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          padding: 24px 16px 64px;
        }
        .service-info-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .service-hero-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: #0B2545;
        }
        .service-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
        }
        .service-hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 28px;
          background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%);
          color: #FBFBFA;
        }
        .service-main-title {
          font-size: 26px;
          font-weight: 800;
          margin: 8px 0;
          color: #FBFBFA;
        }
        .service-rating-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #E2E8F0;
        }
        .service-panel-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 24px;
        }
        .panel-heading {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .panel-text {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        .inclusions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .inclusions-box {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 12px;
          padding: 16px;
        }
        .exclusions-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          padding: 16px;
        }
        .inc-list, .exc-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 13px;
        }
        .inc-list li {
          margin-bottom: 6px;
          color: #065F46;
        }
        .exc-list li {
          margin-bottom: 6px;
          color: #991B1B;
        }
        .partner-highlight-box {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #EEEDE9;
          border-radius: 12px;
          padding: 16px;
        }
        .partner-photo {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
        }
        .pro-badge-pill {
          background: #E2E8F0;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 8px;
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .review-card {
          background: #EEEDE9;
          border-radius: 12px;
          padding: 16px;
        }
        .review-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .review-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
        }
        .review-comment {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .booking-widget-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          position: sticky;
          top: 80px;
        }
        .booking-price-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid #E7E5E4;
          margin-bottom: 20px;
        }
        .cart-notice {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        .booking-field-group {
          margin-bottom: 18px;
        }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .date-pill-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .date-pill {
          padding: 10px 4px;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .date-pill.active {
          background: var(--brand-blue);
          border-color: var(--brand-blue);
          color: #FBFBFA;
        }
        .slot-pill-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .slot-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .slot-pill.active {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
          font-weight: 700;
        }
        .booking-perks {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          margin: 18px 0;
          padding: 12px;
          background: #EEEDE9;
          border-radius: 10px;
        }
        .booking-action-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .booking-main-cta {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 12px;
        }
        .booking-sec-cta {
          width: 100%;
          padding: 12px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 12px;
        }
        @media (max-width: 900px) {
          .service-detail-layout {
            grid-template-columns: 1fr;
          }
          .inclusions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
