import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';

export default function Promotions() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteCouponId, setDeleteCouponId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrder: '0',
    maxDiscount: '500',
    maxUses: '100',
    expiry: '',
    status: 'Active'
  });

  // Coupon Test Sandbox State
  const [testAmount, setTestAmount] = useState('599');
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/coupons');
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const raw = Array.isArray(json.data) ? json.data : (Array.isArray(json.coupons) ? json.coupons : (Array.isArray(json) ? json : []));
        const normalized = raw.map(c => ({
          id: c._id || c.id,
          code: c.code,
          discountType: c.discountType || 'percentage',
          discountValue: Number(c.discountValue) || 0,
          discount: c.discountType === 'flat' ? `₹${c.discountValue} FLAT` : `${c.discountValue}% OFF`,
          minOrder: `₹${c.minOrder || 0}`,
          maxDiscount: c.maxDiscount ? `₹${c.maxDiscount}` : 'None',
          maxUses: c.maxUses || 100,
          usageCount: c.usageCount || 0,
          expiry: c.expiry ? new Date(c.expiry).toISOString().slice(0, 10) : '',
          status: c.status || 'Active'
        }));
        setCoupons(normalized);
      }
    } catch (e) {
      console.warn('Error fetching coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleTestCoupon = async () => {
    const code = (testCode || '').trim().toUpperCase();
    const orderTotal = Number(testAmount) || 0;
    if (!code) {
      setTestResult({ valid: false, reason: 'Please enter a coupon code to test.' });
      return;
    }
    setTesting(true);
    try {
      const res = await apiFetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: orderTotal })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.valid) {
        setTestResult({
          valid: true,
          coupon: data.coupon,
          appliedDiscount: data.discount,
          finalPayable: data.finalPayable
        });
      } else {
        setTestResult({
          valid: false,
          reason: data.reason || 'Invalid or expired coupon.'
        });
      }
    } catch (e) {
      // Local fallback
      const target = coupons.find(c => c.code.toUpperCase() === code);
      if (!target) {
        setTestResult({ valid: false, reason: `Coupon "${code}" not found.` });
      } else {
        const val = target.discountType === 'percentage' 
          ? Math.round(orderTotal * (target.discountValue / 100))
          : target.discountValue;
        setTestResult({
          valid: true,
          coupon: target,
          appliedDiscount: val,
          finalPayable: Math.max(0, orderTotal - val)
        });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrder: '0',
      maxDiscount: '500',
      maxUses: '100',
      expiry: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrder: String(c.minOrder || '0').replace(/[^0-9]/g, ''),
      maxDiscount: String(c.maxDiscount || '0').replace(/[^0-9]/g, ''),
      maxUses: String(c.maxUses || '100'),
      expiry: c.expiry || '',
      status: c.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSaveCoupon = async () => {
    const code = formData.code.trim().toUpperCase();
    if (!code) {
      showToast('Coupon code is required', 'error');
      return;
    }
    const val = Number(formData.discountValue);
    if (!val || val <= 0) {
      showToast('Please provide a valid discount value', 'error');
      return;
    }

    const payload = {
      code,
      discountType: formData.discountType,
      discountValue: val,
      minOrder: Number(formData.minOrder) || 0,
      maxDiscount: Number(formData.maxDiscount) || 0,
      maxUses: Number(formData.maxUses) || 100,
      expiry: formData.expiry ? new Date(formData.expiry) : null,
      status: formData.status
    };

    try {
      if (editingCoupon) {
        const res = await apiFetch(`/api/v1/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Coupon "${code}" updated successfully.`);
          setShowModal(false);
          fetchCoupons();
        } else {
          showToast('Failed to update coupon', 'error');
        }
      } else {
        const res = await apiFetch('/api/v1/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Coupon "${code}" created successfully.`);
          setShowModal(false);
          fetchCoupons();
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.message || 'Failed to create coupon', 'error');
        }
      }
    } catch {
      showToast('Backend connection error', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteCouponId) return;
    try {
      const res = await apiFetch(`/api/v1/coupons/${deleteCouponId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Coupon deleted successfully.');
        setDeleteCouponId(null);
        fetchCoupons();
      } else {
        showToast('Failed to delete coupon', 'error');
      }
    } catch {
      showToast('Backend connection error', 'error');
    }
  };

  const toggleStatus = async (c) => {
    const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
    setCoupons(prev => prev.map(item => item.id === c.id ? { ...item, status: nextStatus } : item));
    showToast(`Coupon "${c.code}" is now ${nextStatus}.`);
    try {
      await apiFetch(`/api/v1/coupons/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {}
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
        title="Coupons"
        subtitle="Manage promotional discount codes, validity rules, and checkout redemption."
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ExportButton
              data={coupons}
              filename="mybigbazaar-coupons.csv"
              label="Export CSV"
            />
            <button
              className="btn-primary"
              onClick={handleOpenAdd}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              + Create Coupon
            </button>
          </div>
        }
      />

      {/* Coupon Test Sandbox */}
      <div
        className="admin-card"
        style={{
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          border: '1px solid var(--color-border, #E7E5E4)',
          borderRadius: '12px',
          padding: '18px 20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
            Coupon Test
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--color-text-secondary, #57534E)' }}>
            Simulate cart checkout calculations and test coupon validity against order amounts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #57534E)', marginBottom: '4px' }}>
              Order Amount (₹)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
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

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #57534E)', marginBottom: '4px' }}>
              Coupon Code
            </label>
            <input
              type="text"
              placeholder="e.g. WELCOME50"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                color: 'var(--color-text-primary, #1C1917)',
                fontSize: '13px',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleTestCoupon}
            disabled={testing}
            style={{
              height: '36px',
              padding: '0 16px',
              backgroundColor: 'var(--color-navy, #0B2545)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {testing ? 'Verifying...' : 'Verify Coupon'}
          </button>
        </div>

        {testResult && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: `1px solid ${testResult.valid ? '#86EFAC' : '#FECDD3'}`,
              backgroundColor: testResult.valid ? '#F0FDF4' : '#FFF1F2',
              fontSize: '13px',
              color: testResult.valid ? '#166534' : '#991B1B'
            }}
          >
            {testResult.valid ? (
              <div>
                <strong>Valid Coupon:</strong> Discount of ₹{testResult.appliedDiscount} applied. Final payable: ₹{testResult.finalPayable}.
              </div>
            ) : (
              <div>
                <strong>Invalid:</strong> {testResult.reason}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coupons Table */}
      <div
        className="admin-card"
        style={{
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          border: '1px solid var(--color-border, #E7E5E4)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-sunken, #EEEDE9)', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Coupon Code</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Discount Value</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Min Order</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Max Cap</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Expiry</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary, #57534E)' }}>
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary, #57534E)' }}>
                    No coupons created yet. Click "+ Create Coupon" to add one.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '13px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-sunken, #EEEDE9)',
                          color: 'var(--color-text-primary, #1C1917)'
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary, #1C1917)' }}>
                      {c.discount}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)' }}>
                      {c.minOrder}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)' }}>
                      {c.maxDiscount}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)' }}>
                      {c.expiry || 'No Expiry'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        onClick={() => toggleStatus(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: c.status === 'Active' ? '#DCFCE7' : 'var(--color-sunken, #EEEDE9)',
                          color: c.status === 'Active' ? '#15803D' : 'var(--color-text-secondary, #57534E)'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.status === 'Active' ? '#15803D' : '#64748B' }} />
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
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
                        onClick={() => setDeleteCouponId(c.id)}
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
      {deleteCouponId && (
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
          onClick={() => setDeleteCouponId(null)}
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
              Are you sure you want to permanently delete this coupon code from the live backend?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteCouponId(null)}
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
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              maxWidth: '460px',
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
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. FESTIVE25"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'var(--color-sunken, #EEEDE9)',
                    color: 'var(--color-text-primary, #1C1917)',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(p => ({ ...p, discountType: e.target.value }))}
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
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(p => ({ ...p, discountValue: e.target.value }))}
                    placeholder={formData.discountType === 'percentage' ? '20' : '150'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData(p => ({ ...p, minOrder: e.target.value }))}
                    placeholder="299"
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
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData(p => ({ ...p, maxDiscount: e.target.value }))}
                    placeholder="500"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '5px' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry}
                    onChange={(e) => setFormData(p => ({ ...p, expiry: e.target.value }))}
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
                onClick={handleSaveCoupon}
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
                {editingCoupon ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
