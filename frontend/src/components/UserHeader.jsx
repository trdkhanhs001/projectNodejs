import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import CheckoutOptionsModal from './CheckoutOptionsModal'
import './UserHeader.css'

function UserHeader() {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="user-header">
      {/* Auth Modal */}
      <CheckoutOptionsModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        authOnly={true}
      />

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
            <button 
              className="nav-link"
              onClick={() => setShowAuthModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Giỏ hàng
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </button>
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
            <button 
              className="btn btn-primary"
              onClick={() => setShowAuthModal(true)}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default UserHeader
