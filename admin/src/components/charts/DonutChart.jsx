import React, { useState } from 'react'

/**
 * DonutChart - Interactive SVG composition donut chart
 * Displays slice arcs, center aggregate text, hover highlight, and categorized legend.
 */
export default function DonutChart({
  title,
  subtitle,
  data = [], // Array of: { label: 'UPI', value: 450, color: '#1548A6' }
  centerLabel = 'Total',
  centerValue,
  size = 200,
  strokeWidth = 32
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const total = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0)
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  // Calculate cumulative stroke-dasharray offsets
  let accumulatedAngle = 0
  const slices = data.map((item, idx) => {
    const val = Number(item.value) || 0
    const ratio = total > 0 ? val / total : 0
    const strokeDasharray = `${ratio * circumference} ${circumference}`
    const strokeDashoffset = -accumulatedAngle * circumference
    accumulatedAngle += ratio
    const percentage = (ratio * 100).toFixed(1)

    return {
      ...item,
      ratio,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      idx
    }
  })

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null

  return (
    <div className="admin-card" style={{ margin: 0, padding: '20px 22px', backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', borderRadius: '12px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1C1917' }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#57534E' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#EEEDE9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx
              return (
                <circle
                  key={slice.idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color || '#0B2545'}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="butt"
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.18s ease, opacity 0.18s ease',
                    opacity: hoveredIdx === null || isHovered ? 1 : 0.5
                  }}
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              )
            })}
          </svg>

          {/* Center Aggregated Label */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '8px'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#6F6A65', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {activeSlice ? activeSlice.label : centerLabel}
            </span>
            <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1917', marginTop: '2px' }}>
              {activeSlice ? (activeSlice.formattedValue || activeSlice.value) : (centerValue || total.toLocaleString())}
            </span>
            {activeSlice && (
              <span className="tabular-nums" style={{ fontSize: '0.7rem', color: activeSlice.color, fontWeight: 600 }}>
                {activeSlice.percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Legend Table / List */}
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slices.map((slice) => (
            <div
              key={slice.idx}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: hoveredIdx === slice.idx ? '#EEEDE9' : 'transparent',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: slice.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#1C1917', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {slice.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1917' }}>
                  {slice.formattedValue || slice.value}
                </span>
                <span className="tabular-nums" style={{ fontSize: '0.74rem', color: '#6F6A65', minWidth: '38px', textAlign: 'right' }}>
                  {slice.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
