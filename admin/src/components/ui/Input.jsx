// ============================================================
// MyBigBazaar Admin — Standard Input Primitive
// Warm Minimalist Luxury (Sunken #EEEDE9, Card #FBFBFA, Border #E7E5E4)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react';

export default function Input({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  error = '',
  helperText = '',
  icon = null,
  disabled = false,
  required = false,
  id,
  name,
  autoComplete,
  style = {},
  className = ''
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`admin-input-wrapper ${className}`} style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={inputId}
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
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: '#6F6A65',
              pointerEvents: 'none'
            }}
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: icon ? '38px' : '14px',
            paddingRight: '14px',
            borderRadius: '8px',
            border: `1px solid ${error ? '#BE123C' : '#E7E5E4'}`,
            backgroundColor: '#EEEDE9',
            color: '#1C1917',
            fontSize: '13.5px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 140ms ease, background-color 140ms ease',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
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
        />
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
