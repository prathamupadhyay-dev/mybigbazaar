// ============================================================
// User Cohort Retention & Engagement Decay Analysis
// ============================================================
// Cohort tracking across sign-up vintages: Day 1, 7, 14, 30, 60
// retention curves, repeat transaction rates, and churn metrics.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import TrendChart from '../components/charts/TrendChart'
import ExportButton from '../components/common/ExportButton'

export default function UserRetention() {
  const [activePeriod, setActivePeriod] = useState('30D')

  // Retention curves awaiting live telemetry
  const retentionCurve = []

  // Weekly Cohort Matrix awaiting live telemetry
  const cohorts = []

  const getHeatBg = (valStr) => {
    if (!valStr || valStr === '—') return 'transparent'
    const num = parseInt(valStr)
    if (num >= 70) return 'rgba(16, 185, 129, 0.35)'
    if (num >= 45) return 'rgba(16, 185, 129, 0.22)'
    if (num >= 35) return 'rgba(21, 72, 166, 0.25)'
    if (num >= 25) return 'rgba(233, 109, 15, 0.22)'
    return 'rgba(239, 68, 68, 0.18)'
  }

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              User Retention & Cohort Intelligence
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
              AWAITING COHORT TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Multi-cohort retention curves, 60-day repeat transaction rates, and user category longevity.
          </p>
        </div>

        <ExportButton
          data={cohorts}
          filename="mybigbazaar-cohort-retention.csv"
          label="Export Cohort Data"
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
          <strong>Awaiting User Cohort Aggregation:</strong> User cohort retention curves and repeat order benchmarks will compute automatically as registration cohorts mature over time.
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
          label="Day 1 Retention"
          value="—"
          period="awaiting cohort data"
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <MetricCard
          label="Day 7 Retention"
          value="—"
          period="awaiting cohort data"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <MetricCard
          label="Day 30 Retention"
          value="—"
          period="awaiting cohort data"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="60-Day Repeat Order Rate"
          value="—"
          period="awaiting cohort data"
          icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </div>

      {/* Main Trend: Retention Curve by Role */}
      <div style={{ marginBottom: '28px' }}>
        <TrendChart
          title="Retention Curve Decay by User Archetype (%)"
          subtitle="Proportion of users returning after signup: Sellers vs Buyers vs Service Customers"
          data={retentionCurve}
          series={[
            { key: 'sellers', name: 'Classifieds Sellers', color: '#10b981', format: v => `${v}%` },
            { key: 'buyers', name: 'Classifieds Buyers', color: '#1548A6', format: v => `${v}%` },
            { key: 'serviceUsers', name: 'Service Consumers', color: '#E96D0F', format: v => `${v}%` }
          ]}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          height={260}
        />
      </div>

      {/* Cohort Heatmap Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Weekly Sign-Up Cohort Retention Heatmap
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Percentage of registered users active in subsequent intervals following acquisition.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Cohort Week</th>
                <th>Cohort Size</th>
                <th style={{ textAlign: 'center' }}>Day 1</th>
                <th style={{ textAlign: 'center' }}>Day 7</th>
                <th style={{ textAlign: 'center' }}>Day 14</th>
                <th style={{ textAlign: 'center' }}>Day 30</th>
                <th style={{ textAlign: 'center' }}>Day 60</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No weekly user cohort retention data recorded yet.
                  </td>
                </tr>
              ) : (
                cohorts.map((c) => (
                  <tr key={c.cohort}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.cohort}</td>
                    <td>{c.users.toLocaleString()} users</td>
                    <td style={{ textAlign: 'center', background: getHeatBg(c.d1), fontWeight: 700, color: '#ffffff' }}>
                      {c.d1}
                    </td>
                    <td style={{ textAlign: 'center', background: getHeatBg(c.d7), fontWeight: 700, color: '#ffffff' }}>
                      {c.d7}
                    </td>
                    <td style={{ textAlign: 'center', background: getHeatBg(c.d14), fontWeight: 700, color: '#ffffff' }}>
                      {c.d14}
                    </td>
                    <td style={{ textAlign: 'center', background: getHeatBg(c.d30), fontWeight: 700, color: '#ffffff' }}>
                      {c.d30}
                    </td>
                    <td style={{ textAlign: 'center', background: getHeatBg(c.d60), fontWeight: 700, color: '#ffffff' }}>
                      {c.d60}
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
