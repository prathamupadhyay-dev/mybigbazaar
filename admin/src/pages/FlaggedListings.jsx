import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const INITIAL_FLAGGED = [];

export default function FlaggedListings() {
  const [reports, setReports] = useState(INITIAL_FLAGGED);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDismiss = (report) => {
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    showToast(`Report ${report.id} dismissed as invalid.`);
    setSelectedReport(null);
  };

  const handleSuspendListing = (report) => {
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    showToast(`Listing ${report.listingId} suspended for "${report.reportReason}".`);
    setSelectedReport(null);
  };

  const handleBanSeller = (report) => {
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    showToast(`Seller "${report.seller}" banned and listing removed.`);
    setSelectedReport(null);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Flagged & Reported Listings"
        subtitle="Investigate community reports for counterfeits, advance fee fraud, and prohibited items."
      />

      {/* Flagged Table */}
      <div className="admin-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E8E8EA', background: '#FAFAFA' }}>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Report Ref</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Reported Listing</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Flag Reason</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Severity</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Reporter</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Date</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #E8E8EA' }}>
                <td style={{ padding: '14px', fontWeight: '700', fontSize: '13px', color: '#D42E2E' }}>
                  {r.id}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={r.image}
                      alt={r.title}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#17171B' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: '#6B6B72' }}>Seller: <strong>{r.seller}</strong> • {r.price}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ color: '#D42E2E', fontWeight: '600', fontSize: '13px' }}>{r.reportReason}</div>
                  <div style={{ fontSize: '11px', color: '#6B6B72', maxWidth: '240px' }}>{r.evidenceNotes}</div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span
                    style={{
                      background: r.severity === 'Critical' ? '#FEE2E2' : '#FEF3C7',
                      color: r.severity === 'Critical' ? '#B91C1C' : '#B45309',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}
                  >
                    {r.severity}
                  </span>
                </td>
                <td style={{ padding: '14px', fontSize: '12px', color: '#17171B' }}>
                  {r.reporter}
                </td>
                <td style={{ padding: '14px', fontSize: '12px', color: '#6B6B72' }}>
                  {r.reportDate}
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedReport(r)}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', marginRight: '6px', borderRadius: '6px', fontSize: '12px' }}
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleSuspendListing(r)}
                    className="btn-danger"
                    style={{ padding: '6px 10px', marginRight: '6px', borderRadius: '6px', fontSize: '12px' }}
                  >
                    Suspend Ad
                  </button>
                  <button
                    onClick={() => handleDismiss(r)}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
                  >
                    Dismiss
                  </button>
                </td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '12px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Queue is Clean</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    No reported listings in queue. Community standards are maintained.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--status-danger-text)' }}>
                Report Investigation #{selectedReport.id}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
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

            <img
              src={selectedReport.image}
              alt={selectedReport.title}
              style={{ width: '100%', height: '180px', borderRadius: '10px', objectFit: 'cover', marginBottom: '14px', border: '1px solid var(--border-color)' }}
            />

            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedReport.title}</h4>
            <div style={{ color: 'var(--accent-color)', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>
              {selectedReport.price}
            </div>

            <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: 'var(--status-danger-text)', fontSize: '13px' }}>Reported Violation:</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '13px', marginTop: '2px' }}>{selectedReport.reportReason}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px' }}>{selectedReport.evidenceNotes}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => handleDismiss(selectedReport)}
                className="btn-secondary"
                style={{ padding: '8px 14px', borderRadius: '6px' }}
              >
                Dismiss Report
              </button>
              <button
                onClick={() => handleSuspendListing(selectedReport)}
                className="btn-danger"
                style={{ padding: '8px 14px', borderRadius: '6px' }}
              >
                Suspend Listing
              </button>
              <button
                onClick={() => handleBanSeller(selectedReport)}
                className="btn-action btn-delete"
                style={{ padding: '8px 14px', borderRadius: '6px' }}
              >
                Ban Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Glass Toast */}
      {toastMessage && (
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
