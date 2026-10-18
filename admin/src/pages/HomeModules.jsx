import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const initialModules = [
  { id: 'MOD-01', name: 'Hero Promotional Slider', titleKey: 'Top Carousel', type: 'Carousel', visible: true, order: 1, limit: 5 },
  { id: 'MOD-02', name: 'Service Categories Quick Grid', titleKey: 'Our Top Services', type: 'IconGrid', visible: true, order: 2, limit: 8 },
  { id: 'MOD-03', name: 'Spotlight Deals & Offers', titleKey: 'Flash Deals Near You', type: 'CardSlider', visible: true, order: 3, limit: 6 },
  { id: 'MOD-04', name: 'Popular On-Demand Services', titleKey: 'Most Booked Services', type: 'ListGrid', visible: true, order: 4, limit: 4 },
  { id: 'MOD-05', name: 'Recent Marketplace Classifieds', titleKey: 'Fresh Listings in Your Area', type: 'ProductFeed', visible: true, order: 5, limit: 12 },
  { id: 'MOD-06', name: 'Top Verified Partner Showcase', titleKey: 'Certified Service Professionals', type: 'ProviderSlider', visible: true, order: 6, limit: 5 }
];

export default function HomeModules() {
  const [modules, setModules] = useState(initialModules);
  const [editingMod, setEditingMod] = useState(null);
  const [titleKey, setTitleKey] = useState('');
  const [limit, setLimit] = useState(4);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const toggleVisibility = (id) => {
    setModules(modules.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
    showToast('Module visibility toggled.');
  };

  const moveOrder = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= modules.length) return;
    const items = [...modules];
    const temp = items[index];
    items[index] = items[newIdx];
    items[newIdx] = temp;
    // update order numbers
    setModules(items.map((it, idx) => ({ ...it, order: idx + 1 })));
    showToast('Module layout order updated.');
  };

  const handleSaveEdit = () => {
    if (!editingMod) return;
    setModules(modules.map(m => m.id === editingMod.id ? {
      ...m,
      titleKey,
      limit: Number(limit)
    } : m));
    setEditingMod(null);
    showToast(`Configuration for "${editingMod.name}" saved.`);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Mobile Home Layout Architecture"
        description="Control feed component sequencing, module visibility, and heading titles on the consumer mobile app."
      />

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

      <div className="admin-card">
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Module Name</th>
                <th>Consumer Display Heading</th>
                <th>Layout Component Type</th>
                <th>Item Fetch Limit</th>
                <th>Visibility</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m, idx) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, minWidth: '20px' }}>#{m.order}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button 
                          className="btn-action" 
                          style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={idx === 0}
                          onClick={() => moveOrder(idx, -1)}
                          aria-label="Move Up"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        </button>
                        <button 
                          className="btn-action" 
                          style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={idx === modules.length - 1}
                          onClick={() => moveOrder(idx, 1)}
                          aria-label="Move Down"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {m.id}</div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>"{m.titleKey}"</strong>
                  </td>
                  <td>
                    <span className="badge badge-default">{m.type}</span>
                  </td>
                  <td>
                    <span>{m.limit} items</span>
                  </td>
                  <td>
                    <span 
                      className={`badge ${m.visible ? 'badge-success' : 'badge-default'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleVisibility(m.id)}
                    >
                      {m.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => {
                        setEditingMod(m);
                        setTitleKey(m.titleKey);
                        setLimit(m.limit);
                      }}
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingMod && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '460px', maxWidth: '100%', margin: 0, boxShadow: 'var(--modal-shadow)' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">Configure Module: {editingMod.name}</h3>
              <button
                onClick={() => setEditingMod(null)}
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
              <label className="form-label">Display Heading in App</label>
              <input
                type="text"
                className="form-input"
                value={titleKey}
                onChange={e => setTitleKey(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Item Max Render Limit</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="50"
                value={limit}
                onChange={e => setLimit(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-secondary" onClick={() => setEditingMod(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveEdit}>Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
