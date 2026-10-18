// ============================================================
// Public Marketing Website Telemetry & Lead Conversion
// ============================================================
// Tracks visitors to the public marketing site (apps/web): app
// store download clicks, policy readership, and provider signups.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import TrendChart from '../components/charts/TrendChart'
import DonutChart from '../components/charts/DonutChart'
import ExportButton from '../components/common/ExportButton'

export default function WebsiteAnalytics() {
  const [activePeriod, setActivePeriod] = useState('30D')

  // Web trend awaiting live telemetry
  const webTrend = []

  // Store clicks awaiting live telemetry
  const storeClicks = []

  // Page views awaiting live telemetry
  const pageViews = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Public Website & App Download Telemetry
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
              AWAITING WEB TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Marketing landing site traffic, app install acquisition attribution, and partner inquiries.
          </p>
        </div>

        <ExportButton
          data={pageViews}
          filename="mybigbazaar-web-analytics.csv"
          label="Export Web Traffic"
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
          <strong>Awaiting Web Telemetry:</strong> Public website client-side telemetry (pageview tracking, app store CTA click attribution, partner lead webhook) will populate automatically once analytics events are captured.
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
          label="Unique Web Visitors (30d)"
          value="—"
          period="awaiting telemetry"
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
        <MetricCard
          label="App Store Download Clicks"
          value="—"
          period="awaiting telemetry"
          icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
        <MetricCard
          label="Partner / Provider Leads"
          value="—"
          period="awaiting telemetry"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <MetricCard
          label="Average Read Time"
          value="—"
          period="awaiting telemetry"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Main Trend */}
      <div style={{ marginBottom: '28px' }}>
        <TrendChart
          title="Marketing Site Traffic & App Download Conversion"
          subtitle="Unique Visitors vs App Store Clicks vs Partner Inquiries"
          data={webTrend}
          series={[
            { key: 'visitors', name: 'Web Visitors', color: '#1548A6' },
            { key: 'downloadClicks', name: 'App Store Clicks', color: '#10b981' },
            { key: 'partnerLeads', name: 'Partner Inquiries', color: '#E96D0F' }
          ]}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          height={260}
        />
      </div>

      {/* Donut Chart: App Store Split */}
      <div style={{ marginBottom: '28px' }}>
        <DonutChart
          title="App Download Clicks by Platform Operating System"
          subtitle="Google Play Store (Android) vs Apple App Store (iOS) distribution"
          data={storeClicks}
          centerLabel="Total Clicks"
          centerValue="0"
          size={190}
        />
      </div>

      {/* Page Views Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Website Page Performance & Policy Readership
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Audience behavior across marketing sections, trust guides, and statutory policy pages.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Page Route</th>
                <th>Page Title</th>
                <th>Page Views</th>
                <th>Unique Visitors</th>
                <th>Avg Dwell Time</th>
                <th>App CTA Click %</th>
              </tr>
            </thead>
            <tbody>
              {pageViews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No website page telemetry recorded yet.
                  </td>
                </tr>
              ) : (
                pageViews.map((p) => (
                  <tr key={p.path}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)', fontFamily: 'monospace' }}>
                      {p.path}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</td>
                    <td style={{ fontWeight: 600 }}>{p.views.toLocaleString()}</td>
                    <td>{p.uniqueVisitors.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.avgTime}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{p.ctaClicks}</td>
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
