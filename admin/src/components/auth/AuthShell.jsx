import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthShell() {
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-canvas, #F6F5F2)',
        padding: '24px 16px'
      }}
    >
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          <span>{toast.msg}</span>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Outlet context={{ showToast }} />
      </div>
    </div>
  )
}
