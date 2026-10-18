import React, { useState, useEffect } from 'react';
import ExportButton from '../components/common/ExportButton';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../utils/api';

export const INITIAL_REFUNDS = [];

const REJECT_REASONS = [
  'Item already delivered and accepted by customer',
  'Service fulfilled according to agreed job scope',
  'Duplicate or fraudulent chargeback claim',
  'Dispute raised after 48-hour return window',
  'Other administrative violation'
];

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/v1/refunds')
      .then(res => res.json())
      .then(json => {
        if (isMounted && json && Array.isArray(json.data)) {
          setRefunds(json.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Modals state
  const [approvingRefund, setApprovingRefund] = useState(null);
  const [rejectingRefund, setRejectingRefund] = useState(null);
  const [inspectingRefund, setInspectingRefund] = useState(null);
  const [inspectNotes, setInspectNotes] = useState('');
  const [selectedRejectReason, setSelectedRejectReason] = useState(REJECT_REASONS[0]);
  const [refundMethod, setRefundMethod] = useState('original'); // 'original' | 'wallet'

  useEffect(() => {
    if (inspectingRefund) {
      setInspectNotes(inspectingRefund.adminNotes || inspectingRefund.notes || '');
    }
  }, [inspectingRefund]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveNotes = async () => {
    if (!inspectingRefund) return;
    try {
      let res = await apiFetch(`/api/v1/refunds/${inspectingRefund.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: inspectNotes })
      }).catch(() => null);
      if (!res || !res.ok) {
        res = await apiFetch(`/api/v1/finance/${inspectingRefund.id}/notes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminNotes: inspectNotes })
        });
      }
      if (res.ok) {
        showToast('Admin notes saved successfully.');
        setRefunds(prev => prev.map(r => r.id === inspectingRefund.id ? { ...r, adminNotes: inspectNotes, notes: inspectNotes } : r));
        setInspectingRefund(prev => prev ? { ...prev, adminNotes: inspectNotes, notes: inspectNotes } : null);
      } else {
        showToast('Failed to save notes', 'error');
      }
    } catch {
      showToast('Error connecting to backend', 'error');
    }
  };

  const handleConfirmApprove = () => {
    if (!approvingRefund) return;
    const refundId = approvingRefund.id;
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              status: 'Processed',
              notes: `Refund approved via ${
                refundMethod === 'original' ? 'Original Payment Source' : 'BigBazaar Wallet Credit'
              }.`
            }
          : r
      )
    );
    apiFetch(`/api/v1/refunds/${refundId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ method: refundMethod })
    }).catch(console.warn);
    showToast(`Refund ${refundId} of ₹${(Number(approvingRefund.amount) || 0).toLocaleString('en-IN')} approved.`);
    setApprovingRefund(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingRefund) return;
    const refundId = rejectingRefund.id;
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              status: 'Rejected',
              notes: `Rejected by Admin. Reason: ${selectedRejectReason}`
            }
          : r
      )
    );
    apiFetch(`/api/v1/refunds/${refundId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: selectedRejectReason })
    }).catch(console.warn);
    showToast(`Refund ${refundId} has been rejected.`);
    setRejectingRefund(null);
  };

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : (r.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.refNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = refunds.filter((r) => r.status === 'Pending Approval').length;
  const totalRefunded = refunds
    .filter((r) => r.status === 'Processed' || r.status === 'Approved' || r.status === 'Refunded')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Refunds"
        description="Review, approve, or reject customer refund requests for cancelled orders and disputed services."
        breadcrumbs={['Commerce', 'Refunds']}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ExportButton
            data={filteredRefunds}
            filename="mybigbazaar-refund-claims.csv"
            label="Export Refunds"
            variant="secondary"
          />
          <button
            className="btn-primary"
            onClick={() => showToast('Syncing with payment gateway bank settlements...')}
            style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '6px' }}
          >
            Sync Gateway
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--status-warning-text)', marginTop: '4px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Requires review
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Refunded
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{(Number(totalRefunded) || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '4px' }}>
            Processed volume
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-card">
        <div
          className="admin-card-header"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Search by Refund ID, Order #, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            >
              <option value="All">All Requests</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Processed">Processed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px' }}>Refund ID</th>
                <th style={{ padding: '14px 16px' }}>Order/Booking Ref</th>
                <th style={{ padding: '14px 16px' }}>Source / Type</th>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Reason & Category</th>
                <th style={{ padding: '14px 16px' }}>Amount</th>
                <th style={{ padding: '14px 16px' }}>Payment Mode</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {refunds.length === 0 ? 'No refunds or disputes recorded yet.' : 'No matching refund requests found.'}
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((rf) => (
                  <tr
                    key={rf.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--primary-color)' }}>
                      {rf.id}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      {rf.refNumber}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.8rem', padding: '3px 8px' }}>
                        {rf.source || (rf.bookingId ? 'Service Booking' : 'Product Order')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600' }}>{rf.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rf.customerEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600' }}>{rf.category}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rf.reason}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#EF4444' }}>
                      ₹{(Number(rf.amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                      {rf.originalPaymentMode}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={
                          rf.status === 'Processed'
                            ? 'badge badge-success'
                            : rf.status === 'Pending Approval'
                            ? 'badge badge-warning'
                            : 'badge badge-danger'
                        }
                      >
                        {rf.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', marginRight: '6px' }}
                        onClick={() => setInspectingRefund(rf)}
                      >
                        Inspect
                      </button>

                      {rf.status === 'Pending Approval' && (
                        <>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.8rem', marginRight: '6px', background: '#10B981', borderColor: '#10B981' }}
                            onClick={() => setApprovingRefund(rf)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => setRejectingRefund(rf)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Refund Modal */}
      {inspectingRefund && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '560px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              background: 'var(--modal-bg)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Refund Request: {inspectingRefund.id}</h3>
              <button
                onClick={() => setInspectingRefund(null)}
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

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reference Number:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{inspectingRefund.refNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Source Type:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {inspectingRefund.source || (inspectingRefund.bookingId ? 'Service Booking' : 'Product Order')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Refund Amount:</span>
                <span style={{ fontWeight: '600', color: '#EF4444' }}>
                  ₹{(Number(inspectingRefund.amount) || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{inspectingRefund.customerName} ({inspectingRefund.customerEmail})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{inspectingRefund.status}</span>
              </div>
            </div>

            {/* Customer Bank Details Card */}
            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Bank Details (Payout Destination)
              </div>
              {inspectingRefund.bankDetails && (inspectingRefund.bankDetails.accountNumber || inspectingRefund.bankDetails.bankName) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Bank Name: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{inspectingRefund.bankDetails.bankName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Account Holder: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{inspectingRefund.bankDetails.accountHolderName || inspectingRefund.customerName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Account Number: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{inspectingRefund.bankDetails.accountNumber || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>IFSC Code: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{inspectingRefund.bankDetails.ifscCode || 'N/A'}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Standard Refund: Direct return to original payment method ({inspectingRefund.originalPaymentMode || 'UPI / Gateway'}).
                </div>
              )}
            </div>

            {/* Editable Admin Notes Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Admin Audit Notes:</div>
              <textarea
                value={inspectNotes}
                onChange={(e) => setInspectNotes(e.target.value)}
                placeholder="Enter internal verification or resolution notes..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveNotes}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Save Notes
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setInspectingRefund(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Refund Confirmation Modal */}
      {approvingRefund && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '480px',
              maxWidth: '90vw',
              padding: '24px',
              background: 'var(--modal-bg)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#10B981', marginBottom: '10px' }}>
              Approve Refund: {approvingRefund.id}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Authorize a refund of <strong style={{ color: 'var(--text-primary)' }}>₹{(Number(approvingRefund.amount) || 0).toLocaleString('en-IN')}</strong> to{' '}
              {approvingRefund.customerName}.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Settlement Destination:
              </label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="original">Original Payment Mode ({approvingRefund.originalPaymentMode})</option>
                <option value="wallet">Wallet Credit</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setApprovingRefund(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: '#10B981', borderColor: '#10B981', padding: '8px 16px', borderRadius: '6px' }}
                onClick={handleConfirmApprove}
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Refund Modal */}
      {rejectingRefund && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '480px',
              maxWidth: '90vw',
              padding: '24px',
              background: 'var(--modal-bg)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#EF4444', marginBottom: '10px' }}>
              Reject Refund: {rejectingRefund.id}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Specify the reason for declining this refund request:
            </p>

            <div style={{ marginBottom: '16px' }}>
              <select
                value={selectedRejectReason}
                onChange={(e) => setSelectedRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                {REJECT_REASONS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setRejectingRefund(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleConfirmReject} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
