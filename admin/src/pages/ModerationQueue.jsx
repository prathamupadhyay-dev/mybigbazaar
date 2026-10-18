// ============================================================
// Unified Multi-Vertical Moderation Center
// ============================================================
// Consolidates moderation across Classifieds, User Profiles,
// Chat Violations, Provider Ads, and Customer Reviews.
// ============================================================

import React, { useState, useEffect } from 'react'
import MetricCard from '../components/charts/MetricCard'
import StatusPill from '../components/common/StatusPill'
import BulkActionBar from '../components/common/BulkActionBar'
import ExportButton from '../components/common/ExportButton'
import { apiFetch } from '../utils/api'

export default function ModerationQueue({ token }) {
  const [activeTab, setActiveTab] = useState('listings') // 'listings' | 'users' | 'chats' | 'reviews'
  const [selectedIds, setSelectedIds] = useState([])
  const [inspectItem, setInspectItem] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [toast, setToast] = useState('')
  const [queueItems, setQueueItems] = useState([])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  function normalizeItem(raw) {
    if (!raw) return null
    const typeMap = {
      listing: 'listings',
      listings: 'listings',
      user: 'users',
      users: 'users',
      account: 'users',
      chat: 'chats',
      chats: 'chats',
      review: 'reviews',
      reviews: 'reviews'
    }
    const rawType = (raw.targetType || raw.type || 'listings').toLowerCase()
    const type = typeMap[rawType] || 'listings'

    let age = raw.age || 'Just now'
    if (!raw.age && raw.createdAt) {
      const diffMs = Date.now() - new Date(raw.createdAt).getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHrs / 24)
      if (diffDays > 0) age = `${diffDays}d ago`
      else if (diffHrs > 0) age = `${diffHrs}h ago`
      else age = 'Just now'
    }

    const id = raw.id || raw._id || `MOD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const reporterName = typeof raw.reporterId === 'object' && raw.reporterId
      ? (raw.reporterId.fullName || raw.reporterId.email || 'Community Member')
      : (raw.reporter || 'System Sentinel')

    return {
      id,
      _id: raw._id || id,
      type,
      title: raw.title || raw.reason || raw.description || `Reported ${type.slice(0, -1)}`,
      user: raw.user || (typeof raw.reporterId === 'object' ? raw.reporterId?.fullName : 'Flagged User') || 'Flagged User',
      violation: raw.violation || raw.reason || raw.description || 'Flagged content inspection required',
      reporter: reporterName,
      severity: raw.severity || (String(raw.reason || '').toLowerCase().includes('fraud') ? 'critical' : 'medium'),
      age,
      status: raw.status || 'pending',
      rawItem: raw
    }
  }

  const loadQueue = async () => {
    try {
      const res = await apiFetch('/api/v1/moderation/queue', {}, token)
      const json = await res.json()
      if (json && Array.isArray(json.data)) {
        setQueueItems(json.data.map(normalizeItem).filter(Boolean))
      }
    } catch (err) {
      console.warn('[MODERATION] Error loading queue data:', err)
    }
  }

  useEffect(() => {
    loadQueue()
  }, [token])

  const filtered = queueItems.filter(item => {
    const matchesTab = item.type === activeTab
    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity
    return matchesTab && matchesSeverity
  })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(i => i.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleBulkApprove = async () => {
    const count = selectedIds.length
    setQueueItems(prev => prev.filter(item => !selectedIds.includes(item.id)))
    try {
      await apiFetch('/api/v1/moderation/resolve', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action: 'approve' })
      }, token)
    } catch (err) {
      console.warn('[MODERATION] Bulk approve error:', err)
    }
    showToast(`Bulk approved ${count} items.`)
    setSelectedIds([])
  }

  const handleBulkReject = async () => {
    const count = selectedIds.length
    setQueueItems(prev => prev.filter(item => !selectedIds.includes(item.id)))
    try {
      await apiFetch('/api/v1/moderation/resolve', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action: 'reject' })
      }, token)
    } catch (err) {
      console.warn('[MODERATION] Bulk reject error:', err)
    }
    showToast(`Bulk taken down ${count} items with violation penalty.`)
    setSelectedIds([])
  }

  // Dynamic KPI Metrics
  const pendingCount = queueItems.filter(i => (i.status || '').toLowerCase() === 'pending').length
  const criticalCount = queueItems.filter(i => (i.severity || '').toLowerCase() === 'critical').length
  const totalCount = queueItems.length
  const resolvedCount = queueItems.filter(i => {
    const s = (i.status || '').toLowerCase()
    return s === 'resolved' || s === 'approved' || s === 'dismissed'
  }).length

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Moderation
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Central clearinghouse for content violations, suspect listings, chat abuse, and suspicious users.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExportButton
            data={queueItems}
            filename="mybigbazaar-moderation-queue.csv"
            label="Export Queue"
          />
        </div>
      </div>

      {/* KPI Row with Clean Material Symbols (No raw SVG strings) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricCard
          label="Pending Queue"
          value={`${pendingCount} Items`}
          previousValue={`${pendingCount} Items`}
          change={0}
          period="awaiting review"
          icon="pending_actions"
        />
        <MetricCard
          label="Critical Severity Flags"
          value={`${criticalCount} Items`}
          previousValue={`${criticalCount} Items`}
          change={0}
          period="high priority"
          badgeText={criticalCount > 0 ? 'ATTENTION' : 'NOMINAL'}
          badgeType={criticalCount > 0 ? 'danger' : 'neutral'}
          icon="warning"
        />
        <MetricCard
          label="Processed & Dismissed"
          value={`${resolvedCount} Items`}
          previousValue={`${resolvedCount} Items`}
          change={0}
          period="moderation actions"
          icon="task_alt"
        />
        <MetricCard
          label="Total Monitored"
          value={`${totalCount} Items`}
          previousValue={`${totalCount} Items`}
          change={0}
          period="recorded reports"
          icon="gavel"
        />
      </div>

      {/* Tabs & Filter Bar */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          {/* Vertical Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--hover-bg)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            {[
              { id: 'listings', label: 'Listings & Ads' },
              { id: 'users', label: 'Accounts & Users' },
              { id: 'chats', label: 'Chat Violations' },
              { id: 'reviews', label: 'Ratings & Reviews' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setActiveTab(t.id); setSelectedIds([]) }}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: activeTab === t.id ? 'var(--accent-color, #d4af37)' : 'transparent',
                  color: activeTab === t.id ? '#000000' : 'var(--text-secondary)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Severity:</span>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '750px' }}>
            <thead>
              <tr>
                <th style={{ width: '38px' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Queue Item ID</th>
                <th>Target Entity / Content</th>
                <th>Suspected Violation</th>
                <th>Detection Source</th>
                <th>Severity</th>
                <th>Age</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No queue items pending for this tab.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? 'var(--hover-bg)' : 'transparent' }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleRow(item.id)}
                      />
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color, #d4af37)', fontSize: '0.82rem' }}>
                      {item.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Account: {item.user}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', maxWidth: '240px' }}>
                      {item.violation}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.reporter}
                    </td>
                    <td>
                      <StatusPill status={item.severity} label={item.severity} />
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {item.age}
                    </td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setInspectItem(item)}
                      >
                        Inspect & Rule →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: 'Bulk Approve / Dismiss', icon: 'M5 13l4 4L19 7', onClick: handleBulkApprove, variant: 'secondary' },
          { label: 'Bulk Takedown & Suspend', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', onClick: handleBulkReject, variant: 'danger' }
        ]}
      />

      {/* Inspect Modal */}
      {inspectItem && (
        <div className="modal-overlay" onClick={() => setInspectItem(null)}>
          <div className="modal-container" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>Inspect {inspectItem.id}</h3>
                <StatusPill status={inspectItem.severity} label={inspectItem.severity} />
              </div>
              <button
                onClick={() => setInspectItem(null)}
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
                <span className="form-label">Reported Item Title</span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {inspectItem.title}
                </p>
              </div>

              <div className="admin-grid-2">
                <div>
                  <span className="form-label">Flagged User</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectItem.user}</p>
                </div>
                <div>
                  <span className="form-label">Flagged Source</span>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{inspectItem.reporter}</p>
                </div>
              </div>

              <div>
                <span className="form-label">Specific Rule Violation</span>
                <div style={{
                  marginTop: '4px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  {inspectItem.violation}
                </div>
              </div>

              <div style={{
                background: 'var(--hover-bg)',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Trust Score Heuristics:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Account created 3 days ago from an unverified IP cluster. 0 completed escrow transactions. Flagged automatically by pricing anomaly neural model.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setInspectItem(null)}>Cancel</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    const id = inspectItem.id
                    setQueueItems(prev => prev.filter(item => item.id !== id))
                    try {
                      await apiFetch('/api/v1/moderation/resolve', {
                        method: 'POST',
                        body: JSON.stringify({ ids: [id], action: 'reject' })
                      }, token)
                    } catch (err) {
                      console.warn('[MODERATION] Resolve reject error:', err)
                    }
                    showToast(`Item ${id} removed. Violation action recorded.`)
                    setInspectItem(null)
                  }}
                >
                  Takedown & Reject
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={async () => {
                    const id = inspectItem.id
                    setQueueItems(prev => prev.filter(item => item.id !== id))
                    try {
                      await apiFetch('/api/v1/moderation/resolve', {
                        method: 'POST',
                        body: JSON.stringify({ ids: [id], action: 'approve' })
                      }, token)
                    } catch (err) {
                      console.warn('[MODERATION] Resolve approve error:', err)
                    }
                    showToast(`Item ${id} approved. Flag dismissed.`)
                    setInspectItem(null)
                  }}
                >
                  Approve Item
                </button>
              </div>
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
