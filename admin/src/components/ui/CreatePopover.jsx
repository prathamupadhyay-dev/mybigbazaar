// ============================================================
// MyBigBazaar Admin — CreatePopover Component
// Warm Minimalist Luxury (Panel #FBFBFA, Border #E7E5E4, Hover #EEEDE9)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Briefcase, Percent, ChevronRight } from 'lucide-react';

export default function CreatePopover({ isOpen, onClose }) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (path) => {
    onClose();
    navigate(path);
  };

  const createActions = [
    {
      title: 'New Product Listing',
      desc: 'Publish or moderate a classified ad',
      path: '/dashboard/listings',
      icon: ShoppingBag,
      color: '#0B2545'
    },
    {
      title: 'New Product Category',
      desc: 'Add marketplace taxonomy node',
      path: '/dashboard/listings/categories',
      icon: Tag,
      color: '#15803D'
    },
    {
      title: 'New Service Category',
      desc: 'Add to service catalogue hierarchy',
      path: '/dashboard/services/categories',
      icon: Briefcase,
      color: '#4338CA'
    },
    {
      title: 'New GST Tax Slab',
      desc: 'Configure statutory tax percentage',
      path: '/dashboard/payments/taxes',
      icon: Percent,
      color: '#C2410C'
    }
  ];

  return (
    <div
      ref={popoverRef}
      className="admin-popover create-popover"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '280px',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderRadius: '12px',
        border: '1px solid var(--color-border, #E7E5E4)',
        boxShadow: '0 8px 24px rgba(28, 25, 23, 0.08), 0 1px 3px rgba(28, 25, 23, 0.04)',
        zIndex: 1100,
        overflow: 'hidden',
        padding: '6px'
      }}
    >
      <div
        style={{
          padding: '6px 10px 8px 10px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-text-metadata, #6F6A65)',
          borderBottom: '1px solid var(--color-border, #E7E5E4)'
        }}
      >
        Quick Create
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
        {createActions.map((act, i) => {
          const Icon = act.icon;
          return (
            <div
              key={i}
              onClick={() => handleAction(act.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 120ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg, #EEEDE9)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-sunken, #EEEDE9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.color,
                    flexShrink: 0
                  }}
                >
                  <Icon size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #57534E)' }}>
                    {act.desc}
                  </div>
                </div>
              </div>
              <ChevronRight size={13} style={{ color: 'var(--color-text-metadata, #6F6A65)', opacity: 0.6 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
