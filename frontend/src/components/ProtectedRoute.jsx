// ProtectedRoute - Component để bảo vệ routes (chỉ authenticated users mới vào được)
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

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

  // Nếu chưa đăng nhập -> redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Nếu đã đăng nhập -> render component
  return children
}

export default ProtectedRoute
