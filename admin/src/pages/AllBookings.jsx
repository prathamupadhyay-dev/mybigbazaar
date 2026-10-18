import React, { useState, useEffect, useMemo } from 'react';
import BulkActionBar from '../components/common/BulkActionBar';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';

export const normalizeBooking = (b, idx = 0) => {
  const customerName = b.customer?.name || b.customerName || (b.customerId?.fullName || b.customerId?.name) || 'Customer';
  const customerPhone = b.customer?.phone || b.customerPhone || b.customerId?.phoneNumber || '+91 98765 43210';
  const customerEmail = b.customer?.email || b.customerEmail || b.customerId?.email || 'customer@bigbazaar.com';
  const customerAddress = b.customer?.address || b.address || (typeof b.serviceAddress === 'object' && b.serviceAddress !== null ? `${b.serviceAddress.city || ''}, ${b.serviceAddress.pincode || ''}` : String(b.serviceAddress || 'Indore, Madhya Pradesh'));

  const serviceName = b.service?.name || b.serviceTitle || b.serviceName || 'Hyperlocal Service';
  const serviceCat = b.service?.category || b.category || 'General';
  const serviceDur = b.service?.duration || b.duration || '60 mins';

  const providerName = b.provider?.name || b.providerName || (b.providerId?.fullName || b.providerId?.name) || 'Assigned Partner';
  const providerPhone = b.provider?.phone || b.providerPhone || b.providerId?.phoneNumber || '+91 98111 87654';
  const providerRating = b.provider?.rating || b.providerRating || 4.9;

  const dateStr = b.slot?.date || b.date || (b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'Tomorrow');
  const timeStr = b.slot?.time || b.timeSlot || b.scheduledTimeSlot || '10:00 AM - 12:00 PM';

  const rawStatus = (b.status || 'Upcoming').toLowerCase();
  let normalizedStatus = 'Upcoming';
  if (rawStatus === 'completed') normalizedStatus = 'Completed';
  else if (rawStatus === 'cancelled' || rawStatus === 'canceled') normalizedStatus = 'Cancelled';
  else if (rawStatus === 'in_progress' || rawStatus === 'in progress' || rawStatus === 'assigned') normalizedStatus = 'In Progress';
  else normalizedStatus = 'Upcoming';

  return {
    ...b,
    id: b.bookingId || b.id || b._id || `BKG-${882000 + idx}`,
    customer: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: customerAddress
    },
    service: {
      name: serviceName,
      category: serviceCat,
      duration: serviceDur
    },
    provider: {
      id: b.provider?.id || b.providerId?._id || b.providerId || 'p1',
      name: providerName,
      phone: providerPhone,
      rating: providerRating
    },
    slot: {
      date: dateStr,
      time: timeStr
    },
    date: dateStr,
    timeSlot: timeStr,
    amount: Number(b.amount || b.totalAmount || 0),
    commissionRate: Number(b.commissionRate || b.commission || 0),
    commissionAmount: Math.round((Number(b.amount || b.totalAmount || 0) * Number(b.commissionRate || b.commission || 0)) / 100),
    netPayout: Number(b.amount || b.totalAmount || 0) - Math.round((Number(b.amount || b.totalAmount || 0) * Number(b.commissionRate || b.commission || 0)) / 100),
    paymentMode: b.paymentMode || 'Online (UPI)',
    paymentStatus: (b.paymentStatus === 'paid' || b.paymentStatus === 'Paid') ? 'Paid' : (b.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'),
    status: normalizedStatus,
    address: customerAddress
  };
};

export const initialBookings = [];

export const availableProviders = [
  { id: 'p1', name: 'Rajesh Kumar Tech', rating: 4.9, trade: 'Electrical & AC' },
  { id: 'p2', name: 'Suresh Plumbers', rating: 4.8, trade: 'Plumbing' },
  { id: 'p3', name: 'CleanPro Solutions', rating: 4.7, trade: 'Home Cleaning' },
  { id: 'p4', name: 'Priya Verma Math Tutor', rating: 5.0, trade: 'Tutoring' }
];

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [liveProviders, setLiveProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reassignModalBooking, setReassignModalBooking] = useState(null);
  const [selectedNewProvider, setSelectedNewProvider] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer Request');
  const [processRefund, setProcessRefund] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      try {
        const res = await apiFetch('/api/v1/bookings?all=true').catch(() => null);
        if (isMounted && res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.bookings) ? json.bookings : []);
          setBookings(list.map(normalizeBooking));
        }
      } catch (e) {}
    }

    async function loadProviders() {
      try {
        const res = await apiFetch('/api/v1/providers').catch(() => null);
        if (isMounted && res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const plist = Array.isArray(json.data) ? json.data : (Array.isArray(json.providers) ? json.providers : []);
          if (plist.length > 0) {
            setLiveProviders(plist.map(p => ({
              id: p.id || p._id,
              name: p.fullName || p.name || 'Provider',
              rating: p.rating || 4.9,
              specialty: p.category || 'Service Partner',
              activeJobs: p.activeJobs || 1
            })));
          }
        }
      } catch (e) {}
    }

    loadBookings();
    loadProviders();
    return () => { isMounted = false; };
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredBookings.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = (newStatus) => {
    setBookings(bookings.map(b => selectedIds.includes(b.id) ? { ...b, status: newStatus } : b));
    for (const id of selectedIds) {
      apiFetch(`/api/v1/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus.toLowerCase().replace(' ', '_') })
      }).catch(() => {});
    }
    setSelectedIds([]);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (b.id || '').toLowerCase().includes(term) ||
      (b.customer?.name || '').toLowerCase().includes(term) ||
      (b.service?.name || '').toLowerCase().includes(term) ||
      (b.provider?.name || '').toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || b.paymentMode === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // KPI Calculations
  const totalBookings = bookings.length;
  const upcomingCount = bookings.filter(b => b.status === 'Upcoming').length;
  const inProgressCount = bookings.filter(b => b.status === 'In Progress').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;
  const totalGMV = bookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + b.amount : sum, 0);

  // Actions
  const handleReassign = () => {
    if (!selectedNewProvider) return;
    const pool = liveProviders.length > 0 ? liveProviders : availableProviders;
    const providerObj = pool.find(p => p.id === selectedNewProvider);
    if (!providerObj) return;

    const targetId = reassignModalBooking._id || reassignModalBooking.id;
    apiFetch(`/api/v1/bookings/${targetId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'assigned',
        providerName: providerObj.name,
        providerContact: '+91 99999 00000'
      })
    }).catch(() => {});

    setBookings(bookings.map(b => {
      if (b.id === reassignModalBooking.id) {
        return {
          ...b,
          provider: { id: providerObj.id, name: providerObj.name, phone: '+91 99999 00000', rating: providerObj.rating }
        };
      }
      return b;
    }));
    setReassignModalBooking(null);
    setSelectedNewProvider('');
  };

  const handleForceCancel = () => {
    const targetId = cancelModalBooking._id || cancelModalBooking.id;
    apiFetch(`/api/v1/bookings/${targetId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'cancelled',
        cancellationReason: `Admin Force Cancel: ${cancelReason}`,
        paymentStatus: processRefund ? 'refunded' : undefined
      })
    }).catch(() => {});

    setBookings(bookings.map(b => {
      if (b.id === cancelModalBooking.id) {
        return {
          ...b,
          status: 'Cancelled',
          cancelReason: `Admin Force Cancel: ${cancelReason}`,
          paymentStatus: processRefund && b.paymentStatus === 'Paid' ? 'Refunded' : b.paymentStatus
        };
      }
      return b;
    }));
    setCancelModalBooking(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Upcoming':
        return <span className="badge badge-info">Upcoming</span>;
      case 'In Progress':
        return <span className="badge badge-warning">In Progress</span>;
      case 'Completed':
        return <span className="badge badge-success">Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  const exportBookings = useMemo(() => {
    return filteredBookings.map((b) => ({
      id: b.id,
      date: b.date || b.slot?.date,
      timeSlot: b.timeSlot,
      customerName: b.customer?.name || 'Customer',
      customerPhone: b.customer?.phone || '',
      serviceName: b.service?.name || 'Service',
      serviceCategory: b.service?.category || '',
      providerName: b.provider?.name || '',
      amount: b.amount,
      commissionAmount: b.commissionAmount,
      netPayout: b.netPayout,
      paymentStatus: b.paymentStatus,
      status: b.status
    }));
  }, [filteredBookings]);

  return (
    <div className="admin-page">
      <PageHeader
        title="Bookings"
        breadcrumbs={['Commerce', 'Bookings']}
      >
        <ExportButton
          data={exportBookings}
          filename="bookings.csv"
          label="Export Bookings CSV"
          dateKey="date"
          columns={[
            { key: 'id', label: 'Booking ID' },
            { key: 'date', label: 'Date' },
            { key: 'timeSlot', label: 'Time Slot' },
            { key: 'customerName', label: 'Customer' },
            { key: 'customerPhone', label: 'Customer Phone' },
            { key: 'serviceName', label: 'Service' },
            { key: 'serviceCategory', label: 'Category' },
            { key: 'providerName', label: 'Assigned Partner' },
            { key: 'amount', label: 'Amount (INR)' },
            { key: 'commissionAmount', label: 'Commission (INR)' },
            { key: 'netPayout', label: 'Net Payout (INR)' },
            { key: 'paymentStatus', label: 'Payment Status' },
            { key: 'status', label: 'Booking Status' }
          ]}
        />
      </PageHeader>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Total Bookings</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{totalBookings}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-color)', marginTop: '4px' }}>GMV: ₹{totalGMV.toLocaleString('en-IN')}</div>
        </div>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Upcoming</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#06b6d4', marginTop: '4px' }}>{upcomingCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Next 48 Hours</div>
        </div>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>In Progress</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--status-warning-text)', marginTop: '4px' }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Active on site</div>
        </div>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Completed</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--status-success-text)', marginTop: '4px' }}>{completedCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{cancelledCount} Cancelled</div>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search by ID, Customer, Service, Provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Payment:</label>
            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Modes</option>
              <option value="UPI">UPI</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Card">Card</option>
            </select>
          </div>
          {(searchTerm || statusFilter !== 'All' || paymentFilter !== 'All') && (
            <button
              className="btn-action"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setPaymentFilter('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Bookings Table */}
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '38px' }}>
                  <input
                    type="checkbox"
                    checked={filteredBookings.length > 0 && selectedIds.length === filteredBookings.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service Name</th>
                <th>Assigned Provider</th>
                <th>Scheduled Slot</th>
                <th>Gross Amount</th>
                <th>Commission</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} style={{ background: selectedIds.includes(b.id) ? 'var(--hover-bg)' : 'transparent' }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b.id)}
                      onChange={() => handleToggleRow(b.id)}
                    />
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>
                      {b.id}
                    </span>
                    {b.otp && b.status !== 'Completed' && b.status !== 'Cancelled' && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        OTP: <strong style={{ color: 'var(--text-primary)' }}>{b.otp}</strong>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.customer?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.customer?.phone || '—'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.service?.name || 'Service'}</div>
                    <span className="badge badge-default" style={{ marginTop: '2px', fontSize: '0.68rem' }}>
                      {b.service?.category || 'General'} ({b.service?.duration || '60 mins'})
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--border-color)' }}>
                        {(b.provider?.name || 'P').charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.provider?.name || 'Partner'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>{b.provider?.rating || 4.9}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{b.slot?.date || b.date || 'Scheduled'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.slot?.time || b.timeSlot || 'Anytime'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(b.amount || 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#22c55e' : b.paymentStatus === 'Refunded' ? '#ef4444' : '#f59e0b' }}>
                      ● {b.paymentStatus || 'Pending'} ({b.paymentMode || 'Online'})
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--accent-color)', fontSize: '0.84rem' }}>
                      {b.commissionRate}% (₹{(b.commissionAmount || 0).toLocaleString('en-IN')})
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Platform Share</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.84rem' }}>
                      ₹{(b.netPayout || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Partner Share</div>
                  </td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-action"
                        title="View Full Booking Details"
                        onClick={() => setSelectedBooking(b)}
                      >
                        Details
                      </button>
                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <>
                          <button
                            className="btn-action btn-edit"
                            title="Reassign to another technician"
                            onClick={() => {
                              setReassignModalBooking(b);
                              setSelectedNewProvider('');
                            }}
                          >
                            Reassign
                          </button>
                          <button
                            className="btn-action btn-delete"
                            title="Force Cancel this appointment"
                            onClick={() => {
                              setCancelModalBooking(b);
                              setCancelReason('Customer Request');
                              setProcessRefund(true);
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      No Bookings Recorded Yet
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                      Customer appointments and service orders will display here automatically once booked.
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No bookings found matching the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: 'Bulk Mark Completed', icon: 'M5 13l4 4L19 7', onClick: () => handleBulkStatus('Completed'), variant: 'primary' },
          { label: 'Bulk Cancel', icon: 'M6 18L18 6M6 6l12 12', onClick: () => handleBulkStatus('Cancelled'), variant: 'danger' }
        ]}
      />

      {/* Details Modal */}
      {selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'var(--glass-blur)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '600px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', margin: 0, background: 'var(--modal-bg)', border: '1px solid var(--border-color)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Booking Details — {selectedBooking.id}</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: </span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Start Verification OTP: <strong style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>{selectedBooking.otp}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Customer Information</div>
                <div style={{ fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>{selectedBooking.customer?.name || 'Customer'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{selectedBooking.customer?.phone || '—'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedBooking.customer?.email || '—'}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-primary)' }}>{selectedBooking.customer?.address || selectedBooking.address || '—'}</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Assigned Professional</div>
                <div style={{ fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>{selectedBooking.provider?.name || 'Assigned Partner'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>ID: {selectedBooking.provider?.id || '—'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedBooking.provider?.phone || '—'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Rating:</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBooking.provider?.rating || 4.9} / 5.0</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--hover-bg)', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Service & Slot</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedBooking.service?.name || 'Service'}</strong>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Gross: ₹{selectedBooking.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '4px', color: 'var(--accent-color)' }}>
                <span>Platform Commission ({selectedBooking.commissionRate || 12}%):</span>
                <strong>-₹{selectedBooking.commissionAmount || Math.round(((selectedBooking.amount || 0) * (selectedBooking.commissionRate || 12)) / 100)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '2px', color: '#16a34a' }}>
                <span>Net Partner Payout:</span>
                <strong>₹{selectedBooking.netPayout || ((selectedBooking.amount || 0) - Math.round(((selectedBooking.amount || 0) * (selectedBooking.commissionRate || 12)) / 100))}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Scheduled Slot: {selectedBooking.slot?.date || selectedBooking.date || 'Scheduled'} ({selectedBooking.slot?.time || selectedBooking.timeSlot || 'Anytime'})
              </div>
              {selectedBooking.notes && (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', background: 'var(--card-bg)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid var(--accent-color)' }}>
                  <strong>Customer Instructions:</strong> {selectedBooking.notes}
                </div>
              )}
              {selectedBooking.cancelReason && (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '8px', borderRadius: '6px' }}>
                  <strong>Cancellation Reason:</strong> {selectedBooking.cancelReason}
                </div>
              )}
              {selectedBooking.review && (
                <div style={{ fontSize: '0.8rem', marginTop: '6px', background: 'rgba(34,197,94,0.1)', color: '#15803d', padding: '8px', borderRadius: '6px' }}>
                  <strong>Customer Feedback ({selectedBooking.rating}/5):</strong> "{selectedBooking.review}"
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setSelectedBooking(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Provider Modal */}
      {reassignModalBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'var(--glass-blur)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '480px', maxWidth: '100%', margin: 0, background: 'var(--modal-bg)', border: '1px solid var(--border-color)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reassign Booking {reassignModalBooking.id}</h3>
              <button 
                onClick={() => setReassignModalBooking(null)}
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

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Current Provider: <strong style={{ color: 'var(--text-primary)' }}>{reassignModalBooking.provider.name}</strong>. Select an available verified professional:
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Available Providers</label>
              <select
                className="form-select"
                value={selectedNewProvider}
                onChange={(e) => setSelectedNewProvider(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="">-- Choose Verified Professional --</option>
                {(liveProviders.length > 0 ? liveProviders : availableProviders)
                  .filter(p => p.id !== reassignModalBooking.provider.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.specialty || p.trade || 'Partner'}) — Rating: {p.rating}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setReassignModalBooking(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
              <button 
                className="btn-primary" 
                disabled={!selectedNewProvider} 
                onClick={handleReassign}
                style={{ opacity: selectedNewProvider ? 1 : 0.5, padding: '8px 16px', borderRadius: '6px' }}
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Cancel Modal */}
      {cancelModalBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'var(--glass-blur)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '460px', maxWidth: '100%', margin: 0, background: 'var(--modal-bg)', border: '1px solid var(--border-color)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#EF4444' }}>Cancel Booking</h3>
              <button 
                onClick={() => setCancelModalBooking(null)}
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
              Are you sure you want to cancel booking <strong style={{ color: 'var(--text-primary)' }}>{cancelModalBooking.id}</strong> ({cancelModalBooking.service.name}) for customer <strong style={{ color: 'var(--text-primary)' }}>{cancelModalBooking.customer.name}</strong>?
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Cancellation Reason</label>
              <select
                className="form-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="Customer Request">Customer requested cancellation</option>
                <option value="Technician Unavailable">Technician unable to attend / no-show</option>
                <option value="Severe Weather or Danger">Adverse conditions or safety risk</option>
                <option value="Suspected Fraud / Spam">Suspicious booking or payment anomaly</option>
              </select>
            </div>

            {cancelModalBooking.paymentStatus === 'Paid' && (
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="refundCheckbox"
                  checked={processRefund}
                  onChange={(e) => setProcessRefund(e.target.checked)}
                />
                <label htmlFor="refundCheckbox" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Automatically initiate refund of ₹{cancelModalBooking.amount}
                </label>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setCancelModalBooking(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
              <button className="btn-danger" onClick={handleForceCancel} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
