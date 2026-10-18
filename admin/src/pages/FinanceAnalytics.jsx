// ============================================================
// Platform Finance, Escrow & Settlement Cockpit
// ============================================================
// Core marketplace financial operations: GMV, net commission
// take-rates, payment gateway reconciliations, and escrow custody.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import TrendChart from '../components/charts/TrendChart'
import DonutChart from '../components/charts/DonutChart'
import StatusPill from '../components/common/StatusPill'
import ExportButton from '../components/common/ExportButton'

export default function FinanceAnalytics() {
  const [activePeriod, setActivePeriod] = useState('30D')
  const [takeRate, setTakeRate] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedRate = localStorage.getItem('platform_commission_rate')
      if (savedRate && !isNaN(Number(savedRate))) return Number(savedRate)
    }
    return 8
  })

  const handleUpdateTakeRate = (val) => {
    const rate = Number(val)
    setTakeRate(rate)
    if (typeof window !== 'undefined') {
      localStorage.setItem('platform_commission_rate', String(rate))
    }
  }

  const gmvTotal = 0
  const calculatedCommission = Math.round(gmvTotal * (takeRate / 100))

  // Financial inflow & settlement trend awaiting live gateway events
  const financialTrend = []

  // Payment rail breakdown awaiting live transaction telemetry
  const paymentRails = []

  // Recent Settlement Batches
  const settlements = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Finance, Escrow & Settlements Cockpit
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
              AWAITING GATEWAY TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Escrow custody balances, net platform commissions, payment rail fees, and automated seller payouts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Configurable Take-Rate Rule Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--card-bg, #202433)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Configured Take-Rate:</span>
            <select
              value={takeRate}
              onChange={(e) => handleUpdateTakeRate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-color, #d4af37)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {[5, 8, 10, 12, 15, 18, 20].map((r) => (
                <option key={r} value={r} style={{ background: '#1a1e29', color: '#fff' }}>
                  {r}% (Business Rule)
                </option>
              ))}
            </select>
          </div>

          <ExportButton
            data={settlements}
            filename="mybigbazaar-settlements-ledger.csv"
            label="Export Settlement Ledger"
          />
        </div>
      </div>

      {/* Data Truth Banner */}
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
          <strong>Awaiting Live Gateway Telemetry:</strong> Financial inflow totals, commission take-rates, and escrow custody balances will populate automatically as customer transactions settle through the live Razorpay payment rail.
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
          label="Total GMV (30d)"
          value="₹0"
          previousValue="₹0"
          change={0}
          period="awaiting settlements"
          icon="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        />
        <MetricCard
          label={`Platform Net Margin (${takeRate}%)`}
          value="₹0"
          previousValue="₹0"
          change={0}
          period="configurable business rule"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Escrow Custody Held"
          value="₹0"
          previousValue="₹0"
          change={0}
          period="awaiting transactions"
          icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
        <MetricCard
          label="Disbursed to Merchants"
          value="₹0"
          previousValue="₹0"
          change={0}
          period="awaiting payouts"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Main Trend */}
      <div style={{ marginBottom: '28px' }}>
        <TrendChart
          title="Gross Inflows vs Merchant Payouts & Commission"
          subtitle="Real-time multi-series financial trajectory across weekly settlement windows"
          data={financialTrend}
          series={[
            { key: 'grossInflow', name: 'Gross Inflow (GMV)', color: '#1548A6', format: v => `₹${(v/1000).toFixed(0)}k` },
            { key: 'providerPayouts', name: 'Merchant Disbursed', color: '#10b981', format: v => `₹${(v/1000).toFixed(0)}k` },
            { key: 'netCommission', name: 'Platform Net Margin', color: '#E96D0F', format: v => `₹${(v/1000).toFixed(0)}k` }
          ]}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          height={270}
        />
      </div>

      {/* Payment Rails Composition */}
      <div style={{ marginBottom: '28px' }}>
        <DonutChart
          title="Payment Rail Gateway Composition & Interchange"
          subtitle="Breakdown by customer checkout payment instrument"
          data={paymentRails}
          centerLabel="Settled Volume"
          centerValue="₹0"
          size={190}
        />
      </div>

      {/* Settlement Batches Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Merchant Settlement Batches & Escrow Disbursals
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Batch payment runs released from platform escrow to seller and provider bank accounts.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Run Date</th>
                <th>Merchants</th>
                <th>Gross Order Value</th>
                <th>Platform Commission</th>
                <th>Gateway Fee</th>
                <th>Net Disbursed</th>
                <th>Payout Channel</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No merchant settlement batches recorded yet. Settlements will appear here once gateway payouts are triggered.
                  </td>
                </tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)' }}>{s.id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.date}</td>
                    <td>{s.recipientCount} accounts</td>
                    <td style={{ fontWeight: 600 }}>{s.grossAmount}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{s.platformFee}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.gatewayDeduction}</td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{s.netDisbursed}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.rail}</td>
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
