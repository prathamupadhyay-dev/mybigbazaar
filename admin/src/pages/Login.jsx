// ============================================================
// MyBigBazaar Admin — Administration Login
// Warm Minimalist Luxury (macOS / Google Style)
// Pure, distraction-free authentication connected to live API
// ============================================================

import React, { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const outletCtx = useOutletContext()
  const showToast = (msg, type = 'info') => {
    if (outletCtx?.showToast) {
      outletCtx.showToast(msg, type)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      // 1. Authenticate against live backend: POST /auth/login
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })

      const data = await res.json().catch(() => ({}))

      // 2. Evaluate Authentication Result
      const authToken = data.token || data.data?.token
      if (res.ok && data && typeof authToken === 'string' && authToken.trim().length > 0) {
        const authUser = data.user || data.data?.user || (data.data?.role ? data.data : null) || data.admin || {}
        const userRole = String(
          authUser.role ||
          (Array.isArray(authUser.roles) ? authUser.roles[0] : '') ||
          authUser.userType ||
          ''
        ).toLowerCase().trim()

        const isAdmin =
          userRole === 'admin' ||
          userRole === 'super_admin' ||
          (Array.isArray(authUser.roles) &&
            authUser.roles.map((r) => String(r).toLowerCase().trim()).some(r => r === 'admin' || r === 'super_admin'))

        // 3. Strict Authorization Gate: role MUST be 'admin' or 'super_admin'
        if (!isAdmin) {
          const unauthorizedMsg = 'Access denied. Administrator privileges required.'
          setErrorMsg(unauthorizedMsg)
          showToast(unauthorizedMsg, 'error')
          return
        }

        // Store active session in localStorage
        localStorage.setItem('adminToken', authToken)
        localStorage.setItem('token', authToken)
        localStorage.setItem('af_admin_token', authToken)
        localStorage.setItem('admin_user', JSON.stringify(authUser))
        localStorage.setItem('adminName', authUser.fullName || authUser.name || 'Administrator')
        localStorage.setItem('adminEmail', authUser.email || trimmedEmail)

        showToast('Authentication verified.', 'success')
        setTimeout(() => {
          if (onLogin) onLogin(authToken, authUser)
        }, 300)
      } else {
        const failureMsg = data.message || 'Invalid administrator credentials.'
        setErrorMsg(failureMsg)
        showToast(failureMsg, 'error')
      }
    } catch (err) {
      const connErr = 'Backend service connection failed. Please ensure the backend is running.'
      setErrorMsg(connErr)
      showToast(connErr, 'error')
    } finally {
      setLoading(false)
    }
  }

  const siteLogo = typeof window !== 'undefined' ? localStorage.getItem('site_logo') : null

  return (
    <div
      style={{
        maxWidth: '420px',
        width: '100%',
        margin: '0 auto',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        border: '1px solid var(--color-border, #E7E5E4)',
        borderRadius: '12px',
        padding: '36px 32px',
        boxShadow: '0 1px 3px rgba(28, 25, 23, 0.05)'
      }}
    >
      {/* Brand Logo */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src={siteLogo ? getAssetUrl(siteLogo) : '/client-logo-transparent.png'}
          alt="MyBigBazaar"
          style={{ height: '38px', maxWidth: '180px', objectFit: 'contain', margin: '0 auto' }}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/favicon.svg'
          }}
        />
      </div>

      {/* Title & Subtitle */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary, #1C1917)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Administration
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', margin: '6px 0 0 0' }}>
          Enter your credentials to access the console.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#FFF1F2',
            border: '1px solid #FECDD3',
            color: '#BE123C',
            fontSize: '12.5px',
            marginBottom: '18px',
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

      {/* Authentication Form */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
        {/* Email Field */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '6px' }} htmlFor="email">
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
                color: 'var(--color-text-metadata, #6F6A65)',
                fontSize: '18px',
                pointerEvents: 'none'
              }}
            >
              mail
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder="admin@mybigbazaar.com"
              required
              autoFocus
              autoComplete="username"
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '38px',
                paddingRight: '14px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
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

        {/* Password Field */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', marginBottom: '6px' }} htmlFor="password">
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-metadata, #6F6A65)',
                fontSize: '18px',
                pointerEvents: 'none'
              }}
            >
              lock
            </span>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '38px',
                paddingRight: '42px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                border: '1px solid var(--color-border, #E7E5E4)',
                borderRadius: '8px',
                color: 'var(--color-text-primary, #1C1917)',
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
                color: 'var(--color-text-metadata, #6F6A65)',
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

        {/* Remember & Forgot Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '12.5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-primary, #1C1917)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: '#C2410C', cursor: 'pointer' }}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" style={{ color: '#C2410C', fontWeight: 600, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: '#C2410C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(28, 25, 23, 0.08)',
            transition: 'background-color 140ms ease',
            opacity: loading ? 0.7 : 1,
            marginTop: '8px'
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#9A3412' }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#C2410C' }}
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
        </button>
      </form>
    </div>
  )
}