import React from 'react';

/**
 * Standard macOS-inspired IconButton component
 * Variants: 'default' | 'danger' | 'ghost'
 * Sizes: 'sm' (28px) | 'md' (34px) | 'lg' (40px)
 */
export default function IconButton({
  icon,
  onClick,
  title = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  style = {}
}) {
  const sizeMap = {
    sm: { width: '28px', height: '28px', borderRadius: '6px' },
    md: { width: '34px', height: '34px', borderRadius: '8px' },
    lg: { width: '40px', height: '40px', borderRadius: '8px' }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          color: '#BE123C',
          backgroundColor: 'transparent',
          border: '1px solid transparent'
        };
      case 'ghost':
        return {
          color: '#57534E',
          backgroundColor: 'transparent',
          border: '1px solid transparent'
        };
      case 'default':
      default:
        return {
          color: '#57534E',
          backgroundColor: '#FBFBFA',
          border: '1px solid #E7E5E4'
        };
    }
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      className={`admin-icon-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 120ms ease',
        outline: 'none',
        flexShrink: 0,
        ...sizeMap[size],
        ...getVariantStyles(),
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variant === 'danger'
            ? '#FFF1F2'
            : '#EEEDE9';
          if (variant === 'default') {
            e.currentTarget.style.borderColor = '#0B2545';
            e.currentTarget.style.color = '#1C1917';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          const base = getVariantStyles();
          e.currentTarget.style.backgroundColor = base.backgroundColor;
          e.currentTarget.style.borderColor = base.border?.split(' ')[2] || 'transparent';
          e.currentTarget.style.color = base.color;
        }
      }}
    >
      {icon}
    </button>
  );
}
