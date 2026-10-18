// ============================================================
// Classifieds (Buy & Sell) Intelligence & Ad Performance Center
// ============================================================
// In-depth metrics for C2C/B2C marketplace ads: postings, approval
// rates, days-to-sale, buyer chat-to-offer rates, and category velocity.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import TrendChart from '../components/charts/TrendChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import ExportButton from '../components/common/ExportButton'

export default function ClassifiedsAnalytics() {
  const [activePeriod, setActivePeriod] = useState('30D')

  // Posting velocity trend awaiting live telemetry
  const trendData = []

  // Category performance awaiting live telemetry
  const categoryData = []

  // Price bracket distribution awaiting live telemetry
  const priceBrackets = []

  // Bar comparison of inquiries vs offers by category
  const categoryBarData = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Classifieds (Buy & Sell) Intelligence
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
              AWAITING CLASSIFIEDS TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sell-through rates, liquidity metrics, buyer inquiry depth, and ad price distributions.
          </p>
        </div>

        <ExportButton
          data={categoryData}
          filename="mybigbazaar-classifieds-intelligence.csv"
          label="Export Classifieds Report"
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
          <strong>Awaiting Classifieds Telemetry:</strong> Listing posting velocities, average days to sale, and price brackets will populate in real time as ads are published and transacted on the platform.
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
          label="Total Ads Posted (30d)"
          value="0"
          previousValue="0"
          change={0}
          period="awaiting listings"
          icon="M12 4v16m8-8H4"
        />
        <MetricCard
          label="Average Days to Sale"
          value="—"
          previousValue="—"
          change={0}
          period="awaiting sales"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Inquiry Engagement Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="ads receiving >=1 chat"
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
        <MetricCard
          label="Overall Sell-Through"
          value="0%"
          previousValue="0%"
          change={0}
          period="ads marked sold"
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </div>

      {/* Main Trend */}
      <div style={{ marginBottom: '28px' }}>
        <TrendChart
          title="Listing Velocity & Liquidity Progression"
          subtitle="New Ads Posted vs Moderation Approved vs Ads Confirmed Sold"
          data={trendData}
          series={[
            { key: 'posted', name: 'Ads Posted', color: '#1548A6' },
            { key: 'approved', name: 'Ads Approved', color: '#10b981' },
            { key: 'sold', name: 'Ads Sold / Completed', color: '#E96D0F' }
          ]}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          height={260}
        />
      </div>

      {/* Grid: Bar & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="Category Inquiries vs Negotiated Offers (%)"
          subtitle="Engagement conversion across classifieds categories"
          data={categoryBarData}
          series={[
            { key: 'inquiries', name: 'Inquiry Rate %', color: '#1548A6', format: v => `${v}%` },
            { key: 'offers', name: 'Offer Rate %', color: '#E96D0F', format: v => `${v}%` }
          ]}
          height={260}
        />

        <DonutChart
          title="Listing Inventory by Price Bracket"
          subtitle="Distribution of live ads across item price tiers"
          data={priceBrackets}
          centerLabel="Total Live"
          centerValue="0"
          size={190}
        />
      </div>

      {/* Category Performance Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Category Liquidity & Sell-Through Matrix
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Performance benchmarks across top classifieds verticals.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Active Ads</th>
                <th>Avg Days to Sale</th>
                <th>Inquiry Rate</th>
                <th>Offer Rate</th>
                <th>Gross Transacted</th>
                <th>Sell-Through %</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No classifieds category telemetry recorded yet.
                  </td>
                </tr>
              ) : (
                categoryData.map((c) => (
                  <tr key={c.label}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.label}</td>
                    <td>{c.activeAds.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: c.avgDaysToSale < 10 ? '#10b981' : '#f59e0b' }}>
                      {c.avgDaysToSale} days
                    </td>
                    <td>{c.inquiryRate}</td>
                    <td>{c.offerRate}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)' }}>{c.gmv}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: parseInt(c.sellThrough) >= 50 ? '#10b981' : '#f59e0b'
                      }}>
                        {c.sellThrough}
                      </span>
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
