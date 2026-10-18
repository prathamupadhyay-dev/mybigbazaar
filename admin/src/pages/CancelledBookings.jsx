import React, { useState } from 'react';
import { initialBookings } from './AllBookings';
import PageHeader from '../components/ui/PageHeader';

export default function CancelledBookings() {
  const [bookings] = useState(() => 
    initialBookings.filter(b => b.status === 'Cancelled')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);

  const filtered = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <PageHeader
        title="Cancelled Bookings & Disputes"
        subtitle="Audit log of cancelled service bookings, cancellation reasons, refund settlements, and penalty tracking."
      />

      <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Cancelled</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>{bookings.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Platform churn rate: 2.1%</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Refunded</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            ₹{bookings.reduce((sum, b) => b.paymentStatus === 'Refunded' ? sum + b.amount : sum, 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Credited back to customer accounts</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Dispute Resolution</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '6px' }}>100%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>All cases settled</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search cancelled bookings..."
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
                <th>Service & Slot</th>
                <th>Customer</th>
                <th>Assigned Professional</th>
                <th>Cancellation Rationale</th>
                <th>Refund Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{b.id}</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-danger">Cancelled</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.service.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.slot.date} ({b.slot.time})</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.customer.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.provider.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {b.provider.id}</div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                      {b.cancelReason || 'Customer requested cancellation'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>₹{b.amount}</div>
                    <span className="badge badge-warning">{b.paymentStatus}</span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => setSelectedDispute(b)}>Audit Notes</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No cancelled bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDispute && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '480px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Dispute & Audit Record — {selectedDispute.id}</h3>
              <button 
                onClick={() => setSelectedDispute(null)} 
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
              <div><strong>Cancellation Reason:</strong> {selectedDispute.cancelReason}</div>
              <div><strong>Customer Requested:</strong> Yes</div>
              <div><strong>Provider Fault:</strong> No (Clean record preserved)</div>
              <div><strong>Refund Transaction ID:</strong> RFND-2026-904128</div>
              <div><strong>Settled By:</strong> Automated Policy Engine</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn-action" onClick={() => setSelectedDispute(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
