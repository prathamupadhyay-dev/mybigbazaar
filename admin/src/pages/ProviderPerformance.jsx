// ============================================================
// Service Provider Operations & Technician Performance Center
// ============================================================
// Real-time tracking of doorstep service professionals: acceptance
// rates, on-time arrivals, earnings, KYC audits, and quality scores.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import StatusPill from '../components/common/StatusPill'
import ExportButton from '../components/common/ExportButton'

export default function ProviderPerformance() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')

  const providers = []

  const skillDonut = []

  const barData = providers.map(p => ({
    label: p.name.split(' ')[0],
    jobs: p.completedJobs,
    acceptance: Math.round(parseFloat(p.acceptanceRate))
  }))

  const filtered = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.skill.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = selectedSkill === 'all' || p.skill.toLowerCase().includes(selectedSkill.toLowerCase())
    return matchesSearch && matchesSkill
  })

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Service Provider Performance & Roster
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
              AWAITING DISPATCH TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Technician operational quality, acceptance rates, on-time reliability, and payout settlements.
          </p>
        </div>

        <ExportButton
          data={providers}
          filename="mybigbazaar-provider-performance.csv"
          label="Export Provider Roster"
        />
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
          <strong>Awaiting Provider Telemetry Sync:</strong> Provider response time SLAs, dispatch metrics, and partner roster ratings are awaiting live provider telemetry synchronization.
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
          label="Active Verified Providers"
          value="0"
          previousValue="0"
          change={0}
          period="ready for dispatch"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <MetricCard
          label="Lead Acceptance Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="leads accepted < 5m"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="On-Time Arrival Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="within scheduled slot"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Pending Provider Payouts"
          value="₹0"
          previousValue="₹0"
          change={0}
          period="ready for settlement"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </div>

      {/* Grid: Bar & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="Top Providers: Completed Jobs Volume"
          subtitle="Fulfilled service jobs count per top professional"
          data={barData}
          series={[
            { key: 'jobs', name: 'Completed Appointments', color: '#1548A6' }
          ]}
          height={260}
        />

        <DonutChart
          title="Provider Pool by Core Trade"
          subtitle="Specialization distribution of verified field technicians"
          data={skillDonut}
          centerLabel="Total Pros"
          centerValue="385"
          size={190}
        />
      </div>

      {/* Providers Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Provider Performance Matrix
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Individual service professional metrics, ratings, acceptance rates, and pending earnings.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Trade Skills</option>
              <option value="ac">AC Repair</option>
              <option value="cleaning">Cleaning</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="appliance">Appliance</option>
            </select>

            <input
              type="text"
              placeholder="Search provider, city, skill..."
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
          <table className="admin-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Trade Skill</th>
                <th>City</th>
                <th>Rating</th>
                <th>Completed</th>
                <th>Acceptance %</th>
                <th>On-Time %</th>
                <th>Total Earned</th>
                <th>Pending Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-color, #d4af37)', fontWeight: 600 }}>{p.id}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.skill}</td>
                  <td>{p.city}</td>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{p.rating}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{p.completedJobs}</td>
                  <td>{p.acceptanceRate}</td>
                  <td>{p.onTimeRate}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.earnings}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-color, #d4af37)' }}>{p.pendingPayout}</td>
                  <td>
                    <StatusPill status={p.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No service providers on roster.
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
