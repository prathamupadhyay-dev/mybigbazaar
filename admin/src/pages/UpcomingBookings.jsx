import React, { useState } from 'react';
import { initialBookings, availableProviders } from './AllBookings';
import PageHeader from '../components/ui/PageHeader';

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState(() => 
    initialBookings.filter(b => b.status === 'Upcoming')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [reassignBooking, setReassignBooking] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [viewBooking, setViewBooking] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = bookings.filter(b => {
    const term = (searchTerm || '').toLowerCase();
    return (b.id || '').toLowerCase().includes(term) ||
      (b.customer?.name || '').toLowerCase().includes(term) ||
      (b.service?.name || '').toLowerCase().includes(term) ||
      (b.provider?.name || '').toLowerCase().includes(term);
  });

  const handleReassign = () => {
    if (!selectedProvider) return;
    const providerObj = availableProviders.find(p => p.id === selectedProvider);
    if (!providerObj) return;

    setBookings(bookings.map(b => {
      if (b.id === reassignBooking.id) {
        return {
          ...b,
          provider: { id: providerObj.id, name: providerObj.name, phone: '+91 99999 00000', rating: providerObj.rating }
        };
      }
      return b;
    }));
    showToast(`Assigned professional updated for ${reassignBooking.id}`);
    setReassignBooking(null);
    setSelectedProvider('');
  };

  const handleReschedule = () => {
    if (!newDate || !newTime) return;
    setBookings(bookings.map(b => {
      if (b.id === rescheduleBooking.id) {
        return {
          ...b,
          slot: { date: newDate, time: newTime }
        };
      }
      return b;
    }));
    showToast(`Booking ${rescheduleBooking.id} rescheduled to ${newDate} (${newTime})`);
    setRescheduleBooking(null);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Upcoming Bookings Queue"
        subtitle="Confirmed customer appointments scheduled for dispatch over the next 48 to 72 hours."
      />

      <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Scheduled Jobs</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>{bookings.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>All technicians notified</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Payment Secured</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
            ₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Prepaid & COD reserved</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Dispatch Readiness</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#8b5cf6', marginTop: '6px' }}>100%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>No unassigned requests</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search upcoming bookings by customer, service or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer & Address</th>
                <th>Service & Category</th>
                <th>Assigned Professional</th>
                <th>Scheduled Date & Slot</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{b.id}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>OTP: {b.otp}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.customer.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {b.customer.address}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.service.name}</div>
                    <span className="badge badge-default">{b.service.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.provider.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--status-warning-text)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>{b.provider.rating}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.slot.date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{b.slot.time}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>₹{b.amount}</div>
                    <span className="badge badge-info">{b.paymentMode}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-action" onClick={() => setViewBooking(b)}>Details</button>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => {
                          setRescheduleBooking(b);
                          setNewDate(b.slot.date);
                          setNewTime(b.slot.time);
                        }}
                      >
                        Reschedule
                      </button>
                      <button 
                        className="btn-action" 
                        onClick={() => {
                          setReassignBooking(b);
                          setSelectedProvider('');
                        }}
                      >
                        Reassign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Awaiting Backend Booking Records
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                      No upcoming bookings scheduled. Live dispatch appointments will appear here once booked.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '420px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Reschedule Slot — {rescheduleBooking.id}</h3>
              <button 
                onClick={() => setRescheduleBooking(null)} 
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
              <label className="form-label">New Appointment Date</label>
              <input type="date" className="form-input" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Time Window</label>
              <select className="form-select" value={newTime} onChange={e => setNewTime(e.target.value)}>
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setRescheduleBooking(null)}>Cancel</button>
              <button className="btn-action btn-edit" onClick={handleReschedule}>Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {viewBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '500px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Booking {viewBooking.id}</h3>
              <button 
                onClick={() => setViewBooking(null)} 
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
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div><strong>Customer:</strong> {viewBooking.customer.name} ({viewBooking.customer.phone})</div>
              <div><strong>Address:</strong> {viewBooking.customer.address}</div>
              <div><strong>Service:</strong> {viewBooking.service.name} (₹{viewBooking.amount})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <strong>Professional:</strong> {viewBooking.provider.name}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, marginLeft: '6px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {viewBooking.provider.rating}
                </span>
              </div>
              <div><strong>Slot:</strong> {viewBooking.slot.date} at {viewBooking.slot.time}</div>
              <div><strong>Customer Notes:</strong> {viewBooking.notes || 'None provided.'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setViewBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '480px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Reassign Professional</h3>
              <button 
                onClick={() => setReassignBooking(null)} 
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
              <label className="form-label">Select Available Professional</label>
              <select className="form-select" value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}>
                <option value="">-- Choose Professional --</option>
                {availableProviders.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.specialty}) — Rating: {p.rating}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setReassignBooking(null)}>Cancel</button>
              <button className="btn-action btn-edit" disabled={!selectedProvider} onClick={handleReassign}>Confirm</button>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
