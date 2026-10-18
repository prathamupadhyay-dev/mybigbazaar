// ============================================================
// Service Providers Management & Partner Operations
// ============================================================
// Full CRUD for service professionals, commission rates, and KYC status.
// ============================================================

import React, { useState, useEffect } from 'react';
import BulkActionBar from '../components/common/BulkActionBar';
import ExportButton from '../components/common/ExportButton';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../utils/api';

export default function AllProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  // Provider CRUD Modal State
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [providerFormData, setProviderFormData] = useState({
    partnerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Plumber',
    city: 'Indore',
    commissionRate: 10,
    status: 'Active'
  });
  const [isSubmittingProvider, setIsSubmittingProvider] = useState(false);

  // Delete Confirm Modal State
  const [deleteConfirmProvider, setDeleteConfirmProvider] = useState(null);

  const loadProviders = () => {
    setLoading(true);
    apiFetch('/api/v1/providers')
      .then(res => res.json())
      .then(json => {
        if (json && Array.isArray(json.data)) {
          const normalized = json.data.map(p => ({
            ...p,
            id: p.id || p._id,
            partnerName: p.partnerName || p.businessName || p.fullName || 'Verified Partner',
            fullName: p.partnerName || p.businessName || p.fullName || 'Verified Partner',
            phoneNumber: p.phone || p.phoneNumber || '—',
            city: p.city || 'Indore',
            category: p.category || 'Home Services',
            commissionRate: typeof p.commissionRate === 'number' ? p.commissionRate : 10,
            status: (p.status || 'Active').toLowerCase(),
            walletBalance: p.walletBalance || 0,
            rating: p.rating || 4.8,
            reviewCount: p.reviewCount || 0
          }));
          setProviders(normalized);
        }
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAddProvider = () => {
    setModalMode('add');
    setEditingProviderId(null);
    setProviderFormData({
      partnerName: '',
      contactPerson: '',
      email: '',
      phone: '',
      category: 'Plumber',
      city: 'Indore',
      commissionRate: 10,
      status: 'Active'
    });
    setProviderModalOpen(true);
  };

  const handleOpenEditProvider = (provider) => {
    setModalMode('edit');
    setEditingProviderId(provider.id);
    setProviderFormData({
      partnerName: provider.partnerName || provider.fullName || '',
      contactPerson: provider.contactPerson || provider.fullName || '',
      email: provider.email === '—' ? '' : provider.email,
      phone: provider.phoneNumber === '—' ? '' : provider.phoneNumber,
      category: provider.category || 'Plumber',
      city: provider.city || 'Indore',
      commissionRate: provider.commissionRate || 10,
      status: provider.status === 'active' ? 'Active' : (provider.status === 'suspended' ? 'Suspended' : 'Pending KYC')
    });
    setProviderModalOpen(true);
  };

  const handleSaveProvider = async (e) => {
    e.preventDefault();
    if (!providerFormData.partnerName.trim() || !providerFormData.email.trim()) {
      showToast('Partner name and email are required.', 'error');
      return;
    }

    setIsSubmittingProvider(true);
    try {
      if (modalMode === 'add') {
        const res = await apiFetch('/api/v1/providers', {
          method: 'POST',
          body: JSON.stringify(providerFormData)
        });
        if (res.ok) {
          showToast(`Provider "${providerFormData.partnerName}" created successfully.`);
          setProviderModalOpen(false);
          loadProviders();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.message || 'Failed to create provider.', 'error');
        }
      } else {
        const res = await apiFetch(`/api/v1/providers/${editingProviderId}`, {
          method: 'PUT',
          body: JSON.stringify(providerFormData)
        });
        if (res.ok) {
          showToast(`Provider "${providerFormData.partnerName}" updated successfully.`);
          setProviderModalOpen(false);
          loadProviders();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.message || 'Failed to update provider.', 'error');
        }
      }
    } catch (err) {
      showToast('Backend connection failed while saving provider.', 'error');
    } finally {
      setIsSubmittingProvider(false);
    }
  };

  const confirmDeleteProvider = async () => {
    if (!deleteConfirmProvider) return;
    const { id, partnerName } = deleteConfirmProvider;
    try {
      const res = await apiFetch(`/api/v1/providers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProviders(prev => prev.filter(p => p.id !== id));
        showToast(`Provider "${partnerName}" deleted permanently.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Failed to delete provider.', 'error');
      }
    } catch (e) {
      showToast('Backend connection failed on delete request.', 'error');
    } finally {
      setDeleteConfirmProvider(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProviders.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = (newStatus) => {
    const updatedIds = [...selectedIds];
    if (updatedIds.length === 0) return;
    setProviders(providers.map(p => updatedIds.includes(p.id) ? { ...p, status: newStatus } : p));
    apiFetch('/api/v1/providers/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ ids: updatedIds, status: newStatus })
    }).catch(console.warn);
    showToast(`Bulk updated ${updatedIds.length} partners to ${newStatus}.`);
    setSelectedIds([]);
  };

  const handleToggleStatus = (provider) => {
    const nextStatus = provider.status === 'active' ? 'suspended' : 'active';
    setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, status: nextStatus } : p));
    apiFetch(`/api/v1/providers/${provider.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    }).catch(console.warn);
    showToast(`Partner ${provider.partnerName || provider.fullName} has been ${nextStatus === 'suspended' ? 'suspended' : 'activated'}.`);
  };

  const filteredProviders = providers.filter(p => {
    const q = (search || '').toLowerCase();
    const nameStr = (p.partnerName || p.fullName || '').toLowerCase();
    const phoneStr = (p.phoneNumber || p.phone || '');
    const cityStr = (p.city || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();

    const matchesSearch =
      nameStr.includes(q) ||
      phoneStr.includes(search || '') ||
      cityStr.includes(q) ||
      catStr.includes(q);

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--mbb-radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: '0.84rem'
          }}
        >
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Service Providers"
        subtitle="Manage registered service professionals, commission rates, and partner accounts."
        breadcrumbs={['Providers', 'Directory']}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenAddProvider}
            style={{
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Provider
          </button>
          <ExportButton
            data={filteredProviders}
            filename="mybigbazaar-service-providers.csv"
            label="Export CSV"
            dateKey="createdAt"
            columns={[
              { key: 'id', label: 'Provider ID' },
              { key: 'name', label: 'Provider Name' },
              { key: 'serviceTitle', label: 'Primary Service' },
              { key: 'category', label: 'Trade Category' },
              { key: 'phone', label: 'Phone' },
              { key: 'city', label: 'City' },
              { key: 'rating', label: 'Rating' },
              { key: 'status', label: 'Status' },
              { key: 'isVerified', label: 'Verified Partner' },
              { key: 'createdAt', label: 'Joined Date' }
            ]}
          />
          <div className="stat-pill" style={{ padding: '6px 12px', background: 'var(--color-sunken, #EEEDE9)', borderRadius: '8px', border: '1px solid var(--color-border, #E7E5E4)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #57534E)', fontWeight: 600 }}>Total: {providers.length}</span>
          </div>
          <div className="stat-pill" style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Active: {providers.filter(p => p.status === 'active').length}</span>
          </div>
        </div>
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ padding: '16px', backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search provider by name, phone, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                color: 'var(--color-text-primary, #1C1917)',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E7E5E4)',
                fontSize: '13.5px',
                background: 'var(--color-panel, #FBFBFA)',
                color: 'var(--color-text-primary, #1C1917)'
              }}
            >
              <option value="All">All Categories</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Tutor">Tutor</option>
              <option value="AC Repair">AC Repair</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Home Services">Home Services</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E7E5E4)',
                fontSize: '13.5px',
                background: 'var(--color-panel, #FBFBFA)',
                color: 'var(--color-text-primary, #1C1917)'
              }}
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="pending kyc">Pending KYC</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="admin-card" style={{ backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-sunken, #EEEDE9)', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                <th style={{ width: '38px', padding: '12px 16px' }}>
                  <input
                    type="checkbox"
                    checked={filteredProviders.length > 0 && selectedIds.length === filteredProviders.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>Provider Name &amp; Phone</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>City</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>Commission (%)</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>Ratings</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary, #57534E)' }}>
                    Loading service partners from backend...
                  </td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary, #57534E)' }}>
                    No service providers registered.
                  </td>
                </tr>
              ) : (
                filteredProviders.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border, #E7E5E4)', background: selectedIds.includes(p.id) ? 'var(--color-sunken, #EEEDE9)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => handleToggleRow(p.id)}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary, #1C1917)', fontSize: '13.5px' }}>{p.partnerName || p.fullName || 'Service Provider'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #57534E)', marginTop: '2px' }}>{p.phoneNumber || p.phone || '—'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12.5px', color: 'var(--color-text-secondary, #57534E)' }}>
                      {p.email || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: 'var(--color-sunken, #EEEDE9)', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary, #1C1917)' }}>
                        {p.category || 'General Service'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-primary, #1C1917)' }}>
                      {p.city || 'Indore'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#1548A6' }}>
                      {p.commissionRate}%
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--color-text-primary, #1C1917)', fontSize: '12.5px' }}>
                        <span style={{ color: '#D97706' }}>★</span>
                        <span>{p.rating || '4.8'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-metadata, #6F6A65)', fontWeight: '400' }}>({p.reviewCount || 0})</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.status === 'active' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontWeight: '600', fontSize: '12px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                          Active
                        </span>
                      ) : p.status.includes('pending') ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#D97706', fontWeight: '600', fontSize: '12px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                          Pending KYC
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#DC2626', fontWeight: '600', fontSize: '12px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '12px' }}
                          onClick={() => handleOpenEditProvider(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '12px' }}
                          onClick={() => setSelectedProvider(p)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          style={{
                            padding: '5px 9px',
                            background: p.status === 'active' ? '#FEE2E2' : '#DCFCE7',
                            color: p.status === 'active' ? '#B91C1C' : '#15803D',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {p.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmProvider(p)}
                          style={{
                            padding: '5px 9px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                          title="Delete partner"
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

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: 'Bulk Activate', icon: 'M5 13l4 4L19 7', onClick: () => handleBulkStatus('active'), variant: 'primary' },
          { label: 'Bulk Suspend', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', onClick: () => handleBulkStatus('suspended'), variant: 'danger' }
        ]}
      />

      {/* Add / Edit Provider Modal */}
      {providerModalOpen && (
        <div className="modal-overlay" onClick={() => setProviderModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'Add Service Provider' : 'Edit Service Provider'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setProviderModalOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProvider}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Business / Partner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={providerFormData.partnerName}
                      onChange={(e) => setProviderFormData({ ...providerFormData, partnerName: e.target.value })}
                      placeholder="e.g. QuickPlumb Services"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={providerFormData.contactPerson}
                      onChange={(e) => setProviderFormData({ ...providerFormData, contactPerson: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={providerFormData.email}
                      onChange={(e) => setProviderFormData({ ...providerFormData, email: e.target.value })}
                      placeholder="partner@bigbazaar.com"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={providerFormData.phone}
                      onChange={(e) => setProviderFormData({ ...providerFormData, phone: e.target.value })}
                      placeholder="+91 98470 12345"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Service Category
                    </label>
                    <select
                      value={providerFormData.category}
                      onChange={(e) => setProviderFormData({ ...providerFormData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Tutor">Tutor</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Home Services">Home Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      City / Area
                    </label>
                    <input
                      type="text"
                      value={providerFormData.city}
                      onChange={(e) => setProviderFormData({ ...providerFormData, city: e.target.value })}
                      placeholder="e.g. Indore"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={providerFormData.commissionRate}
                      onChange={(e) => setProviderFormData({ ...providerFormData, commissionRate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Account &amp; KYC Status
                    </label>
                    <select
                      value={providerFormData.status}
                      onChange={(e) => setProviderFormData({ ...providerFormData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Active">Active (Verified)</option>
                      <option value="Pending KYC">Pending KYC</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setProviderModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmittingProvider}
                >
                  {isSubmittingProvider ? 'Saving...' : modalMode === 'add' ? 'Create Provider' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProvider && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmProvider(null)}>
          <div className="modal-container" style={{ maxWidth: '420px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Confirm Partner Deletion
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete service partner <strong>"{deleteConfirmProvider.partnerName || deleteConfirmProvider.fullName}"</strong>? This will remove their partner profile from the live directory.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmProvider(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={confirmDeleteProvider}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Provider Drawer / Modal */}
      {selectedProvider && (
        <div className="modal-overlay" onClick={() => setSelectedProvider(null)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Partner Details</h3>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedProvider(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {selectedProvider.partnerName || selectedProvider.fullName}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedProvider.phoneNumber} • {selectedProvider.email}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div style={{ background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedProvider.category}</div>
                </div>
                <div style={{ background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Commission</span>
                  <div style={{ fontWeight: 700, color: '#1548A6', marginTop: '2px' }}>{selectedProvider.commissionRate}%</div>
                </div>
                <div style={{ background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>City</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedProvider.city}</div>
                </div>
                <div style={{ background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rating</span>
                  <div style={{ fontWeight: 600, color: '#D97706', marginTop: '2px' }}>★ {selectedProvider.rating} ({selectedProvider.reviewCount} reviews)</div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setSelectedProvider(null)}>Close</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedProvider(null);
                  handleOpenEditProvider(selectedProvider);
                }}
              >
                Edit Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
