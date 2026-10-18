import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

// Provider service ads awaiting partner creations
const INITIAL_SERVICE_ADS = [];

export default function ProviderServiceAds() {
  const [ads, setAds] = useState(INITIAL_SERVICE_ADS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notification, setNotification] = useState('');

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleApprove = (ad) => {
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'active' } : a));
    notify(`Service package "${ad.title}" has been approved and published to the live marketplace.`);
  };

  const handlePause = (ad) => {
    const next = ad.status === 'active' ? 'paused' : 'active';
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: next } : a));
    notify(`Service package "${ad.title}" is now ${next}.`);
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch =
      ad.title?.toLowerCase().includes(search.toLowerCase()) ||
      ad.providerName?.toLowerCase().includes(search.toLowerCase()) ||
      ad.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || ad.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || ad.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="admin-page">
      <PageHeader
        title="Provider Service Packages & Ads"
        description="Moderate custom service packages, repair tiers, and pricing catalog created by verified service partners."
      />

      {notification && (
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
          <span>{notification}</span>
        </div>
      )}

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Packages</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>{ads.length}</div>
        </div>
        <div className="admin-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Marketplace Listings</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--status-success-text)', marginTop: '4px' }}>{ads.filter(a => a.status === 'active').length}</div>
        </div>
        <div className="admin-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Awaiting Moderation</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--status-warning-text)', marginTop: '4px' }}>{ads.filter(a => a.status === 'under_review').length}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by package name, partner, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--hover-bg)', color: 'var(--text-primary)', fontSize: '14px' }}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
          >
            <option value="All">All Categories</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Tutor">Tutor</option>
            <option value="AC Repair">AC Repair</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Packages Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Service Offering</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Partner & City</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Starting Price</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Service Tiers</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Bookings Generated</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Status</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No provider service packages recorded yet.
                  </td>
                </tr>
              ) : (
                filteredAds.map(ad => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{ad.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{ad.durationMinutes} mins est. · Package ID: {ad.id}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{ad.providerName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {ad.category} · {ad.city}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--status-success-text)', fontSize: '15px' }}>₹{ad.basePrice}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Base visit</div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '260px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {ad.tiers?.map((t, i) => (
                          <span key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--hover-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                            • {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{ad.bookingsCount} bookings</div>
                      <div style={{ fontSize: '12px', color: 'var(--status-warning-text)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{ad.rating}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {ad.status === 'active' && (
                        <span className="badge badge-success">ACTIVE</span>
                      )}
                      {ad.status === 'under_review' && (
                        <span className="badge badge-warning">UNDER REVIEW</span>
                      )}
                      {ad.status === 'paused' && (
                        <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>PAUSED</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {ad.status === 'under_review' ? (
                        <button
                          onClick={() => handleApprove(ad)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePause(ad)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {ad.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
