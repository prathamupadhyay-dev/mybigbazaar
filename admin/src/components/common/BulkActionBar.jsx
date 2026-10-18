import React from 'react';
import { X } from 'lucide-react';

/**
 * BulkActionBar - Floating macOS-style dock for table multi-selection
 * Appears when 1 or more rows are checked in operational tables.
 */
export default function BulkActionBar({
  selectedCount = 0,
  onClear,
  actions = [] // Array of: { label: 'Approve', icon: ComponentOrPath, onClick: fn, variant: 'primary'|'danger'|'secondary' }
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        backgroundColor: '#0B2545',
        border: '1px solid #E7E5E4',
        boxShadow: '0 8px 24px rgba(11, 37, 69, 0.25), 0 2px 6px rgba(28, 25, 23, 0.08)',
        borderRadius: '8px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: '#FBFBFA',
        animation: 'slideUpBar 0.20s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes slideUpBar {
          from { transform: translate(-50%, 30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      {/* Counter Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          className="tabular-nums"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '22px',
            height: '22px',
            padding: '0 6px',
            borderRadius: '6px',
            backgroundColor: '#C2410C',
            color: '#FBFBFA',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        >
          {selectedCount}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FBFBFA' }}>
          {selectedCount === 1 ? '1 item selected' : `${selectedCount} items selected`}
        </span>
      </div>

      <div style={{ height: '18px', width: '1px', backgroundColor: 'rgba(231, 229, 228, 0.3)' }} />

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actions.map((act, i) => {
          let btnStyle = {
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 120ms ease, opacity 120ms ease'
          };

          if (act.variant === 'danger') {
            btnStyle = { ...btnStyle, backgroundColor: '#BE123C', color: '#FBFBFA' };
          } else if (act.variant === 'primary') {
            btnStyle = { ...btnStyle, backgroundColor: '#C2410C', color: '#FBFBFA' };
          } else {
            btnStyle = { ...btnStyle, backgroundColor: '#EEEDE9', color: '#1C1917' };
          }

          const IconComp = typeof act.icon === 'function' ? act.icon : null;

          return (
            <button
              key={i}
              type="button"
              onClick={act.onClick}
              style={btnStyle}
            >
              {IconComp && <IconComp size={14} />}
              {typeof act.icon === 'string' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={act.icon} />
                </svg>
              )}
              {act.label}
            </button>
          );
        })}
      </div>

      {onClear && (
        <>
          <div style={{ height: '18px', width: '1px', backgroundColor: 'rgba(231, 229, 228, 0.3)' }} />
          <button
            type="button"
            onClick={onClear}
            title="Deselect all"
            style={{
              background: 'none',
              border: 'none',
              color: '#EEEDE9',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        </>
      )}
    </div>
  );
}
