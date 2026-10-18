import React from 'react';

const SELLER_STEPS = [
  'Create listing',
  'Add photos & price',
  'Chat with buyers',
  'Receive offers',
  'Mark sold',
];

export default function SellerCallout() {
  return (
    <section className="section seller-callout-section">
      <div className="container">
        <div className="seller-card-wrapper">
          <div className="seller-content">
            <h2 className="seller-title">Sell your items locally.</h2>
            <p className="seller-subtitle">
              Turn what you don&apos;t need into cash. List in minutes, chat with buyers, negotiate safely, and get paid.
            </p>

            {/* 5-Step Flow Pill Sequence */}
            <div className="seller-flow-strip">
              {SELLER_STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <div className="flow-step-tag">
                    <span className="step-tag-idx">{idx + 1}</span>
                    <span className="step-tag-name">{step}</span>
                  </div>
                  {idx < SELLER_STEPS.length - 1 && (
                    <span className="flow-arrow-sep" aria-hidden="true">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="seller-features">
              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="19" y1="5" x2="5" y2="19" />
                    <circle cx="6.5" cy="6.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <h4 className="feature-head">0% Listing Commission</h4>
                  <p className="feature-text">Keep 100% of your sale price. Individuals post classified ads completely free.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                  </svg>
                </div>
                <div>
                  <h4 className="feature-head">Masked In-App Negotiation</h4>
                  <p className="feature-text">Accept, counter, or decline buyer offers directly in chat without sharing your phone number.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4 className="feature-head">Neighborhood Pickup</h4>
                  <p className="feature-text">Connect with verified buyers within your locality for convenient, hand-to-hand transactions.</p>
                </div>
              </div>
            </div>

            <div className="seller-cta-row">
              <a href="#download" className="btn-primary">
                <span>Start Selling</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <span className="seller-note">Free for individual sellers on iOS &amp; Android</span>
            </div>
          </div>

          {/* Right Visual: Clean Listing Studio Card */}
          <div className="seller-visual">
            <div className="preview-sell-box">
              <div className="sell-box-header">
                <span className="sell-header-label">Seller Studio</span>
                <span className="sell-header-sub">Mobile Preview</span>
              </div>
              <div className="sell-box-body">
                <div className="upload-dropzone">
                  <div className="camera-icon-wrap">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <strong>Add Item Photos</strong>
                  <span>Upload up to 5 clear pictures</span>
                </div>
                <div className="input-field-mock">
                  <label>Title</label>
                  <div className="fake-input">Sony PlayStation 5 Disc Edition + 2 Controllers</div>
                </div>
                <div className="input-row-mock">
                  <div className="input-field-mock flex-1">
                    <label>Category</label>
                    <div className="fake-input">Gaming &amp; Consoles</div>
                  </div>
                  <div className="input-field-mock flex-1">
                    <label>Asking Price</label>
                    <div className="fake-input price-val tabular-nums">₹38,000</div>
                  </div>
                </div>
                <div className="fake-submit-btn">
                  <span>Publish to Neighborhood</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
