import React, { useState, useEffect, useMemo } from 'react';
import { FAQS_CATALOG } from '../../../packages/shared/content.js';
import PageHeader from '../components/ui/PageHeader';

const CATEGORIES = [
  'All',
  'General',
  'Buying & Selling',
  'Doorstep Services',
  'Safety & Escrow',
  'Partner Network'
];

export default function FAQs() {
  const [faqs, setFaqs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_faqs_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback to catalog
        }
      }
    }
    return FAQS_CATALOG.map((f, idx) => ({
      ...f,
      order: idx + 1,
      status: 'Published',
      updatedAt: '2026-09-20'
    }));
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    category: 'General',
    question: '',
    answer: '',
    order: 1,
    status: 'Published'
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('admin_faqs_data', JSON.stringify(faqs));
  }, [faqs]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchSearch = searchQuery.trim() === '' ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }).sort((a, b) => a.order - b.order);
  }, [faqs, activeCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      category: activeCategory === 'All' ? 'General' : activeCategory,
      question: '',
      answer: '',
      order: faqs.length + 1,
      status: 'Published'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      status: faq.status || 'Published'
    });
    setShowModal(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast('Please provide both question and answer', 'error');
      return;
    }

    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? {
        ...f,
        ...formData,
        order: Number(formData.order) || f.order,
        updatedAt: new Date().toISOString().slice(0, 10)
      } : f));
      showToast('FAQ updated successfully');
    } else {
      const newFaq = {
        id: `faq-${Date.now().toString().slice(-4)}`,
        ...formData,
        order: Number(formData.order) || faqs.length + 1,
        updatedAt: new Date().toISOString().slice(0, 10)
      };
      setFaqs([...faqs, newFaq]);
      showToast('New FAQ saved to local storage (Awaiting CMS backend sync)');
    }
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    setFaqs(faqs.map(f => {
      if (f.id === id) {
        const next = f.status === 'Published' ? 'Draft' : 'Published';
        showToast(`FAQ "${f.question.slice(0, 24)}..." marked as ${next}`);
        return { ...f, status: next };
      }
      return f;
    }));
  };

  const handleDelete = (id) => {
    setFaqs(faqs.filter(f => f.id !== id));
    showToast('FAQ deleted from portal.');
  };

  const publishedCount = faqs.filter(f => f.status === 'Published').length;
  const draftCount = faqs.filter(f => f.status === 'Draft').length;

  return (
    <div className="admin-page">
      {/* Page Header */}
      <PageHeader
        title="Frequently Asked Questions (FAQ) CMS"
        subtitle="Manage the canonical questions, answers, and helpdesk knowledgebase displayed on the public website and mobile safety portal."
        action={
          <button
            className="btn-primary"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--mbb-radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={handleOpenAdd}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add FAQ Item
          </button>
        }
      />

      {/* Data Truth Notice Banner */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: '#f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <strong>Local Storage Staging Mode:</strong> FAQ updates and reordering are saved to your browser session. Public website synchronisation across separate browser origins is awaiting the backend CMS storage endpoint.
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div className="admin-grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #1548A6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total FAQs
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
            {faqs.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Across 5 functional categories
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Live &amp; Published
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            {publishedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active on landing page accordion
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Draft / In Review
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            {draftCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Hidden from consumer feeds
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`btn-action ${activeCategory === cat ? 'active' : ''}`}
                style={{
                  background: activeCategory === cat ? 'var(--hover-bg)' : 'transparent',
                  borderColor: activeCategory === cat ? 'var(--accent-color)' : 'var(--border-color)',
                  color: activeCategory === cat ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.84rem'
                }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '400px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by question or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* FAQs Management Table */}
      <div className="admin-card">
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Order</th>
                <th style={{ width: '160px' }}>Category</th>
                <th>Question &amp; Answer Excerpt</th>
                <th style={{ width: '120px' }}>Last Updated</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No FAQs match your search query or filter.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map(faq => (
                  <tr key={faq.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>#{faq.order}</span>
                    </td>
                    <td>
                      <span className="badge badge-default" style={{ fontWeight: 600 }}>
                        {faq.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '4px' }}>
                        {faq.question}
                      </div>
                      <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.45',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {faq.answer}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {faq.updatedAt || '2026-09-20'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${faq.status === 'Published' ? 'badge-success' : 'badge-default'}`}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        title="Click to toggle status"
                        onClick={() => toggleStatus(faq.id)}
                      >
                        {faq.status || 'Published'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEdit(faq)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(faq.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '560px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">{editingFaq ? 'Edit FAQ Item' : 'Create FAQ Item'}</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="admin-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Display Sequence Order</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Question</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. How does BigBazaar Safe-Deal Escrow work?"
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Answer Description</label>
                <textarea
                  className="form-textarea"
                  rows="5"
                  placeholder="Provide a thorough, customer-friendly explanation..."
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Publication Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Published">Published (Visible to all users)</option>
                  <option value="Draft">Draft (Internal review only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-action"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    background: 'var(--accent-color, #1548A6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {editingFaq ? 'Save Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Glass Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${toast.type === 'error' ? 'var(--status-danger-border)' : 'var(--border-color)'}`,
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--mbb-radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: toast.type === 'error' ? 'var(--status-danger-text)' : 'var(--text-primary)'
        }}>
          {toast.type === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
