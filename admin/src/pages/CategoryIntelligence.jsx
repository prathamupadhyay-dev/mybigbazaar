// ============================================================
// Marketplace & Services Category Intelligence
// ============================================================
// Comparative taxonomy performance: average selling prices (ASP),
// demand-to-supply velocity ratios, and transaction values.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import ExportButton from '../components/common/ExportButton'

export default function CategoryIntelligence() {
  const [filterType, setFilterType] = useState('all')

  const categories = []

  const filtered = filterType === 'all'
    ? categories
    : categories.filter(c => c.type.toLowerCase() === filterType.toLowerCase())

  const categoryShare = []

  const barData = filtered.map(c => ({
    label: c.name.split(' ')[0],
    ads: c.activeAds
  }))

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Category Taxonomy & Velocity Intelligence
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
              AWAITING CATALOG TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Inventory depth, average selling price (ASP), demand multipliers, and vertical revenue share.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            background: 'var(--hover-bg)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            {['all', 'classifieds', 'services'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: filterType === t ? 'var(--accent-color, #d4af37)' : 'transparent',
                  color: filterType === t ? '#000000' : 'var(--text-secondary)',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <ExportButton
            data={filtered}
            filename="mybigbazaar-category-intelligence.csv"
            label="Export Category Data"
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: 'middle', marginRight: '6px' }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong>Awaiting Catalog Transactional Aggregation:</strong> Average selling prices (ASP), demand multiples, and category GMV shares will populate dynamically as transactional volume accumulates.
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
          label="Tracked Categories"
          value="0 Verticals"
          previousValue="0"
          change={0}
          period="active taxonomies"
          icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
        <MetricCard
          label="Top GMV Category"
          value="—"
          previousValue="—"
          change={0}
          period="Awaiting transaction volume"
          icon="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <MetricCard
          label="Highest Demand Multiple"
          value="—"
          previousValue="—"
          change={0}
          period="Awaiting search queries"
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <MetricCard
          label="Marketplace ASP"
          value="₹0"
          previousValue="₹0"
          change={0}
          period="average ticket size"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Grid: Bar & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="Active Inventory by Category"
          subtitle="Number of live ads and bookable service listings"
          data={barData}
          series={[
            { key: 'ads', name: 'Active Catalog Items', color: '#1548A6' }
          ]}
          height={260}
        />

        <DonutChart
          title="GMV Share by Category Vertical"
          subtitle="Proportion of total gross transaction volume"
          data={categoryShare}
          centerLabel="Total Volume"
          centerValue="0%"
          size={190}
        />
      </div>

      {/* Category Performance Matrix Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Category Taxonomy Health & Monetization Matrix
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Full comparative breakdown of classifieds and doorstep service categories.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '750px' }}>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Vertical Type</th>
                <th>Active Listings</th>
                <th>Avg Price (ASP)</th>
                <th>Demand Index</th>
                <th>Chat / Lead %</th>
                <th>Gross Transacted</th>
                <th>Growth (MoM)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: c.type === 'Classifieds' ? 'rgba(21, 72, 166, 0.15)' : 'rgba(233, 109, 15, 0.15)',
                      color: c.type === 'Classifieds' ? '#60a5fa' : '#fb923c'
                    }}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.activeAds.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{c.asp}</td>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{c.demandIndex}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{c.chatRate}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)' }}>{c.gmv}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{c.growth}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No category intelligence telemetry recorded yet.
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
