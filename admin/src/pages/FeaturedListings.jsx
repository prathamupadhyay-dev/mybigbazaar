import React, { useState } from 'react';

export const INITIAL_FEATURED = [];

export default function FeaturedListings() {
  const [boosts, setBoosts] = useState(INITIAL_FEATURED);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveBoost = (boost) => {
    setBoosts((prev) => prev.filter((b) => b.id !== boost.id));
    showToast(`Boost removed for "${boost.title}". Reverted to standard listing.`);
  };

  const handleExtendBoost = (boost) => {
    setBoosts((prev) =>
      prev.map((b) => (b.id === boost.id ? { ...b, daysRemaining: b.daysRemaining + 7 } : b))
    );
    showToast(`Extended boost for "${boost.title}" by +7 days.`);
  };

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--mbb-radius-md)',
            border: '1px solid var(--border-color)',
            fontWeight: 600,
            fontSize: '0.84rem',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#17171B', margin: 0 }}>
          Featured &amp; Promoted Listings
        </h1>
        <p style={{ color: '#6B6B72', fontSize: '14px', marginTop: '4px' }}>
          Monitor paid promotional placements, impressions, CTR, and expiration dates.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '10px' }}>
          <div style={{ color: '#6B6B72', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            Active Paid Boosts
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1548A6', marginTop: '4px' }}>
            {boosts.length}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '10px' }}>
          <div style={{ color: '#6B6B72', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Impressions Generated
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1E9E5A', marginTop: '4px' }}>
            {boosts.reduce((sum, b) => sum + b.impressions, 0).toLocaleString()}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '10px' }}>
          <div style={{ color: '#6B6B72', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            Promotional Revenue
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#E96D0F', marginTop: '4px' }}>
            ₹{boosts.reduce((sum, b) => sum + (b.tier === 'Urgent' ? 149 : 99), 0)}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '10px' }}>
          <div style={{ color: '#6B6B72', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            Avg Click-Through Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#6E4CC7', marginTop: '4px' }}>
            {boosts.length > 0 ? `${((boosts.reduce((sum, b) => sum + b.clicks, 0) / (boosts.reduce((sum, b) => sum + b.impressions, 0) || 1)) * 100).toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Boosts Table */}
      <div className="admin-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E8E8EA', background: '#FAFAFA' }}>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Boost Ref</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Item Title &amp; Seller</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Tier</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Fee</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Impressions / Clicks</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72' }}>Expires In</th>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6B6B72', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {boosts.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #E8E8EA' }}>
                <td style={{ padding: '14px', fontWeight: '700', fontSize: '13px', color: '#1548A6' }}>
                  {b.id}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#17171B' }}>{b.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B72' }}>By {b.seller} • Listing {b.listingId}</div>
                </td>
                <td style={{ padding: '14px' }}>
                  {b.tier === 'Urgent' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', border: '1px solid var(--status-danger-border)', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      Urgent (+₹149)
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(233, 109, 15, 0.1)', color: 'var(--mbb-orange)', border: '1px solid rgba(233, 109, 15, 0.2)', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      Featured (+₹99)
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px', fontWeight: '700', fontSize: '14px', color: '#17171B' }}>
                  {b.fee}
                </td>
                <td style={{ padding: '14px', fontSize: '13px' }}>
                  <div><strong>{b.impressions.toLocaleString()}</strong> imp</div>
                  <div style={{ color: '#6B6B72', fontSize: '11px' }}>{b.clicks} clicks ({((b.clicks / b.impressions) * 100).toFixed(1)}% CTR)</div>
                </td>
                <td style={{ padding: '14px', fontSize: '13px' }}>
                  <span style={{ color: b.daysRemaining <= 2 ? '#B91C1C' : '#15803D', fontWeight: '700' }}>
                    {b.daysRemaining} days left
                  </span>
                  <div style={{ fontSize: '11px', color: '#6B6B72' }}>Ends {b.expiresOn}</div>
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleExtendBoost(b)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', marginRight: '6px', borderRadius: '6px', fontSize: '12px' }}
                  >
                    +7 Days
                  </button>
                  <button
                    onClick={() => handleRemoveBoost(b)}
                    className="btn-danger"
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
                  >
                    End Boost
                  </button>
                </td>
              </tr>
            ))}

            {boosts.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6B6B72' }}>
                  No active featured or boosted listings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
