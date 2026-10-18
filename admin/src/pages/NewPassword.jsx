// ============================================================
// MyBigBazaar Admin — New Password Step
// Warm Minimalist Luxury (Canvas #F6F5F2, Cards #FBFBFA, Inputs #EEEDE9)
// ============================================================

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { API_BASE } from '../config'

export default function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const outletCtx = useOutletContext()
  const showToast = (msg, type = 'info') => {
    if (outletCtx?.showToast) {
      outletCtx.showToast(msg, type)
    }
  }

  const email = typeof window !== 'undefined' ? localStorage.getItem('af_reset_email') : ''
  const resetToken = typeof window !== 'undefined' ? localStorage.getItem('af_reset_token') : ''

  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/forgot-password')
    }
  }, [email, resetToken, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!password) {
      const msg = 'Please enter a new password'
      setErrorMsg(msg)
      showToast(msg, 'warning')
      return
    }
    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters'
      setErrorMsg(msg)
      showToast(msg, 'warning')
      return
    }
    if (password !== confirm) {
      const msg = 'Passwords do not match'
      setErrorMsg(msg)
      showToast(msg, 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password, resetToken }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast('Password updated! Redirecting to login...', 'success')
        localStorage.removeItem('af_reset_email')
        localStorage.removeItem('af_reset_token')
        setTimeout(() => navigate('/login'), 700)
      } else {
        const failureMsg = data.message || 'Failed to update password'
        setErrorMsg(failureMsg)
        showToast(failureMsg, 'error')
      }
    } catch {
      const connError = 'Server error while resetting password'
      setErrorMsg(connError)
      showToast(connError, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '440px',
        width: '100%',
        margin: '0 auto',
        backgroundColor: '#FBFBFA',
        border: '1px solid #E7E5E4',
        borderRadius: '12px',
        padding: '36px 32px',
        boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)'
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', color: '#1C1917', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          New Password
        </h2>
        <p style={{ fontSize: '13px', color: '#6F6A65', margin: '6px 0 0 0' }}>
          Enter and confirm your new administrative password.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#FFF1F2',
            border: '1px solid #FECDD3',
            color: '#BE123C',
            fontSize: '12.5px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          role="alert"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#BE123C' }}>error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }} htmlFor="new-pass">
            New Password (min. 6 characters)
          </label>
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6F6A65',
                fontSize: '18px',
                pointerEvents: 'none'
              }}
            >
              key
            </span>
            <input
              id="new-pass"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              required
              autoFocus
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '38px',
                paddingRight: '42px',
                backgroundColor: '#EEEDE9',
                border: '1px solid #E7E5E4',
                borderRadius: '8px',
                color: '#1C1917',
                fontSize: '13.5px',
                outline: 'none',
                transition: 'all 140ms ease'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              title={showPass ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6F6A65',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {showPass ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }} htmlFor="confirm-pass">
            Confirm New Password
          </label>
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6F6A65',
                fontSize: '18px',
                pointerEvents: 'none'
              }}
            >
              check
            </span>
            <input
              id="confirm-pass"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              required
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '38px',
                paddingRight: '14px',
                backgroundColor: '#EEEDE9',
                border: '1px solid #E7E5E4',
                borderRadius: '8px',
                color: '#1C1917',
                fontSize: '13.5px',
                outline: 'none',
                transition: 'all 140ms ease'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: '#C2410C',
            color: '#FBFBFA',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(28, 25, 23, 0.08)',
            transition: 'background-color 140ms ease',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#9A3412'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#C2410C'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_reset</span>
          <span>{loading ? 'Updating...' : 'Commit New Password'}</span>
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#57534E', fontSize: '12.5px', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}