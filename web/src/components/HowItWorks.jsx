import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    desc: 'Find verified goods and certified local trade professionals right in your neighborhood radius.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Choose',
    desc: 'Compare listings, inspect transparent upfront pricing, and check verified seller or pro profiles.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Connect, Buy or Book',
    desc: 'Chat securely with masked numbers, make offers, or book home services with OTP milestone protection.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section how-it-works-section">
      <div className="container">
        <div className="section-header-center">
          <h2 className="section-title">How MyBigBazaar Works</h2>
          <p className="section-subtitle">
            Three clear steps to protect your privacy and ensure safe neighborhood transactions.
          </p>
        </div>

        {/* 3 Numbered Steps Grid */}
        <div className="steps-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-card-header">
                <span className="step-number">{step.num}</span>
                <div className="step-icon-wrapper">
                  {step.icon}
                </div>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Trust Assurance Bar */}
        <div className="how-it-works-banner">
          <div className="hiw-banner-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="hiw-banner-text">
            <strong>Transparent pricing.</strong> Individuals post classified ads completely free with 0% commission. Doorstep services feature upfront fixed rate cards with a 30-day rework warranty.
          </div>
        </div>
      </div>
    </section>
  );
}
