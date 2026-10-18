import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const initialAppeals = [];

export default function Appeals() {
  const [appeals, setAppeals] = useState(initialAppeals);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleDecision = (id, newStatus) => {
    setAppeals(appeals.map(a => a.id === id ? { ...a, status: newStatus, reviewNotes: reviewNote } : a));
    showToast(`Appeal ${id} marked as ${newStatus}. Notification sent.`);
    setSelectedAppeal(null);
    setReviewNote('');
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Account & Content Appeals Queue"
        description="Review formal user petitions contesting suspensions, bans, or listing moderations."
      />

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast}</span>
        </div>
      )}

      <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Review</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            {appeals.filter(a => a.status === 'Pending').length} Appeals
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Awaiting moderator evaluation</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Appeals Granted</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>42 Users</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Accounts reinstated after verification</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Appeals Denied</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>88 Users</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Violations upheld with conclusive proof</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Appeal ID</th>
                <th>User Account</th>
                <th>Original Sanction</th>
                <th>Appeal Statement</th>
                <th>Documents</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appeals.map(a => (
                <tr key={a.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{a.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.user.role} | {a.user.phone}</div>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>{a.originalSanction}</div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.8rem', background: 'var(--hover-bg)', padding: '6px', borderRadius: '4px', fontStyle: 'italic' }}>
                      "{a.appealReason}"
                    </div>
                  </td>
                  <td>
                    {a.documents.length > 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                        {a.documents.length} attachment(s)
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{a.submittedDate}</div>
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'Pending' ? 'badge-warning' : a.status === 'Approved' ? 'badge-success' : 'badge-danger'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-action btn-edit" onClick={() => setSelectedAppeal(a)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {appeals.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No pending user appeals in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedAppeal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '540px', maxWidth: '100%', margin: 0, boxShadow: 'var(--modal-shadow)' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">Review Appeal Petition — {selectedAppeal.id}</h3>
              <button
                onClick={() => setSelectedAppeal(null)}
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

            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '14px' }}>
              <div><strong>Appellant:</strong> {selectedAppeal.user?.name} ({selectedAppeal.user?.email})</div>
              <div><strong>Original Sanction:</strong> <span style={{ color: 'var(--status-danger-text)' }}>{selectedAppeal.originalSanction}</span></div>
              <div style={{ marginTop: '8px' }}><strong>Appellant Statement:</strong></div>
              <div style={{ background: 'var(--hover-bg)', padding: '10px', borderRadius: '6px', margin: '4px 0', fontStyle: 'italic' }}>
                "{selectedAppeal.appealReason}"
              </div>

              {selectedAppeal.documents?.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Submitted Proof Attachments:</strong>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {selectedAppeal.documents.map((doc, i) => (
                      <span
                        key={i}
                        className="badge badge-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => showToast(`Document "${doc}" attached.`)}
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Review Rationale / Decision Remarks</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="State reason for granting or denying appeal..."
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setSelectedAppeal(null)}>Dismiss</button>
              <button 
                className="btn-action btn-delete" 
                onClick={() => handleDecision(selectedAppeal.id, 'Rejected')}
              >
                Reject & Uphold Sanction
              </button>
              <button 
                className="btn-action btn-edit" 
                onClick={() => handleDecision(selectedAppeal.id, 'Approved')}
              >
                Approve & Reinstate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
