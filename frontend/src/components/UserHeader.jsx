import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import './UserHeader.css'

function UserHeader() {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="user-header">
      <div className="header-container">
        {/* Logo/Branding */}
        <div className="header-logo">
          <Link to="/">
            <h1>🍽️ NHÀ HÀNG</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <Link to="/" className="nav-link">Menu</Link>
          {user ? (
            <>
              <Link to="/cart" className="nav-link">
                Giỏ hàng
                {getTotalItems() > 0 && (
                  <span className="cart-badge">{getTotalItems()}</span>
                )}
              </Link>
              <Link to="/orders" className="nav-link">Đơn hàng</Link>
              {user.role === 'USER' && (
                <Link to="/profile" className="nav-link">Tài khoản</Link>
              )}
            </>
          ) : (
            <Link to="/cart" className="nav-link">
              Giỏp hàng
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>
          )}
        </nav>

        {/* User Section */}
        <div className="header-user">
          {user ? (
            <div className="user-menu">
              <span className="user-name">👤 {user.name || user.email}</span>
              <button className="btn btn-logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/user-login" 
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default UserHeader
