import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/ui/PageHeader';

export const initialServiceCategories = [];

export default function ServiceCategories() {
  const [categories, setCategories] = useState(initialServiceCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const catRes = await apiFetch('/service-category/get-all').catch(() => null);

      let catData = [];
      if (catRes && catRes.ok) {
        const catJson = await catRes.json().catch(() => ({}));
        if (catJson && catJson.success && Array.isArray(catJson.data)) {
          catData = catJson.data;
        }
      }

      const mapped = catData.map(item => {
        const catId = item._id || item.id;
        return {
          id: catId,
          name: item.name,
          title: item.title || item.name,
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : ''),
          icon: item.icon || '',
          images: Array.isArray(item.images) ? item.images : [],
          commission: item.commission || 12,
          servicesCount: item.servicesCount || 0,
          providersCount: item.providersCount || 0,
          status: item.status || 'Active'
        };
      });

      setCategories(mapped);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to live backend');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    slug: '',
    icon: '',
    commission: 12,
    status: 'Active'
  });

  const filtered = categories.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (id) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await apiFetch(`/service-category/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setCategories(categories.map(c => 
          c.id === id ? { ...c, status: newStatus } : c
        ));
        showToast(`Category status changed to ${newStatus}.`);
      }
    } catch (e) {
      showToast('Failed to update status on backend: ' + e.message);
    }
  };

  const handleSaveAdd = async () => {
    const categoryName = (formData.name || '').trim();
    if (!categoryName) {
      showToast('Service Category Name is required');
      return;
    }
    const categoryTitle = (formData.title || categoryName).trim();

    setIsSubmitting(true);
    try {
      let createdCatId = null;

      if (selectedImage) {
        const body = new FormData();
        body.append('name', categoryName);
        body.append('title', categoryTitle);
        body.append('icon', selectedImage);
        body.append('images', selectedImage);
        body.append('commission', Number(formData.commission) || 12);

        const res = await apiFetch('/service-category/create', {
          method: 'POST',
          body
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Failed to create service category on backend');
        }
        createdCatId = data.data?._id || data.data?.id;
      } else {
        const payload = {
          name: categoryName,
          title: categoryTitle,
          icon: (formData.icon || '').trim(),
          commission: Number(formData.commission) || 12,
        };

        const res = await apiFetch('/service-category/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Failed to create service category on backend');
        }
        createdCatId = data.data?._id || data.data?.id;
      }

      setShowAddModal(false);
      setFormData({ name: '', title: '', slug: '', icon: '', commission: 12, status: 'Active' });
      setSelectedImage(null);
      showToast(`Service category "${categoryName}" created successfully.`);
      fetchCategories();
    } catch (e) {
      showToast('Error creating service category: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    const categoryName = (formData.name || '').trim();
    if (!categoryName) return;
    const payload = {
      name: categoryName,
      title: (formData.title || categoryName).trim(),
      icon: (formData.icon || '').trim(),
      commission: Number(formData.commission) || 12,
    };

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/service-category/update/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update service category on backend');
      }
      setEditingCategory(null);
      showToast(`Service category "${categoryName}" updated successfully.`);
      fetchCategories();
    } catch (e) {
      showToast('Error updating service category: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service category from live backend?')) {
      try {
        const res = await apiFetch(`/service-category/delete/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Failed to delete service category on backend');
        }
        showToast('Service category deleted from live backend.');
        fetchCategories();
      } catch (e) {
        showToast('Error deleting service category: ' + e.message);
      }
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Categories"
        description="Manage on-demand service categories, commissions, and taxonomy."
        breadcrumbs={['Services', 'Categories']}
      >
        <button 
          className="btn-primary" 
          style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
          onClick={() => {
            setFormData({ name: '', title: '', slug: '', icon: '', commission: 12, status: 'Active' });
            setShowAddModal(true);
          }}
        >
          + Add Category
        </button>
      </PageHeader>

      <div className="admin-grid-4" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Categories</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '6px' }}>{categories.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Categories</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
            {categories.filter(c => c.status === 'Active').length}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Services</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#8b5cf6', marginTop: '6px' }}>
            {categories.reduce((sum, c) => sum + c.servicesCount, 0)}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Commission</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            {categories.length > 0 ? (categories.reduce((sum, c) => sum + c.commission, 0) / categories.length).toFixed(1) : '0.0'}%
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search service categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Platform Commission</th>
                <th>Active Providers</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--hover-bg)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--mac-accent)',
                        flexShrink: 0
                      }}>
                        {c.name ? c.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ background: 'var(--hover-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                      {c.slug}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{c.commission}%</span>
                  </td>
                  <td>{c.providersCount} providers</td>
                  <td>
                    <span 
                      className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-default'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleStatus(c.id)}
                      title="Click to toggle status"
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => {
                          setEditingCategory(c);
                          setFormData({
                            name: c.name,
                            slug: c.slug,
                            icon: c.icon,
                            commission: c.commission,
                            status: c.status
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading service categories from live backend...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                    <div style={{ fontWeight: 600 }}>{errorMessage}</div>
                    <button
                      className="btn-action"
                      style={{ marginTop: '12px', padding: '6px 16px', cursor: 'pointer', display: 'inline-block' }}
                      onClick={fetchCategories}
                    >
                      Retry Connection
                    </button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Service Categories Found
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      No service categories currently exist on the live backend. Click &ldquo;+ Add Category&rdquo; above to create one.
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {(showAddModal || editingCategory) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '480px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">{editingCategory ? 'Edit Service Category' : 'Add New Service Category'}</h3>
              <button 
                type="button"
                onClick={() => { setShowAddModal(false); setEditingCategory(null); }}
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
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Appliance Repair"
                value={formData.name}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    name: val,
                    slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                  });
                }}
              />
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="appliance-repair"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Code / Tag</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. appliance-repair"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Commission Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={e => setFormData({ ...formData, commission: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category Image / Icon File (Optional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={e => setSelectedImage(e.target.files?.[0] || null)}
                style={{ padding: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn-action" 
                onClick={() => { setShowAddModal(false); setEditingCategory(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn-action btn-edit" 
                disabled={!formData.name || isSubmitting}
                onClick={editingCategory ? handleSaveEdit : handleSaveAdd}
              >
                {isSubmitting ? 'Saving to Backend...' : (editingCategory ? 'Save Changes' : 'Create Category')}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--status-success-text)' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
