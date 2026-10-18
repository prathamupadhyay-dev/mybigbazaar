import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroBanner() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Left Column: Text & Editorial CTAs */}
        <div className="hero-content">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="badge badge-orange">Mobile Super-App</span>
            <span className="text-xs text-muted font-medium">Hyperlocal Commerce &amp; Services</span>
          </div>

          <h1 className="hero-title">
            The Hyperlocal Super-App for Everything Local.
          </h1>

          <p className="hero-subtitle">
            Buy and sell verified pre-owned goods directly with neighbors, or book background-checked doorstep technicians in minutes. Everything runs seamlessly in the mobile app.
          </p>

          <div className="hero-cta-group">
            <a href="#download" className="btn-primary btn-hero-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download App</span>
            </a>

            <a href="#app-features" className="btn-secondary btn-hero-secondary">
              <span>Explore Features</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </a>
          </div>

          <div className="hero-trust-summary">
            <div className="trust-summary-item">
              <div className="trust-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="trust-item-text">
                <strong>Aadhaar &amp; Phone Verified</strong>
                <span>Sellers and service professionals are verified</span>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="trust-item-text">
                <strong>Private In-App Chat</strong>
                <span>Bargain directly without sharing phone numbers</span>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="trust-item-text">
                <strong>In-Person Inspection &amp; Warranty</strong>
                <span>Inspect goods in person; 30-day service rework warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Phone Interface Frame */}
        <div className="hero-visual">
          <div className="phone-device-frame">
            <div className="device-speaker"></div>
            <div className="device-screen-content">
              {/* App Status & Location Bar */}
              <div className="inapp-header">
                <div className="inapp-loc-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.5" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Indiranagar, Bengaluru</span>
                </div>
                <div className="inapp-mode-badge">
                  <span className="dot-active"></span>
                  <span>Hyperlocal</span>
                </div>
              </div>

              {/* In-App Segment Tabs */}
              <div className="inapp-segment-tabs">
                <span className="inapp-tab active">Buy &amp; Sell</span>
                <span className="inapp-tab">Services</span>
              </div>

              {/* App Screen Feed Cards */}
              <div className="inapp-feed-container">
                {/* 1. Verified Classified Listing Card */}
                <div className="inapp-listing-card">
                  <div className="inapp-listing-meta">
                    <span className="listing-chip chip-classified">Electronics</span>
                    <span className="verified-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#15803D" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Verified Seller
                    </span>
                  </div>
                  <h4 className="inapp-item-title">Apple iPhone 15 Pro 128GB</h4>
                  <p className="inapp-item-specs">Battery 98% • Natural Titanium • Original Box &amp; Bill</p>
                  <div className="inapp-price-row tabular-nums">
                    <div className="price-stack tabular-nums">
                      <span className="current-price tabular-nums">₹54,999</span>
                      <span className="mrp-price tabular-nums">₹79,900</span>
                    </div>
                    <span className="bargain-tag">Chat &amp; Offer Open</span>
                  </div>
                </div>

                {/* 2. In-App Offer Negotiation Card */}
                <div className="inapp-offer-preview-card">
                  <div className="offer-preview-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <strong>In-App Offer Negotiation</strong>
                  </div>
                  <p className="offer-desc">Buyer proposed <strong>₹52,000</strong> for iPhone 15 Pro</p>
                  <div className="offer-action-pills">
                    <span className="pill-action pill-accept">Accept</span>
                    <span className="pill-action pill-counter">Counter</span>
                    <span className="pill-action pill-decline">Decline</span>
                  </div>
                </div>

                {/* 3. Verified Doorstep Service Card */}
                <div className="inapp-service-card">
                  <div className="inapp-listing-meta">
                    <span className="listing-chip chip-service">Doorstep Service</span>
                    <span className="duration-tag">30 Min Arrival</span>
                  </div>
                  <h4 className="inapp-item-title">Electrician &amp; MCB Repair</h4>
                  <p className="inapp-item-specs">Sunil S. • Master Electrician • 4.9 Rating</p>
                  <div className="inapp-service-bottom">
                    <div className="price-stack tabular-nums">
                      <span className="rate-label">Fixed upfront</span>
                      <span className="current-price tabular-nums">₹349</span>
                    </div>
                    <span className="service-guarantee-pill">30-Day Warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
