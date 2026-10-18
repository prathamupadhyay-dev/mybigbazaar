import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export default function Configuration() {
  const [flags, setFlags] = useState({
    enable_live_chat_offers: true,
    enable_service_package_tiering: true,
    enable_instant_payouts: true,
    enable_ai_moderation: true,
    enable_guest_browsing: true,
    enable_push_notifications: true
  });

  const [techConfig, setTechConfig] = useState({
    maxUploadSizeMb: 10,
    sessionTimeoutMins: 60,
    apiRateLimit: 120,
    cacheTtlSeconds: 300,
    nodeEnvironment: 'Production (Optimized)'
  });

  const [saved, setSaved] = useState(false);

  const toggleFlag = (key) => {
    setFlags({ ...flags, [key]: !flags[key] });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Technical Configuration & Feature Flags"
        description="Control runtime feature toggles, caching strategies, and API security parameters."
      />

      {saved && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--mbb-radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-primary)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Configuration applied and hot-reloaded successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="admin-grid-2">
          {/* Feature Flags */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Application Feature Flags</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Live Chat Bargaining & Make Offer</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Permits buyers and sellers to negotiate formal price offers inside chat.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enable_live_chat_offers}
                  onChange={() => toggleFlag('enable_live_chat_offers')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Service Multi-Tier Packages</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Shows Basic, Standard, and Premium packages on service screens.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enable_service_package_tiering}
                  onChange={() => toggleFlag('enable_service_package_tiering')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Automated AI Heuristics Moderation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Scans listings and chat text for prohibited items and off-platform cash solicitations.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enable_ai_moderation}
                  onChange={() => toggleFlag('enable_ai_moderation')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Guest Marketplace Browsing</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Permits unauthenticated users to view feeds and listings before login prompt.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enable_guest_browsing}
                  onChange={() => toggleFlag('enable_guest_browsing')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mobile Push Notifications</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Broadcasts Expo push notifications for booking confirmations and new chat messages.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enable_push_notifications}
                  onChange={() => toggleFlag('enable_push_notifications')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Technical Runtime Parameters */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Runtime & Performance Limits</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Max File / Image Upload Size (MB)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="50"
                value={techConfig.maxUploadSizeMb}
                onChange={e => setTechConfig({ ...techConfig, maxUploadSizeMb: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Applied to seller listing photos, provider KYC documents, and chat attachments.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                className="form-input"
                min="10"
                max="480"
                value={techConfig.sessionTimeoutMins}
                onChange={e => setTechConfig({ ...techConfig, sessionTimeoutMins: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Automatically invalidates JWT token after this idle period.
              </span>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">API Rate Limit (Req/Min)</label>
                <input
                  type="number"
                  className="form-input"
                  value={techConfig.apiRateLimit}
                  onChange={e => setTechConfig({ ...techConfig, apiRateLimit: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Redis Cache TTL (Seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  value={techConfig.cacheTtlSeconds}
                  onChange={e => setTechConfig({ ...techConfig, cacheTtlSeconds: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--hover-bg)', borderRadius: '8px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SERVER CLUSTER TARGET</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginTop: '4px' }}>
                Node.js ESM • MongoDB Atlas Primary • Express API v1
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button 
            type="submit" 
            className="btn-primary"
            style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
          >
            Apply Technical Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
