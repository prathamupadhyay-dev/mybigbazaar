import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../utils/api';

export default function ServiceCatalogue() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCategories, setLiveCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      let res = await apiFetch('/service/get-all?limit=100');
      if (!res.ok) {
        res = await apiFetch('/api/v1/services?limit=100');
      }
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const raw = Array.isArray(json.data) ? json.data : (Array.isArray(json.services) ? json.services : (Array.isArray(json) ? json : []));
        const normalized = raw.map((s, idx) => ({
          id: s._id || s.id || `SVC-${idx + 1}`,
          name: s.name || s.title || 'Service Offering',
          categoryId: s.serviceCategoryId?._id || s.serviceCategoryId || '',
          category: s.serviceCategoryId?.name || s.serviceCategoryId?.title || s.category || 'General',
          duration: s.duration || (s.durationHours ? `${s.durationHours} hrs` : '1 hr'),
          basePrice: Number(s.price || s.basePrice) || 0,
          popular: !!s.popular,
          status: s.status === 'live' || s.status === 'Active' ? 'Active' : 'Draft',
          bookingsCount: s.bookingsCount || s.totalOrders || 0,
          rating: s.rating || 4.9
        }));
        setServices(normalized);
      }
    } catch (err) {
      console.warn('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch live categories from backend
  useEffect(() => {
    let isMounted = true;
    const fetchTaxonomy = async () => {
      setIsLoadingCategories(true);
      try {
        const catRes = await apiFetch('/service-category/get-all').catch(() => null);

        if (isMounted && catRes && catRes.ok) {
          const catJson = await catRes.json().catch(() => ({}));
          if (catJson && Array.isArray(catJson.data)) {
            setLiveCategories(catJson.data);
          }
        }
      } catch (err) {
        console.warn('Error fetching categories:', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };

    fetchTaxonomy();
    return () => { isMounted = false; };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    category: '',
    duration: '1 hr',
    basePrice: 499,
    popular: false,
    status: 'Active'
  });

  const categoriesForFilter = [
    'All',
    ...liveCategories.map(c => c.name || c.title).filter(Boolean)
  ];

  const filtered = services.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(term) || 
      (s.id || '').toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const togglePopular = async (service) => {
    const nextPopular = !service.popular;
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, popular: nextPopular } : s));
    showToast(nextPopular ? 'Marked as spotlight featured' : 'Removed from spotlight');
    try {
      await apiFetch(`/service/update/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular: nextPopular })
      });
    } catch {}
  };

  const toggleStatus = async (service) => {
    const nextStatus = service.status === 'Active' ? 'Draft' : 'Active';
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: nextStatus } : s));
    showToast(`Service status updated to ${nextStatus}`);
    try {
      await apiFetch(`/service/update/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus === 'Active' ? 'live' : 'draft' })
      });
    } catch {}
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = liveCategories.find(c => String(c._id || c.id) === String(catId));

    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      category: catObj?.name || catObj?.title || ''
    }));
  };

  const handleOpenAdd = () => {
    const defaultCat = liveCategories[0];
    const catId = defaultCat?._id || '';
    const catName = defaultCat?.name || defaultCat?.title || 'Home Services';

    setFormData({
      name: '',
      categoryId: catId,
      category: catName,
      duration: '1 hr',
      basePrice: 499,
      popular: false,
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formData.name.trim()) {
      showToast('Please enter a service title', 'error');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      title: formData.name.trim(),
      serviceCategoryId: formData.categoryId,
      price: Number(formData.basePrice) || 0,
      basePrice: Number(formData.basePrice) || 0,
      duration: formData.duration || '1 hr',
      popular: !!formData.popular,
      status: formData.status === 'Active' ? 'live' : 'draft'
    };

    try {
      const res = await apiFetch('/service/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Service created successfully');
        setShowAddModal(false);
        fetchServices();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to create service', 'error');
      }
    } catch (e) {
      showToast('Backend connection error', 'error');
    }
  };

  const handleOpenEdit = (s) => {
    setEditingService(s);
    setFormData({
      name: s.name || '',
      categoryId: s.categoryId || '',
      category: s.category || '',
      duration: s.duration || '1 hr',
      basePrice: s.basePrice || 0,
      popular: !!s.popular,
      status: s.status || 'Active'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingService || !formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      title: formData.name.trim(),
      serviceCategoryId: formData.categoryId,
      price: Number(formData.basePrice) || 0,
      basePrice: Number(formData.basePrice) || 0,
      duration: formData.duration,
      popular: !!formData.popular,
      status: formData.status === 'Active' ? 'live' : 'draft'
    };

    try {
      const res = await apiFetch(`/service/update/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Service offering updated');
        setEditingService(null);
        fetchServices();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to update service', 'error');
      }
    } catch {
      showToast('Backend connection error', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteServiceId) return;
    try {
      const res = await apiFetch(`/service/delete/${deleteServiceId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Service deleted from catalogue');
        setDeleteServiceId(null);
        fetchServices();
      } else {
        showToast('Failed to delete service', 'error');
      }
    } catch {
      showToast('Backend connection error', 'error');
    }
  };

  return (
    <div className="admin-page" style={{ backgroundColor: 'var(--color-canvas, #F6F5F2)', paddingBottom: '40px' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            border: '1px solid var(--color-border, #E7E5E4)',
            color: 'var(--color-text-primary, #1C1917)',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Services"
        subtitle="Configure bookable service offerings, base pricing, and category mappings."
        action={
          <button 
            className="btn-primary" 
            onClick={handleOpenAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Service
          </button>
        }
      />

      <div className="admin-card" style={{ backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search service name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E7E5E4)',
              backgroundColor: 'var(--color-sunken, #EEEDE9)',
              color: 'var(--color-text-primary, #1C1917)',
              fontSize: '13.5px',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-panel, #FBFBFA)',
                color: 'var(--color-text-primary, #1C1917)',
                fontSize: '13.5px'
              }}
            >
              {categoriesForFilter.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-sunken, #EEEDE9)', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                <th style={{ width: '38px', padding: '12px 16px' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Service Offering</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Spotlight</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary, #57534E)' }}>
                    Loading services from live database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary, #57534E)' }}>
                    No services found.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border, #E7E5E4)', backgroundColor: selectedIds.includes(s.id) ? 'var(--color-sunken, #EEEDE9)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => handleToggleRow(s.id)}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--color-text-primary, #1C1917)' }}>{s.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-metadata, #6F6A65)', marginTop: '2px' }}>ID: {String(s.id).slice(-8)}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-primary, #1C1917)', fontWeight: 500 }}>{s.category}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)' }}>
                      {s.duration}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13.5px', color: 'var(--color-text-primary, #1C1917)' }}>
                      ₹{(Number(s.basePrice) || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        type="button"
                        onClick={() => togglePopular(s)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: s.popular ? '#F59E0B' : 'var(--color-text-metadata, #6F6A65)'
                        }}
                        title={s.popular ? 'Featured' : 'Not featured'}
                      >
                        {s.popular ? '★ Featured' : '☆ Normal'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        onClick={() => toggleStatus(s)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: s.status === 'Active' ? '#DCFCE7' : 'var(--color-sunken, #EEEDE9)',
                          color: s.status === 'Active' ? '#15803D' : 'var(--color-text-secondary, #57534E)'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.status === 'Active' ? '#15803D' : '#64748B' }} />
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        style={{
                          padding: '4px 10px',
                          marginRight: '6px',
                          backgroundColor: 'var(--color-sunken, #EEEDE9)',
                          color: 'var(--color-text-primary, #1C1917)',
                          border: '1px solid var(--color-border, #E7E5E4)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteServiceId(s.id)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#FEE2E2',
                          color: '#BE123C',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteServiceId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setDeleteServiceId(null)}
        >
          <div
            style={{
              maxWidth: '380px',
              width: '100%',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              border: '1px solid var(--color-border, #E7E5E4)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
              Confirm Deletion
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this service offering from the live database?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteServiceId(null)}
                style={{
                  padding: '7px 14px',
                  backgroundColor: 'var(--color-sunken, #EEEDE9)',
                  color: 'var(--color-text-primary, #1C1917)',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  padding: '7px 14px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingService) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => { setShowAddModal(false); setEditingService(null); }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              border: '1px solid var(--color-border, #E7E5E4)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
              {editingService ? 'Edit Service Offering' : 'Add New Service'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Deep Home Cleaning"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'var(--color-sunken, #EEEDE9)',
                    color: 'var(--color-text-primary, #1C1917)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'var(--color-sunken, #EEEDE9)',
                    color: 'var(--color-text-primary, #1C1917)',
                    fontSize: '13px'
                  }}
                >
                  {liveCategories.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name || c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(p => ({ ...p, basePrice: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: 'var(--color-sunken, #EEEDE9)',
                      color: 'var(--color-text-primary, #1C1917)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                    Duration SLA
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 1 hr"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: 'var(--color-sunken, #EEEDE9)',
                      color: 'var(--color-text-primary, #1C1917)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '18px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text-primary, #1C1917)' }}>
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData(p => ({ ...p, popular: e.target.checked }))}
                  />
                  Featured in Spotlight
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text-primary, #1C1917)' }}>
                  <input
                    type="checkbox"
                    checked={formData.status === 'Active'}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.checked ? 'Active' : 'Draft' }))}
                  />
                  Active &amp; Bookable
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditingService(null); }}
                style={{
                  padding: '7px 14px',
                  backgroundColor: 'var(--color-sunken, #EEEDE9)',
                  color: 'var(--color-text-primary, #1C1917)',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingService ? handleSaveEdit : handleSaveAdd}
                style={{
                  padding: '7px 16px',
                  backgroundColor: 'var(--color-navy, #0B2545)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
