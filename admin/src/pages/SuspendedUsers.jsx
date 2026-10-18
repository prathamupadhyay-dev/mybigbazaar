import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch, getAuthToken } from '../utils/api';

export default function SuspendedUsers({ token }) {
  const authToken = getAuthToken(token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSuspendedUsers = async () => {
      setLoading(true);
      try {
        let res = await apiFetch('/auth/get-all-users', {}, authToken);
        if (!res.ok) {
          res = await apiFetch('/api/v1/admin/users', {}, authToken);
        }
        if (res.ok) {
          const json = await res.json();
          const raw = Array.isArray(json) ? json : (json.data || json.users || []);
          if (isMounted) {
            // Find users marked as banned, suspended, or inactive
            const suspended = raw.filter(u => 
              u.status === 'suspended' || 
              u.status === 'banned' || 
              u.isSuspended === true || 
              u.isBanned === true
            ).map((u, idx) => ({
              id: u._id || u.id || `SUS-${idx + 1}`,
              name: u.fullName || u.name || `Account ${idx + 1}`,
              email: u.email || '—',
              phone: u.phoneNumber || u.phone || '—',
              role: Array.isArray(u.userTypes) ? u.userTypes.join(', ') : (u.role || 'Member'),
              reason: u.suspendReason || u.banReason || 'Policy & compliance review violation',
              suspendedOn: typeof u.updatedAt === 'string' ? u.updatedAt.slice(0, 10) : (u.updatedAt ? new Date(u.updatedAt).toISOString().slice(0, 10) : 'Recent'),
              suspendedBy: 'Security Operations',
              status: u.status === 'banned' ? 'Banned' : 'Suspended'
            }));
            setUsers(suspended);
          }
        }
      } catch (err) {
        console.error('Failed to load suspended accounts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuspendedUsers();
    return () => { isMounted = false; };
  }, [authToken]);

  const filtered = users.filter(u => {
    const term = (searchTerm || '').toLowerCase();
    return (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.reason || '').toLowerCase().includes(term);
  });

  const handleUnban = async (id, name) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast(`Account "${name}" reinstated successfully.`);
    try {
      await apiFetch(`/api/v1/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'active' })
      }, authToken);
      await apiFetch(`/api/v1/moderation/users/${id}/suspension`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'activate' })
      }, authToken).catch(() => {});
    } catch (err) {
      console.warn('Failed to reinstate account:', err);
    }
  };

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
      <PageHeader
        title="Suspended & Restricted Accounts"
        description="Operational registry of accounts restricted from marketplace or service activity."
        breadcrumbs={['People', 'Suspended Accounts']}
      />

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            borderRadius: 'var(--mbb-radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast}</span>
        </div>
      )}

      {/* Search and operational header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {users.length} {users.length === 1 ? 'account' : 'accounts'} currently restricted
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search suspended accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.80rem',
              boxSizing: 'border-box'
            }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--mbb-radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Account</th>
                <th style={{ padding: '12px 16px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Suspension Rationale</th>
                <th style={{ padding: '12px 16px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Sanction Date</th>
                <th style={{ padding: '12px 16px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Loading suspended accounts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--hover-bg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Suspended Accounts
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                      {searchTerm ? 'No restricted accounts matched your search.' : 'All platform user accounts are in good standing without active suspensions or restrictions.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {u.email} {u.phone !== '—' && `• ${u.phone}`}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 500,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--hover-bg)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--status-danger-text)', lineHeight: 1.4 }}>
                        {u.reason}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {u.suspendedOn}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--status-danger-bg)',
                          color: 'var(--status-danger-text)',
                          border: '1px solid var(--status-danger-border)'
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleUnban(u.id, u.name)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: 'var(--status-success-bg)',
                          color: 'var(--status-success-text)',
                          border: '1px solid var(--status-success-border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          fontWeight: 600
                        }}
                      >
                        Reinstate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

