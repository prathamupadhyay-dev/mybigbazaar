// ============================================================
// Consumer Mobile App Telemetry & Product Analytics
// ============================================================
// Tracks mobile app engagement (apps/mobile): DAU/MAU stickiness,
// session durations, tab usage breakdown, and crash-free rates.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import TrendChart from '../components/charts/TrendChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import ExportButton from '../components/common/ExportButton'

export default function AppAnalytics() {
  const [activePeriod, setActivePeriod] = useState('30D')

  // App trend awaiting live telemetry
  const appTrend = []

  // Tab distribution awaiting live telemetry
  const tabDistribution = []

  // Core events awaiting live telemetry
  const coreEvents = []

  const barData = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Consumer Mobile App Telemetry
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
              AWAITING IN-APP TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Daily active engagement, session frequency, tab screen time, and core in-app events.
          </p>
        </div>

        <ExportButton
          data={coreEvents}
          filename="mybigbazaar-mobile-telemetry.csv"
          label="Export Mobile Telemetry"
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
          <strong>Awaiting Mobile Telemetry:</strong> Mobile client event tracking (screen dwell time, tab transitions, DAU/MAU stickiness, in-app event loggers) will populate automatically once client analytics events are emitted.
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
          label="Daily Active Users (DAU)"
          value="—"
          period="awaiting telemetry"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <MetricCard
          label="DAU / MAU Stickiness"
          value="—"
          period="awaiting telemetry"
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <MetricCard
          label="Average Session Duration"
          value="—"
          period="awaiting telemetry"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Crash-Free Sessions"
          value="—"
          period="awaiting telemetry"
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </div>

      {/* Main Trend */}
      <div style={{ marginBottom: '28px' }}>
        <TrendChart
          title="App Active Usage & In-App Communications Velocity"
          subtitle="Daily Active Users vs Total Sessions vs Chat Messages Exchanged"
          data={appTrend}
          series={[
            { key: 'sessions', name: 'App Sessions', color: '#1548A6' },
            { key: 'inAppChats', name: 'Chat Messages Sent', color: '#10b981' },
            { key: 'dau', name: 'Daily Active Users', color: '#E96D0F' }
          ]}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          height={260}
        />
      </div>

      {/* Grid: Bar & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="Core Event Frequency (in Thousands)"
          subtitle="In-app interactions completed by consumers"
          data={barData}
          series={[
            { key: 'count', name: 'Events (k)', color: '#1548A6', format: v => `${v}k` }
          ]}
          height={260}
        />

        <DonutChart
          title="Navigation Screen Time Distribution (%)"
          subtitle="Proportion of app session time across the 5 primary tabs"
          data={tabDistribution}
          centerLabel="Active Tabs"
          centerValue="0"
          size={190}
        />
      </div>

      {/* Core Events Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Core In-App Event Telemetry
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Instrumented user actions across the mobile marketplace and service flows.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Action / Event Name</th>
                <th>Monthly Triggers</th>
                <th>Unique Users</th>
                <th>Avg per Session</th>
                <th>Growth (MoM)</th>
              </tr>
            </thead>
            <tbody>
              {coreEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No mobile app telemetry events recorded yet.
                  </td>
                </tr>
              ) : (
                coreEvents.map((e) => (
                  <tr key={e.event}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{e.event}</td>
                    <td style={{ fontWeight: 600 }}>{e.count.toLocaleString()}</td>
                    <td>{e.uniqueUsers.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{e.avgPerSession}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{e.change}</td>
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
