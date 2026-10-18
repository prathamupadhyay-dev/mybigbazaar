import React, { useState } from 'react';

export const INITIAL_AVAILABILITY = [];

export default function ProviderAvailability() {
  const [partners, setPartners] = useState(INITIAL_AVAILABILITY);
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [pingAlert, setPingAlert] = useState('');

  const handlePing = (partner) => {
    setPingAlert(`Dispatched live ping check to ${partner.fullName} (${partner.phoneNumber}). Location refreshed.`);
    setTimeout(() => setPingAlert(''), 4000);
  };

  const handleToggleStatus = (partner) => {
    setPartners(prev =>
      prev.map(p => {
        if (p.id === partner.id) {
          const next = p.currentStatus === 'Online' ? 'Offline' : 'Online';
          return { ...p, currentStatus: next, lastPing: 'Just now' };
        }
        return p;
      })
    );
  };

  const total = partners.length;
  const onlineCount = partners.filter(p => p.currentStatus === 'Online').length;
  const busyCount = partners.filter(p => p.currentStatus === 'Busy').length;
  const offlineCount = partners.filter(p => p.currentStatus === 'Offline').length;

  const filteredPartners = partners.filter(p => {
    const term = (search || '').toLowerCase();
    const matchesSearch =
      (p.fullName || '').toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term) ||
      (p.city || '').toLowerCase().includes(term);
    const matchesCity = cityFilter === 'All' || p.city === cityFilter;
    const matchesStatus = statusFilter === 'All' || p.currentStatus === statusFilter;
    return matchesSearch && matchesCity && matchesStatus;
  });

  return (
    <div className="admin-page" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>Live Partner Availability</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
          Real-time visibility into active on-duty service professionals ready to accept customer bookings.
        </p>
      </div>

      {pingAlert ? (
        <div style={{ padding: '12px 16px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '8px', marginBottom: '16px', fontWeight: '500' }}>
          Ping: {pingAlert}
        </div>
      ) : null}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '18px', background: '#fff', borderRadius: '12px', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>Total Technicians</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginTop: '4px' }}>{total}</div>
          <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '4px' }}>Across 6 cities</div>
        </div>

        <div className="admin-card" style={{ padding: '18px', background: '#fff', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>Online (Available)</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#065F46', marginTop: '4px' }}>{onlineCount}</div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>Ready to take leads</div>
        </div>

        <div className="admin-card" style={{ padding: '18px', background: '#fff', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>On Active Jobs (Busy)</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#B45309', marginTop: '4px' }}>{busyCount}</div>
          <div style={{ fontSize: '12px', color: '#F59E0B', marginTop: '4px' }}>Executing services</div>
        </div>

        <div className="admin-card" style={{ padding: '18px', background: '#fff', borderRadius: '12px', borderLeft: '4px solid #9CA3AF' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>Offline</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#4B5563', marginTop: '4px' }}>{offlineCount}</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Off-duty or resting</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name, skill, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
          />

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', background: '#fff' }}
          >
            <option value="All">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', background: '#fff' }}
          >
            <option value="All">All Live Status</option>
            <option value="Online">Online</option>
            <option value="Busy">Busy</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Availability Table */}
      <div className="admin-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>Partner & Phone</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>Category</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>City</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>Live Status</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>Operating Hours</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>Active Jobs</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>Last Heartbeat</th>
                <th style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{p.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{p.phoneNumber}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 8px', background: '#F3F4F6', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                    {p.city}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {p.currentStatus === 'Online' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#ECFDF5', color: '#065F46', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                        Online
                      </span>
                    )}
                    {p.currentStatus === 'Busy' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#FEF3C7', color: '#92400E', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }}></span>
                        Busy (Job Active)
                      </span>
                    )}
                    {p.currentStatus === 'Offline' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#F3F4F6', color: '#6B7280', borderRadius: '16px', fontSize: '12px', fontWeight: '500' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }}></span>
                        Offline
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#4B5563' }}>
                    {p.operatingHours}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: p.activeJobsCount > 0 ? '#D97706' : '#6B7280' }}>
                    {p.activeJobsCount} Active
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7280' }}>
                    <div>{p.lastPing}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Battery: {p.batteryLevel}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handlePing(p)}
                      style={{ padding: '6px 10px', marginRight: '6px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Ping
                    </button>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      style={{ padding: '6px 10px', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {p.currentStatus === 'Online' ? 'Force Offline' : 'Set Online'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                    No service providers registered or online.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
