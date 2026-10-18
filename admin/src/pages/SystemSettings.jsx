import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export default function SystemSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app_system_settings');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      commissionRate: 0,
      freeAdsLimit: 0,
      bookingAutoCancelMins: 0,
      maintenanceMode: false,
      maintenanceNotice: '',
      supportPhone: '',
      supportEmail: '',
      paymentGatewayMode: 'Live Production',
      smsGateway: 'Fast2SMS Production',
      instantPayouts: false
    };
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_system_settings', JSON.stringify(settings));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Global Platform System Settings"
        description="Operational commission thresholds, emergency maintenance switches, and integration parameters."
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
          <span>System settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="admin-grid-2">
          {/* Marketplace & Financial Rules */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Commercial & Operational Thresholds</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Platform Service Commission (%)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="50"
                value={settings.commissionRate}
                onChange={e => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Deducted automatically from technician payout on completed job completion.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Free Classified Ads Limit Per Seller</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="20"
                value={settings.freeAdsLimit}
                onChange={e => setSettings({ ...settings, freeAdsLimit: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Sellers must buy a Paid Boost or Seller Pass after reaching this active ad limit.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Booking Auto-Cancel Window (Minutes)</label>
              <input
                type="number"
                className="form-input"
                min="5"
                max="120"
                value={settings.bookingAutoCancelMins}
                onChange={e => setSettings({ ...settings, bookingAutoCancelMins: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Unaccepted technician requests are automatically reassigned or refunded after this delay.
              </span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="instantPayoutCheck"
                checked={settings.instantPayouts}
                onChange={e => setSettings({ ...settings, instantPayouts: e.target.checked })}
              />
              <label htmlFor="instantPayoutCheck" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Enable Instant UPI Payout to Verified Technicians upon OTP Completion
              </label>
            </div>
          </div>

          {/* Third-Party Gateways & Support */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Integration Gateways & Support Hotline</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Gateway Mode</label>
              <select
                className="form-select"
                value={settings.paymentGatewayMode}
                onChange={e => setSettings({ ...settings, paymentGatewayMode: e.target.value })}
              >
                <option value="Live Production">Razorpay Live Production</option>
                <option value="Test Sandbox">Razorpay Test Sandbox</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">SMS / OTP Gateway Provider</label>
              <select
                className="form-select"
                value={settings.smsGateway}
                onChange={e => setSettings({ ...settings, smsGateway: e.target.value })}
              >
                <option value="Fast2SMS Production">Fast2SMS High-Priority Route</option>
                <option value="Twilio Global">Twilio Global SMS API</option>
                <option value="Local Simulated">Local Simulated Verification</option>
              </select>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Customer Support Toll-Free</label>
                <input
                  type="text"
                  placeholder="e.g. +91 1800 000 0000"
                  className="form-input"
                  value={settings.supportPhone}
                  onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Support Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. support@example.com"
                  className="form-input"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Maintenance Mode Emergency Switch */}
            <div style={{ marginTop: '16px', padding: '16px', background: settings.maintenanceMode ? 'rgba(239,68,68,0.1)' : 'var(--hover-bg)', borderRadius: '8px', border: settings.maintenanceMode ? '1px solid #ef4444' : '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: settings.maintenanceMode ? '#ef4444' : 'var(--text-primary)' }}>
                  Platform Maintenance Mode
                </span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Activating this locks all consumer apps and displays an emergency downtime banner.
              </p>
              {settings.maintenanceMode && (
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Describe emergency maintenance notice for users..."
                  value={settings.maintenanceNotice}
                  onChange={e => setSettings({ ...settings, maintenanceNotice: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button 
            type="submit" 
            className="btn-primary"
            style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
          >
            Save All Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
