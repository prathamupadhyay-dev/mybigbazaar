import React, { useState } from 'react';
import { STORE_DOWNLOAD_CONFIG } from '../../../packages/shared/content.js';

export default function AppDownload() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.trim().length === 10) {
      setLinkSent(true);
    }
  };

  return (
    <section id="download" className="section download-section">
      <div className="container">
        <div className="download-card">
          <div className="download-content">
            <h2 className="download-title">Everything local, right in your pocket.</h2>
            <p className="download-subtitle">
              Download the MyBigBazaar app for iOS and Android. Get instant alerts when buyers make offers, track your doorstep technician, and use code <span className="code-pill">FIRST20</span> for 20% off your first home service booking.
            </p>

            {/* App Store & Direct APK Buttons */}
            <div className="store-buttons">
              <a
                href="/downloads/mybigbazaar-v1.0.0.apk"
                download="MyBigBazaar-v1.0.0.apk"
                className="store-btn apk-btn"
                title="Download Android APK directly"
                style={{ backgroundColor: '#C2410C', borderColor: '#C2410C' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.081 12 8.081s-3.5902.3306-5.1367.8687L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.152.5676l1.9972 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                </svg>
                <div className="btn-text">
                  <span className="btn-small">DOWNLOAD APK</span>
                  <span className="btn-big">Android Release</span>
                </div>
              </a>

              <a
                href={STORE_DOWNLOAD_CONFIG.android.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="store-btn"
                title={STORE_DOWNLOAD_CONFIG.android.badgeText}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186c-.378-.344-.61-.87-.61-1.48V3.294c0-.61.232-1.136.61-1.48zm11.235 11.235L5.753 22.14l10.984-6.28-1.893-2.811zM18.84 9.947l-2.96 1.693 2.052 2.052 1.133-.648c.95-.543.95-1.43 0-1.974l-.225-.123zm-13.087-7.9l9.091 9.091 1.893-2.812L5.753 1.924c-.001.002-.001.002 0 .003z"/>
                </svg>
                <div className="btn-text">
                  <span className="btn-small">GET IT ON</span>
                  <span className="btn-big">Google Play</span>
                </div>
              </a>

              <a
                href={STORE_DOWNLOAD_CONFIG.ios.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="store-btn"
                title={STORE_DOWNLOAD_CONFIG.ios.badgeText}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.56.64-1.06 1.69-.93 2.71 1.01.08 2.03-.5 2.65-1.21z"/>
                </svg>
                <div className="btn-text">
                  <span className="btn-small">DOWNLOAD ON</span>
                  <span className="btn-big">App Store</span>
                </div>
              </a>
            </div>

            {/* SMS Link Capture */}
            <div className="sms-capture">
              <span className="sms-label">Or receive an instant SMS download link:</span>
              {linkSent ? (
                <div className="sms-success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Download link sent to +91 {phoneNumber}. Please check your SMS.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="sms-form">
                  <div className="sms-input-group">
                    <span className="sms-prefix">+91</span>
                    <input 
                      type="tel" 
                      placeholder="Enter 10-digit mobile number" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      aria-label="10-digit mobile number"
                    />
                  </div>
                  <button type="submit" className="btn-primary btn-sms">
                    Send Link
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Visual: Interactive QR Code Download Box */}
          <div className="download-qr-box">
            <a
              href="/downloads/mybigbazaar-v1.0.0.apk"
              download="MyBigBazaar-v1.0.0.apk"
              className="qr-card block hover:opacity-95 transition-all text-center no-underline"
              title="Click or scan to download Android APK directly"
            >
              <div className="qr-wrapper">
                <svg width="150" height="150" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="QR Code to Download Mobile App">
                  <rect width="160" height="160" rx="12" fill="#FBFBFA"/>
                  <rect x="16" y="16" width="36" height="36" rx="6" fill="#0B2545"/>
                  <rect x="24" y="24" width="20" height="20" rx="2" fill="#FBFBFA"/>
                  <rect x="28" y="28" width="12" height="12" rx="2" fill="#C2410C"/>

                  <rect x="108" y="16" width="36" height="36" rx="6" fill="#0B2545"/>
                  <rect x="116" y="24" width="20" height="20" rx="2" fill="#FBFBFA"/>
                  <rect x="120" y="28" width="12" height="12" rx="2" fill="#C2410C"/>

                  <rect x="16" y="108" width="36" height="36" rx="6" fill="#0B2545"/>
                  <rect x="24" y="116" width="20" height="20" rx="2" fill="#FBFBFA"/>
                  <rect x="28" y="120" width="12" height="12" rx="2" fill="#C2410C"/>

                  <rect x="62" y="16" width="8" height="8" fill="#1C1917"/>
                  <rect x="78" y="16" width="12" height="8" fill="#1C1917"/>
                  <rect x="62" y="32" width="16" height="8" fill="#1C1917"/>
                  <rect x="86" y="32" width="12" height="8" fill="#1C1917"/>
                  <rect x="62" y="48" width="8" height="16" fill="#1C1917"/>
                  <rect x="78" y="48" width="16" height="8" fill="#1C1917"/>
                  <rect x="16" y="62" width="16" height="8" fill="#1C1917"/>
                  <rect x="40" y="62" width="8" height="16" fill="#1C1917"/>
                  <rect x="108" y="62" width="12" height="8" fill="#1C1917"/>
                  <rect x="130" y="62" width="14" height="12" fill="#1C1917"/>
                  <rect x="62" y="74" width="24" height="8" fill="#0B2545"/>
                  <rect x="94" y="74" width="16" height="8" fill="#1C1917"/>
                  <rect x="20" y="86" width="24" height="8" fill="#1C1917"/>
                  <rect x="62" y="90" width="12" height="16" fill="#1C1917"/>
                  <rect x="82" y="90" width="8" height="8" fill="#C2410C"/>
                  <rect x="98" y="90" width="14" height="16" fill="#1C1917"/>
                  <rect x="120" y="90" width="24" height="8" fill="#1C1917"/>
                  <rect x="62" y="114" width="24" height="8" fill="#1C1917"/>
                  <rect x="94" y="114" width="12" height="12" fill="#1C1917"/>
                  <rect x="114" y="114" width="14" height="24" fill="#0B2545"/>
                  <rect x="62" y="130" width="8" height="14" fill="#1C1917"/>
                  <rect x="78" y="130" width="24" height="8" fill="#1C1917"/>
                  <rect x="136" y="130" width="8" height="14" fill="#1C1917"/>
                </svg>
              </div>
              <div className="qr-text">
                <strong style={{ color: '#1C1917' }}>Scan or Click to download</strong>
                <p style={{ color: '#C2410C', fontWeight: '600', marginTop: '2px' }}>Android Release APK (v1.0.0)</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
