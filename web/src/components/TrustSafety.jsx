import React from 'react';
import { Link } from 'react-router-dom';

const TRUST_MECHANISMS = [
  {
    title: 'Verified Phone & KYC',
    desc: 'Sellers and service providers complete mobile verification and Aadhaar KYC checks before listings or services go live.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <line x1="15" y1="8" x2="17" y2="8" />
        <line x1="15" y1="12" x2="17" y2="12" />
        <path d="M7 16h4" />
      </svg>
    ),
  },
  {
    title: 'Safe Deal Guidance',
    desc: 'Clear in-app guidance on inspecting items, meeting safely in public places, and verifying product condition before paying.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'Secure In-App Chat',
    desc: 'Chat and bargain with buyers and sellers directly inside the app. No need to share personal contact info until you are ready.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Report & Moderation',
    desc: 'Easily flag suspicious listings or accounts with one tap. Our safety team reviews reported items promptly to keep the community safe.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
  },
  {
    title: 'Booking Protection',
    desc: 'Transparent upfront rate cards, OTP-verified job starts, and a 30-day rework warranty on domestic repair and servicing tasks.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Customer Support',
    desc: 'Real customer assistance whenever you have questions about an order, need mediation on an exchange, or require help.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

export default function TrustSafety() {
  return (
    <section id="safety" className="section trust-section">
      <div className="container">
        <div className="trust-header">
          <h2 className="section-title">Built on Trust, Verified with Care</h2>
          <p className="section-subtitle">
            Local commerce should never feel uncertain. We built practical safeguards into every step of the experience.
          </p>
        </div>

        <div className="trust-grid-six">
          {TRUST_MECHANISMS.map((mech) => (
            <div key={mech.title} className="trust-item-card">
              <div className="trust-item-header">
                <div className="trust-icon-box">
                  {mech.icon}
                </div>
                <h3 className="trust-card-title">{mech.title}</h3>
              </div>
              <p className="trust-card-desc">{mech.desc}</p>
            </div>
          ))}
        </div>

        {/* Safety Resolution Desk Banner */}
        <div className="safety-pledge-banner">
          <div className="pledge-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="pledge-info">
            <h4 className="pledge-title">Dedicated Safety Guidelines &amp; Community Standards</h4>
            <p className="pledge-text">
              Learn our recommended best practices for safe meeting locations, inspecting electronics, and dispute resolution.
            </p>
          </div>
          <div className="pledge-action">
            <Link to="/safety" className="btn-secondary">
              Review Safety Guidelines
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
