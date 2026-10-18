import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch, cleanLegacyMocks } from '../utils/api';

export const INITIAL_REPORTS = [];

const REPORT_TYPES = [
  'All',
  'Fraudulent Listing',
  'Off-Platform Payment Solicitation',
  'Harassment & Abuse',
  'Service Quality Dispute',
  'Counterfeit Item'
];

export default function Reports() {
  const [reports, setReports] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_reports_data');
      if (saved) {
        try {
          const parsed = cleanLegacyMocks(JSON.parse(saved));
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_REPORTS;
  });

  const [activeType, setActiveType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('admin_reports_data', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/v1/moderation/reports')
      .then(res => res.json())
      .then(json => {
        if (isMounted && json && Array.isArray(json.data)) {
          setReports(json.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchType = activeType === 'All' || r.type === activeType;
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = query === '' ||
        r.id.toLowerCase().includes(query) ||
        r.targetTitle.toLowerCase().includes(query) ||
        r.targetUser.toLowerCase().includes(query) ||
        r.reporterName.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query);
      return matchType && matchStatus && matchSearch;
    });
  }, [reports, activeType, statusFilter, searchQuery]);

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const underReviewCount = reports.filter(r => r.status === 'Under Review').length;
  const criticalCount = reports.filter(r => r.severity === 'Critical' && r.status !== 'Resolved' && r.status !== 'Dismissed').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  const handleResolveAction = (newStatus, actionLabel) => {
    if (!selectedReport) return;
    const reportId = selectedReport.id;
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: newStatus,
          notes: actionNotes.trim() ? `${r.notes ? r.notes + ' | ' : ''}[${actionLabel}]: ${actionNotes}` : r.notes
        };
      }
      return r;
    });

    setReports(updated);
    apiFetch(`/api/v1/moderation/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus, action: actionLabel, notes: actionNotes })
    }).catch(console.warn);
    showToast(`Incident ${reportId} marked as ${newStatus} (${actionLabel})`);
    setSelectedReport(null);
    setActionNotes('');
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Trust, Safety & Incident Reports"
        subtitle="Investigate consumer fraud reports, off-platform solicitation, chat abuse, and escrow quality disputes."
      >
        <ExportButton
          data={filteredReports}
          filename="incident_reports.csv"
          label="Export Reports CSV"
          dateKey="createdAt"
          columns={[
            { key: 'id', label: 'Incident ID' },
            { key: 'createdAt', label: 'Report Date' },
            { key: 'type', label: 'Incident Category' },
            { key: 'severity', label: 'Severity' },
            { key: 'targetTitle', label: 'Target Listing / Service' },
            { key: 'targetUser', label: 'Reported User' },
            { key: 'reporterName', label: 'Reporting Customer' },
            { key: 'reason', label: 'Allegation Summary' },
            { key: 'status', label: 'Resolution Status' }
          ]}
        />
      </PageHeader>

      {/* KPI Counters */}
      <div className="admin-grid-4" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Critical Active
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            High priority fraud / scams
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending Moderation
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Awaiting initial triage
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Under Investigation
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>
            {underReviewCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Evidence check / user contact
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Resolved
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            {resolvedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Actioned and closed
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Incident Type Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {REPORT_TYPES.map(type => (
              <button
                key={type}
                className={`btn-action ${activeType === type ? 'active' : ''}`}
                style={{
                  background: activeType === type ? 'var(--hover-bg)' : 'transparent',
                  borderColor: activeType === type ? 'var(--accent-color)' : 'var(--border-color)',
                  color: activeType === type ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.84rem'
                }}
                onClick={() => setActiveType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status & Search Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '150px', padding: '8px 10px', fontSize: '0.85rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>

            <input
              type="text"
              className="form-input"
              placeholder="Search reports or entities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '240px', padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="admin-card">
        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Incident ID</th>
                <th style={{ width: '110px' }}>Severity</th>
                <th style={{ width: '180px' }}>Type</th>
                <th>Reported Entity &amp; Context</th>
                <th style={{ width: '160px' }}>Reporter Info</th>
                <th style={{ width: '130px' }}>Date</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', width: '110px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    {reports.length === 0 ? 'No incident reports filed yet.' : 'No reports found matching your current filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredReports.map(rep => (
                  <tr key={rep.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{rep.id}</strong>
                    </td>
                    <td>
                      <span className={`badge ${rep.severity === 'Critical' ? 'badge-danger' : rep.severity === 'High' ? 'badge-warning' : 'badge-default'}`}>
                        {rep.severity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rep.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {rep.targetTitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Target: <span style={{ color: 'var(--accent-color)' }}>{rep.targetUser}</span> ({rep.targetType} #{rep.targetId})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{rep.reason.slice(0, 90)}..."
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {rep.reporterName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {rep.reporterPhone}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {rep.date}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        rep.status === 'Resolved' ? 'badge-success' :
                        rep.status === 'Under Review' ? 'badge-warning' :
                        rep.status === 'Pending' ? 'badge-danger' : 'badge-default'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => {
                          setSelectedReport(rep);
                          setActionNotes('');
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Review & Moderation Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '640px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Incident Review: {selectedReport.id}</h3>
                <span className={`badge ${selectedReport.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: '4px' }}>
                  {selectedReport.severity} Priority • {selectedReport.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Flagged Entity Summary */}
              <div style={{ padding: '14px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  FLAGGED ENTITY
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {selectedReport.targetTitle}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Account / Author: <strong>{selectedReport.targetUser}</strong> ({selectedReport.targetType} #{selectedReport.targetId})
                </div>
              </div>

              {/* Reported Reason & Evidence */}
              <div className="form-group">
                <label className="form-label">Reporter Allegation &amp; Description</label>
                <div style={{ padding: '12px', background: 'var(--hover-bg)', borderRadius: '6px', fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  {selectedReport.reason}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attached User Evidence</label>
                <div style={{ padding: '10px 12px', background: 'var(--hover-bg)', borderRadius: '6px', fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Evidence: {selectedReport.evidence}
                </div>
              </div>

              {selectedReport.notes && (
                <div className="form-group">
                  <label className="form-label">Prior Moderation Notes</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(21, 72, 166, 0.08)', borderRadius: '6px', fontSize: '0.84rem', color: 'var(--accent-color)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>{selectedReport.notes}</span>
                  </div>
                </div>
              )}

              {/* Action Note Input */}
              <div className="form-group">
                <label className="form-label">Moderator Resolution Notes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Record your investigation rationale, user call notes, or penalty summary..."
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                />
              </div>

              {/* Moderation Actions Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  EXECUTE MODERATION ACTION
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444', fontWeight: 700 }}
                    onClick={() => handleResolveAction('Resolved', 'Account Banned & Listing Takedown')}
                  >
                    Ban Account &amp; Takedown
                  </button>

                  <button
                    type="button"
                    className="btn-action"
                    style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b', fontWeight: 700 }}
                    onClick={() => handleResolveAction('Resolved', 'Official Warning Issued')}
                  >
                    Issue Official Warning
                  </button>

                  <button
                    type="button"
                    className="btn-action"
                    style={{ background: '#10b981', color: '#fff', borderColor: '#10b981', fontWeight: 700 }}
                    onClick={() => handleResolveAction('Resolved', 'Escrow 100% Refund Approved')}
                  >
                    Approve Escrow Refund
                  </button>

                  <button
                    type="button"
                    className="btn-action"
                    style={{ background: 'transparent', color: 'var(--text-secondary)' }}
                    onClick={() => handleResolveAction('Dismissed', 'Dismissed as False Report')}
                  >
                    Dismiss Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Glass Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${toast.type === 'error' ? 'var(--status-danger-border)' : 'var(--border-color)'}`,
          boxShadow: 'var(--card-shadow)',
          borderRadius: 'var(--mbb-radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: toast.type === 'error' ? 'var(--status-danger-text)' : 'var(--text-primary)'
        }}>
          {toast.type === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
