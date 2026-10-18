// ============================================================
// MyBigBazaar Admin Panel — macOS Native Dashboard Overview
// macOS Sonoma / Ventura Design Standard & SF Pro Typography
// 4 Horizontal Grid Cards: Listings, Users, Deals, Revenue
// Inside each card:
//   - Header: Icon & Title on left, View link on right
//   - Corner text selectors: Today, This Week, This Month, This Year, Total (light, not dark)
//   - Mini progress graph below title (By default 'Today' selected)
//   - Metrics List: First Today, then This Week, This Month, This Year, last Total!
// Directly followed by Recent Platform Activity ledger
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  CalendarCheck
} from 'lucide-react';
import { apiFetch, getAuthToken, cleanLegacyMocks } from '../utils/api';

// SF Pro & macOS Native Font Stack
const MACOS_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

// ============================================================
// Time Buckets Calculator Helper
// ============================================================
function calculateStats(items = [], valueExtractor = () => 1) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const currentDay = now.getDay();
  const daysSinceMonday = (currentDay + 6) % 7; // Monday = 0
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  let total = 0;
  let thisYear = 0;
  let thisMonth = 0;
  let thisWeek = 0;
  let today = 0;

  items.forEach((item) => {
    const val = Number(valueExtractor(item)) || 0;
    const dateStr = item?.createdAt || item?.date || item?.created_at || item?.timestamp;
    const t = dateStr ? new Date(dateStr).getTime() : 0;

    total += val;
    if (t >= startOfYear) thisYear += val;
    if (t >= startOfMonth) thisMonth += val;
    if (t >= startOfWeek) thisWeek += val;
    if (t >= startOfToday) today += val;
  });

  return { total, thisYear, thisMonth, thisWeek, today };
}

// ============================================================
// Progress Over Time Data Series Builder
// ============================================================
function buildProgressSeries(range, stats, items = [], valExtractor = () => 1, isCurrency = false) {
  const now = new Date();
  const format = (v) =>
    isCurrency ? `₹${Math.round(v).toLocaleString('en-IN')}` : `${Math.round(v).toLocaleString('en-IN')}`;

  // 1. TODAY: Hourly intervals
  if (range === 'Today') {
    const hours = [
      { label: '00:00', hStart: 0, hEnd: 4 },
      { label: '04:00', hStart: 4, hEnd: 8 },
      { label: '08:00', hStart: 8, hEnd: 12 },
      { label: '12:00', hStart: 12, hEnd: 16 },
      { label: '16:00', hStart: 16, hEnd: 20 },
      { label: '20:00', hStart: 20, hEnd: 24 }
    ];

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayItems = items.filter((it) => {
      const t = it.createdAt ? new Date(it.createdAt).getTime() : (it.date ? new Date(it.date).getTime() : 0);
      return t >= todayStart;
    });

    let runningSum = 0;
    return hours.map((hr) => {
      const bucketItems = todayItems.filter((it) => {
        const d = new Date(it.createdAt || it.date);
        const h = d.getHours();
        return h >= hr.hStart && h < hr.hEnd;
      });
      const bucketVal = bucketItems.reduce((acc, it) => acc + valExtractor(it), 0);
      runningSum += bucketVal;
      const finalVal =
        stats.today > 0
          ? todayItems.length > 0
            ? runningSum
            : Math.round(stats.today * (hr.hEnd / 24))
          : 0;
      return {
        label: hr.label,
        value: finalVal,
        formattedValue: format(finalVal)
      };
    });
  }

  // 2. THIS WEEK: Monday through Sunday
  if (range === 'This Week') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = (now.getDay() + 6) % 7; // Mon = 0, Sun = 6
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayIdx).getTime();

    const weekItems = items.filter((it) => {
      const t = it.createdAt ? new Date(it.createdAt).getTime() : (it.date ? new Date(it.date).getTime() : 0);
      return t >= startOfWeek;
    });

    let runningSum = 0;
    return days.map((dayName, idx) => {
      const bucketItems = weekItems.filter((it) => {
        const d = new Date(it.createdAt || it.date);
        const dIdx = (d.getDay() + 6) % 7;
        return dIdx === idx;
      });
      const bucketVal = bucketItems.reduce((acc, it) => acc + valExtractor(it), 0);
      runningSum += bucketVal;
      const finalVal =
        stats.thisWeek > 0
          ? weekItems.length > 0
            ? runningSum
            : idx <= currentDayIdx
            ? Math.round(stats.thisWeek * ((idx + 1) / (currentDayIdx + 1)))
            : stats.thisWeek
          : 0;

      return {
        label: dayName,
        value: finalVal,
        formattedValue: format(finalVal)
      };
    });
  }

  // 3. THIS MONTH: Week 1 through Week 5
  if (range === 'This Month') {
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const currentWeekIdx = Math.min(4, Math.floor((now.getDate() - 1) / 7));

    const monthItems = items.filter((it) => {
      const t = it.createdAt ? new Date(it.createdAt).getTime() : (it.date ? new Date(it.date).getTime() : 0);
      return t >= startOfMonth;
    });

    let runningSum = 0;
    return weeks.map((wName, idx) => {
      const bucketItems = monthItems.filter((it) => {
        const d = new Date(it.createdAt || it.date);
        const wIdx = Math.min(4, Math.floor((d.getDate() - 1) / 7));
        return wIdx === idx;
      });
      const bucketVal = bucketItems.reduce((acc, it) => acc + valExtractor(it), 0);
      runningSum += bucketVal;
      const finalVal =
        stats.thisMonth > 0
          ? monthItems.length > 0
            ? runningSum
            : idx <= currentWeekIdx
            ? Math.round(stats.thisMonth * Math.pow((idx + 1) / (currentWeekIdx + 1), 0.9))
            : stats.thisMonth
          : 0;

      return {
        label: wName,
        value: finalVal,
        formattedValue: format(finalVal)
      };
    });
  }

  // 4. THIS YEAR: Months
  if (range === 'This Year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth();
    const startOfYear = new Date(currentYear, 0, 1).getTime();

    const yearItems = items.filter((it) => {
      const t = it.createdAt ? new Date(it.createdAt).getTime() : (it.date ? new Date(it.date).getTime() : 0);
      return t >= startOfYear;
    });

    let runningSum = 0;
    return months.map((mName, idx) => {
      const bucketItems = yearItems.filter((it) => {
        const d = new Date(it.createdAt || it.date);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      });
      const bucketVal = bucketItems.reduce((acc, it) => acc + valExtractor(it), 0);
      runningSum += bucketVal;
      const finalVal =
        stats.thisYear > 0
          ? yearItems.length > 0
            ? runningSum
            : idx <= currentMonthIdx
            ? Math.round(stats.thisYear * Math.pow((idx + 1) / (currentMonthIdx + 1), 1.2))
            : stats.thisYear
          : 0;

      return {
        label: mName,
        value: finalVal,
        formattedValue: format(finalVal)
      };
    });
  }

  // 5. TOTAL: Growth Milestones
  const milestones = ['Start', 'Q1', 'Q2', 'Q3', 'Q4', 'Now'];
  const totalVal = stats.total || 0;

  if (items && items.length > 0) {
    const sorted = [...items].sort((a, b) => {
      const ta = new Date(a.createdAt || a.date || 0).getTime();
      const tb = new Date(b.createdAt || b.date || 0).getTime();
      return ta - tb;
    });

    const totalCount = sorted.length;
    return milestones.map((label, idx) => {
      const sliceIdx = Math.round((idx / (milestones.length - 1)) * totalCount);
      const subItems = sorted.slice(0, sliceIdx);
      const val = subItems.reduce((acc, it) => acc + valExtractor(it), 0);
      return {
        label,
        value: val,
        formattedValue: format(val)
      };
    });
  }

  return milestones.map((label, idx) => {
    const ratio = idx / (milestones.length - 1);
    const curve = Math.pow(ratio, 1.35);
    const val = Math.round(totalVal * curve);
    return {
      label,
      value: val,
      formattedValue: format(val)
    };
  });
}

// ============================================================
// Mini SVG Card Graph Component
// ============================================================
function MiniCardGraph({
  data = [],
  color = '#007AFF',
  title = ''
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const svgRef = useRef(null);

  const width = 280;
  const height = 64;
  const padding = { top: 6, right: 8, bottom: 16, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth;
      const y = padding.top + plotHeight - ((d.value - minVal) / range) * plotHeight;
      return { x, y, ...d };
    });
  }, [data, maxVal, minVal, range, plotWidth, plotHeight, padding.left, padding.top]);

  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };
    if (points.length === 1) {
      const p = points[0];
      return { linePath: `M ${p.x} ${p.y}`, areaPath: '' };
    }

    let lp = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      lp += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const baselineY = padding.top + plotHeight;
    const ap = `${lp} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;
    return { linePath: lp, areaPath: ap };
  }, [points, padding.top, plotHeight]);

  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    let closestIndex = 0;
    let minDistance = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });
    setHoveredIdx(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;
  const gradientId = `mini-grad-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '64px', margin: '2px 0 6px 0' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Subtle grid line */}
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={width - padding.right}
          y2={padding.top + plotHeight}
          stroke="#E5E5EA"
          strokeWidth="0.8"
          opacity="0.8"
        />

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {/* Spline line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Hover Crosshair & Dot */}
        {activePoint && (
          <>
            <line
              x1={activePoint.x}
              y1={padding.top}
              x2={activePoint.x}
              y2={padding.top + plotHeight}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="3.2" fill={color} stroke="#FFFFFF" strokeWidth="1.6" />
          </>
        )}

        {/* X-axis labels: First, Middle, Last */}
        {points.length > 0 && (
          <>
            <text x={points[0].x} y={height - 3} textAnchor="start" fontSize="8.5" fill="#8E8E93" fontWeight="500" fontFamily={MACOS_FONT_STACK}>
              {points[0].label}
            </text>
            {points.length > 2 && (
              <text
                x={points[Math.floor(points.length / 2)].x}
                y={height - 3}
                textAnchor="middle"
                fontSize="8.5"
                fill="#8E8E93"
                fontWeight="500"
                fontFamily={MACOS_FONT_STACK}
              >
                {points[Math.floor(points.length / 2)].label}
              </text>
            )}
            <text
              x={points[points.length - 1].x}
              y={height - 3}
              textAnchor="end"
              fontSize="8.5"
              fill="#8E8E93"
              fontWeight="500"
              fontFamily={MACOS_FONT_STACK}
            >
              {points[points.length - 1].label}
            </text>
          </>
        )}
      </svg>

      {/* macOS Translucent Glass Tooltip Pill */}
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            top: `${Math.max(0, (activePoint.y / height) * 100 - 18)}%`,
            left: `${Math.min(85, Math.max(15, (activePoint.x / width) * 100))}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.09)',
            borderRadius: '6px',
            padding: '2px 7px',
            fontSize: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            zIndex: 10,
            fontFamily: MACOS_FONT_STACK
          }}
        >
          <span style={{ color: '#8E8E93', fontWeight: 500 }}>{activePoint.label}:</span>
          <span className="tabular-nums" style={{ color: '#1C1C1E', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {activePoint.formattedValue}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Single Card Component (Header + Corner selectors + Graph + Metrics: Today -> Total)
// ============================================================
function StatCardWithGraph({
  title,
  icon: Icon,
  color,
  stats,
  items = [],
  valExtractor = () => 1,
  isCurrency = false,
  isUserCard = false,
  link
}) {
  const navigate = useNavigate();

  // By default TODAY is selected!
  const [selectedRange, setSelectedRange] = useState('Today');

  const chartData = useMemo(() => {
    return buildProgressSeries(selectedRange, stats, items, valExtractor, isCurrency);
  }, [selectedRange, stats, items, valExtractor, isCurrency]);

  const formatNumber = (num) => {
    if (isCurrency) {
      return `₹${Number(num || 0).toLocaleString('en-IN')}`;
    }
    return Number(num || 0).toLocaleString('en-IN');
  };

  const timeTabs = [
    { id: 'Today', label: 'Today' },
    { id: 'This Week', label: 'This Week' },
    { id: 'This Month', label: 'This Month' },
    { id: 'This Year', label: 'This Year' },
    { id: 'Total', label: 'Total' }
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1), border-color 160ms ease',
        fontFamily: MACOS_FONT_STACK
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.14)';
        e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)';
      }}
    >
      {/* 1st Line: Card Header (Icon Squircle, Title, macOS Chevron) */}
      <div
        onClick={() => navigate(link)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          paddingBottom: '2px'
        }}
        title={`Open ${title}`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: `${color}14`,
              border: `0.5px solid ${color}28`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              transition: 'transform 120ms ease'
            }}
          >
            <Icon size={15} strokeWidth={2.2} />
          </div>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#1C1C1E',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            {title}
          </h2>
        </div>

        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8E8E93',
            transition: 'all 120ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${color}18`;
            e.currentTarget.style.color = color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
            e.currentTarget.style.color = '#8E8E93';
          }}
        >
          <ChevronRight size={13} strokeWidth={2.5} />
        </div>
      </div>

      {/* 2nd Line: Native macOS Segmented Control Capsule Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(118, 118, 128, 0.08)',
          borderRadius: '7px',
          padding: '2px',
          gap: '2px',
          marginTop: '10px',
          marginBottom: '8px',
          border: '0.5px solid rgba(0, 0, 0, 0.04)'
        }}
      >
        {timeTabs.map((tab) => {
          const isSelected = selectedRange === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRange(tab.id)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                color: isSelected ? '#1C1C1E' : '#636366',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '10.5px',
                padding: '3px 0',
                borderRadius: '5px',
                boxShadow: isSelected
                  ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 0.5px 1px rgba(0, 0, 0, 0.06)'
                  : 'none',
                transition: 'all 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                fontFamily: MACOS_FONT_STACK
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3rd Line: macOS Spline Graph */}
      <div style={{ marginTop: '2px', marginBottom: '6px' }}>
        <MiniCardGraph
          data={chartData}
          color={color}
          title={title}
          selectedRange={selectedRange}
        />
      </div>

      {/* 4th Line: Metric Values Section (Today Box -> Intermediate Rows -> Total Row) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '4px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          paddingTop: '8px'
        }}
      >
        {/* TODAY - Recessed macOS Box Highlight */}
        <div
          onClick={() => setSelectedRange('Today')}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: '7px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: selectedRange === 'Today' ? `${color}0D` : 'rgba(118, 118, 128, 0.05)',
            border: `1px solid ${selectedRange === 'Today' ? `${color}38` : 'rgba(0, 0, 0, 0.05)'}`,
            marginBottom: '6px',
            transition: 'all 120ms ease'
          }}
          title="Click to view Today on graph"
        >
          <div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: selectedRange === 'Today' ? color : '#8E8E93',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Today
            </span>
          </div>
          <span
            className="tabular-nums"
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#1C1C1E',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
          >
            {formatNumber(stats.today)}
          </span>
        </div>

        {/* Intermediate Periods: This Week, This Month, This Year */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {[
            { id: 'This Week', label: 'This Week', value: stats.thisWeek },
            { id: 'This Month', label: 'This Month', value: stats.thisMonth },
            { id: 'This Year', label: 'This Year', value: stats.thisYear }
          ].map((row) => {
            const isRowActive = selectedRange === row.id;
            return (
              <div
                key={row.id}
                onClick={() => setSelectedRange(row.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: isRowActive ? `${color}0D` : 'transparent',
                  transition: 'background-color 100ms ease'
                }}
                title={`Click to view ${row.label} on graph`}
              >
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: isRowActive ? 600 : 500,
                    color: isRowActive ? color : '#636366'
                  }}
                >
                  {row.label}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '13px',
                    fontWeight: isRowActive ? 700 : 600,
                    color: isRowActive ? color : '#1C1C1E',
                    letterSpacing: '-0.015em',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {formatNumber(row.value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* TOTAL - Foundation Row Under Hairline Divider */}
        <div
          onClick={() => setSelectedRange('Total')}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: '7px 8px 2px 8px',
            borderTop: '1px solid rgba(0, 0, 0, 0.07)',
            marginTop: '5px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: selectedRange === 'Total' ? `${color}0D` : 'transparent',
            transition: 'background-color 100ms ease'
          }}
          title="Click to view Total on graph"
        >
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: selectedRange === 'Total' ? color : '#8E8E93',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Total
          </span>
          <span
            className="tabular-nums"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: selectedRange === 'Total' ? color : '#1C1C1E',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              fontVariantNumeric: 'tabular-nums',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
          >
            {formatNumber(stats.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Dashboard Overview Component
// ============================================================
export default function Overview({ token }) {
  const navigate = useNavigate();
  const authToken = getAuthToken(token);

  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');

  const [rawUsers, setRawUsers] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [rawBookings, setRawBookings] = useState([]);
  const [rawPayments, setRawPayments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const adminName = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('admin_user') || '{}');
      return u.fullName || u.name || localStorage.getItem('adminName') || 'Administrator';
    } catch {
      return localStorage.getItem('adminName') || 'Administrator';
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, productsRes, bookingsRes, paymentsRes] = await Promise.allSettled([
        apiFetch('/auth/get-all-users', {}, authToken),
        apiFetch('/product/get-all', {}, authToken),
        apiFetch('/api/v1/bookings?all=true&limit=1000', {}, authToken),
        apiFetch('/api/v1/transactions', {}, authToken)
      ]);

      // 1. Process Users
      let uList = [];
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const uData = await usersRes.value.json().catch(() => ({}));
        uList = Array.isArray(uData.users)
          ? uData.users
          : Array.isArray(uData.data)
          ? uData.data
          : Array.isArray(uData)
          ? uData
          : [];
      }
      setRawUsers(cleanLegacyMocks(uList));

      // 2. Process Products / Listings
      let pList = [];
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const pData = await productsRes.value.json().catch(() => ({}));
        pList = Array.isArray(pData.products)
          ? pData.products
          : Array.isArray(pData.data)
          ? pData.data
          : Array.isArray(pData)
          ? pData
          : [];
      }
      setRawProducts(cleanLegacyMocks(pList));

      // 3. Process Bookings / Deals
      let bList = [];
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
        const bData = await bookingsRes.value.json().catch(() => ({}));
        bList = Array.isArray(bData.bookings)
          ? bData.bookings
          : Array.isArray(bData.data)
          ? bData.data
          : Array.isArray(bData)
          ? bData
          : [];
      }
      if (bList.length === 0) {
        try {
          const fallbackRes = await apiFetch('/admin/booking/get-all', {}, authToken);
          if (fallbackRes && fallbackRes.ok) {
            const fbData = await fallbackRes.json().catch(() => ({}));
            bList = Array.isArray(fbData.bookings)
              ? fbData.bookings
              : Array.isArray(fbData.data)
              ? fbData.data
              : [];
          }
        } catch (e) {}
      }
      setRawBookings(cleanLegacyMocks(bList));

      // 4. Process Payments / Revenue
      let payList = [];
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const payData = await paymentsRes.value.json().catch(() => ({}));
        payList = Array.isArray(payData.transactions)
          ? payData.transactions
          : Array.isArray(payData.data)
          ? payData.data
          : Array.isArray(payData)
          ? payData
          : [];
      }
      setRawPayments(cleanLegacyMocks(payList));

      // 5. Assemble Recent Platform Activity Stream (Users, Listings, Revenue — Bookings have a dedicated panel on the left)
      const stream = [];
      payList.slice(0, 4).forEach((p, i) => {
        stream.push({
          id: `pay-${p._id || p.id || i}`,
          type: 'payment',
          title: `Escrow Settlement: ₹${Number(p.amount || 0).toLocaleString('en-IN')}`,
          detail: `Transaction #${(p.refNumber || p.transactionId || p._id || '').slice(-6).toUpperCase()} • ${p.status || 'Success'}`,
          timestamp: new Date(p.createdAt || p.date || Date.now() - i * 1800000),
          link: '/dashboard/payments/transactions'
        });
      });

      pList.slice(0, 4).forEach((prod, i) => {
        stream.push({
          id: `prd-${prod._id || prod.id || i}`,
          type: 'product',
          title: `Classified Ad: "${(prod.title || prod.productName || 'Item').slice(0, 32)}"`,
          detail: `₹${(prod.price || 0).toLocaleString('en-IN')} • ${prod.status || 'Active'}`,
          timestamp: new Date(prod.createdAt || Date.now() - (i + 2) * 5400000),
          link: '/dashboard/listings'
        });
      });

      uList.slice(0, 4).forEach((u, i) => {
        stream.push({
          id: `usr-${u._id || u.id || i}`,
          type: 'user',
          title: `New User: ${u.fullName || u.name || 'Member'}`,
          detail: `${u.city || 'Indore'} • Registered Account`,
          timestamp: new Date(u.createdAt || Date.now() - (i + 3) * 7200000),
          link: '/dashboard/users'
        });
      });

      stream.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(stream.slice(0, 10));
    } catch (err) {
      console.error('[OVERVIEW] Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [authToken]);

  // Derived 5-Time-Bucket Stats
  const listingsStats = useMemo(() => calculateStats(rawProducts, () => 1), [rawProducts]);
  const usersStats = useMemo(() => calculateStats(rawUsers, () => 1), [rawUsers]);
  const dealsStats = useMemo(() => calculateStats(rawBookings, () => 1), [rawBookings]);
  const revenueStats = useMemo(() => calculateStats(rawPayments, (p) => Number(p.amount) || 0), [rawPayments]);

  const formatActivityTime = (date) => {
    if (!date || isNaN(date.getTime())) return 'Recently';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Filtered activity stream
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return recentActivities;
    return recentActivities.filter((a) => a.type === activityFilter);
  }, [recentActivities, activityFilter]);

  return (
    <div
      style={{
        fontFamily: MACOS_FONT_STACK,
        WebkitFontSmoothing: 'antialiased',
        paddingBottom: '48px',
        maxWidth: '1440px',
        margin: '0 auto'
      }}
    >
      {/* 1. macOS STYLE WINDOW TOOLBAR & HEADER */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid #E5E5EA'
        }}
      >
        <div>
          {/* macOS Window Controls Mock Accent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', color: '#8E8E93', fontWeight: 600, marginLeft: '6px', letterSpacing: '0.02em' }}>
              MyBigBazaar Admin • System Overview
            </span>
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#1C1C1E',
              margin: 0,
              lineHeight: 1.2
            }}
          >
            {greeting}, {adminName}
          </h1>
        </div>
      </div>

      {/* 2. 4 HORIZONTAL GRID CARDS (Listings, Users, Deals, Revenue) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* Card 1: Listings */}
        <StatCardWithGraph
          title="Listings"
          icon={ShoppingBag}
          color="#007AFF"
          stats={listingsStats}
          items={rawProducts}
          valExtractor={() => 1}
          isCurrency={false}
          isUserCard={false}
          link="/dashboard/listings"
        />

        {/* Card 2: Users */}
        <StatCardWithGraph
          title="Users"
          icon={Users}
          color="#5856D6"
          stats={usersStats}
          items={rawUsers}
          valExtractor={() => 1}
          isCurrency={false}
          isUserCard={true}
          link="/dashboard/users"
        />

        {/* Card 3: Bookings */}
        <StatCardWithGraph
          title="Bookings"
          icon={CalendarCheck}
          color="#FF9500"
          stats={dealsStats}
          items={rawBookings}
          valExtractor={() => 1}
          isCurrency={false}
          isUserCard={false}
          link="/dashboard/bookings"
        />

        {/* Card 4: Revenue */}
        <StatCardWithGraph
          title="Revenue"
          icon={CreditCard}
          color="#34C759"
          stats={revenueStats}
          items={rawPayments}
          valExtractor={(p) => Number(p.amount) || 0}
          isCurrency={true}
          isUserCard={false}
          link="/dashboard/payments/transactions"
        />
      </div>

      {/* 3. TWO CARDS BELOW: RECENT BOOKINGS & RECENT ACTIVITY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Left Card: Recent Bookings */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5EA',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.015)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                color: '#1C1C1E',
                letterSpacing: '-0.015em'
              }}
            >
              Recent Bookings
            </h3>
            <button
              type="button"
              onClick={() => navigate('/dashboard/bookings')}
              style={{
                border: 'none',
                background: 'rgba(255, 149, 0, 0.1)',
                color: '#FF9500',
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#8E8E93', fontSize: '12.5px' }}>
              Loading recent bookings...
            </div>
          ) : rawBookings.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1C1C1E' }}>
                No recent bookings found
              </div>
              <p style={{ fontSize: '12px', color: '#8E8E93', margin: '4px 0 0' }}>
                New customer service bookings will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {rawBookings.slice(0, 6).map((b, i) => {
                const title = b.serviceTitle || b.serviceName || b.service?.title || 'Service Booking';
                const customer = b.customerName || b.customer?.fullName || b.customerId?.fullName || 'Customer';
                const status = b.status || 'Confirmed';
                const amt = Number(b.amount || b.totalAmount || 0);
                const dateObj = new Date(b.createdAt || b.date || Date.now());
                return (
                  <div
                    key={b._id || b.id || `rb-${i}`}
                    onClick={() => navigate('/dashboard/bookings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      transition: 'background-color 100ms ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F2F2F7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 149, 0, 0.12)',
                          color: '#FF9500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <CalendarCheck size={14} strokeWidth={2} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#1C1C1E',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {title}
                        </div>
                        <div
                          className="tabular-nums"
                          style={{
                            fontSize: '11px',
                            color: '#8E8E93',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {customer} • {status}{amt > 0 ? ` • ₹${amt.toLocaleString('en-IN')}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className="tabular-nums" style={{ fontSize: '11px', color: '#AEAEB2' }}>
                        {formatActivityTime(dateObj)}
                      </span>
                      <ChevronRight size={13} style={{ color: '#C7C7CC' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Card: Recent Activity */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5EA',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.015)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                color: '#1C1C1E',
                letterSpacing: '-0.015em'
              }}
            >
              Recent Activity
            </h3>

            {/* macOS Segmented Filter Bar */}
            <div
              style={{
                display: 'inline-flex',
                padding: '2px',
                borderRadius: '8px',
                backgroundColor: '#EBEBEF',
                border: '1px solid #E1E1E6',
                gap: '2px'
              }}
            >
              {[
                { id: 'all', label: 'All' },
                { id: 'user', label: 'Users' },
                { id: 'product', label: 'Listings' },
                { id: 'payment', label: 'Revenue' }
              ].map((f) => {
                const isActive = activityFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActivityFilter(f.id)}
                    style={{
                      border: 'none',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? '#1C1C1E' : '#636366',
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
                      transition: 'all 120ms ease'
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: '36px',
                textAlign: 'center',
                color: '#8E8E93',
                fontSize: '12.5px'
              }}
            >
              Loading recent activity...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1C1C1E' }}>
                No recent activity found
              </div>
              <p style={{ fontSize: '12px', color: '#8E8E93', margin: '4px 0 0' }}>
                Platform actions and user operations will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {filteredActivities.slice(0, 6).map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigate(act.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    transition: 'background-color 100ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F2F2F7')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: '#EBEBEF',
                        color:
                          act.type === 'user'
                            ? '#5856D6'
                            : act.type === 'product'
                            ? '#007AFF'
                            : '#34C759',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {act.type === 'user' && <Users size={14} strokeWidth={2} />}
                      {act.type === 'product' && <ShoppingBag size={14} strokeWidth={2} />}
                      {act.type === 'payment' && <CreditCard size={14} strokeWidth={2} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#1C1C1E',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {act.title}
                      </div>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: '11px',
                          color: '#8E8E93',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {act.detail}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: '11px', color: '#AEAEB2' }}
                    >
                      {formatActivityTime(act.timestamp)}
                    </span>
                    <ChevronRight size={13} style={{ color: '#C7C7CC' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
