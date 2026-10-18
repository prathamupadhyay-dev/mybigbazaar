import React from 'react';

/**
 * Standard macOS-inspired Skeleton loading component
 */
export default function Skeleton({
  variant = 'text',
  width = '100%',
  height,
  borderRadius,
  count = 1,
  style = {},
  className = ''
}) {
  const getDefaultHeight = () => {
    switch (variant) {
      case 'circle':
        return width || '40px';
      case 'card':
        return '140px';
      case 'table-row':
        return '48px';
      case 'text':
      default:
        return '16px';
    }
  };

  const getDefaultRadius = () => {
    switch (variant) {
      case 'circle':
        return '50%';
      case 'card':
        return '14px';
      case 'table-row':
        return '8px';
      case 'text':
      default:
        return '6px';
    }
  };

  const h = height || getDefaultHeight();
  const r = borderRadius || getDefaultRadius();

  const items = Array.from({ length: count });

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .admin-skeleton {
          background: linear-gradient(
            90deg,
            #EEEDE9 25%,
            #E7E5E4 50%,
            #EEEDE9 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      {items.map((_, i) => (
        <div
          key={i}
          className={`admin-skeleton ${className}`}
          style={{
            width: variant === 'circle' ? h : width,
            height: h,
            borderRadius: r,
            marginBottom: count > 1 && i < count - 1 ? '10px' : 0,
            ...style
          }}
        />
      ))}
    </>
  );
}
