import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { LEGAL_DOCUMENTS, TRUST_PILLARS, BRAND_CONFIG } from '../../../../packages/shared/content.js';
import { loadCmsDocument, renderCmsMarkdown } from '../utils/cmsUtils.jsx';

export default function SafetyPage() {
  const [cmsDoc, setCmsDoc] = useState(null);
  const doc = LEGAL_DOCUMENTS.safety;

  useEffect(() => {
    let isMounted = true;
    loadCmsDocument('trust-safety', 'safety').then((data) => {
      if (isMounted && data) {
        setCmsDoc(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="legal-page">
      <Navbar />

      <section className="legal-hero-section">
        <div className="container">
          <div className="legal-hero-content">
            <div className="legal-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Trust</span>
              <span>/</span>
              <span className="current">Safety &amp; Escrow Guidelines</span>
            </div>
            <span className="badge badge-green">Community Fraud Prevention</span>
            <h1 className="legal-title">{cmsDoc?.title || doc.title}</h1>
            <div className="legal-meta">
              <span>Version: <strong>{cmsDoc?.version || doc.version}</strong></span>
              <span className="divider">•</span>
              <span>Last Revised: <strong>{cmsDoc?.lastUpdated || doc.lastUpdated}</strong></span>
              <span className="divider">•</span>
              <span>Moderation Response: <strong>&lt; 15 Minutes</strong></span>
            </div>
            <p className="legal-summary">{cmsDoc?.excerpt || doc.summary}</p>
          </div>
        </div>
      </section>

      {/* Safety Pillars Grid */}
      <section className="section" style={{ background: '#FBFBFA', borderBottom: '1px solid var(--hairline)' }}>
        <div className="container">
          <div className="pillars-grid">
            {TRUST_PILLARS.map((pillar, idx) => (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon-box">
                  <span className="pillar-icon">{pillar.icon}</span>
                </div>
                <span className="pillar-badge">{pillar.badge}</span>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="legal-body-section">
        <div className="container">
          <div className="legal-layout">
            {/* Quick Index / Sidebar */}
            <aside className="legal-sidebar">
              <div className="sidebar-sticky-card">
                <h4 className="sidebar-heading">Safety Advisories</h4>
                <nav className="sidebar-nav">
                  {doc.sections.map((sec, idx) => (
                    <a key={idx} href={`#section-${idx + 1}`} className="sidebar-link">
                      {sec.heading}
                    </a>
                  ))}
                </nav>
                <div className="sidebar-callout">
                  <strong>Report Suspicious Activity</strong>
                  <p>Our 24/7 Trust Desk acts immediately on user alerts:</p>
                  <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="contact-link">
                    {BRAND_CONFIG.supportEmail}
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Document Content */}
            <article className="legal-article">
              {cmsDoc?.content ? (
                <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm mb-6">
                  {renderCmsMarkdown(cmsDoc.content)}
                </div>
              ) : (
                doc.sections.map((sec, idx) => (
                  <div key={idx} id={`section-${idx + 1}`} className="legal-section-block">
                    <h2 className="section-heading">{sec.heading}</h2>
                    <p className="section-paragraph">{sec.content}</p>
                  </div>
                ))
              )}

              <div className="legal-footer-card">
                <h3>The BigBazaar Safe-Deal Guarantee</h3>
                <p>
                  We actively police our network using automated heuristic anomaly detection and Aadhaar identity verification. If you ever feel uneasy about a deal, abort immediately and notify our safety team.
                </p>
                <div className="legal-cta-row">
                  <Link to="/refunds" className="btn-secondary">
                    ← Escrow Refund Policies
                  </Link>
                  <a href={`mailto:${BRAND_CONFIG.supportEmail}?subject=Urgent%20Safety%20Escalation`} className="btn-primary">
                    Report User / Ad to Trust Desk →
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
