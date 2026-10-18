// ============================================================
// MyBigBazaar Admin — Standard Button Primitive
// Warm Minimalist Luxury (Canvas #F6F5F2, Cards #FBFBFA, Inputs #EEEDE9)
// Primary Terracotta #C2410C (hover #9A3412), Radius 8px
// Zero #FFFFFF, Zero #000000
// ============================================================

import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  className = '',
  title = ''
}) {
  const sizeStyles = {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: '12px',
      borderRadius: '8px',
      gap: '6px'
    },
    md: {
      height: '38px',
      padding: '0 16px',
      fontSize: '13px',
      borderRadius: '8px',
      gap: '8px'
    },
    lg: {
      height: '44px',
      padding: '0 20px',
      fontSize: '14px',
      borderRadius: '8px',
      gap: '8px'
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#C2410C',
          color: '#FBFBFA',
          border: '1px solid transparent',
          boxShadow: '0 1px 2px rgba(28, 25, 23, 0.06)'
        };
      case 'secondary':
        return {
          backgroundColor: '#FBFBFA',
          color: '#1C1917',
          border: '1px solid #E7E5E4',
          boxShadow: '0 1px 2px rgba(28, 25, 23, 0.03)'
        };
      case 'danger':
        return {
          backgroundColor: '#FFF1F2',
          color: '#BE123C',
          border: '1px solid rgba(190, 18, 60, 0.25)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#57534E',
          border: '1px solid transparent'
        };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      title={title}
      className={`admin-btn admin-btn-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 140ms ease',
        userSelect: 'none',
        outline: 'none',
        ...sizeStyles[size],
        ...getVariantStyles(),
        ...style
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        if (variant === 'primary') e.currentTarget.style.backgroundColor = '#9A3412';
        if (variant === 'secondary') e.currentTarget.style.backgroundColor = '#EEEDE9';
        if (variant === 'danger') e.currentTarget.style.backgroundColor = '#FFE4E6';
        if (variant === 'ghost') e.currentTarget.style.backgroundColor = '#EEEDE9';
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        const defaultStyle = getVariantStyles();
        e.currentTarget.style.backgroundColor = defaultStyle.backgroundColor;
      }}
    >
      {loading ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ animation: 'spin 0.8s linear infinite' }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
        </>
      )}
    </button>
  );
}
