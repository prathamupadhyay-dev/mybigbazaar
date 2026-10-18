// ============================================================
// Marketplace Seller Operations & Performance Center
// ============================================================
// Operational monitoring of C2C and power sellers: sell-through
// rates, chat responsiveness, dispute ratios, and GMV rankings.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import StatusPill from '../components/common/StatusPill'
import ExportButton from '../components/common/ExportButton'

export default function SellerPerformance() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')

  // Sellers roster awaiting live telemetry
  const sellers = []

  // Tier donut awaiting live telemetry
  const tierDonut = []

  const barData = []

  const filtered = sellers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.phone.includes(searchQuery)
    const matchesTier = selectedTier === 'all' || s.tier === selectedTier
    return matchesSearch && matchesTier
  })

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Seller Directory & Performance Cockpit
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              AWAITING MERCHANT TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage classifieds sellers, response SLAs, sell-through velocity, and dispute frequencies.
          </p>
        </div>

        <ExportButton
          data={sellers}
          filename="mybigbazaar-seller-performance.csv"
          label="Export Seller Roster"
        />
      </div>

      {/* Data Truth Notice Banner */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <strong>Awaiting Merchant Telemetry:</strong> Seller tier distribution, chat response speeds, and dispute rates will compute in real time as sellers transact on the platform.
        </div>
      </div>

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricCard
          label="Active Sellers Roster"
          value="0"
          previousValue="0"
          change={0}
          period="posted >= 1 ad (30d)"
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
        <MetricCard
          label="Power & Verified Sellers"
          value="0"
          previousValue="0"
          change={0}
          period="high volume merchants"
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
        <MetricCard
          label="Avg Chat Response Speed"
          value="—"
          previousValue="—"
          change={0}
          period="awaiting chat events"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Seller Dispute Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="escrow claims ratio"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Grid: Bar & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="Top Sellers: Sold vs Active Inventory"
          subtitle="Inventory turnover comparison across top merchant accounts"
          data={barData}
          series={[
            { key: 'sold', name: 'Sold Listings', color: '#10b981' },
            { key: 'active', name: 'Active Ads', color: '#1548A6' }
          ]}
          height={260}
        />

        <DonutChart
          title="Seller Base Composition by Tier"
          subtitle="Proportion of casual C2C individuals vs verified power sellers"
          data={tierDonut}
          centerLabel="Total Sellers"
          centerValue="0"
          size={190}
        />
      </div>

      {/* Sellers Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Seller Performance Matrix
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Individual merchant metrics, speed to reply, and dispute compliance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Seller Tiers</option>
              <option value="power">Power Sellers</option>
              <option value="verified">Verified Sellers</option>
              <option value="individual">Individual C2C</option>
            </select>

            <input
              type="text"
              placeholder="Search by name, phone or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Seller</th>
                <th>City</th>
                <th>Tier</th>
                <th>Active Ads</th>
                <th>Sold Ads</th>
                <th>Lifetime GMV</th>
                <th>Avg Response</th>
                <th>Rating</th>
                <th>Disputes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No seller performance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.phone}</div>
                    </td>
                    <td>{s.city}</td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: s.tier === 'power' ? 'rgba(21, 72, 166, 0.15)' : s.tier === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: s.tier === 'power' ? '#60a5fa' : s.tier === 'verified' ? '#10b981' : 'var(--text-secondary)',
                        textTransform: 'uppercase'
                      }}>
                        {s.tier}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.activeAds}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{s.soldAds}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)' }}>{s.gmv}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.responseTime}</td>
                    <td style={{ fontWeight: 700, color: '#f59e0b' }}>{s.rating}</td>
                    <td>
                      <span style={{ color: parseFloat(s.disputeRate) > 2 ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {s.disputeRate}
                      </span>
                    </td>
                    <td>
                      <StatusPill status={s.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
