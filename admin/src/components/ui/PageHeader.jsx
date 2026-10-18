// ============================================================
// MyBigBazaar Admin — PageHeader Primitive
// Warm Minimalist Luxury (Primary #1C1917, Secondary #57534E)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react';

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  children
}) {
  return (
    <div
      className="page-header"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}
    >
      <div>
        {breadcrumbs.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: '#6F6A65',
              marginBottom: '4px',
              fontWeight: 500
            }}
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1C1917',
            margin: 0
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: '13.5px',
              color: '#57534E',
              marginTop: '4px',
              marginBottom: 0,
              maxWidth: '720px',
              lineHeight: 1.45
            }}
          >
            {description}
          </p>
        )}
      </div>

      {children && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {children}
        </div>
      )}
    </div>
  );
}
