import React from 'react';
import { Link } from 'react-router-dom';

export default function ProviderCallout() {
  return (
    <section className="section provider-callout-section">
      <div className="container">
        <div className="provider-card-wrapper">
          {/* Left Visual: Clean Provider Dispatch Card */}
          <div className="provider-visual">
            <div className="provider-dashboard-mock">
              <div className="mock-dash-top">
                <div className="provider-profile">
                  <div className="pro-avatar-initials">SS</div>
                  <div>
                    <strong className="pro-name">Sunil Sharma</strong>
                    <span className="pro-role">Master Electrician • Verified Professional • Background Checked</span>
                  </div>
                </div>
                <div className="pro-status-badge">
                  <span className="status-dot-green"></span>
                  <span>Active for Leads</span>
                </div>
              </div>

              <div className="earnings-banner">
                <span className="earnings-sub">Provider Payout Platform</span>
                <span className="earnings-amount">Direct Bank Settlement</span>
                <span className="earnings-meta">Instant UPI &amp; NEFT transfers after completed service</span>
              </div>

              <div className="incoming-lead-card">
                <div className="lead-header">
                  <span className="lead-tag">New Booking Request</span>
                  <span className="lead-time">2m ago</span>
                </div>
                <h4 className="lead-job">MCB Fuse Box Trip &amp; Short Circuit Repair</h4>
                <div className="lead-loc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Indiranagar (1.2 km away)</span>
                </div>
                <div className="lead-actions">
                  <button type="button" className="btn-accept">Accept Job (+₹449 Guaranteed)</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & CTAs */}
          <div className="provider-content">
            <h2 className="provider-title">Grow your service business.</h2>
            <p className="provider-subtitle">
              Join as a verified service partner. Get booked by local customers, manage your schedule, and grow your earnings.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <strong>Verified Customer Leads</strong>
                  <p>Receive job bookings directly from neighbors in your chosen service pin codes.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <strong>Set Your Own Rates &amp; Packages</strong>
                  <p>Choose which services you offer and maintain control over your schedule and pricing.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <strong>Direct Daily Settlements</strong>
                  <p>Funds settle promptly into your registered bank or UPI account after job completion.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <strong>Build Your Local Reputation</strong>
                  <p>Earn verified reviews from completed jobs to attract more repeat customers.</p>
                </div>
              </div>
            </div>

            <div className="provider-cta-row">
              <Link to="/partner" className="btn-primary">
                <span>Become a Partner</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#download" className="btn-secondary">
                <span>Get the App</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
