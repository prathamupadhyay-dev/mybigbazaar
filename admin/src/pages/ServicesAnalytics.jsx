// ============================================================
// On-Demand Doorstep Services Marketplace Intelligence
// ============================================================
// Service bookings, technician fulfillment rates, cancellation
// telemetry, customer ratings, and package variant adoption.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import TrendChart from '../components/charts/TrendChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import ExportButton from '../components/common/ExportButton'

export default function ServicesAnalytics() {
  const [activePeriod, setActivePeriod] = useState('30D')

  // Booking volume trend awaiting live telemetry
  const trendData = []

  // Services category performance awaiting live telemetry
  const serviceCategories = []

  // Cancellation reasons awaiting live telemetry
  const cancellationReasons = []

  const barData = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Services Marketplace Intelligence
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
              AWAITING SERVICES TELEMETRY
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            On-demand doorstep technician operations, appointment fulfillment, and quality scores.
          </p>
        </div>

        <ExportButton
          data={serviceCategories}
          filename="mybigbazaar-services-intelligence.csv"
          label="Export Services Report"
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
          <strong>Awaiting Services Telemetry:</strong> Doorstep technician arrival SLAs, fulfillment rates, and booking analytics will populate in real time as service appointments are booked.
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
          label="Total Bookings (30d)"
          value="0"
          previousValue="0"
          change={0}
          period="awaiting bookings"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <MetricCard
          label="Job Fulfillment Rate"
          value="0%"
          previousValue="0%"
          change={0}
          period="awaiting completions"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Avg Arrival Response Time"
          value="—"
          previousValue="—"
          change={0}
          period="awaiting dispatches"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          label="Average Customer Rating"
          value="—"
          previousValue="—"
          change={0}
          period="awaiting customer reviews"
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </div>

      {/* Main Trend */}
      <div style={{ marginBottom: '28px' }}>
        <TrendChart
          title="Doorstep Service Appointment Velocity"
          subtitle="Bookings Created vs Jobs Successfully Fulfilled vs Cancellations"
          data={trendData}
          series={[
            { key: 'booked', name: 'Appointments Booked', color: '#1548A6' },
            { key: 'completed', name: 'Successfully Completed', color: '#10b981' },
            { key: 'cancelled', name: 'Cancelled / Refunded', color: '#ef4444' }
          ]}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          height={260}
        />
      </div>

      {/* Grid: Bar & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <BarChart
          title="Bookings by Core Skill Vertical"
          subtitle="Appointment count across technician specializations"
          data={barData}
          series={[
            { key: 'bookings', name: 'Bookings Volume', color: '#1548A6' }
          ]}
          height={260}
        />

        <DonutChart
          title="Cancellation Drivers Analysis"
          subtitle="Primary root causes for booking drop-offs"
          data={cancellationReasons}
          centerLabel="Cancelled"
          centerValue="0"
          size={190}
        />
      </div>

      {/* Service Category Performance Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Service Vertical Fulfillment Matrix
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Operational efficiency, average ticket sizes, and customer ratings per vertical.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Service Category</th>
                <th>Monthly Bookings</th>
                <th>Average Ticket</th>
                <th>Gross Service GMV</th>
                <th>Fulfillment Rate</th>
                <th>Avg Arrival SLA</th>
                <th>Customer Rating</th>
              </tr>
            </thead>
            <tbody>
              {serviceCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No service vertical telemetry recorded yet.
                  </td>
                </tr>
              ) : (
                serviceCategories.map((s) => (
                  <tr key={s.service}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.service}</td>
                    <td>{s.bookings} appointments</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.avgTicket}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)' }}>{s.gmv}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{s.completionRate}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.avgLeadTime}</td>
                    <td style={{ fontWeight: 700, color: '#f59e0b' }}>{s.rating}</td>
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
