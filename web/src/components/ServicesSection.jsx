import React from 'react';
import { Link } from 'react-router-dom';

const SERVICES_STEPS = [
  {
    num: '01',
    title: 'Find',
    desc: 'Search electrical, plumbing, AC servicing, cleaning, tutoring, and more in your neighborhood.',
  },
  {
    num: '02',
    title: 'Compare',
    desc: 'Review transparent fixed rate cards, background-checked credentials, and verified customer ratings.',
  },
  {
    num: '03',
    title: 'Book',
    desc: 'Select a convenient time slot and confirm your booking instantly through the mobile app.',
  },
  {
    num: '04',
    title: 'Track',
    desc: 'Receive live updates as your verified service professional is dispatched to your doorstep.',
  },
  {
    num: '05',
    title: 'Review',
    desc: 'Inspect the completed work, share your completion OTP, and rate your experience.',
  },
];

export default function ServicesSection() {
  return (
    <section className="editorial-showcase-section services-alt-bg" id="services">
      <div className="container">
        <div className="showcase-grid reverse-on-desktop">
          {/* Left Column (Desktop Visual): Real Service Rate Card */}
          <div className="showcase-visual">
            <div className="editorial-device-card service-theme-card">
              <div className="card-top-tag">
                <span className="card-category-label">Doorstep Service • Upfront Rate Card</span>
                <span className="status-badge-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#15803D" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>KYC Verified Pro</span>
                </span>
              </div>

              <div className="card-mock-body">
                <div className="card-title-block">
                  <h4 className="card-item-title">Electrical &amp; Switchboard Repair</h4>
                  <span className="card-price-tag tabular-nums">₹349 fixed</span>
                </div>

                <div className="service-pro-badge-row">
                  <div className="pro-avatar-mini">SS</div>
                  <div>
                    <strong className="pro-name-text">Sunil Sharma</strong>
                    <span className="pro-credential-text">Master Electrician • Verified Professional • Background Checked</span>
                  </div>
                </div>

                <p className="service-lead-desc">
                  Diagnosis and resolution of tripping MCBs, short circuits, switchboard wire replacements, and appliance earthing.
                </p>

                <div className="service-inclusions">
                  <div className="inc-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Doorstep arrival in 30–45 minutes</span>
                  </div>
                  <div className="inc-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Standard insulation &amp; circuit testing included</span>
                  </div>
                  <div className="inc-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>30-Day worry-free rework warranty</span>
                  </div>
                </div>

                <div className="service-booking-indicator">
                  <span className="flow-step-label">Booking Flow</span>
                  <div className="flow-steps-track">
                    <span className="flow-step-pill active">1. Package</span>
                    <span className="flow-step-pill active">2. Time Slot</span>
                    <span className="flow-step-pill active">3. Address</span>
                    <span className="flow-step-pill active">4. OTP Release</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial 5-Step Process */}
          <div className="showcase-content">
            <h2 className="showcase-title">Local help, when you need it.</h2>
            <p className="showcase-subtitle">
              Find trusted professionals, compare packages, choose a time, and book from the app.
            </p>

            <div className="process-flow-list">
              {SERVICES_STEPS.map((step) => (
                <div key={step.num} className="process-flow-item">
                  <div className="process-step-indicator orange-step">
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
                <span>Download App to Book Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <Link to="/partner" className="btn-secondary">
                <span>Become a Service Partner</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
