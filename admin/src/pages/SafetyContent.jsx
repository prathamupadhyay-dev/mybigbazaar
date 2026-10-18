import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const initialSafetyTips = [
  {
    id: 'SAF-01',
    category: 'Buyer Safety',
    title: 'Meet in Busy, Public Daylight Locations',
    description: 'Always arrange in-person product pickups at well-lit public places like metro stations, coffee shops, or shopping malls. Avoid secluded spots.',
    icon: 'location',
    active: true
  },
  {
    id: 'SAF-02',
    category: 'Buyer Safety',
    title: 'Never Send Advance Money for Courier',
    description: 'Fraudulent sellers may demand advance courier or booking charges via UPI. Only pay when you physically inspect and take possession of the item.',
    icon: 'payment-security',
    active: true
  },
  {
    id: 'SAF-03',
    category: 'Seller Safety',
    title: 'Beware of "Scan QR to Receive Money" Scams',
    description: 'Scanning a QR code or entering your UPI PIN always DEBITS money from your account, never credits it. Do not fall for reverse QR scams.',
    icon: 'alert',
    active: true
  },
  {
    id: 'SAF-04',
    category: 'Seller Safety',
    title: 'Verify Bank Balance, Not Just SMS Text',
    description: 'Scammers can send spoofed SMS messages that mimic bank transaction alerts. Always verify actual balance in your official mobile banking app.',
    icon: 'phone-verify',
    active: true
  },
  {
    id: 'SAF-05',
    category: 'Service At-Home Safety',
    title: 'Always Authenticate Technician OTP & ID',
    description: 'Before allowing any service professional into your home, match their photo ID in your BigBazaar app and verify the 4-digit start OTP.',
    icon: 'shield',
    active: true
  },
  {
    id: 'SAF-06',
    category: 'Service At-Home Safety',
    title: 'Do Not Pay Off-Platform Extra Charges',
    description: 'All valid service charges and part costs should be billed through the BigBazaar digital invoice. Paying offline forfeits your 30-day warranty.',
    icon: 'invoice',
    active: true
  }
];

export default function SafetyContent() {
  const [tips, setTips] = useState(initialSafetyTips);
  const [activeTab, setActiveTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const [formData, setFormData] = useState({
    category: 'Buyer Safety',
    title: '',
    description: '',
    icon: '',
    active: true
  });

  const categories = ['All', 'Buyer Safety', 'Seller Safety', 'Service At-Home Safety'];

  const filtered = activeTab === 'All' ? tips : tips.filter(t => t.category === activeTab);

  const toggleActive = (id) => {
    setTips(tips.map(t => t.id === id ? { ...t, active: !t.active } : t));
    showToast('Advisory status updated.');
  };

  const handleSaveAdd = () => {
    if (!formData.title) return;
    const newTip = {
      id: `SAF-0${tips.length + 1}`,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      icon: formData.icon.trim() || 'shield',
      active: formData.active
    };
    setTips([...tips, newTip]);
    setShowAddModal(false);
    showToast(`Advisory "${formData.title}" published.`);
  };

  const handleSaveEdit = () => {
    if (!editingTip || !formData.title) return;
    setTips(tips.map(t => t.id === editingTip.id ? {
      ...t,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      active: formData.active
    } : t));
    setEditingTip(null);
    showToast(`Advisory "${formData.title}" updated.`);
  };

  const handleDelete = (id) => {
    setTips(tips.filter(t => t.id !== id));
    showToast('Advisory removed.');
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Trust & Safety Guidelines CMS"
        description="Consumer education and fraud-prevention advisories presented in the mobile app safety center."
      >
        <button 
          className="btn-primary" 
          onClick={() => {
            setFormData({
              category: 'Buyer Safety',
              title: '',
              description: '',
              icon: '',
              active: true
            });
            setShowAddModal(true);
          }}
        >
          Add Safety Advisory
        </button>
      </PageHeader>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--mbb-radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-primary)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn-action ${activeTab === cat ? 'active' : ''}`}
            style={{
              background: activeTab === cat ? 'var(--hover-bg)' : 'transparent',
              borderColor: activeTab === cat ? 'var(--accent-color)' : 'var(--border-color)',
              color: activeTab === cat ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 600
            }}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="admin-grid-3">
        {filtered.map(tip => (
          <div key={tip.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-default">{tip.category}</span>
              <span 
                className={`badge ${tip.active ? 'badge-success' : 'badge-default'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleActive(tip.id)}
              >
                {tip.active ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--hover-bg)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mac-accent)',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {tip.title}
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '10px', flex: 1 }}>
              {tip.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button 
                className="btn-action btn-edit"
                onClick={() => {
                  setEditingTip(tip);
                  setFormData({
                    category: tip.category,
                    title: tip.title,
                    description: tip.description,
                    icon: tip.icon,
                    active: tip.active
                  });
                }}
              >
                Edit
              </button>
              <button className="btn-action btn-delete" onClick={() => handleDelete(tip.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingTip) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '480px', maxWidth: '100%', margin: 0, boxShadow: 'var(--modal-shadow)' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">{editingTip ? 'Edit Safety Tip' : 'Add Safety Tip'}</h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingTip(null); }}
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

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="Buyer Safety">Buyer Safety</option>
                <option value="Seller Safety">Seller Safety</option>
                <option value="Service At-Home Safety">Service At-Home Safety</option>
              </select>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Advisory Headline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Advisory Code / Tag</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. security-pin"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Explanation</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => { setShowAddModal(false); setEditingTip(null); }}>Cancel</button>
              <button className="btn-action btn-edit" disabled={!formData.title} onClick={editingTip ? handleSaveEdit : handleSaveAdd}>
                {editingTip ? 'Save Changes' : 'Publish Advisory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
