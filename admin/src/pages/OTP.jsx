// ============================================================
// MyBigBazaar Admin — OTP Verification Step
// Warm Minimalist Luxury (Canvas #F6F5F2, Cards #FBFBFA, Inputs #EEEDE9)
// ============================================================

import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { API_BASE } from '../config'

export default function OTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRefs = useRef([])
  const navigate = useNavigate()

  const outletCtx = useOutletContext()
  const showToast = (msg, type = 'info') => {
    if (outletCtx?.showToast) {
      outletCtx.showToast(msg, type)
    }
  }

  const email = typeof window !== 'undefined' ? localStorage.getItem('af_reset_email') : ''

  useEffect(() => {
    if (!email) navigate('/forgot-password')
  }, [email, navigate])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (errorMsg) setErrorMsg('')
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''))
    setOtp(newOtp)
    if (errorMsg) setErrorMsg('')
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    const code = otp.join('')
    if (code.length !== 6) {
      const msg = 'Please enter complete 6-digit verification code.'
      setErrorMsg(msg)
      showToast(msg, 'warning')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast('Code verified successfully.', 'success')
        const tokenVal = data.resetToken || data.token || code
        localStorage.setItem('af_reset_token', tokenVal)
        setTimeout(() => navigate('/new-password'), 600)
      } else {
        const failureMsg = data.message || 'Invalid or expired verification code.'
        setErrorMsg(failureMsg)
        showToast(failureMsg, 'error')
      }
    } catch {
      const connError = 'Server connection failed.'
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
          Verify Code
        </h2>
        <p style={{ fontSize: '13px', color: '#6F6A65', margin: '6px 0 0 0' }}>
          Enter the 6-digit code sent to <strong style={{ color: '#1C1917' }}>{email || 'your email'}</strong>.
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

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', margin: '8px 0 16px' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              autoFocus={index === 0}
              aria-label={`Digit ${index + 1}`}
              style={{
                height: '46px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 700,
                color: '#1C1917',
                backgroundColor: '#EEEDE9',
                border: '1px solid #E7E5E4',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'var(--font-mono, monospace)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'all 140ms ease'
              }}
            />
          ))}
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          <span>{loading ? 'Verifying...' : 'Verify Code & Proceed'}</span>
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/forgot-password" style={{ color: '#57534E', fontSize: '12.5px', textDecoration: 'none', fontWeight: 500 }}>
          ← Re-enter Email Address
        </Link>
      </div>
    </div>
  )
}