// ============================================================
// MyBigBazaar Admin — EmptyState Primitive
// Warm Minimalist Luxury (Cards #FBFBFA, Sunken #EEEDE9, Border #E7E5E4)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react';

export default function EmptyState({
  icon = null,
  title = 'No records found',
  description = 'Try adjusting your search filters or create a new record.',
  actionLabel = null,
  onAction = null,
  style = {}
}) {
  return (
    <div
      className="empty-state-box"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#FBFBFA',
        borderRadius: '12px',
        border: '1px solid #E7E5E4',
        ...style
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          backgroundColor: '#EEEDE9',
          border: '1px solid #E7E5E4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#57534E',
          marginBottom: '14px'
        }}
      >
        {icon || (
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            inbox
          </span>
        )}
      </div>

      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#1C1917',
          margin: '0 0 6px 0'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          color: '#57534E',
          maxWidth: '420px',
          margin: 0,
          lineHeight: 1.45
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#C2410C',
            color: '#FBFBFA',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 120ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9A3412')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C2410C')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
