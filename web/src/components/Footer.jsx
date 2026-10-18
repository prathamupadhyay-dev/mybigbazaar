import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_URL, API_BASE } from '../config.js';

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('site_logo') || '/client-logo-white-transparent.png');

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/logo/get-all`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d?.logo?.logo) {
          const full = d.logo.logo.startsWith('http')
            ? d.logo.logo
            : `${API_BASE}${d.logo.logo.startsWith('/') ? '' : '/'}${d.logo.logo}`;
          setLogoUrl(full);
          localStorage.setItem('site_logo', full);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <footer className="footer-horizontal">
      <div className="container">
        {/* Main Horizontal Bar */}
        <div className="footer-main-row">
          {/* Brand Info & Compliance */}
          <div className="footer-brand-wrap">
            <Link to="/" className="footer-brand-link" aria-label="MyBigBazaar Home">
              <img
                src={logoUrl}
                alt="MyBigBazaar Logo"
                className="footer-logo-img"
                onError={(e) => { e.target.src = '/client-logo-white-transparent.png'; }}
              />
              <span className="footer-brand-title">
                MyBig<span className="text-orange">Bazaar</span>
              </span>
            </Link>
            <span className="footer-brand-tagline">
              Hyperlocal super-app for verified classifieds &amp; doorstep services
            </span>
            <div className="footer-compliance-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>ISO 27001 &bull; DPDPA 2023 Compliant</span>
            </div>
          </div>

          {/* Horizontal Nav Links */}
          <nav className="footer-horizontal-links" aria-label="Footer Navigation">
            <div className="footer-link-group">
              <span className="footer-group-label">App</span>
              <a href="/#download" className="footer-nav-item font-semibold text-orange">Get App</a>
              <a href="/#app-features" className="footer-nav-item">Features</a>
              <Link to="/partner" className="footer-nav-item">Partner</Link>
            </div>

            <div className="footer-link-group">
              <span className="footer-group-label">Legal</span>
              <Link to="/privacy" className="footer-nav-item">Privacy Policy</Link>
              <Link to="/terms" className="footer-nav-item">Terms of Service</Link>
              <Link to="/refunds" className="footer-nav-item">Refund Policy</Link>
              <Link to="/safety" className="footer-nav-item">Trust &amp; Safety</Link>
            </div>

            <div className="footer-link-group">
              <span className="footer-group-label">Support</span>
              <Link to="/support" className="footer-nav-item">Grievance Desk</Link>
              <Link to="/delete-account" className="footer-nav-item text-danger">Data Deletion</Link>
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-nav-item footer-admin-link"
                title="Internal Management Portal"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Admin</span>
              </a>
            </div>
          </nav>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="footer-bottom-row">
          <div className="footer-statutory-info">
            <span>&copy; {new Date().getFullYear()} MyBigBazaar Marketplace India Pvt. Ltd.</span>
            <span className="footer-dot">&bull;</span>
            <span>CIN: U72900MP2025PTC078129</span>
            <span className="footer-dot">&bull;</span>
            <span>South Tukoganj, Indore, MP 452001</span>
          </div>

          <div className="footer-grievance-info">
            <span className="footer-desk-label">Statutory Nodal Desk:</span>
            <a href="tel:18008892227" className="footer-tel-link">1800-889-2227</a>
            <span className="footer-dot">&bull;</span>
            <a href="mailto:grievance@mybigbazaar.com" className="footer-mail-link">grievance@mybigbazaar.com</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-horizontal {
          background: #0B2545;
          color: #FBFBFA;
          border-top: 1px solid #1E293B;
          padding: 24px 0 18px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.5;
        }
        .footer-main-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .footer-brand-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .footer-brand-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #FBFBFA;
        }
        .footer-logo-img {
          height: 28px;
          width: 28px;
          object-fit: contain;
        }
        .footer-brand-title {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #FBFBFA;
        }
        .footer-brand-title .text-orange {
          color: #EA580C;
        }
        .footer-brand-tagline {
          color: #94A3B8;
          font-size: 11.5px;
          padding-left: 12px;
          border-left: 1px solid rgba(255, 255, 255, 0.15);
          max-width: 320px;
        }
        .footer-compliance-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(51, 65, 85, 0.7);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #E2E8F0;
        }
        .footer-horizontal-links {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .footer-link-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .footer-group-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748B;
          margin-right: 2px;
        }
        .footer-nav-item {
          color: #CBD5E1;
          text-decoration: none;
          font-size: 12px;
          transition: color 0.15s ease;
        }
        .footer-nav-item:hover {
          color: #FBFBFA;
          text-decoration: underline;
        }
        .footer-nav-item.text-orange {
          color: #F97316;
        }
        .footer-nav-item.text-danger {
          color: #F87171;
        }
        .footer-admin-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 2px 7px;
          border-radius: 4px;
          color: #E2E8F0;
        }
        .footer-admin-link:hover {
          background: rgba(255, 255, 255, 0.16);
          color: #FFF;
          text-decoration: none;
        }
        .footer-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 14px;
          font-size: 11px;
          color: #64748B;
        }
        .footer-statutory-info,
        .footer-grievance-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .footer-dot {
          color: #475569;
        }
        .footer-desk-label {
          color: #94A3B8;
          font-weight: 600;
        }
        .footer-tel-link,
        .footer-mail-link {
          color: #94A3B8;
          text-decoration: none;
          font-weight: 600;
        }
        .footer-tel-link:hover,
        .footer-mail-link:hover {
          color: #F97316;
          text-decoration: underline;
        }
        @media (max-width: 900px) {
          .footer-brand-tagline {
            display: none;
          }
          .footer-main-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .footer-horizontal-links {
            gap: 16px;
          }
          .footer-bottom-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </footer>
  );
}
