// RoleBasedRoute - Check role trước khi vào trang
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function RoleBasedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth()

  // Nếu đang loading -> hiển thị spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    // User routes -> về home (sẽ show modal khi click giỏ hàng)
    if (requiredRole === 'USER') {
      return <Navigate to="/" replace />
    }
    // Admin routes -> trang login admin
    if (requiredRole === 'ADMIN') {
      return <Navigate to="/admin-login" replace />
    }
    // Staff routes -> trang login staff
    if (requiredRole === 'STAFF') {
      return <Navigate to="/staff-login" replace />
    }
  }

  // Nếu role không khớp -> redirect to home
  if (user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // Nếu hợp lệ -> render component
  return children
}

export default RoleBasedRoute
