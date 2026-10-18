// ============================================================
// Admin Panel - Root App Component (Secure Protected Routing)
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { lazyRetry } from './utils/lazyRetry'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getAuthToken, getAdminUser, clearAdminSession } from './utils/api'
import ProtectedRoute from './components/ProtectedRoute'
import AuthShell from './components/auth/AuthShell'
import './App.css'

// Lazy Load Root Pages
const Login = lazyRetry(() => import('./pages/Login'))
const ForgotPassword = lazyRetry(() => import('./pages/ForgotPassword'))
const OTP = lazyRetry(() => import('./pages/OTP'))
const NewPassword = lazyRetry(() => import('./pages/NewPassword'))
import Dashboard from './pages/Dashboard'

function App() {
  const [token, setToken] = useState(() => getAuthToken())
  const [adminUser, setAdminUser] = useState(() => getAdminUser())

  // Listen for global admin-logout events (e.g. triggered on 401 API responses)
  useEffect(() => {
    const onAdminLogout = () => {
      setToken('')
      setAdminUser(null)
    }
    window.addEventListener('admin-logout', onAdminLogout)
    return () => window.removeEventListener('admin-logout', onAdminLogout)
  }, [])

  const handleLogin = (jwtToken, user) => {
    if (typeof jwtToken === 'string' && jwtToken.trim()) {
      localStorage.setItem('adminToken', jwtToken)
      localStorage.setItem('token', jwtToken)
      localStorage.setItem('af_admin_token', jwtToken)
    }
    if (user) {
      localStorage.setItem('admin_user', JSON.stringify(user))
      if (user.role) localStorage.setItem('adminRole', user.role)
      const displayName = user.fullName || user.name || 'Admin'
      localStorage.setItem('adminName', displayName)
      if (user.email) localStorage.setItem('adminEmail', user.email)
    }
    setToken(jwtToken)
    setAdminUser(user || null)
  }

  const handleLogout = () => {
    clearAdminSession()
    setToken('')
    setAdminUser(null)
  }

  return (
    <HashRouter>
      <style>{`
        .app-suspense-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--page-bg, #1a1e29);
          color: var(--text-secondary, #a6b0cf);
          font-weight: 500;
          font-size: 1rem;
          gap: 12px;
        }
      `}</style>

      <Suspense
        fallback={
          <div className="app-suspense-loader">
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--accent-color, #1548a6)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            ></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading admin workspace...
          </div>
        }
      >
        <Routes>
          {/* Public Authentication Routes (Unified Persistent macOS Glass + Aurora Canvas) */}
          <Route element={<AuthShell />}>
            <Route
              path="/"
              element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/login"
              element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/forgot-password"
              element={token ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
            />
            <Route
              path="/otp"
              element={token ? <Navigate to="/dashboard" replace /> : <OTP />}
            />
            <Route
              path="/new-password"
              element={token ? <Navigate to="/dashboard" replace /> : <NewPassword />}
            />
          </Route>

          {/* Secure Protected Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute token={token}>
                <Dashboard token={token} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route
            path="*"
            element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
