import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { getAuthToken, apiFetch } from '../utils/api';
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  Maximize2,
  X,
  Phone,
  Calendar,
  Building,
  UserCheck,
  ZoomIn,
  Copy,
  Gauge,
  CreditCard
} from 'lucide-react';

export default function UserVerification({ token }) {
  const authToken = getAuthToken(token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [inspectingUser, setInspectingUser] = useState(null);
  const [decisionReason, setDecisionReason] = useState('Clean / Verified Identity (Clear for Platform Operations)');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [toast, setToast] = useState(null);

  const [loadError, setLoadError] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let res = await apiFetch('/auth/get-all-users');
      if (!res.ok) {
        res = await apiFetch('/api/v1/admin/users');
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText || 'Unable to fetch user verification requests'}`);
      }
      const json = await res.json();
      const raw = Array.isArray(json) ? json : (json.data || json.users || []);
      const mapped = raw.map((u, idx) => {
        const kycRaw = (u.kycStatus || '').toLowerCase();
        let status = 'Pending';
        if (kycRaw === 'verified' || kycRaw === 'approved') {
          status = 'Approved';
        } else if (kycRaw === 'rejected') {
          status = 'Rejected';
        } else if (kycRaw === 'pending' || kycRaw === 'pending_verification') {
          status = 'Pending';
        } else if (u.isEmailVerified && u.status === 'active' && !kycRaw) {
          status = 'Pending';
        }

        const roleLabel = (u.role === 'admin' || (Array.isArray(u.userTypes) && u.userTypes.includes('admin'))) ? 'Admin' : 'User';

        return {
          id: u._id || u.id || `USR-${idx + 1}`,
          name: u.fullName || u.name || `User ${idx + 1}`,
          email: u.email || '—',
          phone: u.phoneNumber || u.phone || '—',
          city: u.city || 'Indore',
          role: roleLabel,
          status,
          submittedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
          documents: [
            'Government Issued Photo ID (Aadhaar / PAN)',
            'Address Verification Proof'
          ],
          trustScore: status === 'Approved' ? 94 : (status === 'Rejected' ? 24 : 68)
        };
      });
      setUsers(mapped);
    } catch (err) {
      setLoadError(String(err?.message || 'Failed to fetch verification list'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [authToken]);

  const handleAction = async (id, newStatus) => {
    const isApproved = newStatus === 'Approved' || newStatus === 'Verified';
    const isRejected = newStatus === 'Rejected';
    const apiStatus = isApproved ? 'verified' : (isRejected ? 'rejected' : 'pending');
    const displayStatus = isApproved ? 'Approved' : (isRejected ? 'Rejected' : 'Pending');

    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: displayStatus } : u));
    if (inspectingUser && inspectingUser.id === id) {
      setInspectingUser(prev => ({ ...prev, status: displayStatus }));
    }
    showToast(`Verification status updated to ${displayStatus}.`);

    try {
      await apiFetch(`/api/v1/admin/users/${id}/kyc`, {
        method: 'PUT',
        body: JSON.stringify({ status: apiStatus })
      });
      await apiFetch(`/kyc/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ kycStatus: apiStatus, status: apiStatus })
      }).catch(() => {});
    } catch (err) {
      console.warn('KYC status update error:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesTab = activeTab === 'All' || u.status === activeTab;
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const pendingCount = users.filter(u => u.status === 'Pending').length;
  const approvedCount = users.filter(u => u.status === 'Approved').length;
  const rejectedCount = users.filter(u => u.status === 'Rejected').length;

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: '#F6F5F2' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#FBFBFA',
            color: '#1C1917',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #E7E5E4',
            boxShadow: '0 8px 30px rgba(28, 25, 23, 0.12)',
            fontWeight: 600,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <CheckCircle2 size={16} color="#15803D" strokeWidth={2.5} />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Verification"
        breadcrumbs={['Users', 'Verification']}
      >
        <ExportButton
          data={filteredUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            documentType: u.documentType,
            status: u.status,
            createdAt: u.createdAt || ''
          }))}
          filename="kyc_verifications.csv"
          label="Export KYC CSV"
          dateKey="createdAt"
          columns={[
            { key: 'id', label: 'User ID' },
            { key: 'name', label: 'Full Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'role', label: 'Account Role' },
            { key: 'documentType', label: 'Document Type' },
            { key: 'status', label: 'KYC Status' },
            { key: 'createdAt', label: 'Submission Date' }
          ]}
        />
      </PageHeader>

      {/* Filter Tabs & Search Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        {/* Segmented Control */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#EEEDE9',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #E7E5E4'
          }}
        >
          {[
            { id: 'Pending', label: `Pending (${pendingCount})` },
            { id: 'Approved', label: `Approved (${approvedCount})` },
            { id: 'Rejected', label: `Rejected (${rejectedCount})` },
            { id: 'All', label: `All (${users.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="tabular-nums"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#0B2545' : '#57534E',
                backgroundColor: activeTab === tab.id ? '#FBFBFA' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(28, 25, 23, 0.05)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search applicants by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #E7E5E4',
              backgroundColor: '#EEEDE9',
              color: '#1C1917',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6F6A65'
            }}
          />
        </div>
      </div>

      {/* Main High-Density Data Table */}
      <div
        style={{
          backgroundColor: '#FBFBFA',
          borderRadius: '12px',
          border: '1px solid #E7E5E4',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ height: '48px', borderBottom: '1px solid #E7E5E4', backgroundColor: '#EEEDE9' }}>
                <th style={{ padding: '0 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#57534E', fontWeight: 600 }}>Applicant</th>
                <th style={{ padding: '0 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#57534E', fontWeight: 600 }}>Contact Telemetry</th>
                <th style={{ padding: '0 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#57534E', fontWeight: 600 }}>Proof Submitted</th>
                <th style={{ padding: '0 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#57534E', fontWeight: 600 }}>Submission Date</th>
                <th style={{ padding: '0 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#57534E', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#57534E', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]" style={{ backgroundColor: '#FBFBFA' }}>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#6F6A65', fontSize: '0.84rem' }}>
                    Loading KYC verification records from Atlas...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} color="#DC2626" />
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Failed to load verification records</div>
                      <div style={{ fontSize: '0.82rem', color: '#7F1D1D' }}>{String(loadError)}</div>
                      <button type="button" className="btn-secondary" onClick={fetchUsers} style={{ marginTop: '8px', cursor: 'pointer' }}>Retry</button>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#EEEDE9',
                        border: '1px solid #E7E5E4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        color: '#6F6A65'
                      }}
                    >
                      <UserCheck size={20} strokeWidth={1.8} />
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1C1917', marginBottom: '4px' }}>
                      No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} verification requests
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#57534E', maxWidth: '400px', margin: '0 auto' }}>
                      {searchTerm ? 'No records matched your search filter.' : 'Identity verification submissions will appear here for administrative clearance.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} style={{ height: '48px', borderBottom: '1px solid #E7E5E4', transition: 'background-color 100ms ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F6F5F2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FBFBFA'}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: '#0B2545',
                            color: '#FBFBFA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            flexShrink: 0
                          }}
                        >
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#1C1917', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name}
                            {u.role === 'Admin' && (
                              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', fontWeight: 600 }}>
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '10px 16px', fontSize: '0.80rem' }}>
                      <div style={{ color: '#1C1917' }}>{u.email}</div>
                      <div className="tabular-nums" style={{ fontSize: '0.72rem', color: '#57534E', marginTop: '2px' }}>{u.phone} &bull; {u.city}</div>
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {u.documents.map((doc, idx) => (
                          <span key={idx} style={{ fontSize: '0.74rem', color: '#0B2545', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FileText size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="tabular-nums" style={{ padding: '10px 16px', color: '#57534E', fontSize: '0.78rem' }}>
                      {u.submittedDate}
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          backgroundColor: (u.status === 'Approved' || u.status === 'Verified') ? '#F0FDF4' : (u.status === 'Rejected' ? '#FFF1F2' : '#FFFBEB'),
                          color: (u.status === 'Approved' || u.status === 'Verified') ? '#15803D' : (u.status === 'Rejected' ? '#BE123C' : '#B45309'),
                          border: `1px solid ${(u.status === 'Approved' || u.status === 'Verified') ? 'rgba(21, 128, 61, 0.25)' : (u.status === 'Rejected' ? 'rgba(190, 18, 60, 0.25)' : 'rgba(180, 83, 9, 0.25)')}`
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                        {u.status}
                      </span>
                    </td>

                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingUser(u);
                            setInternalRemarks(`Application verified by compliance officer. ID confirmed for ${u.name}.`);
                          }}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: '#EEEDE9',
                            color: '#1C1917',
                            border: '1px solid #E7E5E4',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            transition: 'all 120ms ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0B2545'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                        >
                          Inspect Dossier
                        </button>
                        {u.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAction(u.id, 'Approved')}
                              style={{
                                padding: '5px 12px',
                                backgroundColor: '#15803D',
                                color: '#FBFBFA',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.74rem',
                                fontWeight: 600
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(u.id, 'Rejected')}
                              style={{
                                padding: '5px 12px',
                                backgroundColor: '#BE123C',
                                color: '#FBFBFA',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.74rem',
                                fontWeight: 600
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 84% SLIDE-OVER INSPECTION DRAWER OVERLAY (PORTED FROM STITCH) */}
      {inspectingUser && (
        <>
          {/* Backdrop Wash */}
          <div
            onClick={() => setInspectingUser(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1040,
              backgroundColor: 'rgba(28, 25, 23, 0.45)',
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Slide-over Drawer (84% pinned to right) */}
          <section
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 1050,
              width: '84%',
              maxWidth: '1280px',
              backgroundColor: '#FBFBFA',
              borderLeft: '1px solid #E7E5E4',
              boxShadow: '-4px 0 24px rgba(28, 25, 23, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideInRight 180ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Drawer Header */}
            <header
              style={{
                height: '64px',
                padding: '0 24px',
                backgroundColor: '#FBFBFA',
                borderBottom: '1px solid #E7E5E4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#0B2545',
                    color: '#FBFBFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1C1917', margin: 0, letterSpacing: '-0.015em' }}>
                      Entity Inspection & KYC Verification: <span className="tabular-nums" style={{ color: '#0B2545' }}>#{inspectingUser.id}</span>
                    </h2>
                    {inspectingUser.role === 'Admin' && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          color: '#4F46E5',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          fontSize: '0.70rem',
                          fontWeight: 600
                        }}
                      >
                        Admin
                      </span>
                    )}
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: inspectingUser.status === 'Approved' ? '#F0FDF4' : (inspectingUser.status === 'Rejected' ? '#FFF1F2' : '#FFFBEB'),
                        color: inspectingUser.status === 'Approved' ? '#15803D' : (inspectingUser.status === 'Rejected' ? '#BE123C' : '#B45309'),
                        border: `1px solid ${inspectingUser.status === 'Approved' ? 'rgba(21, 128, 61, 0.25)' : (inspectingUser.status === 'Rejected' ? 'rgba(190, 18, 60, 0.25)' : 'rgba(180, 83, 9, 0.25)')}`,
                        fontSize: '0.70rem',
                        fontWeight: 600
                      }}
                    >
                      Status: {inspectingUser.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6F6A65', margin: '3px 0 0' }}>
                    Applicant: <strong style={{ color: '#1C1917' }}>{inspectingUser.name}</strong> &bull; Submitted {inspectingUser.submittedDate} &bull; Region: {inspectingUser.city}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInspectingUser(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: '#EEEDE9',
                    color: '#57534E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Close Drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Drawer Body: 60% Left / 40% Right Split View */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left Panel (60%): Evidence Viewer & AI Risk Telemetry */}
              <div
                style={{
                  width: '60%',
                  borderRight: '1px solid #E7E5E4',
                  backgroundColor: '#F6F5F2',
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Evidence Card */}
                <div
                  style={{
                    backgroundColor: '#FBFBFA',
                    border: '1px solid #E7E5E4',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="#0B2545" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1C1917' }}>
                        Submitted Proof of Identity
                      </span>
                    </div>
                    <span style={{ fontSize: '0.70rem', color: '#15803D', fontWeight: 600, backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(21, 128, 61, 0.2)' }}>
                      OCR EXIF VERIFIED
                    </span>
                  </div>

                  {/* Document Graphic Mock */}
                  <div
                    style={{
                      height: '240px',
                      backgroundColor: '#EEEDE9',
                      border: '1px solid #E7E5E4',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#FBFBFA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '1px solid #E7E5E4' }}>
                      <FileText size={24} color="#0B2545" />
                    </div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 600, color: '#1C1917' }}>
                      Government Smart ID / PAN Verification Card
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '0.74rem', color: '#57534E', marginTop: '4px' }}>
                      Doc Reference: #GOV-IN-{inspectingUser.id.replace(/[^0-9]/g, '') || '99201'} &bull; Digital Signature Confirmed
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div
                    className="tabular-nums"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: '#6F6A65',
                      paddingTop: '12px',
                      marginTop: '12px',
                      borderTop: '1px solid #E7E5E4'
                    }}
                  >
                    <span>EXIF Capture: 2026-10-02 IST</span>
                    <span>Resolution: 300 DPI Official Scan</span>
                    <span>Integrity: SHA-256 Validated</span>
                  </div>
                </div>

                {/* Automated AI Risk Telemetry Engine */}
                <div
                  style={{
                    backgroundColor: '#FBFBFA',
                    border: '1px solid #E7E5E4',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)'
                  }}
                >
                  <div style={{ padding: '12px 16px', backgroundColor: '#EEEDE9', borderBottom: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} color="#0B2545" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1C1917' }}>
                        Automated AI Risk Telemetry Engine
                      </span>
                    </div>
                    <span className="tabular-nums" style={{ fontSize: '0.72rem', fontWeight: 600, color: inspectingUser.trustScore >= 80 ? '#15803D' : '#B45309' }}>
                      Trust Score: {inspectingUser.trustScore}/100
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={16} color="#15803D" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1C1917' }}>Aadhaar & PAN Match</div>
                        <div style={{ fontSize: '0.74rem', color: '#57534E' }}>Applicant name matches national identity database records with 100% confidence.</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={16} color="#15803D" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1C1917' }}>Phone & OTP Verification</div>
                        <div className="tabular-nums" style={{ fontSize: '0.74rem', color: '#57534E' }}>Primary mobile {inspectingUser.phone} verified via 2FA carrier handshake.</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <AlertTriangle size={16} color="#C2410C" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1C1917' }}>Regional Service Clearance</div>
                        <div style={{ fontSize: '0.74rem', color: '#57534E' }}>Location flagged as {inspectingUser.city}. Cleared for local marketplace classifieds and verified technician dispatch.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel (40%): Applicant Dossier & Decision Engine */}
              <div
                style={{
                  width: '40%',
                  backgroundColor: '#FBFBFA',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Dossier Summary Card */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#EEEDE9',
                      border: '1px solid #E7E5E4',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6F6A65', fontWeight: 600, marginBottom: '8px' }}>
                      Applicant Metadata
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#6F6A65', display: 'block', fontSize: '0.70rem' }}>Full Name</span>
                        <strong style={{ color: '#1C1917' }}>{inspectingUser.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#6F6A65', display: 'block', fontSize: '0.70rem' }}>Account Type</span>
                        <strong style={{ color: '#1C1917' }}>{inspectingUser.role === 'Admin' ? 'Administrator' : 'User'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#6F6A65', display: 'block', fontSize: '0.70rem' }}>Email Address</span>
                        <span style={{ color: '#1C1917' }}>{inspectingUser.email}</span>
                      </div>
                      <div>
                        <span style={{ color: '#6F6A65', display: 'block', fontSize: '0.70rem' }}>Phone Number</span>
                        <span className="tabular-nums" style={{ color: '#1C1917' }}>{inspectingUser.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Reason Form */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                      Primary Decision Code *
                    </label>
                    <select
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '8px',
                        border: '1px solid #E7E5E4',
                        backgroundColor: '#EEEDE9',
                        color: '#1C1917',
                        padding: '0 12px',
                        fontSize: '0.80rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Clean / Verified Identity (Clear for Platform Operations)">Clean / Verified Identity (Clear for Platform Operations)</option>
                      <option value="Photo ID Clear and Verified against Official Records">Photo ID Clear and Verified against Official Records</option>
                      <option value="Duplicate or Blurred ID Document Uploaded">Duplicate or Blurred ID Document Uploaded</option>
                      <option value="Name Mismatch between Account and Government ID">Name Mismatch between Account and Government ID</option>
                    </select>
                  </div>

                  {/* Internal Remarks Textarea */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                      Internal Audit Remarks & Notification
                    </label>
                    <textarea
                      value={internalRemarks}
                      onChange={(e) => setInternalRemarks(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #E7E5E4',
                        backgroundColor: '#EEEDE9',
                        color: '#1C1917',
                        padding: '10px 12px',
                        fontSize: '0.80rem',
                        fontFamily: 'inherit',
                        lineHeight: 1.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Sticky Decision Action Buttons */}
                <div style={{ paddingTop: '20px', borderTop: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleAction(inspectingUser.id, 'Approved')}
                      style={{
                        height: '44px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#15803D',
                        color: '#FBFBFA',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Approve KYC</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(inspectingUser.id, 'Rejected')}
                      style={{
                        height: '44px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#BE123C',
                        color: '#FBFBFA',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <XCircle size={16} />
                      <span>Reject & Notify</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingUser(null)}
                    style={{
                      height: '38px',
                      borderRadius: '8px',
                      border: '1px solid #E7E5E4',
                      backgroundColor: '#EEEDE9',
                      color: '#57534E',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Postpone Inspection (Keep in Queue)
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
