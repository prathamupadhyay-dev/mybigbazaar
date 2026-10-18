import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUserRound, LogOut, ArrowUpRight } from 'lucide-react';
import { clearAdminSession } from '../../utils/api';

/**
 * Anchored macOS-style Lightweight Profile Popover (220px)
 * Closes on Escape or outside click.
 * Strictly lightweight identity + quick route to Account page + Sign Out.
 */
export default function ProfilePopover({
  isOpen,
  onClose,
  userName = 'Administrator',
  userEmail = 'admin@mybigbazaar.com',
  onLogout
}) {
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

  const initial = (userName || userEmail || 'A').charAt(0).toUpperCase();

  const handleNavigateAccount = () => {
    onClose();
    navigate('/dashboard/profile');
  };

  const handleSignOutClick = () => {
    onClose();
    if (onLogout) onLogout();
    else {
      clearAdminSession();
      navigate('/login');
    }
  };

  return (
    <div
      ref={popoverRef}
      className="profile-popover"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '240px',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderRadius: '8px',
        border: '1px solid var(--color-border, #E7E5E4)',
        boxShadow: '0 4px 16px rgba(28, 25, 23, 0.08), 0 1px 3px rgba(28, 25, 23, 0.04)',
        zIndex: 1100,
        overflow: 'hidden',
        animation: 'popoverFadeIn 140ms cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '6px'
      }}
    >
      {/* Identity Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-navy, #0B2545)',
            color: '#FBFBFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.82rem',
            flexShrink: 0
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text-primary, #1C1917)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              color: 'var(--color-text-metadata, #6F6A65)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {userEmail}
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--color-border, #E7E5E4)', margin: '4px 0' }} />

      {/* Navigation Actions */}
      <div
        onClick={handleNavigateAccount}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.80rem',
          fontWeight: 500,
          color: 'var(--color-text-primary, #1C1917)',
          transition: 'background-color 120ms ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg, #EEEDE9)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CircleUserRound size={15} style={{ color: 'var(--color-navy, #0B2545)' }} />
          <span>Account Settings</span>
        </div>
        <ArrowUpRight size={13} style={{ color: 'var(--color-text-metadata, #6F6A65)' }} />
      </div>

      <div
        onClick={handleSignOutClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.80rem',
          fontWeight: 500,
          color: '#BE123C',
          transition: 'background-color 120ms ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF1F2')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <LogOut size={15} />
        <span>Sign Out</span>
      </div>
    </div>
  );
}
