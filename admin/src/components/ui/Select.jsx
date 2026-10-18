// ============================================================
// MyBigBazaar Admin — Standard Select Primitive
// Warm Minimalist Luxury (Sunken #EEEDE9, Card #FBFBFA, Border #E7E5E4)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  children,
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  id,
  name,
  style = {},
  className = ''
}) {
  const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`admin-select-wrapper ${className}`} style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1C1917',
            marginBottom: '6px',
            letterSpacing: '0.01em'
          }}
        >
          {label} {required && <span style={{ color: '#BE123C' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '14px',
            paddingRight: '36px',
            borderRadius: '8px',
            border: `1px solid ${error ? '#BE123C' : '#E7E5E4'}`,
            backgroundColor: '#EEEDE9',
            color: '#1C1917',
            fontSize: '13.5px',
            outline: 'none',
            boxSizing: 'border-box',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'border-color 140ms ease, background-color 140ms ease',
            ...style
          }}
          onFocus={(e) => {
            if (!disabled && !error) {
              e.currentTarget.style.borderColor = '#0B2545';
              e.currentTarget.style.backgroundColor = '#FBFBFA';
              e.currentTarget.style.boxShadow = '0 0 0 1px #0B2545';
            }
          }}
          onBlur={(e) => {
            if (!disabled && !error) {
              e.currentTarget.style.borderColor = '#E7E5E4';
              e.currentTarget.style.backgroundColor = '#EEEDE9';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))
            : children}
        </select>

        {/* Custom Chevron Indicator */}
        <span
          style={{
            position: 'absolute',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            color: '#6F6A65',
            pointerEvents: 'none'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {error ? (
        <span style={{ display: 'block', fontSize: '11.5px', color: '#BE123C', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ display: 'block', fontSize: '11.5px', color: '#6F6A65', marginTop: '4px' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
