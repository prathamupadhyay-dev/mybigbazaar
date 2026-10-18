import React, { useState, useId } from 'react'

/**
 * TrendChart - High-performance interactive SVG Trend & Area Chart
 * Supports multiple data series, period switcher, area gradient fill,
 * and hover inspection crosshair with formatted tooltips.
 */
export default function TrendChart({
  title,
  subtitle,
  data = [], // Array of objects: { label: 'Oct 1', series1: 120, series2: 80, ... }
  series = [
    { key: 'value', name: 'Volume', color: '#1548A6', format: (v) => v }
  ],
  periods = ['7D', '30D', '90D', '12M'],
  activePeriod = '30D',
  onPeriodChange,
  height = 260
}) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const chartId = useId().replace(/:/g, '')

  if (!data || data.length === 0) {
    return (
      <div className="admin-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No trend data available.
      </div>
    )
  }

  // Compute domain bounds
  const allValues = data.flatMap(d => series.map(s => Number(d[s.key]) || 0))
  const rawMin = Math.min(...allValues)
  const rawMax = Math.max(...allValues)
  const minVal = Math.max(0, Math.floor(rawMin * 0.9))
  const maxVal = Math.ceil(rawMax * 1.1) || 100
  const range = maxVal - minVal || 1

  const padding = { top: 20, right: 24, bottom: 32, left: 54 }
  const width = 700 // Standard SVG logical coordinate width
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Generate coordinates for each data point
  const getX = (idx) => padding.left + (idx / Math.max(1, data.length - 1)) * plotWidth
  const getY = (val) => padding.top + plotHeight - ((Number(val) - minVal) / range) * plotHeight

  // Horizontal grid lines (4 lines)
  const yTicks = [0, 0.33, 0.66, 1].map(pct => {
    const val = minVal + pct * (maxVal - minVal)
    const y = getY(val)
    return { val: Math.round(val), y }
  })

  // Build SVG path strings for lines and gradient areas
  const seriesPaths = series.map(s => {
    const points = data.map((d, i) => ({ x: getX(i), y: getY(d[s.key] || 0) }))
    
    // Construct smooth or linear path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const firstX = points[0].x.toFixed(1)
    const lastX = points[points.length - 1].x.toFixed(1)
    const baselineY = (padding.top + plotHeight).toFixed(1)
    const areaPath = `${linePath} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`

    return { ...s, linePath, areaPath, points }
  })

  const hoveredData = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="admin-card" style={{ margin: 0, padding: '20px 22px', position: 'relative', backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', borderRadius: '12px' }}>
      {/* Header with Title and Period Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Series Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '6px' }}>
            {series.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#57534E' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>

          {/* Period Pills */}
          {periods && periods.length > 0 && (
            <div style={{
              display: 'flex',
              background: '#EEEDE9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #E7E5E4'
            }}>
              {periods.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPeriodChange && onPeriodChange(p)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: activePeriod === p ? '#0B2545' : 'transparent',
                    color: activePeriod === p ? '#FBFBFA' : '#57534E',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {series.map(s => (
              <linearGradient key={s.key} id={`gradient-${chartId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#E7E5E4"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6F6A65"
                fontWeight="500"
                fontFamily="inherit"
              >
                {tick.val >= 100000 ? `₹${(tick.val / 100000).toFixed(1)}L` : tick.val >= 1000 ? `${(tick.val / 1000).toFixed(0)}k` : tick.val}
              </text>
            </g>
          ))}

          {/* Area Gradients */}
          {seriesPaths.map(s => (
            <path
              key={`area-${s.key}`}
              d={s.areaPath}
              fill={`url(#gradient-${chartId}-${s.key})`}
            />
          ))}

          {/* Line Strokes */}
          {seriesPaths.map(s => (
            <path
              key={`line-${s.key}`}
              d={s.linePath}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* X-axis labels (render up to 7 evenly spaced labels) */}
          {data.map((d, i) => {
            const step = Math.ceil(data.length / 7)
            if (i % step !== 0 && i !== data.length - 1) return null
            const x = getX(i)
            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill="#6F6A65"
                fontFamily="inherit"
              >
                {d.label}
              </text>
            )
          })}

          {/* Invisible vertical hover hit boxes */}
          {data.map((d, i) => {
            const colWidth = plotWidth / (data.length - 1 || 1)
            const x = getX(i) - colWidth / 2
            return (
              <rect
                key={`hit-${i}`}
                x={Math.max(padding.left, x)}
                y={padding.top}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIndex(i)}
              />
            )
          })}

          {/* Hover Crosshair & Dots */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + plotHeight}
                stroke="#0B2545"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {seriesPaths.map(s => {
                const pt = s.points[hoverIndex]
                if (!pt) return null
                return (
                  <circle
                    key={`dot-${s.key}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill={s.color}
                    stroke="#FBFBFA"
                    strokeWidth="2"
                  />
                )
              })}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredData && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: '#FBFBFA',
            border: '1px solid #E7E5E4',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            color: '#1C1917',
            boxShadow: '0 4px 16px rgba(28, 25, 23, 0.08)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#0B2545' }}>
              {hoveredData.label}
            </div>
            {series.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#57534E' }}>{s.name}:</span>
                <strong className="tabular-nums" style={{ color: s.color }}>
                  {s.format ? s.format(hoveredData[s.key]) : hoveredData[s.key]}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
