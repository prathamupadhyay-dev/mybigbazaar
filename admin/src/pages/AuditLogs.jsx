import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';

export const initialAuditLogs = [];

export default function AuditLogs() {
  const [logs, setLogs] = useState(initialAuditLogs);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let res = await apiFetch('/api/v1/audit-logs').catch(() => null);
        if (!res || !res.ok) {
          res = await apiFetch('/audit-log/get-all').catch(() => null);
        }
        if (isMounted && res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.auditLogs) ? json.auditLogs : []);
          const normalized = list.map((item, idx) => ({
            id: item._id || item.id || `LOG-${1000 + idx}`,
            timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Just now',
            admin: {
              name: item.actorId?.fullName || item.details?.email || 'Platform Sentinel',
              role: item.actorId?.role || item.details?.role || 'Admin',
              email: item.actorId?.email || item.details?.email || ''
            },
            action: item.action || 'SYSTEM_EVENT',
            resource: item.resourceType || item.resource || 'System',
            ipAddress: item.ipAddress || '127.0.0.1',
            status: 'Success',
            details: item.details || {}
          }));
          setLogs(normalized);
        }
      } catch (err) {
        console.warn('Failed to load audit logs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLogs();
    return () => { isMounted = false; };
  }, []);

  const filtered = logs.filter(l => {
    const matchesSearch = 
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.admin && l.admin.name && l.admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = ['All', ...new Set(logs.map(l => l.action))];

  return (
    <div className="admin-page">
      <PageHeader
        title="Activity"
        description="Chronological record of administrative operations, security events, and system changes."
        breadcrumbs={['Insights', 'Activity']}
      >
        <ExportButton
          data={filtered.map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            admin: (l.admin && l.admin.name) || 'Administrator',
            role: (l.admin && l.admin.role) || 'Admin',
            action: l.action,
            resource: l.resource,
            ipAddress: l.ipAddress || l.ip || '127.0.0.1',
            status: l.status || 'Success'
          }))}
          filename="system_audit_logs.csv"
          label="Export Audit Trail"
          dateKey="timestamp"
          columns={[
            { key: 'id', label: 'Log ID' },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'admin', label: 'Administrator' },
            { key: 'role', label: 'Role' },
            { key: 'action', label: 'Action Performed' },
            { key: 'resource', label: 'Resource Target' },
            { key: 'ipAddress', label: 'IP Address' },
            { key: 'status', label: 'Status' }
          ]}
        />
      </PageHeader>

      <div className="admin-card">
        <div className="filter-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="search-box"
            placeholder="Search by user, action, resource, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Action:</label>
            <select
              className="filter-select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)'
              }}
            >
              {uniqueActions.map(act => <option key={act} value={act}>{act}</option>)}
            </select>
          </div>
        </div>

        <div className="table-responsive-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Resource</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{l.timestamp}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>ID: {l.id}</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{(l.admin && l.admin.name) || 'Administrator'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(l.admin && l.admin.role) || 'Admin'}</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <code style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-color)', background: 'rgba(30, 70, 189, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                      {l.action}
                    </code>
                  </td>
                  <td style={{ padding: '14px', maxWidth: '240px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{l.resource}</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{l.ipAddress}</span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 8px', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button className="btn-secondary" onClick={() => setSelectedLog(l)} style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px' }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Diff Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'var(--glass-blur)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '620px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', margin: 0, background: 'var(--modal-bg)', border: '1px solid var(--border-color)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>Activity Details — {selectedLog.id}</h3>
              <button 
                onClick={() => setSelectedLog(null)} 
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

            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>User:</strong> {(selectedLog.admin && selectedLog.admin.name) || 'Administrator'} ({(selectedLog.admin && selectedLog.admin.email) || 'admin@bigbazaar.com'})</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Action:</strong> <code>{selectedLog.action}</code></div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Target:</strong> {selectedLog.resource}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Recorded At:</strong> {selectedLog.timestamp} from IP <code>{selectedLog.ipAddress}</code></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '6px' }}>BEFORE</div>
                <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {JSON.stringify((selectedLog.diff && selectedLog.diff.before) || {}, null, 2)}
                </pre>
              </div>

              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '6px' }}>AFTER</div>
                <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {JSON.stringify((selectedLog.diff && selectedLog.diff.after) || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn-secondary" onClick={() => setSelectedLog(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
