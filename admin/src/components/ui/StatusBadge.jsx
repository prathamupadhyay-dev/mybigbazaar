// ============================================================
// MyBigBazaar Admin — Standard StatusBadge Primitive
// Theme-aware tokens for both Light and Dark Modes
// ============================================================

import React from 'react';

export default function StatusBadge({ status, label, onClick, title, dot = false }) {
  const norm = String(status || '').toLowerCase().trim();

  let bg = 'var(--status-neutral-bg, rgba(87, 83, 78, 0.08))';
  let color = 'var(--status-neutral-text, #57534E)';
  let border = 'var(--status-neutral-border, rgba(87, 83, 78, 0.20))';
  let dotColor = '#6F6A65';

  if (['active', 'approved', 'verified', 'published', 'completed', 'paid', 'live', 'sent', 'success', 'delivered'].includes(norm)) {
    bg = 'var(--status-success-bg, rgba(21, 128, 61, 0.08))';
    color = 'var(--status-success-text, #15803D)';
    border = 'var(--status-success-border, rgba(21, 128, 61, 0.25))';
    dotColor = '#10B981';
  } else if (['pending', 'in_progress', 'under_review', 'scheduled', 'draft', 'countered', 'waiting', 'placed', 'processing', 'shipped'].includes(norm)) {
    bg = 'var(--status-warning-bg, rgba(194, 65, 12, 0.08))';
    color = 'var(--status-warning-text, #C2410C)';
    border = 'var(--status-warning-border, rgba(194, 65, 12, 0.25))';
    dotColor = '#F59E0B';
  } else if (['inactive', 'rejected', 'declined', 'failed', 'cancelled', 'canceled', 'returned', 'suspended', 'blocked', 'banned', 'critical'].includes(norm)) {
    bg = 'var(--status-danger-bg, rgba(190, 18, 60, 0.08))';
    color = 'var(--status-danger-text, #BE123C)';
    border = 'var(--status-danger-border, rgba(190, 18, 60, 0.25))';
    dotColor = '#EF4444';
  } else if (['power', 'featured', 'premium', 'service', 'assigned', 'doorstep'].includes(norm)) {
    bg = 'rgba(99, 102, 241, 0.12)';
    color = 'var(--color-navy, #6366F1)';
    border = 'rgba(99, 102, 241, 0.28)';
    dotColor = '#6366F1';
  }

  return (
    <span
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dot ? '5px' : '0',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'opacity 120ms ease'
      }}
    >
      {dot && (
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0
          }}
        />
      )}
      {label || status}
    </span>
  );
}
