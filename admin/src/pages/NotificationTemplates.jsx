import React, { useState } from 'react';

const INITIAL_TEMPLATES = [
  {
    id: 'tpl-1',
    key: 'BOOKING_CONFIRMED',
    name: 'Booking Confirmation',
    category: 'Bookings',
    channel: 'Push & SMS',
    subject: 'Booking Confirmed: #{{bookingId}}',
    body: 'Hello {{userName}}, your service booking for {{serviceName}} is confirmed for {{scheduledDate}} ({{scheduledTimeSlot}}). Assigned Pro: {{providerName}}.',
    status: 'Active',
    variables: ['userName', 'bookingId', 'serviceName', 'scheduledDate', 'scheduledTimeSlot', 'providerName']
  },
  {
    id: 'tpl-2',
    key: 'OFFER_RECEIVED',
    name: 'New Offer Received',
    category: 'Chat/Offers',
    channel: 'Push & In-App',
    subject: 'New Offer on {{itemName}}',
    body: '{{buyerName}} offered ₹{{offerAmount}} for your listing "{{itemName}}". Open chat to accept, counter, or decline.',
    status: 'Active',
    variables: ['buyerName', 'offerAmount', 'itemName']
  },
  {
    id: 'tpl-3',
    key: 'OFFER_ACCEPTED',
    name: 'Offer Accepted Deal',
    category: 'Chat/Offers',
    channel: 'Push & In-App',
    subject: 'Your offer was accepted!',
    body: 'Great news {{buyerName}}! {{sellerName}} accepted your offer of ₹{{offerAmount}} for {{itemName}}. Complete checkout within 24 hours to secure your deal.',
    status: 'Active',
    variables: ['buyerName', 'sellerName', 'offerAmount', 'itemName']
  },
  {
    id: 'tpl-4',
    key: 'ORDER_DELIVERED',
    name: 'Order Delivery Notice',
    category: 'Transactions/Orders',
    channel: 'SMS & In-App',
    subject: 'Order #{{orderId}} Delivered',
    body: 'Your package containing {{itemName}} has been delivered. Please inspect and confirm receipt in the app.',
    status: 'Active',
    variables: ['userName', 'orderId', 'itemName']
  },
  {
    id: 'tpl-5',
    key: 'OTP_VERIFY',
    name: 'OTP Authentication',
    category: 'Auth/Security',
    channel: 'SMS',
    subject: 'MyBigBazaar Login OTP',
    body: '{{otpCode}} is your verification code for MyBigBazaar. Valid for 10 minutes. Do not share with anyone.',
    status: 'Active',
    variables: ['otpCode']
  },
  {
    id: 'tpl-6',
    key: 'PRICE_DROP',
    name: 'Watchlist Price Drop',
    category: 'Chat/Offers',
    channel: 'Push',
    subject: 'Price Drop Alert: {{itemName}}',
    body: 'An item in your watchlist has dropped price from ₹{{oldPrice}} to ₹{{newPrice}}. Grab it before it sells out!',
    status: 'Active',
    variables: ['userName', 'itemName', 'oldPrice', 'newPrice']
  }
];

function NotificationTemplates() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Modals
  const [editModal, setEditModal] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  const categories = ['All', 'Chat/Offers', 'Bookings', 'Transactions/Orders', 'Auth/Security'];

  const filteredTemplates = templates.filter((tpl) => {
    const matchCat = activeCategory === 'All' || tpl.category === activeCategory;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (tpl.name || '').toLowerCase().includes(q) ||
      (tpl.key || '').toLowerCase().includes(q) ||
      (tpl.body || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleToggleStatus = (id) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t
      )
    );
    showToast('Template status toggled.');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModal.name.trim() || !editModal.body.trim()) {
      showToast('Template Name and Body are required.');
      return;
    }

    setTemplates(
      templates.map((t) => (t.id === editModal.id ? editModal : t))
    );
    setEditModal(null);
    showToast('Template updated successfully.');
  };

  const handleInsertVariable = (variable) => {
    if (!editModal) return;
    const tag = `{{${variable}}}`;
    setEditModal({
      ...editModal,
      body: editModal.body + ' ' + tag
    });
  };

  const renderSimulatedPreview = (tpl) => {
    let previewText = tpl.body
      .replace('{{userName}}', 'Anita Sharma')
      .replace('{{buyerName}}', 'John Doe')
      .replace('{{sellerName}}', 'Rahul Mehta')
      .replace('{{itemName}}', 'Apple iPhone 14 (128 GB)')
      .replace('{{serviceName}}', 'Tap Repair & Washbasin Fix')
      .replace('{{bookingId}}', 'BB-98421')
      .replace('{{orderId}}', 'ORD-88129')
      .replace('{{offerAmount}}', '38,000')
      .replace('{{scheduledDate}}', 'Tomorrow')
      .replace('{{scheduledTimeSlot}}', '10:00 AM - 12:00 PM')
      .replace('{{providerName}}', 'Alex Smith')
      .replace('{{otpCode}}', '482910')
      .replace('{{oldPrice}}', '42,000')
      .replace('{{newPrice}}', '38,000');

    let previewSubject = tpl.subject
      .replace('{{bookingId}}', 'BB-98421')
      .replace('{{orderId}}', 'ORD-88129')
      .replace('{{itemName}}', 'Apple iPhone 14');

    return { previewSubject, previewText };
  };

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="admin-title" style={{ margin: 0 }}>Notification Templates</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Configure SMS, Push, and in-app automated trigger templates with dynamic merge variables.
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="admin-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '20px' }}>
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search templates by key or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              minWidth: '260px',
              background: 'var(--bg-input, #fff)'
            }}
          />
        </div>
      </div>

      {/* Templates Table */}
      <div className="admin-card">
        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Template Key & Name</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Channel</th>
                <th style={{ padding: '12px' }}>Message Preview</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {item.name}
                    </div>
                    <code style={{ fontSize: '11px', color: 'var(--primary-color, #2563EB)', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.key}
                    </code>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span className="badge badge-info">{item.category}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: '500' }}>
                    {item.channel}
                  </td>
                  <td style={{ padding: '12px', maxWidth: '340px' }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text-primary)' }}>
                      {item.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.body}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      onClick={() => handleToggleStatus(item.id)}
                      style={{ cursor: 'pointer' }}
                      className={item.status === 'Active' ? 'badge badge-success' : 'badge badge-danger'}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setPreviewModal(item)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Preview
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => setEditModal({ ...item })}
                        style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    No notification templates match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Template Modal */}
      {editModal && (
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
              Edit Notification Template: {editModal.key}
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Subject / Push Title
                </label>
                <input
                  type="text"
                  value={editModal.subject}
                  onChange={(e) => setEditModal({ ...editModal, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>
                    Template Body
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click tag to insert:</span>
                </div>

                {/* Merge Tag Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {(editModal.variables || ['userName', 'itemName', 'offerAmount']).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        cursor: 'pointer'
                      }}>
                      +{v}
                    </button>
                  ))}
                </div>

                <textarea
                  value={editModal.body}
                  onChange={(e) => setEditModal({ ...editModal, body: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Delivery Channel
                  </label>
                  <select
                    value={editModal.channel}
                    onChange={(e) => setEditModal({ ...editModal, channel: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <option value="Push">Push Notification</option>
                    <option value="SMS">SMS Text Message</option>
                    <option value="In-App">In-App Notification</option>
                    <option value="Push & SMS">Push & SMS</option>
                    <option value="Push & In-App">Push & In-App</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editModal.status}
                    onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditModal(null)}
                  style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 16px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewModal && (
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
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
              Simulated Notification Preview
            </h3>

            {/* Mobile Push Card Simulation */}
            <div style={{
              background: '#0F172A',
              color: '#fff',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#2563EB', width: '18px', height: '18px', borderRadius: '4px', display: 'inline-block' }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>BIGBAZAAR</span>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>now</span>
              </div>

              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                {renderSimulatedPreview(previewModal).previewSubject}
              </div>
              <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: '18px' }}>
                {renderSimulatedPreview(previewModal).previewText}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <strong>Channel:</strong> {previewModal.channel} &bull; <strong>Key:</strong> {previewModal.key}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setPreviewModal(null)}
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default NotificationTemplates;
