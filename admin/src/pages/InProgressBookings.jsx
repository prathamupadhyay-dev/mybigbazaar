import React, { useState } from 'react';
import { initialBookings } from './AllBookings';
import PageHeader from '../components/ui/PageHeader';

export default function InProgressBookings() {
  const [bookings, setBookings] = useState(() => 
    initialBookings.filter(b => b.status === 'In Progress')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [completeBooking, setCompleteBooking] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [escalateBooking, setEscalateBooking] = useState(null);
  const [escalateReason, setEscalateReason] = useState('Safety Concern');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkComplete = () => {
    setBookings(bookings.filter(b => b.id !== completeBooking.id));
    showToast(`Job ${completeBooking.id} marked complete & payout released.`);
    setCompleteBooking(null);
    setCompletionNotes('');
  };

  const handleEscalate = () => {
    showToast(`Booking ${escalateBooking.id} escalated to Trust & Safety Team. Priority ticket dispatched.`, 'error');
    setEscalateBooking(null);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="In-Progress Service Operations"
        subtitle="Live tracking of service technicians currently on-site with active customer jobs."
      />

      <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active On-Site</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>{bookings.length} Jobs</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Live technician GPS telemetry enabled</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Completed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>{bookings.filter(b => b.status === 'Completed').length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Fulfilled jobs</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>In Progress</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '6px' }}>{bookings.filter(b => b.status !== 'Completed').length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Active dispatch</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search live active jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Service & Duration</th>
                <th>Technician</th>
                <th>Customer & Location</th>
                <th>Start Verification OTP</th>
                <th>Amount & Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{b.id}</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-warning">On-Site Active</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.service.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated: {b.service.duration}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.provider.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> {b.provider.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {b.customer.address}</div>
                  </td>
                  <td>
                    <div style={{ background: 'var(--hover-bg)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', fontFamily: 'monospace', fontWeight: 700, color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                      VERIFIED ({b.otp})
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>₹{b.amount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.paymentMode}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => {
                          setCompleteBooking(b);
                          setCompletionNotes('');
                        }}
                      >
                        Complete Job
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => setEscalateBooking(b)}
                      >
                        Escalate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No service jobs currently in progress.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Job Modal */}
      {completeBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '460px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Mark Service Job Completed</h3>
              <button 
                onClick={() => setCompleteBooking(null)} 
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Confirm that professional <strong>{completeBooking.provider.name}</strong> has satisfactorily completed <strong>{completeBooking.service.name}</strong> for customer <strong>{completeBooking.customer.name}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Completion Remarks / Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Work done verified, customer confirmed satisfaction..."
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setCompleteBooking(null)}>Cancel</button>
              <button className="btn-action btn-edit" onClick={handleMarkComplete}>Confirm & Release Payout</button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {escalateBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '460px', maxWidth: '100%', margin: 0, borderTop: '4px solid #ef4444' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title" style={{ color: '#ef4444' }}>Escalate Service Job</h3>
              <button 
                onClick={() => setEscalateBooking(null)} 
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
            <div className="form-group">
              <label className="form-label">Escalation Category</label>
              <select className="form-select" value={escalateReason} onChange={e => setEscalateReason(e.target.value)}>
                <option value="Safety Concern">Safety Concern / Dispute at Premises</option>
                <option value="Quality Dispute">Customer disputes quality of work</option>
                <option value="Pricing Dispute">Technician requesting extra payment off-platform</option>
                <option value="Technician Left">Technician abandoned premises without completion</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setEscalateBooking(null)}>Dismiss</button>
              <button className="btn-action btn-delete" onClick={handleEscalate}>Dispatch Support Agent</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${toast.type === 'error' ? 'var(--status-danger-border)' : 'var(--border-color)'}`,
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--mbb-radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: toast.type === 'error' ? 'var(--status-danger-text)' : 'var(--text-primary)'
        }}>
          {toast.type === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
