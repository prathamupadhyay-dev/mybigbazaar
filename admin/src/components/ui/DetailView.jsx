import React from 'react';
import Button from './Button';

/**
 * Enterprise DetailView Component
 * For displaying inspected entity metadata, key-value pairs, and action buttons.
 * Fully responsive and supports Light & Dark themes.
 */
export default function DetailView({
  title,
  subtitle,
  badge = null,
  avatar = null,
  items = [],
  actions = null,
  onClose = null,
  children = null,
  style = {}
}) {
  return (
    <div
      className="detail-view-card cc-card"
      style={{
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderRadius: '12px',
        border: '1px solid var(--color-border, #E7E5E4)',
        boxShadow: '0 1px 3px rgba(28, 25, 23, 0.04)',
        padding: '24px',
        ...style
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border, #E7E5E4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {avatar && (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {avatar}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #1C1917)',
                  margin: 0,
                  letterSpacing: '-0.015em'
                }}
              >
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary, #57534E)',
                  margin: '4px 0 0'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Key-Value Items Grid */}
      {items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: children ? '20px' : 0
          }}
        >
          {items.map((it, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                border: '1px solid var(--color-border, #E7E5E4)'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--color-text-metadata, #6F6A65)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '4px'
                }}
              >
                {it.label}
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: 'var(--color-text-primary, #1C1917)'
                }}
              >
                {it.value ?? '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
