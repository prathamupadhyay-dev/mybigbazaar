import React from 'react';

/**
 * Standard macOS-inspired FormSection component
 * Groups form fields with clean hierarchy and border separation.
 */
export default function FormSection({
  title,
  description,
  children,
  actions = null,
  style = {},
  className = ''
}) {
  return (
    <div
      className={`form-section-card ${className}`}
      style={{
        backgroundColor: '#FBFBFA',
        borderRadius: '12px',
        border: '1px solid #E7E5E4',
        boxShadow: '0 1px 3px rgba(28, 25, 23, 0.04)',
        padding: '24px',
        marginBottom: '20px',
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
          paddingBottom: '14px',
          borderBottom: '1px solid #E7E5E4'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#1C1917',
              margin: 0,
              letterSpacing: '-0.01em'
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                fontSize: '0.8rem',
                color: '#57534E',
                margin: '4px 0 0',
                lineHeight: 1.4
              }}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{actions}</div>}
      </div>

      <div className="form-section-content">{children}</div>
    </div>
  );
}
