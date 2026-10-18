import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

// Notification broadcasts awaiting campaign creation
function Notifications() {
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('mbb_admin_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [filterAudience, setFilterAudience] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');

  const saveCampaigns = (newCampaigns) => {
    setCampaigns(newCampaigns);
    try {
      localStorage.setItem('mbb_admin_campaigns', JSON.stringify(newCampaigns));
    } catch (e) {}
  };

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/v1/notifications')
      .then(res => res.json())
      .then(json => {
        if (isMounted && json && Array.isArray(json.data) && json.data.length > 0) {
          saveCampaigns(json.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Modals
  const [composerOpen, setComposerOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newAudience, setNewAudience] = useState('All Users');
  const [newType, setNewType] = useState('Promotion');
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchAudience = filterAudience === 'All' || c.audience === filterAudience;
    const q = (searchTerm || '').toLowerCase();
    const matchSearch =
      (c.title || '').toLowerCase().includes(q) ||
      (c.body || '').toLowerCase().includes(q);
    return matchAudience && matchSearch;
  });

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      showToast('Please fill out campaign title and message body.');
      return;
    }

    const newCampaign = {
      id: `bc-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      type: newType,
      audience: newAudience,
      status: scheduleLater ? 'Scheduled' : 'Sent',
      sentAt: scheduleLater && scheduledTime ? scheduledTime : 'Just now',
      recipients: 0,
      openRate: scheduleLater ? 'Pending' : '0.0%',
      clickRate: scheduleLater ? 'Pending' : '0.0%'
    };

    saveCampaigns([newCampaign, ...campaigns]);
    apiFetch('/api/v1/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(newCampaign)
    }).catch(console.warn);
    setComposerOpen(false);
    setNewTitle('');
    setNewBody('');
    setScheduleLater(false);
    setScheduledTime('');
    showToast(scheduleLater ? 'Campaign scheduled successfully.' : 'Broadcast notification dispatched.');
  };

  const handleDeleteCampaign = (id) => {
    saveCampaigns(campaigns.filter((c) => c.id !== id));
    apiFetch(`/api/v1/notifications/${id}`, {
      method: 'DELETE'
    }).catch(console.warn);
    showToast('Notification campaign deleted.');
  };

  const handleResendCampaign = (campaign) => {
    const resent = {
      ...campaign,
      id: `bc-${Date.now()}`,
      sentAt: 'Just now',
      status: 'Sent'
    };
    saveCampaigns([resent, ...campaigns]);
    showToast(`Broadcast "${campaign.title}" resent successfully.`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return 'badge badge-success';
      case 'Scheduled':
        return 'badge badge-warning';
      case 'Draft':
        return 'badge badge-info';
      default:
        return 'badge';
    }
  };

  const totalDelivered = campaigns.reduce((sum, c) => sum + (c.recipients || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="admin-title" style={{ margin: 0 }}>Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Compose, schedule, and review notifications and announcements across mobile and web.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setComposerOpen(true)}
          style={{ padding: '9px 18px', fontSize: '14px', fontWeight: '600' }}>
          + New Broadcast Campaign
        </button>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Broadcasts</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--text-primary)' }}>
            {campaigns.length} Campaigns
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Active campaigns</div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Messages Delivered</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--text-primary)' }}>
            {totalDelivered.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Delivered via push & SMS</div>
        </div>
      </div>

      {/* Main Campaign Management Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 className="admin-card-title">Broadcast History & Scheduled Campaigns</h3>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                background: 'var(--bg-input, #fff)'
              }}
            />

            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                background: 'var(--bg-input, #fff)'
              }}>
              <option value="All">All Audiences</option>
              <option value="All Users">All Users</option>
              <option value="Verified Users">Verified Users</option>
              <option value="Active Accounts">Active Accounts</option>
            </select>
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Campaign Title & Preview</th>
                <th style={{ padding: '12px' }}>Audience</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Sent / Scheduled</th>
                <th style={{ padding: '12px' }}>Recipients</th>
                <th style={{ padding: '12px' }}>Open Rate</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {campaigns.length === 0 ? 'No notification broadcasts recorded yet.' : 'No matching campaigns found.'}
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', maxWidth: '300px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {item.title}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.body}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '500' }}>{item.audience}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-info">{item.type}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {item.sentAt}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    {item.recipients ? item.recipients.toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span style={{ color: (String(item.openRate || '')).includes('%') ? '#10B981' : 'var(--text-secondary)', fontWeight: '600' }}>
                      {item.openRate}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={getStatusBadge(item.status)}>{item.status}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setDetailsModal(item)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}>
                        View
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleResendCampaign(item)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Resend
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => setDeleteTarget(item)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '440px', maxWidth: '100%', padding: '24px', borderRadius: '12px', background: 'var(--modal-bg, var(--card-bg))', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-crimson, #EF4444)' }}>
              Delete Notification?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '12px 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete notification <strong>"{deleteTarget.title}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  handleDeleteCampaign(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composer Modal */}
      {composerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
              Compose Broadcast Campaign
            </h3>

            <form onSubmit={handleCreateCampaign}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Weekend Flash Sale / Security Notice"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Message Content (Push & In-App Text)
                </label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  placeholder="Type announcement message to dispatch to mobile apps..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Target Audience Segment
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <option value="All Users">All Users</option>
                    <option value="Verified Users">Verified Users</option>
                    <option value="Active Accounts">Active Accounts</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Notification Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <option value="Promotion">Promotion / Deals</option>
                    <option value="Security">Security Advisory</option>
                    <option value="System">System Maintenance</option>
                    <option value="Update">App Feature Update</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={scheduleLater}
                    onChange={(e) => setScheduleLater(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Schedule for future delivery
                </label>

                {scheduleLater && (
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setComposerOpen(false)}
                  style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 16px' }}>
                  {scheduleLater ? 'Schedule Broadcast' : 'Dispatch Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Inspection Modal */}
      {detailsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
              {detailsModal.title}
            </h3>

            <div style={{ background: 'var(--bg-input, #F8FAFC)', padding: '12px', borderRadius: '8px', fontSize: '13px', lineHeight: '20px', color: 'var(--text-primary)', marginBottom: '16px' }}>
              {detailsModal.body}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '20px' }}>
              <div><strong>Audience:</strong> {detailsModal.audience}</div>
              <div><strong>Category:</strong> {detailsModal.type}</div>
              <div><strong>Status:</strong> {detailsModal.status}</div>
              <div><strong>Sent / Scheduled:</strong> {detailsModal.sentAt}</div>
              <div><strong>Recipients:</strong> {(detailsModal.recipients || 0).toLocaleString()}</div>
              <div><strong>Open Rate:</strong> {detailsModal.openRate}</div>
              <div><strong>Click-Through:</strong> {detailsModal.clickRate}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setDetailsModal(null)}
                style={{ padding: '8px 16px' }}>
                Close
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--status-success-text)' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default Notifications;
