import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

// Risk flags stream awaiting live heuristic detections
export const initialRiskFlags = [];

export default function RiskFlags() {
  const [flags, setFlags] = useState(initialRiskFlags);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = flags.filter(f => {
    const matchesSearch = 
      f.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.triggerSnippet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.sourceRef?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || f.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleAction = (id, newStatus, message) => {
    setFlags(flags.map(f => f.id === id ? { ...f, status: newStatus } : f));
    if (message) showToast(message);
    setSelectedFlag(null);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'High':
        return <span className="badge badge-danger">High Risk ({sev})</span>;
      case 'Medium':
        return <span className="badge badge-warning">Medium Risk</span>;
      case 'Low':
        return <span className="badge badge-info">Low Risk</span>;
      default:
        return <span className="badge badge-default">{sev}</span>;
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Risk Flags & Automated Threat Monitor"
        description="Automated keyword heuristics, off-platform payment attempts, and prohibited content surveillance."
      />

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

      <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Critical / High Risk</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>
            {flags.filter(f => f.severity === 'High').length} Flags
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Requires immediate triage</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Under Investigation</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            {flags.filter(f => f.status === 'Investigating').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Assigned to trust moderators</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Resolved Today</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
            {flags.filter(f => f.status === 'Resolved' || f.status === 'Dismissed').length} Incidents
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Zero fraud leakage</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search risk flags by keyword, snippet, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Severity:</label>
            <select
              className="filter-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Flag ID</th>
                <th>Violation Category</th>
                <th>Detected Snippet</th>
                <th>Source Origin</th>
                <th>Severity</th>
                <th>Detected At</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{f.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.keyword}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Score: {f.riskScore}/100</div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.8rem', background: 'var(--hover-bg)', padding: '6px 8px', borderRadius: '4px', fontStyle: 'italic', borderLeft: '3px solid #ef4444' }}>
                      "{f.triggerSnippet}"
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{f.sourceType}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{f.sourceRef}</div>
                  </td>
                  <td>{getSeverityBadge(f.severity)}</td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.detectedAt}</div>
                  </td>
                  <td>
                    <span className={`badge ${f.status === 'Pending' ? 'badge-warning' : f.status === 'Investigating' ? 'badge-info' : 'badge-default'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-action btn-edit" onClick={() => setSelectedFlag(f)}>
                      Triage
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No risk flags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triage Modal */}
      {selectedFlag && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '540px', maxWidth: '100%', margin: 0, borderTop: '4px solid var(--status-danger-text)', boxShadow: 'var(--modal-shadow)' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">Triage Security Flag {selectedFlag.id}</h3>
              <button
                onClick={() => setSelectedFlag(null)}
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

            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '16px' }}>
              <div><strong>Category:</strong> {selectedFlag.keyword} (Risk Score: {selectedFlag.riskScore}/100)</div>
              <div><strong>Origin:</strong> {selectedFlag.sourceType} ({selectedFlag.sourceRef})</div>
              <div><strong>Detected Snippet:</strong></div>
              <div style={{ background: 'var(--hover-bg)', padding: '8px', borderRadius: '6px', margin: '6px 0', fontStyle: 'italic', borderLeft: '3px solid var(--status-danger-text)' }}>
                "{selectedFlag.triggerSnippet}"
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => handleAction(selectedFlag.id, 'Dismissed', 'Security flag dismissed.')}>
                Dismiss Flag
              </button>
              <button className="btn-action btn-edit" onClick={() => handleAction(selectedFlag.id, 'Investigating', 'Marked as under investigation.')}>
                Mark Investigating
              </button>
              <button 
                className="btn-action btn-delete" 
                onClick={() => handleAction(selectedFlag.id, 'Resolved / Sanctioned', 'Content removed and user account suspended.')}
              >
                Remove Content & Suspend User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
