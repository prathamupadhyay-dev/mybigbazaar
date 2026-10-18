// ============================================================
// MyBigBazaar Admin — NotificationPopover Component
// Warm Minimalist Luxury (Panel #FBFBFA, Border #E7E5E4, Hover #EEEDE9)
// Zero #FFFFFF, Zero #000000
// ============================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPopover({
  isOpen,
  onClose,
  notifications = [],
  notifCount = 0,
  loading = false,
  onMarkAllRead,
  onViewAll
}) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
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

  return (
    <div
      ref={popoverRef}
      className="admin-popover notif-popover"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '320px',
        maxHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderRadius: '12px',
        border: '1px solid var(--color-border, #E7E5E4)',
        boxShadow: '0 8px 24px rgba(28, 25, 23, 0.08), 0 1px 3px rgba(28, 25, 23, 0.04)',
        zIndex: 1100,
        overflow: 'hidden'
      }}
    >
      {/* Popover Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid var(--color-border, #E7E5E4)',
          backgroundColor: 'var(--color-panel, #FBFBFA)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--color-text-primary, #1C1917)' }}>
            Notifications
          </span>
          {notifCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#BE123C',
                color: '#FBFBFA',
                borderRadius: '999px',
                padding: '1px 6px'
              }}
            >
              {notifCount}
            </span>
          )}
        </div>
        {notifCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#C2410C',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {loading ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#57534E', fontSize: '13px' }}>
            Checking notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#57534E', fontSize: '13px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', opacity: 0.5, display: 'block', margin: '0 auto 8px' }}>
              notifications_off
            </span>
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id || n._id}
              onClick={() => {
                onClose();
                navigate('/dashboard/notifications');
              }}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 120ms ease',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EEEDE9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#EEEDE9',
                  color: '#0B2545',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  flexShrink: 0
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>notifications</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {n.title || n.message || 'System Notification'}
                </div>
                <div style={{ fontSize: '11px', color: '#57534E', marginTop: '2px', lineHeight: 1.3 }}>
                  {n.description || n.user_name || n.email || ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popover Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #E7E5E4',
          backgroundColor: '#EEEDE9',
          textAlign: 'center'
        }}
      >
        <button
          onClick={() => {
            onClose();
            if (onViewAll) onViewAll();
            else navigate('/dashboard/notifications');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0B2545',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '2px 8px'
          }}
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}
