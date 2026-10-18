import React from 'react'

/**
 * FunnelChart - Marketplace and Services conversion funnel visualizer
 * Displays progressive funnel steps, drop-off percentages, stage conversion rates,
 * and comparative benchmark indicators.
 */
export default function FunnelChart({
  title,
  subtitle,
  steps = [], // Array of: { label: 'Search', count: 12000, color: '#1548A6' }
  overallRateLabel = 'End-to-End Conversion'
}) {
  if (!steps || steps.length === 0) {
    return (
      <div className="admin-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No funnel data available.
      </div>
    )
  }

  const initialCount = steps[0]?.count || 1
  const finalCount = steps[steps.length - 1]?.count || 0
  const overallConversion = ((finalCount / initialCount) * 100).toFixed(2)

  return (
    <div className="admin-card" style={{ margin: 0, padding: '20px 22px', backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', borderRadius: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1C1917' }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#57534E' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: '#6F6A65', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
            {overallRateLabel}
          </span>
          <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803D' }}>
            {overallConversion}%
          </span>
        </div>
      </div>

      {/* Funnel Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step, idx) => {
          const ratio = initialCount > 0 ? (step.count / initialCount) : 0
          const pctOfInitial = (ratio * 100).toFixed(1)
          
          let dropOff = null
          if (idx > 0) {
            const prevCount = steps[idx - 1].count
            const drop = prevCount > 0 ? (((prevCount - step.count) / prevCount) * 100).toFixed(1) : 0
            dropOff = drop
          }

          const barWidth = Math.max(12, ratio * 100)
          const barColor = step.color || '#0B2545'

          return (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Step info row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#EEEDE9',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#1C1917'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, color: '#1C1917' }}>
                    {step.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="tabular-nums" style={{ fontWeight: 600, color: '#1C1917' }}>
                    {step.count.toLocaleString()}
                  </span>
                  <span className="tabular-nums" style={{ fontSize: '0.74rem', color: '#6F6A65', minWidth: '42px', textAlign: 'right' }}>
                    {pctOfInitial}%
                  </span>
                  {dropOff !== null && (
                    <span className="tabular-nums" style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#BE123C',
                      background: '#FFF1F2',
                      border: '1px solid rgba(190, 18, 60, 0.2)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      minWidth: '55px',
                      textAlign: 'center'
                    }}>
                      -{dropOff}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress track */}
              <div style={{
                height: '8px',
                width: '100%',
                background: '#EEEDE9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${barWidth}%`,
                  background: barColor,
                  borderRadius: '4px',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
