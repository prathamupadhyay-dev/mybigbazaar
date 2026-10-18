import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const initialServicePackages = [
  {
    id: 'PKG-SVC-01',
    name: 'Quick Diagnostic & Inspection',
    tier: 'Basic',
    category: 'General Home Repair',
    price: 199,
    duration: '45 mins',
    warranty: '7 Days',
    features: ['On-site technician visit', 'Complete problem diagnosis', 'Transparent cost quotation', 'Minor screw/seal fixes included'],
    popular: false,
    status: 'Active',
    subscribersCount: 0
  },
  {
    id: 'PKG-SVC-02',
    name: 'Standard Comprehensive Service',
    tier: 'Standard',
    category: 'Appliance & Cleaning',
    price: 699,
    duration: '2 hrs',
    warranty: '30 Days',
    features: ['Full equipment tune-up', 'Consumables & filter cleaning', 'Post-service performance test', '30-day rework warranty'],
    popular: true,
    status: 'Active',
    subscribersCount: 0
  },
  {
    id: 'PKG-SVC-03',
    name: 'Master Deep Care & Sanitization',
    tier: 'Premium',
    category: 'Home Cleaning & Pest',
    price: 1499,
    duration: '4 hrs',
    warranty: '60 Days',
    features: ['Hospital-grade chemicals', 'Heavy machinery pressure wash', 'Complete deodorization & sterilization', 'Priority re-visit guarantee'],
    popular: false,
    status: 'Active',
    subscribersCount: 0
  },
  {
    id: 'PKG-SVC-04',
    name: 'Annual Home Care AMC',
    tier: 'Comprehensive Service',
    category: 'Full Home Maintenance',
    price: 4999,
    duration: '1 Year (4 Visits)',
    warranty: '365 Days',
    features: ['4 Scheduled seasonal visits', 'Unlimited emergency plumbing & electrical calls', 'Zero visiting fee all year', '10% discount on spare parts'],
    popular: false,
    status: 'Active',
    subscribersCount: 0
  }
];

export default function ServicePackages() {
  const [packages, setPackages] = useState(initialServicePackages);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tier: 'Standard',
    category: 'General Services',
    price: 599,
    duration: '2 hrs',
    warranty: '30 Days',
    features: '',
    popular: false,
    status: 'Active'
  });

  const toggleStatus = (id) => {
    setPackages(packages.map(p => {
      if (p.id === id) {
        const next = p.status === 'Active' ? 'Inactive' : 'Active';
        showToast(`Package status updated to ${next}`);
        return { ...p, status: next };
      }
      return p;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.name) return;
    const newPkg = {
      id: `PKG-SVC-0${packages.length + 1}`,
      name: formData.name,
      tier: formData.tier,
      category: formData.category,
      price: Number(formData.price),
      duration: formData.duration,
      warranty: formData.warranty,
      features: formData.features.split('\n').filter(f => f.trim()),
      popular: formData.popular,
      status: formData.status,
      subscribersCount: 0
    };
    setPackages([...packages, newPkg]);
    setShowAddModal(false);
    showToast('Package tier created successfully');
  };

  const handleSaveEdit = () => {
    if (!editingPackage || !formData.name) return;
    setPackages(packages.map(p => p.id === editingPackage.id ? {
      ...p,
      name: formData.name,
      tier: formData.tier,
      category: formData.category,
      price: Number(formData.price),
      duration: formData.duration,
      warranty: formData.warranty,
      features: formData.features.split('\n').filter(f => f.trim()),
      popular: formData.popular,
      status: formData.status
    } : p));
    setEditingPackage(null);
    showToast('Package tier updated');
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Service Packages & Bundles CMS"
        subtitle="Configure multi-tier service packages, warranty durations, and bundled feature inclusions."
        action={
          <button 
            className="btn-primary" 
            onClick={() => {
              setFormData({
                name: '',
                tier: 'Standard',
                category: 'General Services',
                price: 599,
                duration: '2 hrs',
                warranty: '30 Days',
                features: '',
                popular: false,
                status: 'Active'
              });
              setShowAddModal(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Package Tier
          </button>
        }
      />

      <div className="admin-grid-4" style={{ marginBottom: '24px' }}>
        {packages.map(pkg => (
          <div key={pkg.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {pkg.popular && (
              <span className="badge badge-warning" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                Most Popular
              </span>
            )}
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {pkg.tier} Tier
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {pkg.name}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', margin: '12px 0' }}>
              ₹{pkg.price}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Duration: <strong>{pkg.duration}</strong> · Warranty: <strong>{pkg.warranty}</strong>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>INCLUSIONS:</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pkg.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span 
                className={`badge ${pkg.status === 'Active' ? 'badge-success' : 'badge-default'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleStatus(pkg.id)}
              >
                {pkg.status}
              </span>
              <button 
                className="btn-action btn-edit"
                onClick={() => {
                  setEditingPackage(pkg);
                  setFormData({
                    name: pkg.name,
                    tier: pkg.tier,
                    category: pkg.category,
                    price: pkg.price,
                    duration: pkg.duration,
                    warranty: pkg.warranty,
                    features: pkg.features.join('\n'),
                    popular: pkg.popular,
                    status: pkg.status
                  });
                }}
              >
                Edit Package
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingPackage) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '500px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">{editingPackage ? 'Edit Package Tier' : 'Create Package Tier'}</h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingPackage(null); }}
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
                <label className="form-label">Tier Type</label>
                <select className="form-select" value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })}>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Comprehensive Service">Comprehensive Service</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Duration SLA</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.warranty}
                  onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Features / Inclusions (One per line)</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={formData.features}
                onChange={e => setFormData({ ...formData, features: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="popularPkgCheck"
                checked={formData.popular}
                onChange={e => setFormData({ ...formData, popular: e.target.checked })}
              />
              <label htmlFor="popularPkgCheck" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Highlight as 'Most Popular' Choice
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn-action" 
                onClick={() => { setShowAddModal(false); setEditingPackage(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn-action btn-edit" 
                disabled={!formData.name}
                onClick={editingPackage ? handleSaveEdit : handleSaveAdd}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
