// ============================================================
// MyBigBazaar Admin — Standard Modal Primitive
// Warm Minimalist Luxury (Cards #FBFBFA, Sunken #EEEDE9, Border #E7E5E4)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React, { useEffect, useRef } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '560px',
  closeOnEscape = true,
  closeOnOutsideClick = true
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1200,
        animation: 'modalBackdropFade 140ms ease-out'
      }}
    >
      <style>{`
        @keyframes modalBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        ref={modalRef}
        className="modal-container"
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: '#FBFBFA',
          borderRadius: '12px',
          border: '1px solid #E7E5E4',
          boxShadow: '0 4px 20px -2px rgba(28, 25, 23, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'modalSlideUp 160ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E7E5E4',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#FBFBFA'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#1C1917',
                margin: 0,
                letterSpacing: '-0.015em'
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: '12.5px',
                  color: '#57534E',
                  margin: '4px 0 0',
                  lineHeight: 1.4
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close dialog"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#57534E',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 120ms ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EEEDE9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#FBFBFA'
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #E7E5E4',
              backgroundColor: '#EEEDE9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
