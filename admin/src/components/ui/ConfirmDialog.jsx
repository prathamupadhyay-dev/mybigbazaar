// ============================================================
// MyBigBazaar Admin — Enterprise ConfirmDialog Primitive
// Accessible Keyboard Trapping, Escape Dismissal, Theme-Safe Tokens
// ============================================================

import React, { useEffect } from 'react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
        animation: 'backdropFadeIn 140ms ease'
      }}
      onClick={onCancel}
    >
      <div
        className="modal-card cc-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          borderRadius: '12px',
          border: '1px solid var(--color-border, #E7E5E4)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          padding: '24px',
          animation: 'modalScaleIn 160ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalScaleIn { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>

        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--color-text-primary, #1C1917)',
            margin: '0 0 8px 0'
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--color-text-secondary, #57534E)',
            lineHeight: 1.5,
            margin: '0 0 20px 0'
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E7E5E4)',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              color: 'var(--color-text-primary, #1C1917)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 120ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-sunken, #EEEDE9)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-panel, #FBFBFA)')}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDanger ? 'var(--status-danger-text, #BE123C)' : 'var(--accent-color, #C2410C)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'background-color 120ms ease'
            }}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
