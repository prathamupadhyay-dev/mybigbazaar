// ============================================================
// Platform Feature Flags & Runtime Experimentation Control
// ============================================================
// Zero-downtime feature flags: toggles, canary rollout percentages,
// audience targeting rules, and instant emergency kill-switches.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import PageHeader from '../components/ui/PageHeader'

export default function FeatureFlags() {
  const [flags, setFlags] = useState([
    { key: 'escrow_checkout_enabled', name: 'Classifieds Escrow Checkout', desc: 'Allows buyers to deposit payments safely into platform escrow until delivery confirmation.', enabled: true, rollout: 100, env: 'Production', category: 'Commerce' },
    { key: 'doorstep_live_tracking', name: 'Real-Time Technician GPS Tracking', desc: 'Transmits live provider coordinates to customer during active appointment dispatch.', enabled: true, rollout: 100, env: 'Production', category: 'Services' },
    { key: 'in_app_bargaining_counter', name: 'In-App Bargaining & Counter-Offers', desc: 'Enables interactive price negotiation widgets inside buyer-seller chat conversations.', enabled: true, rollout: 100, env: 'Production', category: 'Classifieds' },
    { key: 'instant_ocr_kyc', name: 'Automated OCR Identity Verification', desc: 'Uses AI vision to parse and cross-check Aadhaar/PAN cards upon upload.', enabled: true, rollout: 50, env: 'Staging / Canary', category: 'Trust & Safety' },
    { key: 'surge_pricing_engine', name: 'Dynamic Service Demand Multiplier', desc: 'Automatically applies 1.1x - 1.3x surge rates during rain or extreme localized demand.', enabled: false, rollout: 0, env: 'Production', category: 'Services' },
    { key: 'guest_checkout_express', name: 'Guest Browsing & One-Click Contact', desc: 'Allows visitors to browse full listings without immediate phone verification.', enabled: true, rollout: 100, env: 'Production', category: 'Growth' }
  ])

  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggleFlag = (key) => {
    setFlags(prev => prev.map(f => {
      if (f.key === key) {
        const nextState = !f.enabled
        showToast(`Feature flag '${f.name}' set to ${nextState ? 'ENABLED' : 'DISABLED'}`)
        return { ...f, enabled: nextState, rollout: nextState ? (f.rollout === 0 ? 100 : f.rollout) : 0 }
      }
      return f
    }))
  }

  const updateRollout = (key, val) => {
    setFlags(prev => prev.map(f =>
      f.key === key ? { ...f, rollout: parseInt(val), enabled: parseInt(val) > 0 } : f
    ))
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="Feature Flags & Runtime Experimentation"
        subtitle="Instant operational toggles, canary deployment percentages, and platform safety switches."
      />

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricCard
          label="Active Flags"
          value={`${flags.filter(f => f.enabled).length} / ${flags.length}`}
          change={null}
          period="operational switches"
          icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <MetricCard
          label="Canary Experiments"
          value={`${flags.filter(f => f.rollout > 0 && f.rollout < 100).length} Active`}
          change={null}
          period="partial traffic rollout"
          icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
        <MetricCard
          label="Propagation Delay"
          value="< 500ms"
          change={null}
          period="instant Redis pub/sub sync"
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <MetricCard
          label="Emergency Kill-Switch"
          value="ARMED"
          change={null}
          period="1-click full isolation"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </div>

      {/* Feature Flags Cards / Table */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {flags.map((f) => (
            <div
              key={f.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '10px',
                background: 'var(--hover-bg, rgba(255, 255, 255, 0.04))',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {f.name}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(21, 72, 166, 0.15)',
                    color: '#60a5fa'
                  }}>
                    {f.category}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)'
                  }}>
                    {f.env}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {f.desc}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-color, #d4af37)', fontFamily: 'monospace', marginTop: '4px' }}>
                  Key: {f.key}
                </div>
              </div>

              {/* Rollout slider & toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Rollout: <strong>{f.rollout}%</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={f.rollout}
                    onChange={e => updateRollout(f.key, e.target.value)}
                    style={{ width: '120px', cursor: 'pointer' }}
                  />
                </div>

                {/* Switch toggle */}
                <button
                  type="button"
                  onClick={() => toggleFlag(f.key)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: f.enabled ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                    color: f.enabled ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {f.enabled ? 'ON (Active)' : 'OFF (Disabled)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Glass Toast Notification */}
      {toast && (
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
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
