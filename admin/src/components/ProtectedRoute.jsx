import { Navigate, Outlet } from 'react-router-dom'
import { getAuthToken, getAdminUser, clearAdminSession } from '../utils/api'

function ProtectedRoute({ token, children }) {
  const activeToken = getAuthToken(token)

  if (!activeToken) {
    return <Navigate to="/login" replace />
  }

  const user = getAdminUser()
  if (user) {
    const role = String(
      user.role ||
      (Array.isArray(user.roles) ? user.roles[0] : '') ||
      user.userType ||
      ''
    ).toLowerCase().trim()
    const isAdmin =
      role === 'admin' ||
      (Array.isArray(user.roles) &&
        user.roles.map((r) => String(r).toLowerCase().trim()).includes('admin'))

    if (!isAdmin) {
      clearAdminSession()
      return <Navigate to="/login" replace />
    }
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute;
