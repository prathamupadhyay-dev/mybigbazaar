/**
 * @file apps/web/src/pages/HomePage.jsx
 * @description Master Landing Page & Product Summary for MyBigBazaar Mobile App.
 * Serves as a brand showcase and feature explainer directing users to the mobile application.
 */

import React from 'react';
import Navbar from '../components/Navbar.jsx';
import HeroBanner from '../components/HeroBanner.jsx';
import BuySellSection from '../components/BuySellSection.jsx';
import ServicesSection from '../components/ServicesSection.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import SellerCallout from '../components/SellerCallout.jsx';
import ProviderCallout from '../components/ProviderCallout.jsx';
import TrustSafety from '../components/TrustSafety.jsx';
import FAQSection from '../components/FAQSection.jsx';
import AppDownload from '../components/AppDownload.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';

const APP_FEATURES = [
  {
    id: 'classifieds',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    tag: 'Zero Listing Fees',
    title: 'Hyperlocal Pre-Owned Marketplace',
    desc: 'List smartphones, two-wheelers, electronics, and home furniture in 2 minutes. Connect directly with verified buyers in your neighborhood with zero middleman commissions.',
    actionText: 'Post Ads in App',
    actionHref: '#download'
  },
  {
    id: 'services',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    tag: 'Upfront Rate Cards',
    title: 'Doorstep Expert Home Services',
    desc: 'Book background-checked electricians, AC technicians, plumbers, and deep cleaning professionals. Transparent rate cards and 30-minute rapid dispatch.',
    actionText: 'Book in App',
    actionHref: '#download'
  },
  {
    id: 'chat',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    tag: 'Privacy Protected',
    title: 'Private In-App Chat & Bargaining',
    desc: 'Propose cash offers, counter-offers, and confirm meeting times right inside the app. Your personal phone number and personal details remain 100% masked.',
    actionText: 'Negotiate in App',
    actionHref: '#download'
  },
  {
    id: 'escrow',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    tag: 'Safe-Deal Escrow',
    title: 'In-Person Inspection Guarantee',
    desc: 'Meet safely in daylight in busy public spots. Test the item thoroughly before releasing any escrow payment or UPI. Complete buyer protection guarantee.',
    actionText: 'Safe-Deal Guarantee',
    actionHref: '#how-it-works'
  },
  {
    id: 'warranty',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    tag: '30-Day Warranty',
    title: 'Worry-Free Service Warranty',
    desc: 'All electrical repairs, AC tune-ups, plumbing installations, and home cleaning booked through MyBigBazaar include an automatic 30-day rework warranty.',
    actionText: 'Learn About Warranty',
    actionHref: '#download'
  },
  {
    id: 'verification',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2545" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
    tag: 'Aadhaar & KYC Verified',
    title: 'Verified Community Members',
    desc: 'Automated identity verification, background-checked technicians, and zero anonymous bots. A safe and reliable hyper-local community network.',
    actionText: 'Explore Safety',
    actionHref: '/safety'
  }
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <Navbar />
      <AuthModal />
      <HeroBanner />

      {/* 1. App Features Showcase (Replaces store category rail & search) */}
      <section className="home-app-features-section" id="app-features">
        <div className="container">
          <div className="section-title-wrap">
            <span className="badge badge-orange">Platform Capabilities</span>
            <h2 className="home-sec-title">What The MyBigBazaar App Does</h2>
            <p className="home-sec-sub">
              A unified mobile application built specifically for your neighborhood. Buy, sell, bargain, and book verified doorstep services from one app.
            </p>
          </div>

          <div className="home-features-grid">
            {APP_FEATURES.map((feat) => (
              <div key={feat.id} className="feature-showcase-card">
                <div className="feature-card-top">
                  <div className="feature-icon-container">
                    {feat.icon}
                  </div>
                  <span className="feature-pill">{feat.tag}</span>
                </div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>
                <div className="feature-card-action">
                  <a href={feat.actionHref} className="feature-link-btn">
                    <span>{feat.actionText}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Download Callout Banner (Directs user to mobile app for all transactions) */}
      <section className="container">
        <div className="home-download-cta-banner">
          <div className="download-cta-text">
            <span className="badge badge-blue">100% Mobile First</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 6px', color: '#0B2545' }}>
              Want to post an ad, sell an item, or book a service?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '520px', lineHeight: '1.5' }}>
              All interactions—listing products, live bargaining chat, instant offers, and booking service technicians—run exclusively inside the MyBigBazaar mobile app.
            </p>
          </div>
          <div className="download-cta-actions">
            <a href="#download" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px', whiteSpace: 'nowrap' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Get The App Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Deep Dive Editorial Sections */}
      <BuySellSection />
      <ServicesSection />
      <HowItWorks />
      <SellerCallout />
      <ProviderCallout />
      <TrustSafety />
      <FAQSection />
      <AppDownload />
      <Footer />

      <style>{`
        .home-app-features-section {
          padding: 64px 0 48px;
          background: #FBFBFA;
        }
        .section-title-wrap {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 36px;
        }
        .home-sec-title {
          font-size: 28px;
          font-weight: 800;
          margin-top: 10px;
          letter-spacing: -0.6px;
          color: #0B2545;
        }
        .home-sec-sub {
          font-size: 15px;
          color: var(--text-secondary);
          margin-top: 8px;
          line-height: 1.6;
        }
        .home-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-showcase-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .feature-showcase-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -4px rgba(11, 37, 69, 0.08);
          border-color: #CBD5E1;
        }
        .feature-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .feature-icon-container {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #EEEDE9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-pill {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          background: #F1F5F9;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .feature-card-title {
          font-size: 17px;
          font-weight: 700;
          color: #0B2545;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .feature-card-desc {
          font-size: 13.5px;
          color: #64748B;
          line-height: 1.6;
          flex: 1;
          margin-bottom: 20px;
        }
        .feature-card-action {
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }
        .feature-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #C2410C;
          text-decoration: none;
          transition: gap 0.15s ease;
        }
        .feature-link-btn:hover {
          gap: 9px;
          color: #9A3412;
        }
        .home-download-cta-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
          border: 1px solid #FED7AA;
          border-radius: 14px;
          padding: 32px 40px;
          margin: 16px 0 48px;
          flex-wrap: wrap;
          gap: 20px;
        }
        @media (max-width: 960px) {
          .home-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .home-download-cta-banner {
            padding: 24px;
          }
        }
        @media (max-width: 640px) {
          .home-features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
