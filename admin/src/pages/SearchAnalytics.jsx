// ============================================================
// Marketplace Search Intelligence & Query Analytics
// ============================================================
// Real-time tracking of buyer search intent, trending keywords,
// search-to-chat conversion rates, and zero-result search gaps.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import BarChart from '../components/charts/BarChart'
import ExportButton from '../components/common/ExportButton'

export default function SearchAnalytics() {
  const [tab, setTab] = useState('trending') // 'trending' | 'zero_result'

  // Top queries awaiting live telemetry
  const topQueries = []

  // Zero-result queries awaiting live telemetry
  const zeroResultQueries = []

  const barData = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Search Intelligence & Discovery Analytics
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
              AWAITING SEARCH TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Buyer search intent, query-to-inquiry conversions, and zero-result inventory gaps.
          </p>
        </div>

        <ExportButton
          data={topQueries}
          filename="mybigbazaar-search-intelligence.csv"
          label="Export Search Queries"
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
          <strong>Awaiting Search Telemetry:</strong> Top search queries, conversion percentages, and zero-result targets will populate as users search on the mobile app and website.
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
          label="Total Searches (30d)"
          value="0"
          previousValue="0"
          change={0}
          period="catalog searches"
          icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
        <MetricCard
          label="Search-to-Click Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="users tapping an ad/service"
          icon="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
        />
        <MetricCard
          label="Search-to-Chat Conversion"
          value="0%"
          previousValue="0%"
          change={0}
          period="high buyer intent"
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
        <MetricCard
          label="Zero-Result Search Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="inventory match health"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </div>

      {/* Query Volume Bar Chart */}
      <div style={{ marginBottom: '28px' }}>
        <BarChart
          title="Top Search Queries by Volume (30d)"
          subtitle="Highest frequency consumer search terms across mobile app and web"
          data={barData}
          series={[
            { key: 'volume', name: 'Search Invocations', color: '#1548A6' }
          ]}
          height={260}
        />
      </div>

      {/* Tabs & Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {tab === 'trending' ? 'Top Search Queries & Conversions' : 'Zero-Result Demand Gaps'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {tab === 'trending'
                ? 'Queries driving the highest chat leads and service appointments.'
                : 'Searches returning 0 listings — direct opportunities for seller onboarding.'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            background: 'var(--hover-bg)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => setTab('trending')}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: tab === 'trending' ? 'var(--accent-color, #d4af37)' : 'transparent',
                color: tab === 'trending' ? '#000000' : 'var(--text-secondary)'
              }}
            >
              Trending Queries
            </button>
            <button
              type="button"
              onClick={() => setTab('zero_result')}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: tab === 'zero_result' ? 'var(--accent-color, #d4af37)' : 'transparent',
                color: tab === 'zero_result' ? '#000000' : 'var(--text-secondary)'
              }}
            >
              Zero-Result Gaps
            </button>
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          {tab === 'trending' ? (
            <table className="admin-table" style={{ width: '100%', minWidth: '750px' }}>
              <thead>
                <tr>
                  <th>Search Query</th>
                  <th>Category</th>
                  <th>Monthly Volume</th>
                  <th>Click-Through %</th>
                  <th>Chat / Order %</th>
                  <th>Zero-Result %</th>
                  <th>Growth (MoM)</th>
                </tr>
              </thead>
              <tbody>
                {topQueries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No trending search queries recorded yet.
                    </td>
                  </tr>
                ) : (
                  topQueries.map((q) => (
                    <tr key={q.query}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.query}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {q.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{q.volume.toLocaleString()}</td>
                      <td>{q.clickRate}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>{q.chatRate}</td>
                      <td>{q.zeroResult}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>{q.trend}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="admin-table" style={{ width: '100%', minWidth: '750px' }}>
              <thead>
                <tr>
                  <th>Unmet Search Query</th>
                  <th>Target Category</th>
                  <th>Searches (30d)</th>
                  <th>Concentrated Locality</th>
                  <th>Recommended Supply Action</th>
                </tr>
              </thead>
              <tbody>
                {zeroResultQueries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No zero-result search gaps recorded yet.
                    </td>
                  </tr>
                ) : (
                  zeroResultQueries.map((z, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#ef4444' }}>{z.query}</td>
                      <td>{z.category}</td>
                      <td style={{ fontWeight: 700 }}>{z.searches}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{z.location}</td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(21, 72, 166, 0.12)',
                          color: '#60a5fa'
                        }}>
                          {z.suggestedAction}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
