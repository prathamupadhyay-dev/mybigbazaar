import React from 'react';
import { Link } from 'react-router-dom';

const BUY_SELL_STEPS = [
  {
    num: '01',
    title: 'Discover',
    desc: 'Browse verified items near you by category, distance, or neighborhood pin code.',
  },
  {
    num: '02',
    title: 'Inspect',
    desc: 'Review high-resolution photos, condition notes, specifications, and verified seller profiles.',
  },
  {
    num: '03',
    title: 'Chat',
    desc: 'Message sellers directly inside the app without disclosing your personal phone number.',
  },
  {
    num: '04',
    title: 'Offer',
    desc: 'Propose a price using built-in offer and counter-offer tools to reach a fair agreement.',
  },
  {
    num: '05',
    title: 'Buy',
    desc: 'Meet safely in person, inspect the item thoroughly, and complete the exchange.',
  },
];

export default function BuySellSection() {
  return (
    <section className="editorial-showcase-section" id="buy-and-sell">
      <div className="container">
        <div className="showcase-grid">
          {/* Left Column: Editorial 5-Step Process */}
          <div className="showcase-content">
            <h2 className="showcase-title">Buy and sell locally.</h2>
            <p className="showcase-subtitle">
              Discover nearby listings, inspect details, chat with sellers, make offers, and complete deals safely.
            </p>

            <div className="process-flow-list">
              {BUY_SELL_STEPS.map((step) => (
                <div key={step.num} className="process-flow-item">
                  <div className="process-step-indicator">
                    <span className="step-num-text">{step.num}</span>
                  </div>
                  <div className="process-step-info">
                    <h3 className="process-step-heading">{step.title}</h3>
                    <p className="process-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="showcase-action-wrap" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#download" className="btn-primary">
                <span>Download App to Buy &amp; Sell</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <a href="#how-it-works" className="btn-secondary">
                <span>How Verification Works</span>
              </a>
            </div>
          </div>

          {/* Right Column: Realistic Product Card with Negotiation State */}
          <div className="showcase-visual">
            <div className="editorial-device-card">
              <div className="card-top-tag">
                <span className="card-category-label">Classifieds • Two-Wheelers</span>
                <span className="status-badge-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#15803D" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>Aadhaar Verified</span>
                </span>
              </div>

              <div className="card-mock-body">
                <div className="card-title-block">
                  <h4 className="card-item-title">Royal Enfield Classic 350</h4>
                  <span className="card-price-tag tabular-nums">₹1,45,000</span>
                </div>

                <div className="card-specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Year</span>
                    <span className="spec-val">2022</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-val">11,200 km</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Ownership</span>
                    <span className="spec-val">1st Owner</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Condition</span>
                    <span className="spec-val">Like New</span>
                  </div>
                </div>

                <div className="card-chat-preview">
                  <div className="chat-bubble seller">
                    <span>Complete service records available at authorized center.</span>
                  </div>
                  <div className="chat-bubble buyer">
                    <span>Offer proposed: ₹1,38,000 (Immediate UPI upon inspection)</span>
                  </div>
                  <div className="offer-action-bar">
                    <span className="offer-status-label">In-App Negotiation Active</span>
                    <span className="offer-badge-pill">Number Masked</span>
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
