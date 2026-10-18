import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ExportButton from '../components/common/ExportButton';
import PageHeader from '../components/ui/PageHeader';

export default function Taxes() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [formData, setFormData] = useState({ taxName: '', taxPercentage: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch taxes from live backend
  const fetchTaxes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiGet('/tax/get-all');
      const list = Array.isArray(data.taxes) ? data.taxes : (Array.isArray(data.data) ? data.data : []);
      setTaxes(list);
    } catch (err) {
      setErrorMsg(String(err?.message || 'Failed to load taxes from live backend'));
      setTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const openCreateModal = () => {
    setEditingTax(null);
    setFormData({ taxName: '', taxPercentage: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (tax) => {
    setEditingTax(tax);
    setFormData({
      taxName: tax.taxName || '',
      taxPercentage: String(tax.taxPercentage ?? '')
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTax(null);
    setFormData({ taxName: '', taxPercentage: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.taxName.trim();
    if (!trimmedName) {
      errors.taxName = 'Tax name is required (e.g. GST 18%, Service Tax 5%)';
    } else if (trimmedName.length < 2) {
      errors.taxName = 'Tax name must be at least 2 characters';
    }

    const pctStr = String(formData.taxPercentage).trim();
    if (!pctStr) {
      errors.taxPercentage = 'Tax percentage is required';
    } else {
      const num = Number(pctStr);
      if (isNaN(num)) {
        errors.taxPercentage = 'Tax percentage must be a valid number';
      } else if (num < 0) {
        errors.taxPercentage = 'Tax percentage cannot be negative';
      } else if (num > 100) {
        errors.taxPercentage = 'Tax percentage cannot exceed 100%';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      taxName: formData.taxName.trim(),
      taxPercentage: Number(formData.taxPercentage)
    };

    try {
      if (editingTax) {
        const res = await apiPut(`/tax/update/${editingTax._id}`, payload);
        showToast(res.message || 'Tax rule updated successfully!', 'success');
      } else {
        const res = await apiPost('/tax/create', payload);
        showToast(res.message || 'New tax rule created successfully!', 'success');
      }
      closeModal();
      await fetchTaxes();
    } catch (err) {
      showToast(err.message || 'Operation failed on backend', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTax = async (tax) => {
    if (!window.confirm(`Are you sure you want to permanently delete tax rule "${tax.taxName}" (${tax.taxPercentage}%) from the live backend?`)) {
      return;
    }

    try {
      const res = await apiDelete(`/tax/delete/${tax._id}`);
      showToast(res.message || 'Tax deleted successfully from database', 'success');
      setTaxes(prev => prev.filter(t => t._id !== tax._id));
    } catch (err) {
      showToast(err.message || 'Failed to delete tax rule', 'error');
    }
  };

  const filtered = taxes.filter(t => 
    (t.taxName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(t.taxPercentage || '').includes(searchTerm) ||
    (t._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Toast Alert Banner */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <PageHeader
        title="Taxes"
        description="Tax rates applied to physical products, orders, and services."
        breadcrumbs={['Commerce', 'Taxes']}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExportButton
            data={taxes.map(t => ({
              id: t._id,
              name: t.taxName,
              percentage: `${t.taxPercentage}%`,
              created: t.createdAt
            }))}
            filename="mybigbazaar-taxes-master.csv"
            label="Export Taxes"
            variant="secondary"
          />
          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>+</span> Add Tax
          </button>
        </div>
      </PageHeader>

      {/* Search and Telemetry Toolbar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search tax name, percentage, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                maxWidth: '400px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSearchTerm('')}
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filtered.length}</strong> of <strong>{taxes.length}</strong> live tax rule{taxes.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading live tax rules from backend...
          </div>
        ) : errorMsg ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#DC2626' }}>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Unable to Load Tax Rules</div>
            <div style={{ fontSize: '13px', color: '#7F1D1D' }}>{String(errorMsg)}</div>
            <div style={{ marginTop: '12px' }}>
              <button type="button" className="btn-secondary" onClick={fetchTaxes}>Retry</button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {searchTerm ? 'No tax rules match your search query.' : 'No tax rules registered yet. Click "Create New Tax" above to add the first rule.'}
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--header-bg, rgba(255, 255, 255, 0.02))', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tax Rule Name</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Rate (%)</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>System Tax ID</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Created At</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tax => (
                  <tr key={tax._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {tax.taxName}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(21, 72, 166, 0.15)',
                        color: 'var(--accent-color, #1548a6)',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        {tax.taxPercentage}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {tax._id}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {tax.createdAt ? new Date(tax.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditModal(tax)}
                          style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: '4px' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteTax(tax)}
                          style={{
                            padding: '5px 12px',
                            fontSize: '0.76rem',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--modal-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {editingTax ? 'Edit Tax Rate' : 'Add Tax Rate'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
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

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Tax Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GST 18%, VAT 5%"
                  value={formData.taxName}
                  onChange={e => setFormData({ ...formData, taxName: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: formErrors.taxName ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                  autoFocus
                />
                {formErrors.taxName && (
                  <div style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '4px' }}>
                    {formErrors.taxName}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Tax Percentage (%) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 18 or 5.5"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxPercentage}
                  onChange={e => setFormData({ ...formData, taxPercentage: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: formErrors.taxPercentage ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
                {formErrors.taxPercentage && (
                  <div style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '4px' }}>
                    {formErrors.taxPercentage}
                  </div>
                )}
                <span style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Must be between 0% and 100%. Gross billing uses this rate.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                  style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : (editingTax ? 'Update Tax' : 'Create Tax')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
