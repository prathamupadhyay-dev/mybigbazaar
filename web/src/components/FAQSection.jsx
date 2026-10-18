import React, { useState, useMemo } from 'react';
import { FAQS_CATALOG, BRAND_CONFIG } from '../../../../packages/shared/content.js';

const CATEGORIES = [
  'All',
  'General',
  'Buying & Selling',
  'Doorstep Services',
  'Safety & Escrow',
  'Partner Network',
];

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState('faq-01');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    return FAQS_CATALOG.filter((faq) => {
      const matchesCategory =
        activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="section faq-section">
      <div className="container">
        {/* Header */}
        <div className="faq-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Clear answers about buying, selling, doorstep services, safety, and payments.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="faq-controls">
          <div className="faq-search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="faq-search-icon"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search questions (e.g. warranty, bargaining, partner)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="faq-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`faq-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-accordion">
          {filteredFaqs.length === 0 ? (
            <div className="faq-empty-state">
              <div className="empty-icon-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3>No matching questions found</h3>
              <p>Try searching with different keywords or reset the category filter.</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-left">
                      <span className="faq-category-tag">{faq.category}</span>
                      <span className="faq-question-text">{faq.question}</span>
                    </div>
                    <span className="faq-chevron" aria-hidden="true">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer-panel">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Banner Card */}
        <div className="faq-support-card">
          <div className="support-card-content">
            <h4 className="support-title">Still have questions?</h4>
            <p className="support-desc">
              Our support team is available 7 days a week to assist with listings, bookings, or account queries.
            </p>
          </div>
          <div className="support-card-action">
            <a
              href={`mailto:${BRAND_CONFIG.supportEmail}?subject=MyBigBazaar%20Inquiry`}
              className="btn-primary support-cta-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
