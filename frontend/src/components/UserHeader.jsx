import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

function UserHeader() {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const isActive = (path) => location.pathname === path

  const navLinks = user
    ? [
        { to: '/',        label: 'Menu' },
        { to: '/cart',    label: 'Giỏ hàng', badge: getTotalItems() },
        { to: '/orders',  label: 'Đơn hàng' },
        ...(user.role === 'USER' ? [{ to: '/profile', label: 'Tài khoản' }] : []),
      ]
    : [{ to: '/', label: 'Menu' }, { to: '/cart', label: 'Giỏ hàng', badge: getTotalItems() }]

  return (
    <>
      <style>{`
        .uh-root {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(15, 14, 11, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(212, 175, 100, 0.14);
          box-shadow: 0 4px 32px rgba(0,0,0,0.45);
        }

        /* Thin gold accent line at very top */
        .uh-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,175,100,0.6) 40%, rgba(212,175,100,0.9) 50%, rgba(212,175,100,0.6) 60%, transparent 100%);
        }

        .uh-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        /* ── Logo ── */
        .uh-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .uh-logo-icon {
          font-size: 1.3rem;
          line-height: 1;
        }
        .uh-logo-text {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-gold);
          letter-spacing: 0.06em;
          transition: color 0.2s;
        }
        .uh-logo:hover .uh-logo-text {
          color: var(--color-gold-light);
        }

        /* ── Nav ── */
        .uh-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
          justify-content: center;
        }

        .uh-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.875rem;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-muted);
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }

        .uh-nav-link:hover {
          color: var(--color-text);
          background: rgba(212,175,100,0.07);
        }

        .uh-nav-link.active {
          color: var(--color-gold);
          background: rgba(212,175,100,0.1);
        }

        /* Active dot indicator */
        .uh-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 2px;
          background: var(--color-gold);
          border-radius: 2px;
        }

        /* ── Cart Badge ── */
        .uh-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--color-gold);
          color: #0f0e0b;
          font-size: 0.68rem;
          font-weight: 800;
          border-radius: 999px;
          line-height: 1;
        }

        /* ── User Section ── */
        .uh-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .uh-username {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .uh-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(212,175,100,0.15);
          border: 1px solid rgba(212,175,100,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .uh-btn-logout {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.875rem;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: var(--radius-sm);
          color: var(--color-error);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .uh-btn-logout:hover {
          background: rgba(248,113,113,0.16);
          border-color: rgba(248,113,113,0.45);
          transform: translateY(-1px);
        }

        .uh-btn-login {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1.125rem;
          background: linear-gradient(135deg, var(--color-gold), #b8952e);
          border: none;
          border-radius: var(--radius-sm);
          color: #0f0e0b;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(212,175,100,0.25);
          letter-spacing: 0.02em;
        }
        .uh-btn-login:hover {
          background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
          box-shadow: 0 4px 20px rgba(212,175,100,0.4);
          transform: translateY(-1px);
        }

        /* ── Divider dot ── */
        .uh-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--color-border);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .uh-inner { padding: 0 1rem; height: 56px; }
          .uh-logo-text { font-size: 1.15rem; }
          .uh-nav { gap: 0; }
          .uh-nav-link { padding: 0.35rem 0.5rem; font-size: 0.8rem; }
          .uh-username { display: none; }
          .uh-dot { display: none; }
        }
      `}</style>

      <header className="uh-root">
        <div className="uh-inner">

          {/* Logo */}
          <Link to="/" className="uh-logo">
            <span className="uh-logo-icon">🍽️</span>
            <span className="uh-logo-text">NHÀ HÀNG</span>
          </Link>

          {/* Nav */}
          <nav className="uh-nav">
            {navLinks.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                className={`uh-nav-link${isActive(to) ? ' active' : ''}`}
              >
                {label}
                {badge > 0 && <span className="uh-badge">{badge}</span>}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="uh-user">
            {user ? (
              <>
                <div className="uh-avatar">👤</div>
                <span className="uh-username">
                  {user.name || user.email}
                </span>
                <div className="uh-dot" />
                <button className="uh-btn-logout" onClick={handleLogout}>
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/user-login" className="uh-btn-login">
                Đăng nhập
              </Link>
            )}
          </div>

        </div>
      </header>
    </>
  )
}

export default UserHeader