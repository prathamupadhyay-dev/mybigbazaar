// ============================================================
// MyBigBazaar Admin — Standard StatusPill Primitive
// Warm Minimalist Luxury (Emerald #15803D, Terracotta #C2410C, Crimson #BE123C, Indigo #4338CA)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react'

export default function StatusPill({ status = '', label = null, showDot = true }) {
  const norm = String(status).toLowerCase().trim().replace(/[-\s]/g, '_')

  let bg = '#EEEDE9'
  let text = '#57534E'
  let border = '#E7E5E4'
  let dotColor = '#57534E'

  switch (norm) {
    case 'active':
    case 'approved':
    case 'verified':
    case 'completed':
    case 'paid':
    case 'resolved':
    case 'success':
      bg = 'rgba(21, 128, 61, 0.08)'
      text = '#15803D'
      border = 'rgba(21, 128, 61, 0.25)'
      dotColor = '#15803D'
      break

    case 'pending':
    case 'under_review':
    case 'in_progress':
    case 'investigating':
    case 'waiting_customer':
    case 'scheduled':
    case 'upcoming':
      bg = 'rgba(194, 65, 12, 0.08)'
      text = '#C2410C'
      border = 'rgba(194, 65, 12, 0.25)'
      dotColor = '#C2410C'
      break

    case 'escrow_held':
    case 'assigned':
    case 'dispatched':
    case 'processing':
    case 'doorstep':
      bg = 'rgba(67, 56, 202, 0.08)'
      text = '#4338CA'
      border = 'rgba(67, 56, 202, 0.25)'
      dotColor = '#4338CA'
      break

    case 'rejected':
    case 'failed':
    case 'cancelled':
    case 'suspended':
    case 'banned':
    case 'critical':
    case 'breached':
      bg = '#FFF1F2'
      text = '#BE123C'
      border = 'rgba(190, 18, 60, 0.25)'
      dotColor = '#BE123C'
      break

    default:
      bg = '#EEEDE9'
      text = '#57534E'
      border = '#E7E5E4'
      dotColor = '#57534E'
      break
  }

  const displayText = label || status.replace(/_/g, ' ')

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '11px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '6px',
      backgroundColor: bg,
      color: text,
      border: `1px solid ${border}`,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap'
    }}>
      {showDot && (
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0
        }} />
      )}
      <span>{displayText}</span>
    </span>
  )
}
