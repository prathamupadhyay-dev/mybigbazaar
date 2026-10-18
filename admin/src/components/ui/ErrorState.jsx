// ============================================================
// MyBigBazaar Admin — ErrorState Primitive
// Warm Minimalist Luxury (Crimson #BE123C, Card #FBFBFA, Border #E7E5E4)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react';
import Button from './Button';

export default function ErrorState({
  title = 'Unable to load content',
  message = 'An unexpected error occurred while communicating with the server. Please verify your connection or try again.',
  error = null,
  onRetry = null,
  style = {}
}) {
  return (
    <div
      className="error-state-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        backgroundColor: '#FBFBFA',
        borderRadius: '12px',
        border: '1px solid rgba(190, 18, 60, 0.25)',
        ...style
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          backgroundColor: '#FFF1F2',
          border: '1px solid #FECDD3',
          color: '#BE123C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          error
        </span>
      </div>

      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#BE123C',
          margin: '0 0 6px 0'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          color: '#57534E',
          maxWidth: '440px',
          margin: '0 0 16px 0',
          lineHeight: 1.45
        }}
      >
        {message}
      </p>

      {error && (
        <code
          style={{
            fontSize: '11px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#EEEDE9',
            border: '1px solid #E7E5E4',
            color: '#BE123C',
            marginBottom: '16px',
            fontFamily: 'var(--font-mono, monospace)'
          }}
        >
          {typeof error === 'string' ? error : error?.message || 'Error code 500'}
        </code>
      )}

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
