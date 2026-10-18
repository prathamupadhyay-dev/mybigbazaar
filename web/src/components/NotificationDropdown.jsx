/**
 * @file apps/web/src/components/NotificationDropdown.jsx
 * @description Real-time notifications dropdown with status indicators and action links.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function NotificationDropdown({ onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <div className="notif-dropdown-menu" onClick={(e) => e.stopPropagation()}>
      <div className="notif-header">
        <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Notifications</h4>
        <button
          type="button"
          className="notif-mark-read-btn"
          onClick={markAllNotificationsRead}
        >
          Mark all as read
        </button>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <span className="material-symbols-outlined text-[24px] text-[#6F6A65]">notifications_none</span>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              to={n.link || '/orders'}
              className={`notif-item ${!n.read ? 'unread' : ''}`}
              onClick={() => {
                markNotificationRead(n.id);
                if (onClose) onClose();
              }}
            >
              <div className="notif-icon">
                {n.type === 'listing' && <span className="material-symbols-outlined text-[18px] text-[#C2410C]">sell</span>}
                {n.type === 'offer' && <span className="material-symbols-outlined text-[18px] text-[#0B2545]">chat</span>}
                {n.type === 'booking' && <span className="material-symbols-outlined text-[18px] text-[#4338CA]">calendar_month</span>}
                {n.type === 'promo' && <span className="material-symbols-outlined text-[18px] text-[#15803D]">loyalty</span>}
              </div>
              <div className="notif-content">
                <div className="notif-title-row">
                  <span className="notif-item-title">{n.title}</span>
                  {!n.read && <span className="notif-dot" />}
                </div>
                <p className="notif-item-body">{n.body}</p>
                <span className="notif-item-time">{n.time}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="notif-footer">
        <Link to="/orders" onClick={onClose} className="notif-view-all">
          View all activity &rarr;
        </Link>
      </div>

      <style>{`
        .notif-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 360px;
          background: #FBFBFA;
          border-radius: 12px;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.16);
          border: 1px solid #E7E5E4;
          z-index: 1000;
          overflow: hidden;
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid #E7E5E4;
        }
        .notif-mark-read-btn {
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-blue);
          cursor: pointer;
        }
        .notif-mark-read-btn:hover {
          text-decoration: underline;
        }
        .notif-list {
          max-height: 380px;
          overflow-y: auto;
        }
        .notif-empty {
          text-align: center;
          padding: 32px 16px;
        }
        .notif-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #F8FAFC;
          transition: background 0.15s ease;
        }
        .notif-item:hover {
          background: #EEEDE9;
        }
        .notif-item.unread {
          background: #F0F7FF;
        }
        .notif-icon {
          font-size: 20px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .notif-content {
          flex: 1;
        }
        .notif-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .notif-item-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--brand-blue);
        }
        .notif-item-body {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 3px 0;
          line-height: 1.4;
        }
        .notif-item-time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .notif-footer {
          padding: 10px;
          text-align: center;
          border-top: 1px solid #E7E5E4;
          background: #F6F5F2;
        }
        .notif-view-all {
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-blue);
        }
      `}</style>
    </div>
  );
}
