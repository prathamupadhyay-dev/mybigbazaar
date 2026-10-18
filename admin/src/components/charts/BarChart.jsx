import React, { useState } from 'react'

/**
 * BarChart - Clean, responsive SVG bar & comparison chart
 * Supports single and dual series bars, stacked or grouped mode, and interactive hover tooltips.
 */
export default function BarChart({
  title,
  subtitle,
  data = [], // Array of: { label: 'Electronics', series1: 450, series2: 320 }
  series = [
    { key: 'value', name: 'Volume', color: '#1548A6', format: (v) => v }
  ],
  height = 260,
  isStacked = false
}) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="admin-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No bar chart data available.
      </div>
    )
  }

  // Calculate bounds
  let maxVal = 0
  if (isStacked) {
    maxVal = Math.max(...data.map(d => series.reduce((acc, s) => acc + (Number(d[s.key]) || 0), 0)))
  } else {
    maxVal = Math.max(...data.flatMap(d => series.map(s => Number(d[s.key]) || 0)))
  }
  maxVal = Math.ceil(maxVal * 1.15) || 100

  const padding = { top: 20, right: 20, bottom: 36, left: 52 }
  const width = 640
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const getY = (val) => padding.top + plotHeight - (Number(val) / maxVal) * plotHeight

  // 4 Y-ticks
  const yTicks = [0, 0.33, 0.66, 1].map(pct => {
    const val = pct * maxVal
    return { val: Math.round(val), y: getY(val) }
  })

  const groupWidth = plotWidth / data.length
  const barGap = 4
  const barWidth = isStacked
    ? Math.min(36, groupWidth * 0.55)
    : Math.min(22, (groupWidth * 0.7) / series.length)

  const hoveredData = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="admin-card" style={{ margin: 0, padding: '20px 22px', position: 'relative', backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', borderRadius: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
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

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {series.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#57534E' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: s.color }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y Grid Lines & Labels */}
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
                fontFamily="inherit"
              >
                {tick.val >= 100000 ? `₹${(tick.val / 100000).toFixed(1)}L` : tick.val >= 1000 ? `${(tick.val / 1000).toFixed(0)}k` : tick.val}
              </text>
            </g>
          ))}

          {/* Bars & Labels */}
          {data.map((d, i) => {
            const groupX = padding.left + i * groupWidth + groupWidth / 2

            if (isStacked) {
              let currentBaseline = padding.top + plotHeight
              return (
                <g key={i} onMouseEnter={() => setHoverIndex(i)} style={{ cursor: 'pointer' }}>
                  {series.map(s => {
                    const val = Number(d[s.key]) || 0
                    const barH = (val / maxVal) * plotHeight
                    const y = currentBaseline - barH
                    currentBaseline = y

                    return (
                      <rect
                        key={s.key}
                        x={groupX - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={barH}
                        fill={s.color}
                        rx="3"
                        opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
                        style={{ transition: 'opacity 0.15s ease' }}
                      />
                    )
                  })}
                  <text
                    x={groupX}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6F6A65"
                    fontFamily="inherit"
                  >
                    {d.label}
                  </text>
                </g>
              )
            }

            // Grouped bars
            const totalBarsWidth = series.length * barWidth + (series.length - 1) * barGap
            const startX = groupX - totalBarsWidth / 2

            return (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} style={{ cursor: 'pointer' }}>
                {series.map((s, sIdx) => {
                  const val = Number(d[s.key]) || 0
                  const barH = (val / maxVal) * plotHeight
                  const x = startX + sIdx * (barWidth + barGap)
                  const y = padding.top + plotHeight - barH

                  return (
                    <rect
                      key={s.key}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(2, barH)}
                      fill={s.color}
                      rx="3"
                      opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
                      style={{ transition: 'opacity 0.15s ease' }}
                    />
                  )
                })}
                <text
                  x={groupX}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6F6A65"
                  fontFamily="inherit"
                >
                  {d.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredData && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
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
