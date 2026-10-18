import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keyboard, Command, LifeBuoy, X, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

/**
 * HelpModal - macOS-style System Shortcuts & Help Reference
 */
export default function HelpModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', label: 'Spotlight Command Search' },
    { key: '/', label: 'Quick Search Focus' },
    { key: 'Esc', label: 'Close Active Popover / Modal' },
    { key: '⌘B / Ctrl+B', label: 'Toggle Sidebar Navigation' }
  ];

  const quickLinks = [
    {
      title: 'Customer Support Tickets',
      desc: 'Resolve user inquiries & escalation queues',
      path: '/dashboard/support/tickets',
      icon: <LifeBuoy size={16} color="#C2410C" />
    },
    {
      title: 'Sales & Analytics Reports',
      desc: 'Inspect daily sales, customer, and payment reports',
      path: '/dashboard/reports/sales',
      icon: <FileText size={16} color="#15803D" />
    },
    {
      title: 'System Health & Metrics',
      desc: 'Verify backend API & microservice status',
      path: '/dashboard/system/health',
      icon: <ShieldAlert size={16} color="#0B2545" />
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FBFBFA',
          borderRadius: '12px',
          border: '1px solid #E7E5E4',
          boxShadow: '0 24px 64px rgba(28, 25, 23, 0.18), 0 2px 8px rgba(28, 25, 23, 0.05)',
          overflow: 'hidden',
          animation: 'popoverFadeIn 160ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E7E5E4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EEEDE9',
                color: '#0B2545',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Command size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#1C1917' }}>
                Help & Shortcuts
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#6F6A65' }}>
                Enterprise moderation productivity controls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6F6A65',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Keyboard Shortcuts */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6F6A65',
                marginBottom: '10px'
              }}
            >
              <Keyboard size={14} />
              <span>Keyboard Shortcuts</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}
            >
              {shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#EEEDE9',
                    border: '1px solid #E7E5E4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <kbd
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0B2545'
                    }}
                  >
                    {sc.key}
                  </kbd>
                  <span style={{ fontSize: '0.72rem', color: '#57534E' }}>
                    {sc.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Links */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6F6A65',
                marginBottom: '10px'
              }}
            >
              Platform Operations
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {quickLinks.map((ql, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(ql.path);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 120ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EEEDE9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {ql.icon}
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1917' }}>
                        {ql.title}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#6F6A65' }}>
                        {ql.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#6F6A65" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#EEEDE9',
            borderTop: '1px solid #E7E5E4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#6F6A65'
          }}
        >
          <span>MyBigBazaar Admin Suite v2.4</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
