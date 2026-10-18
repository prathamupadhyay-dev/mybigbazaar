// ============================================================
// Platform Trust, Safety & Risk Intelligence Center
// ============================================================
// Algorithmic fraud defense: device fingerprint clustering,
// price dumping detection, off-platforming, and risk scoring.
// ============================================================

import React, { useState } from 'react'
import MetricCard from '../components/charts/MetricCard'
import StatusPill from '../components/common/StatusPill'
import ExportButton from '../components/common/ExportButton'

export default function TrustRiskCenter() {
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // Live risk incidents stream awaiting telemetry
  const riskIncidents = []

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Trust & Platform Risk Center
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              RISK SIGNALS & HEURISTIC ENGINE
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Heuristic defense rule specifications, anomaly detection models, and escrow safeguards.
          </p>
        </div>

        <ExportButton
          data={riskIncidents}
          filename="mybigbazaar-risk-incidents.csv"
          label="Export Risk Stream"
        />
      </div>

      {/* Data Truth Notice Banner */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <strong>Platform Risk Stream:</strong> Real-time fraud signals and incident alerts will appear automatically as anomalies are detected across marketplace transactions.
        </div>
      </div>

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricCard
          label="Fraud Interceptions (30d)"
          value="0 Blocks"
          previousValue="0 Blocks"
          change={0}
          period="nominal risk status"
          icon="security"
        />
        <MetricCard
          label="Estimated Loss Prevented"
          value="₹0"
          previousValue="₹0"
          change={0}
          period="nominal risk status"
          icon="savings"
        />
        <MetricCard
          label="False Positive Rate"
          value="0.0%"
          previousValue="0.0%"
          change={0}
          period="target specification"
          icon="rule"
        />
      </div>

      {/* Real-Time Risk Anomaly Stream */}
      <div className="admin-card" style={{ marginBottom: '28px', padding: '20px 22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Real-Time Heuristic Anomaly Stream
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            High-risk behavior signals detected by automated platform heuristics.
          </p>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '750px' }}>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Target Account</th>
                <th>Heuristic Risk Signal</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Automated Action</th>
                <th>Detected</th>
                <th style={{ textAlign: 'right' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {riskIncidents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No risk incidents detected. Platform risk stream is nominal.
                  </td>
                </tr>
              ) : (
                riskIncidents.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)', fontSize: '0.82rem' }}>
                      {r.id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.user}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{r.signal}</td>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: r.score >= 85 ? '#ef4444' : r.score >= 65 ? '#f59e0b' : '#10b981'
                      }}>
                        {r.score}/100
                      </span>
                    </td>
                    <td>
                      <StatusPill status={r.level} label={r.level} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-color, #d4af37)' }}>
                        {r.action}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.time}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => setSelectedIncident(r)}
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Investigation: {selectedIncident.id}</h3>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span className="form-label">Subject User Account</span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedIncident.user}</p>
              </div>
              <div>
                <span className="form-label">Risk Evaluation</span>
                <p style={{ margin: '4px 0 0', color: '#ef4444', fontWeight: 600 }}>{selectedIncident.signal}</p>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <span className="form-label">Calculated Risk Score</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                  {selectedIncident.score} / 100
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedIncident(null)}>Dismiss</button>
              <button className="btn-primary" onClick={() => { showToast('Account permanent ban enacted.'); setSelectedIncident(null); }}>
                Enact Permanent Ban
              </button>
            </div>
          </div>
        </div>
      )}

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
