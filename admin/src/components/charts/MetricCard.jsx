// ============================================================
// MyBigBazaar Admin — Stripe Enterprise MetricCard Component
// Ported from Stitch mybigbazaar_admin_moderation_portal KPI Bento
// Warm Minimalist Luxury (Cards #FBFBFA, Border #E7E5E4, Tabular Numbers)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react'

export default function MetricCard({
  label,
  value,
  previousValue,
  change,
  period = 'vs prev 30 days',
  icon,
  sparkline = [],
  onClick,
  alert,
  subtext,
  badgeText,
  badgeType = 'neutral'
}) {
  const isPositive = typeof change === 'number' ? change >= 0 : null
  const changeFormatted = typeof change === 'number' 
    ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` 
    : change

  // Calculate sparkline points for SVG
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null
    const min = Math.min(...sparkline)
    const max = Math.max(...sparkline)
    const range = max - min || 1
    const width = 80
    const height = 24
    const points = sparkline.map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 6) - 3
      return `${x},${y}`
    }).join(' ')

    const strokeColor = isPositive === false ? '#BE123C' : isPositive === true ? '#15803D' : '#0B2545'

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    )
  }

  return (
    <div
      className={`admin-card stat-card ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
      style={{
        margin: 0,
        padding: '18px 20px',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderRadius: '12px',
        border: '1px solid var(--color-border, #E7E5E4)',
        boxShadow: 'var(--card-shadow, 0 1px 2px 0 rgba(28, 25, 23, 0.04))',
        transition: 'border-color 140ms ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover, #D6D3D1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border, #E7E5E4)' }}
    >
      {/* Top Row: Label, Badge and Icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-metadata, #6F6A65)'
            }}>
              {label}
            </span>
            {badgeText && (
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: badgeType === 'danger' ? 'var(--status-danger-bg, #FFF1F2)' : 'var(--color-sunken, #EEEDE9)',
                color: badgeType === 'danger' ? 'var(--status-danger-text, #BE123C)' : 'var(--color-navy, #0B2545)',
                border: `1px solid ${badgeType === 'danger' ? 'var(--status-danger-border, #FECDD3)' : 'var(--color-border, #E7E5E4)'}`
              }}>
                {badgeText}
              </span>
            )}
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--color-text-primary, #1C1917)',
              marginTop: '6px',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {value}
          </div>
        </div>

        {icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-sunken, #EEEDE9)',
            border: '1px solid var(--color-border, #E7E5E4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary, #0B2545)',
            flexShrink: 0
          }}>
            {typeof icon === 'string' ? (
              (icon.startsWith('M') || (icon.length > 25 && icon.includes(' '))) ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {icon}
                </span>
              )
            ) : icon}
          </div>
        )}
      </div>

      {/* Middle Row: Trend, Comparison, Sparkline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '14px',
        paddingTop: '10px',
        borderTop: '1px solid var(--color-border, #E7E5E4)',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {changeFormatted && (
            <span
              className="tabular-nums"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: isPositive ? 'rgba(21, 128, 61, 0.08)' : isPositive === false ? '#FFF1F2' : '#EEEDE9',
                color: isPositive ? '#15803D' : isPositive === false ? '#BE123C' : '#57534E',
                border: `1px solid ${isPositive ? 'rgba(21, 128, 61, 0.25)' : isPositive === false ? 'rgba(190, 18, 60, 0.25)' : '#E7E5E4'}`
              }}
            >
              {isPositive ? '↑' : isPositive === false ? '↓' : '•'} {changeFormatted}
            </span>
          )}
          {previousValue && (
            <span className="tabular-nums" style={{ fontSize: '11.5px', color: '#6F6A65' }}>
              prev {previousValue}
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#6F6A65' }}>
            {period}
          </span>
        </div>

        {renderSparkline()}
      </div>

      {/* Optional Alert or Subtext footer */}
      {(subtext || alert) && (
        <div style={{
          marginTop: '6px',
          fontSize: '11.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: alert ? '#C2410C' : '#57534E'
        }}>
          {alert && (
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#C2410C',
              flexShrink: 0
            }} />
          )}
          <span>{alert || subtext}</span>
        </div>
      )}
    </div>
  )
}
