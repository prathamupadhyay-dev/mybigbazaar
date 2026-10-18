// ============================================================
// Geographic & Location Intelligence Dashboard
// ============================================================
// Deep breakdown of Marketplace Listings, Doorstep Services,
// GMV, and Zero-Result Demand Hotspots across Indian Metros.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import ExportButton from '../components/common/ExportButton'

export default function LocationAnalytics() {
  const [selectedVertical, setSelectedVertical] = useState('all') // 'all' | 'marketplace' | 'services'
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [searchQuery, setSearchQuery] = useState('')

  const citiesData = []

  // City volume chart data
  const chartData = citiesData.map(c => ({
    label: c.city,
    gmv: Math.round(c.gmvRaw / 1000),
    volume: c.listings + c.bookings
  }))

  const cityDonutData = citiesData.map((c, i) => {
    const colors = ['#1548A6', '#E96D0F', '#10b981', '#38bdf8', '#8b5cf6', '#f59e0b']
    return {
      label: c.city,
      value: c.gmvRaw,
      formattedValue: c.gmv,
      color: colors[i % colors.length]
    }
  })

  // Zero-result search hotspots (unmet localized demand)
  const unmetDemandHotspots = []

  const filteredCities = citiesData.filter(c => {
    const matchesSearch = (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.state || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === 'All Cities' || c.city === selectedCity
    return matchesSearch && matchesCity
  })

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Geographic & City Intelligence
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
              AWAITING SPATIAL TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Regional supply & demand density, city GMV rankings, and localized unmet buyer demand.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Vertical Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--hover-bg, rgba(255, 255, 255, 0.05))',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
          }}>
            {['all', 'marketplace', 'services'].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVertical(v)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: selectedVertical === v ? 'var(--accent-color, #d4af37)' : 'transparent',
                  color: selectedVertical === v ? '#000000' : 'var(--text-secondary)',
                  textTransform: 'capitalize'
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <ExportButton
            data={citiesData}
            filename="mybigbazaar-city-analytics.csv"
            label="Export City Data"
          />
        </div>
      </div>

      {/* Data Truth Notice Banner */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: '#f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle", marginRight: "6px" }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong>Awaiting Spatial Aggregation Engine:</strong> The 12 metro regional volumes and unmet demand hotspots below are seeded demonstration fixtures. Dynamic geographic rollups from user and listing coordinates are awaiting dedicated spatial aggregation endpoints.
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
          label="Active Metros"
          value="0 Cities"
          previousValue="0"
          change={0}
          period="operating footprint"
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <MetricCard
          label="Top GMV City"
          value="—"
          previousValue="—"
          change={0}
          subtext="Awaiting platform transactions"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <MetricCard
          label="Active Neighborhoods"
          value="0 Localities"
          previousValue="0"
          change={0}
          period="hyperlocal coverage"
          icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
        <MetricCard
          label="Avg Search Zero-Result Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="unmet demand indicator"
          icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="City GMV Velocity"
          subtitle="Gross transactional volume across core operating regions"
          data={chartData}
          series={[
            { key: 'gmv', name: 'GMV (₹)', color: '#1548A6', format: v => `₹${v}` }
          ]}
          height={260}
        />

        <DonutChart
          title="Regional GMV Distribution"
          subtitle="Geographic share of total marketplace revenue"
          data={cityDonutData}
          centerLabel="Total Metros"
          centerValue="₹0"
          size={190}
        />
      </div>

      {/* Zero-Result Search Hotspots (Unmet Local Demand) */}
      <div className="admin-card" style={{ marginBottom: '28px', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Hyperlocal Demand Gaps & Zero-Result Search Hotspots
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Pinpoints localities where users are repeatedly searching for services or goods with zero or insufficient suppliers.
            </p>
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '600px' }}>
            <thead>
              <tr>
                <th>Locality & Metro</th>
                <th>Requested Category / Query</th>
                <th>Search Volume (30d)</th>
                <th>Available Providers / Ads</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {unmetDemandHotspots.map((h, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.locality}</td>
                  <td style={{ color: 'var(--accent-color, #d4af37)', fontWeight: 600 }}>{h.requestedItem}</td>
                  <td>{h.searches} searches</td>
                  <td>
                    <span style={{ color: h.providersAvailable === 0 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                      {h.providersAvailable} available
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      {h.action} →
                    </button>
                  </td>
                </tr>
              ))}
              {unmetDemandHotspots.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No unmet demand hotspots recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* City Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Metro Operations Leaderboard
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Comprehensive performance breakdown by Indian city territory.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              placeholder="Filter by city or state..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                background: 'var(--hover-bg, rgba(255, 255, 255, 0.05))',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>City & State</th>
                <th>Monthly GMV</th>
                <th>Live Listings</th>
                <th>Active Providers</th>
                <th>Bookings (30d)</th>
                <th>Top Localities</th>
                <th>Growth (MoM)</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.map((c) => (
                <tr key={c.city}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.city}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.state}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{c.gmv}</td>
                  <td>{c.listings.toLocaleString()} ads</td>
                  <td>{c.providers} verified</td>
                  <td>{c.bookings} jobs</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {c.topLocalities.slice(0, 3).join(', ')}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
                      {c.growth}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredCities.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No regional city data recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
