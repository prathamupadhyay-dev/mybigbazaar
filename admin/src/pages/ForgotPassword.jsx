// ============================================================
// MyBigBazaar Admin — Forgot Password Step
// Warm Minimalist Luxury (Canvas #F6F5F2, Cards #FBFBFA, Inputs #EEEDE9)
// ============================================================

import React, { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { API_BASE } from '../config'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const outletCtx = useOutletContext()
  const showToast = (msg, type = 'info') => {
    if (outletCtx?.showToast) {
      outletCtx.showToast(msg, type)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMsg('Please enter your corporate email address.')
      showToast('Please enter your corporate email address.', 'warning')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast(data.message || 'Verification code dispatched to your email.', 'success')
        localStorage.setItem('af_reset_email', trimmedEmail)
        setTimeout(() => navigate('/otp'), 600)
      } else {
        const failureMsg = data.message || 'Unable to send code. Please verify your email.'
        setErrorMsg(failureMsg)
        showToast(failureMsg, 'error')
      }
    } catch {
      const connError = 'Server connection failed. Please try again.'
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
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        border: '1px solid var(--color-border, #E7E5E4)',
        borderRadius: '12px',
        padding: '36px 32px',
        boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)'
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary, #1C1917)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Reset Password
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', margin: '6px 0 0 0' }}>
          Enter your admin email address to receive a verification code.
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '6px' }} htmlFor="recovery-email">
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary, #6F6A65)',
                fontSize: '18px',
                pointerEvents: 'none'
              }}
            >
              mail
            </span>
            <input
              id="recovery-email"
              type="email"
              placeholder="admin@mybigbazaar.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              required
              autoFocus
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '38px',
                paddingRight: '14px',
                backgroundColor: 'var(--color-canvas, #EEEDE9)',
                border: '1px solid var(--color-border, #E7E5E4)',
                borderRadius: '8px',
                color: 'var(--color-text-primary, #1C1917)',
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          <span>{loading ? 'Dispatching Code...' : 'Send Verification Code'}</span>
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/login" style={{ color: 'var(--color-text-secondary, #57534E)', fontSize: '12.5px', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}