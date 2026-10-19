/**
 * @file apps/web/src/components/AuthModal.jsx
 * @description Accessible Authentication Modal with 1-click Persona presets and credential login.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function AuthModal() {
  const { authModalOpen, authModalTab, closeAuth, login, loginPersona, register } = useApp();
  const [tab, setTab] = useState(authModalTab || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        if (!email || !password) {
          setError('Please provide both email and password.');
          setLoading(false);
          return;
        }
        await login({ email, password });
      } else {
        if (!email || !password || !fullName) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        await register({ email, password, fullName, phone });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuth} role="dialog" aria-modal="true">
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={closeAuth} aria-label="Close modal">
          &times;
        </button>

        <div className="auth-modal-header">
          <div className="auth-logo-badge">
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--brand-blue)' }}>BigBazaar</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px' }}>
            {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {tab === 'login' ? 'Sign in to access your listings, chats & bookings' : 'Join India’s trusted hyperlocal marketplace'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-group">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Demo Fast Persona Quick Access */}
        <div className="persona-quick-access">
          <div className="persona-section-title">1-Click Fast Demo Login</div>
          <div className="persona-grid">
            <button
              type="button"
              className="persona-btn"
              onClick={() => loginPersona('buyer')}
            >
              <span className="persona-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </span>
              <strong>Buyer</strong>
              <small>Aarav Sharma</small>
            </button>
            <button
              type="button"
              className="persona-btn"
              onClick={() => loginPersona('seller')}
            >
              <span className="persona-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </span>
              <strong>Seller</strong>
              <small>Priya Patel</small>
            </button>
            <button
              type="button"
              className="persona-btn"
              onClick={() => loginPersona('provider')}
            >
              <span className="persona-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </span>
              <strong>Provider</strong>
              <small>Rajesh Kumar</small>
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>Or with credentials</span>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'signup' && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (tab === 'login' ? 'Sign In to BigBazaar' : 'Create My Account')}
          </button>
        </form>
      </div>

      <style>{`
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .auth-modal-content {
          background: #FBFBFA;
          border-radius: 12px;
          max-width: 480px;
          width: 100%;
          padding: 32px;
          position: relative;
          box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.25);
          max-height: 90vh;
          overflow-y: auto;
        }
        .auth-modal-close {
          position: absolute;
          top: 18px;
          right: 20px;
          font-size: 28px;
          line-height: 1;
          color: var(--text-muted);
          cursor: pointer;
        }
        .auth-modal-close:hover {
          color: var(--text-primary);
        }
        .auth-modal-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .persona-quick-access {
          background: #EEEDE9;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 16px;
        }
        .persona-section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--brand-blue);
          margin-bottom: 10px;
        }
        .persona-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .persona-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px 6px;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .persona-btn:hover {
          border-color: var(--brand-blue);
          background: #EFF6FF;
          transform: translateY(-1px);
        }
        .persona-icon {
          font-size: 18px;
          margin-bottom: 4px;
        }
        .persona-btn strong {
          font-size: 11px;
          color: var(--text-primary);
          display: block;
        }
        .persona-btn small {
          font-size: 10px;
          color: var(--text-muted);
          display: block;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 16px 0;
          color: var(--text-muted);
          font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #E2E8F0;
        }
        .auth-divider span {
          padding: 0 10px;
        }
        .auth-tab-group {
          display: flex;
          background: #EEEDE9;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 18px;
        }
        .auth-tab {
          flex: 1;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          color: var(--text-secondary);
        }
        .auth-tab.active {
          background: #FBFBFA;
          color: var(--brand-blue);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .auth-error-banner {
          background: #FEE2E2;
          border: 1px solid #F87171;
          color: #991B1B;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 14px;
        }
        .auth-form .form-group {
          margin-bottom: 14px;
        }
        .auth-form label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .auth-form .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .auth-form .form-input:focus {
          border-color: var(--brand-blue);
        }
        .auth-submit-btn {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 10px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
