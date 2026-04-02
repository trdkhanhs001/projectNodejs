// Sidebar navigation cho Admin
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './AdminLayout.css'

function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Kiểm tra page hiện tại
  const isActive = (path) => location.pathname === path ? 'active' : ''

  // Xử lý logout
  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🍽️ Restaurant</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin')}`}
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/profile" 
                className={`nav-link ${isActive('/admin/profile')}`}
              >
                👤 Thông tin cá nhân
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/staff" 
                className={`nav-link ${isActive('/admin/staff')}`}
              >
                👥 Quản lý Staff
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/category" 
                className={`nav-link ${isActive('/admin/category')}`}
              >
                📁 Quản lý Danh mục
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/menu" 
                className={`nav-link ${isActive('/admin/menu')}`}
              >
                🍽️ Quản lý Menu
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className={`nav-link ${isActive('/admin/orders')}`}
              >
                📦 Quản lý Đơn Hàng
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary btn-logout"
            onClick={handleLogout}
          >
            🚪 Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <header className="admin-header">
          <h1>Chào mừng trở lại!</h1>
          <div className="user-info">
            <span className="username">{user?.fullName || user?.username}</span>
            <span className="role-badge">{user?.role}</span>
          </div>
        </header>

        <div className="admin-body">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
