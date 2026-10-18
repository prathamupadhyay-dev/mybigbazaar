// ============================================================
// MyBigBazaar Admin — Profile & Account Settings
// macOS Native Desktop Application Architecture
// APIs: GET, PUT /api/auth/profile, PUT /api/auth/change-password, POST /api/upload/single
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

export default function Profile({ profileImage, onProfileImageChange, token, onLogout }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Social / Communication links
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')

  // Password fields
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.name) setName(data.name)
          if (data.email) setEmail(data.email)
          if (data.phone) setPhone(data.phone)
          const avatar = data.avatar_url || data.profile_image || ''
          if (avatar && onProfileImageChange) {
            onProfileImageChange(avatar)
            localStorage.setItem('adminAvatar', avatar)
          }
          if (data.instagram) setInstagram(data.instagram)
          if (data.facebook) setFacebook(data.facebook)
          if (data.linkedin) setLinkedin(data.linkedin)
          if (data.twitter) setTwitter(data.twitter)
        }
      } catch {
        showToast('Unable to load profile data', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (authToken) fetchProfile()
  }, [authToken])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          avatar_url: profileImage,
          profile_image: profileImage,
          instagram,
          facebook,
          linkedin,
          twitter,
        }),
      })
      if (res.ok) {
        const resData = await res.json().catch(() => ({}))
        const savedAvatar = resData.avatarUrl || resData.avatar_url || profileImage
        if (savedAvatar) {
          localStorage.setItem('adminAvatar', savedAvatar)
        }
        localStorage.setItem('adminName', name)
        window.dispatchEvent(new Event('logo-updated'))
        window.dispatchEvent(new Event('storage'))
        showToast('Account profile updated successfully', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update profile', 'error')
      }
    } catch {
      showToast('Connection error while saving profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!currentPass || !newPass || !confirmPass) {
      return showToast('Please complete all password fields', 'warning')
    }
    if (newPass !== confirmPass) {
      return showToast('New passwords do not match', 'error')
    }
    if (newPass.length < 6) {
      return showToast('Password must be at least 6 characters', 'warning')
    }

    setSavingPassword(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      })
      if (res.ok) {
        showToast('Password updated successfully', 'success')
        setCurrentPass('')
        setNewPass('')
        setConfirmPass('')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update password', 'error')
      }
    } catch {
      showToast('Connection error while updating password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload/single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.imageUrl || data.url || ''
        if (onProfileImageChange) onProfileImageChange(url)
        localStorage.setItem('adminAvatar', url)
        localStorage.setItem('site_logo', url)
        window.dispatchEvent(new Event('logo-updated'))
        window.dispatchEvent(new Event('storage'))

        await fetch(`${API_BASE}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name,
            email,
            avatar_url: url,
            profile_image: url,
          }),
        })

        showToast('Profile photo updated', 'success')
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch {
      showToast('Error uploading avatar', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (onProfileImageChange) onProfileImageChange('')
    localStorage.removeItem('adminAvatar')
    localStorage.removeItem('site_logo')
    window.dispatchEvent(new Event('logo-updated'))
    window.dispatchEvent(new Event('storage'))

    try {
      await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          avatar_url: '',
          profile_image: '',
        }),
      })
      showToast('Profile photo removed', 'info')
    } catch {
      showToast('Error saving changes', 'error')
    }
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 24px 60px' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#D97706',
            color: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.015em' }}>
          Account
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your personal profile details, authentication credentials and administrator settings.
        </p>
      </div>

      {/* Profile Identity Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '20px 24px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--mbb-radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--accent-color)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 600,
            flexShrink: 0,
            border: '2px solid var(--border-color)'
          }}
        >
          {profileImage ? (
            <img src={getAssetUrl(profileImage)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (name || 'A').charAt(0).toUpperCase()
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {name || 'Administrator'}
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(79, 139, 255, 0.12)',
                color: 'var(--accent-color)'
              }}
            >
              Administrator
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {email || (typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : '') || '—'}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--hover-bg)',
                border: '1px solid var(--border-color)',
                fontSize: '0.78rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                transition: 'background-color 150ms ease'
              }}
            >
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} hidden />
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </label>
            {profileImage && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: 'var(--status-danger-text, #DC2626)',
                  cursor: 'pointer',
                  padding: '5px 10px'
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Account Information */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--mbb-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '24px'
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Personal Details
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          Update your public administrator identity and contact details.
        </p>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@example.com"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                disabled={loading}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Twitter / X Handle
              </label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/..."
                disabled={loading}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={savingProfile || loading}
              style={{
                height: '36px',
                padding: '0 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-color)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 150ms ease'
              }}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Security & Password */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--mbb-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px'
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Security & Password
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          Change your account password to ensure administrative access remains secure.
        </p>

        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 36px 0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <EyeIcon open={showCurrent} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 36px 0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 36px 0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={savingPassword}
              style={{
                height: '36px',
                padding: '0 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-color)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 150ms ease'
              }}
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Account Actions (Logout) */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--mbb-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '24px'
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Account Actions
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          Terminate your current administrative session and securely sign out.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sign Out of Session
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Clears your cached authentication tokens from this browser.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out of the Admin panel?')) {
                if (onLogout) onLogout();
                else {
                  window.dispatchEvent(new Event('admin-logout'));
                  window.location.hash = '#/login';
                }
              }
            }}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              color: '#DC2626',
              fontSize: '0.80rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 140ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.16)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)')}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}