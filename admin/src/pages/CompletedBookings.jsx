import React, { useState } from 'react';
import { initialBookings } from './AllBookings';
import PageHeader from '../components/ui/PageHeader';

export default function CompletedBookings() {
  const [bookings] = useState(() => 
    initialBookings.filter(b => b.status === 'Completed')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [viewInvoice, setViewInvoice] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <PageHeader
        title="Completed Bookings Archive"
        subtitle="Fulfilled service history, customer ratings, proof-of-work validation, and financial invoices."
      />

      <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fulfilled Services</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>{bookings.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Zero open disputes</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Settled Payouts</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '6px' }}>
            ₹{bookings.reduce((sum, b) => sum + (b.amount * 0.85), 0).toFixed(0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>15% platform commission retained</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Average CSAT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#eab308', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>5.0 / 5.0</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>100% verified customer ratings</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search completed bookings archive..."
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
                <th>Service & Date</th>
                <th>Customer</th>
                <th>Professional</th>
                <th>Customer Rating & Feedback</th>
                <th>Settlement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{b.id}</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-success">Completed</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill={star <= (b.rating || 5) ? '#f59e0b' : 'none'}
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '4px' }}>
                        ({b.rating || 5}.0)
                      </span>
                    </div>
                    {b.review && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                        "{b.review}"
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>₹{b.amount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Payout: ₹{(b.amount * 0.85).toFixed(0)}</div>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => setViewInvoice(b)}>Invoice</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No completed bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {viewInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '520px', maxWidth: '100%', margin: 0 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Tax Invoice — {viewInvoice.id}</h3>
              <button 
                onClick={() => setViewInvoice(null)} 
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
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div><strong>Billed To:</strong> {viewInvoice.customer.name}</div>
              <div><strong>Address:</strong> {viewInvoice.customer.address}</div>
              <div><strong>Fulfillment Partner:</strong> {viewInvoice.provider.name}</div>
              <div><strong>Date of Service:</strong> {viewInvoice.slot.date}</div>
            </div>
            <div style={{ margin: '14px 0', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{viewInvoice.service.name}</span>
                <span>₹{viewInvoice.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)' }}>
                <span>GST (18% included)</span>
                <span>₹{(viewInvoice.amount * 0.18 / 1.18).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed var(--border-color)', fontWeight: 700, fontSize: '0.95rem' }}>
                <span>Total Amount Paid</span>
                <span>₹{viewInvoice.amount}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setViewInvoice(null)}>Close</button>
              <button className="btn-primary" onClick={() => showToast('Invoice receipt PDF downloaded.')}>Download PDF</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
