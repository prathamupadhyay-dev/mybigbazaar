import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../utils/api';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Building,
  UserCheck,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

export default function KYC() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docZoom, setDocZoom] = useState(1);
  const [docRotation, setDocRotation] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Document photo is unclear/blurry. Please re-upload a clear copy.');
  const [feedback, setFeedback] = useState('');

  const loadKyc = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      let res = await apiFetch('/api/v1/providers/kyc');
      if (!res.ok) {
        res = await apiFetch('/kyc/get-all');
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText || 'Unable to fetch KYC records'}`);
      }
      const json = await res.json().catch(() => ({}));
      const raw = Array.isArray(json?.data) ? json.data : (Array.isArray(json?.kyc) ? json.kyc : (Array.isArray(json) ? json : []));
      setApplications(raw);
    } catch (err) {
      setLoadError(String(err?.message || 'Failed to load KYC applications from backend'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, []);

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleApprove = async (app) => {
    if (!window.confirm(`Approve KYC verification for "${app.partnerName || 'Partner'}"?`)) return;
    setApplications(prev =>
      prev.map(item =>
        item.id === app.id
          ? { ...item, status: 'verified', notes: `Approved by Admin on ${new Date().toISOString().slice(0, 10)}` }
          : item
      )
    );
    try {
      await apiFetch(`/api/v1/providers/kyc/${app.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'verified' })
      });
      await apiFetch(`/api/v1/admin/users/${app.id}/kyc`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'verified' })
      });
      await apiFetch(`/kyc/update/${app.id}`, {
        method: 'PUT',
        body: JSON.stringify({ kycStatus: 'verified', status: 'verified' })
      }).catch(() => {});
    } catch (err) {
      console.warn('KYC approve error:', err);
    }
    showToast(`Provider ${app.partnerName || 'Partner'} has been verified.`);
  };

  const handleConfirmReject = async () => {
    if (!rejectingApp) return;
    const appId = rejectingApp.id;
    setApplications(prev =>
      prev.map(item =>
        item.id === appId
          ? { ...item, status: 'rejected', notes: rejectionReason, rejectionReason: rejectionReason }
          : item
      )
    );
    try {
      await apiFetch(`/api/v1/providers/kyc/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected', rejectionReason: rejectionReason, reason: rejectionReason })
      });
      await apiFetch(`/api/v1/admin/users/${appId}/kyc`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected', rejectionReason: rejectionReason })
      });
      await apiFetch(`/kyc/update/${appId}`, {
        method: 'PUT',
        body: JSON.stringify({ kycStatus: 'rejected', status: 'rejected', rejectionReason })
      }).catch(() => {});
    } catch (err) {
      console.warn('KYC reject error:', err);
    }
    showToast(`Verification for ${rejectingApp.partnerName || 'Partner'} marked rejected.`);
    setRejectingApp(null);
  };

  const filtered = applications.filter(app => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      (app.partnerName || '').toLowerCase().includes(q) ||
      (app.phoneNumber || '').includes(search || '') ||
      (app.documentNumber || '').toLowerCase().includes(q) ||
      (app.category || '').toLowerCase().includes(q);

    const matchesDocType = docTypeFilter === 'All' || app.documentType === docTypeFilter;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesDocType && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.status === 'pending_verification').length;
  const verifiedCount = applications.filter(a => a.status === 'verified').length;

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: 'var(--color-canvas, #F6F5F2)' }}>
      <PageHeader
        title="Verification"
        breadcrumbs={['Services', 'Verification']}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ padding: '6px 12px', background: '#FFFBEB', borderRadius: '6px', border: '1px solid rgba(180, 83, 9, 0.25)' }}>
            <span className="tabular-nums" style={{ fontSize: '12px', color: '#B45309', fontWeight: 600 }}>
              Pending: {pendingCount}
            </span>
          </div>
          <div style={{ padding: '6px 12px', background: '#F0FDF4', borderRadius: '6px', border: '1px solid rgba(21, 128, 61, 0.25)' }}>
            <span className="tabular-nums" style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>
              Verified: {verifiedCount}
            </span>
          </div>
        </div>
      </PageHeader>

      {/* Filter toolbar */}
      <div style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--color-panel, #FBFBFA)', borderRadius: '12px', border: '1px solid var(--color-border, #E7E5E4)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by provider name, phone, document ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 34px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E7E5E4)',
                background: 'var(--color-canvas, #EEEDE9)',
                color: 'var(--color-text-primary, #1C1917)',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary, #6F6A65)' }} />
          </div>

          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E7E5E4)',
              fontSize: '13px',
              background: 'var(--color-canvas, #EEEDE9)',
              color: 'var(--color-text-primary, #1C1917)',
              outline: 'none'
            }}
          >
            <option value="All">All Document Types</option>
            <option value="Aadhaar Card">Aadhaar Card</option>
            <option value="PAN Card">PAN Card</option>
            <option value="Trade License">Trade License</option>
            <option value="Voter ID">Voter ID</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E7E5E4)',
              fontSize: '13px',
              background: 'var(--color-canvas, #EEEDE9)',
              color: 'var(--color-text-primary, #1C1917)',
              outline: 'none'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="pending_verification">Pending Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* KYC Table */}
      <div style={{ backgroundColor: 'var(--color-panel, #FBFBFA)', borderRadius: '12px', border: '1px solid var(--color-border, #E7E5E4)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ height: '48px', borderBottom: '1px solid var(--color-border, #E7E5E4)', backgroundColor: 'var(--color-canvas, #EEEDE9)' }}>
                <th style={{ padding: '0 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Provider Details</th>
                <th style={{ padding: '0 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Service &amp; City</th>
                <th style={{ padding: '0 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submitted Document</th>
                <th style={{ padding: '0 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date Submitted</th>
                <th style={{ padding: '0 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                <th style={{ padding: '0 16px', color: 'var(--color-text-secondary, #57534E)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary, #57534E)' }}>
                    Loading KYC verification documents from backend...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#DC2626' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} color="#DC2626" />
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Failed to load KYC applications</div>
                      <div style={{ fontSize: '12px', color: '#7F1D1D' }}>{String(loadError)}</div>
                      <button type="button" onClick={loadKyc} style={{ marginTop: '8px', padding: '6px 14px', background: 'var(--color-canvas, #EEEDE9)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Retry</button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary, #57534E)' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary, #1C1917)' }}>No Submissions Found</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>All provider verification documents have been processed.</div>
                  </td>
                </tr>
              ) : (
                filtered.map(app => (
                <tr key={app.id} style={{ height: '48px', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', fontSize: '13px' }}>{app.partnerName}</div>
                    <div className="tabular-nums" style={{ fontSize: '11px', color: 'var(--color-text-secondary, #57534E)' }}>{app.phoneNumber} &bull; ID: {app.id}</div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', background: 'var(--color-canvas, #EEEDE9)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#4338CA' }}>
                      {app.category}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #57534E)', marginTop: '2px' }}>
                      {app.city}
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', fontSize: '12px' }}>
                      {app.documentType}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '11px', color: 'var(--color-text-secondary, #57534E)' }}>{app.documentNumber}</div>
                    <button
                      onClick={() => {
                        setPreviewDoc(app);
                        setDocZoom(1);
                        setDocRotation(0);
                      }}
                      style={{ marginTop: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: 'var(--color-canvas, #EEEDE9)', border: '1px solid var(--color-border, #E7E5E4)', color: 'var(--color-text-primary, #0B2545)', cursor: 'pointer' }}
                    >
                      View Document
                    </button>
                  </td>
                  <td className="tabular-nums" style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                    {app.submittedAt}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {app.status === 'pending_verification' && (
                      <span style={{ padding: '3px 8px', background: '#FFFBEB', color: '#B45309', border: '1px solid rgba(180, 83, 9, 0.25)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                        Pending
                      </span>
                    )}
                    {app.status === 'verified' && (
                      <span style={{ padding: '3px 8px', background: '#F0FDF4', color: '#15803D', border: '1px solid rgba(21, 128, 61, 0.25)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                        Verified
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <div>
                        <span style={{ padding: '3px 8px', background: '#FFF1F2', color: '#BE123C', border: '1px solid rgba(190, 18, 60, 0.25)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                          Rejected
                        </span>
                        {app.rejectionReason && (
                          <div style={{ fontSize: '11px', color: '#BE123C', marginTop: '4px', maxWidth: '180px' }}>
                            {app.rejectionReason}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    {app.status === 'pending_verification' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleApprove(app)}
                          style={{ padding: '5px 12px', background: '#15803D', border: 'none', color: '#FBFBFA', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            setRejectingApp(app);
                            setRejectionReason('Document photo is unclear/blurry. Please re-upload a clear copy.');
                          }}
                          style={{ padding: '5px 12px', background: '#BE123C', border: 'none', color: '#FBFBFA', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #6F6A65)' }}>Reviewed</span>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal with Zoom & Rotate */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'var(--color-panel, #FBFBFA)', borderRadius: '12px', padding: '24px', width: '640px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border, #E7E5E4)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>Document Inspection</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  {previewDoc.partnerName} &bull; {previewDoc.documentType} ({previewDoc.documentNumber})
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  background: 'var(--color-canvas, #EEEDE9)',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary, #57534E)'
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Zoom & Rotate Controls Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--color-canvas, #EEEDE9)',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid var(--color-border, #E7E5E4)',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={() => setDocZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                  style={{ padding: '6px 10px', background: 'var(--color-panel, #fff)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-primary, #1C1917)' }}
                >
                  <ZoomOut size={15} />
                </button>
                <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '46px', textAlign: 'center', color: 'var(--color-text-primary, #1C1917)' }}>
                  {Math.round(docZoom * 100)}%
                </span>
                <button
                  type="button"
                  title="Zoom In"
                  onClick={() => setDocZoom(z => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  style={{ padding: '6px 10px', background: 'var(--color-panel, #fff)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-primary, #1C1917)' }}
                >
                  <ZoomIn size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  title="Rotate Left (-90°)"
                  onClick={() => setDocRotation(r => (r - 90 + 360) % 360)}
                  style={{ padding: '6px 10px', background: 'var(--color-panel, #fff)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-primary, #1C1917)' }}
                >
                  <RotateCcw size={15} />
                </button>
                <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '38px', textAlign: 'center', color: 'var(--color-text-primary, #1C1917)' }}>
                  {docRotation}°
                </span>
                <button
                  type="button"
                  title="Rotate Right (+90°)"
                  onClick={() => setDocRotation(r => (r + 90) % 360)}
                  style={{ padding: '6px 10px', background: 'var(--color-panel, #fff)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-primary, #1C1917)' }}
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  title="Reset Zoom & Orientation"
                  onClick={() => { setDocZoom(1); setDocRotation(0); }}
                  style={{ padding: '6px 10px', background: 'var(--color-panel, #fff)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary, #1C1917)' }}
                >
                  <RefreshCw size={13} /> Reset
                </button>
              </div>
            </div>

            {/* Inspection Viewport */}
            <div style={{
              flex: 1,
              minHeight: '280px',
              maxHeight: '440px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-canvas, #EEEDE9)',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E7E5E4)',
              padding: '20px',
              position: 'relative'
            }}>
              {previewDoc.documentUrl || previewDoc.file || previewDoc.documentImage || previewDoc.frontImage ? (
                <img
                  src={previewDoc.documentUrl || previewDoc.file || previewDoc.documentImage || previewDoc.frontImage}
                  alt="Submitted KYC Document"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    objectFit: 'contain',
                    transform: `scale(${docZoom}) rotate(${docRotation}deg)`,
                    transition: 'transform 0.2s ease',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <div style={{
                  transform: `scale(${docZoom}) rotate(${docRotation}deg)`,
                  transition: 'transform 0.2s ease',
                  textAlign: 'center',
                  padding: '24px',
                  backgroundColor: 'var(--color-panel, #fff)',
                  borderRadius: '8px',
                  border: '1px dashed var(--color-border, #E7E5E4)',
                  maxWidth: '380px'
                }}>
                  <FileText size={44} style={{ color: 'var(--color-text-secondary, #57534E)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                    {previewDoc.documentType || 'Official Identification'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #57534E)', marginTop: '4px' }}>
                    Number: {previewDoc.documentNumber || 'N/A'}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '11px', color: 'var(--color-text-secondary, #57534E)', marginTop: '6px' }}>
                    Record ID: #{previewDoc.id || previewDoc._id}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--color-border, #E7E5E4)', backgroundColor: 'var(--color-canvas, #EEEDE9)', color: 'var(--color-text-primary, #1C1917)', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
              >
                Close
              </button>
              {previewDoc.status === 'pending_verification' && (
                <button
                  onClick={() => {
                    handleApprove(previewDoc);
                    setPreviewDoc(null);
                  }}
                  style={{ padding: '8px 16px', background: '#15803D', color: '#FBFBFA', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                >
                  Verify Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'var(--color-panel, #FBFBFA)', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90vw', border: '1px solid var(--color-border, #E7E5E4)', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>Reject Verification</h3>
            <p style={{ margin: '4px 0 16px', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
              Specify the reason so {rejectingApp.partnerName} can submit a corrected document.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '6px' }}>Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  background: 'var(--color-canvas, #EEEDE9)',
                  color: 'var(--color-text-primary, #1C1917)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setRejectingApp(null)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border, #E7E5E4)', backgroundColor: 'var(--color-canvas, #EEEDE9)', color: 'var(--color-text-primary, #1C1917)', cursor: 'pointer', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#BE123C', color: '#FBFBFA', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {feedback && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          border: '1px solid var(--color-border, #E7E5E4)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--color-text-primary, #1C1917)'
        }}>
          <CheckCircle2 size={16} color="#15803D" strokeWidth={2.5} />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
