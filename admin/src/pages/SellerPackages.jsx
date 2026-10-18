import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const initialSellerPackages = [
  {
    id: 'PKG-SEL-01',
    name: 'Free Basic Tier',
    price: 0,
    validity: 'Lifetime',
    features: ['Up to 3 Active Listings', 'Standard Search Placement', 'Standard Buyer Chat', 'Basic Analytics'],
    subscribers: 0,
    revenue: 0,
    badgeColor: 'badge-default',
    status: 'Active'
  },
  {
    id: 'PKG-SEL-02',
    name: 'Featured Ad Booster',
    price: 99,
    validity: '7 Days',
    features: ['Top of Category Search', 'Glowing "Featured" Badge', '3x More Buyer Inquiries', 'Priority Image Gallery'],
    subscribers: 0,
    revenue: 0,
    badgeColor: 'badge-info',
    status: 'Active'
  },
  {
    id: 'PKG-SEL-03',
    name: 'Urgent Sale Spotlight',
    price: 149,
    validity: '14 Days',
    features: ['"Urgent Deal" Red Tag', 'Pinned to Homepage Deals', 'Instant Notification to Watchers', 'Highlighted Price Cut Banner'],
    subscribers: 0,
    revenue: 0,
    badgeColor: 'badge-warning',
    status: 'Active'
  },
  {
    id: 'PKG-SEL-04',
    name: 'Pro Seller Business Pass',
    price: 499,
    validity: '30 Days',
    features: ['25 Featured Ads Included', 'Verified Merchant Blue Tick', 'Dedicated Storefront URL', 'Export Customer Leads CSV', 'Zero Ad Renewal Fees'],
    subscribers: 0,
    revenue: 0,
    badgeColor: 'badge-success',
    status: 'Active'
  }
];

export default function SellerPackages() {
  const [packages, setPackages] = useState(initialSellerPackages);
  const [editingPkg, setEditingPkg] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [formData, setFormData] = useState({
    name: '',
    price: 99,
    validity: '7 Days',
    features: '',
    status: 'Active'
  });

  const totalRevenue = packages.reduce((sum, p) => sum + p.revenue, 0);
  const totalSubscribers = packages.reduce((sum, p) => sum + p.subscribers, 0);

  const handleSaveEdit = () => {
    if (!editingPkg || !formData.name) return;
    setPackages(packages.map(p => 
      p.id === editingPkg.id ? {
        ...p,
        name: formData.name,
        price: Number(formData.price),
        validity: formData.validity,
        features: formData.features.split('\n').filter(f => f.trim()),
        status: formData.status
      } : p
    ));
    setEditingPkg(null);
    showToast(`Package "${formData.name}" rules updated successfully.`);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Seller Packages & Ad Monetization"
        subtitle="Classifieds promotion tiers, featured boosts, and merchant subscription plans."
      />

      <div className="admin-grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Package Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Classifieds monetization</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Boost Subscribers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '6px' }}>
            {totalSubscribers.toLocaleString('en-IN')} Sellers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Awaiting boost subscriptions</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>ARPU (Paying Sellers)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#8b5cf6', marginTop: '6px' }}>₹0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Avg revenue per boost purchase</div>
        </div>
      </div>

      <div className="admin-grid-4">
        {packages.map(p => (
          <div key={p.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`badge ${p.badgeColor}`}>{p.validity}</span>
              <span className="badge badge-default">{p.status}</span>
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px' }}>
              {p.name}
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', margin: '8px 0' }}>
              {p.price === 0 ? 'Free' : `₹${p.price}`}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {p.subscribers.toLocaleString('en-IN')} sellers · ₹{p.revenue.toLocaleString('en-IN')} revenue total
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>FEATURES:</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {p.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '12px' }}>
              <button
                className="btn-action btn-edit"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setEditingPkg(p);
                  setFormData({
                    name: p.name,
                    price: p.price,
                    validity: p.validity,
                    features: p.features.join('\n'),
                    status: p.status
                  });
                }}
              >
                Configure Pricing & Rules
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Package Modal */}
      {editingPkg && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '480px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Edit Seller Package — {editingPkg.id}</h3>
              <button 
                onClick={() => setEditingPkg(null)} 
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
              <label className="form-label">Package Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Validity Period</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.validity}
                  onChange={e => setFormData({ ...formData, validity: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Features (one per line)</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={formData.features}
                onChange={e => setFormData({ ...formData, features: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setEditingPkg(null)}>Cancel</button>
              <button className="btn-action btn-edit" onClick={handleSaveEdit}>Save Package</button>
            </div>
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
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
