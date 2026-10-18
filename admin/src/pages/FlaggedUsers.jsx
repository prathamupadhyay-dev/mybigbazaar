import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';

export const initialFlaggedUsers = [];

export default function FlaggedUsers() {
  const [users, setUsers] = useState(initialFlaggedUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  const handleAction = (id, newStatus, message) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(message);
    setSelectedUser(null);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Flagged Accounts & User Moderation"
        description="Users flagged by multiple community reports or algorithmic abuse heuristics."
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>High Risk Accounts</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>{users.length} Users</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Pending disciplinary review</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Warnings</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            {users.filter(u => u.status === 'Warned').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Formal strike recorded</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total User Reports</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '6px' }}>
            {users.reduce((sum, u) => sum + u.reportsCount, 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Verified community complaints</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-toolbar">
          <input
            type="text"
            className="search-box"
            placeholder="Search flagged users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '260px' }}
          />
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Role</th>
                <th>Violation Category</th>
                <th>Reports</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{u.email} | {u.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-default">{u.role}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#ef4444' }}>{u.violationType}</div>
                  </td>
                  <td>
                    <span className="badge badge-danger">{u.reportsCount} Reports</span>
                  </td>
                  <td>
                    <strong style={{ color: u.riskScore > 80 ? '#ef4444' : '#f59e0b' }}>{u.riskScore} / 100</strong>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'Warned' ? 'badge-warning' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-action btn-edit" onClick={() => setSelectedUser(u)}>
                      Review Action
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No flagged accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '500px', maxWidth: '100%', margin: 0, borderTop: '4px solid var(--status-danger-text)', boxShadow: 'var(--modal-shadow)' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">Disciplinary Action — {selectedUser.name}</h3>
              <button
                onClick={() => setSelectedUser(null)}
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
              <div><strong>Account ID:</strong> {selectedUser.id} ({selectedUser.role})</div>
              <div><strong>Contact:</strong> {selectedUser.phone} | {selectedUser.email}</div>
              <div><strong>Primary Violation:</strong> {selectedUser.violationType}</div>
              <div><strong>Reported By:</strong> {selectedUser.reportedBy.join(', ')}</div>
              <div><strong>Platform Risk Index:</strong> {selectedUser.riskScore}/100</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-action" onClick={() => setSelectedUser(null)}>Dismiss</button>
              <button 
                className="btn-action" 
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b' }}
                onClick={() => handleAction(selectedUser.id, 'Warned', `Official warning strike issued to ${selectedUser.name}.`)}
              >
                Issue Warning Strike
              </button>
              <button 
                className="btn-action btn-delete"
                onClick={() => handleAction(selectedUser.id, 'Suspended', `Account ${selectedUser.name} suspended indefinitely.`)}
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
