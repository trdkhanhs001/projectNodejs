import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu!')
      setLoading(false)
      return
    }

    const result = await loginAdmin(username, password)
    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* ── LEFT: Branding ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0f0e0b 0%, #1a1410 60%, #221a0e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(212,175,100,0.12)',
      }}>
        {/* Decorative glow blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(212,175,100,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-100px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(212,175,100,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '360px', width: '100%' }}>
          {/* Logo */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.6rem',
              fontWeight: 700,
              color: 'var(--color-gold)',
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              letterSpacing: '0.02em',
            }}>
              Nhà Hàng ABC
            </div>
            <div style={{
              width: '48px', height: '2px',
              background: 'linear-gradient(90deg, var(--color-gold), transparent)',
              marginBottom: '1rem',
            }} />
            <p style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}>
              Hệ thống quản lý nhà hàng toàn diện — Nhanh chóng, chính xác, hiệu quả
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: '📦', title: 'Quản lý đơn hàng', desc: 'Theo dõi realtime mọi đơn' },
              { icon: '🍴', title: 'Quản lý thực đơn', desc: 'Thêm, sửa, xóa dễ dàng' },
              { icon: '👥', title: 'Quản lý nhân viên', desc: 'Phân quyền & theo dõi ca' },
            ].map((item) => (
              <div key={item.title} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(212,175,100,0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{item.icon}</span>
                <div>
                  <div style={{
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '0.2rem',
                  }}>{item.title}</div>
                  <div style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8rem',
                  }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div style={{
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="animate-slide-up">

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.2rem 0.75rem',
              background: 'rgba(212,175,100,0.1)',
              border: '1px solid rgba(212,175,100,0.2)',
              borderRadius: '999px',
              color: 'var(--color-gold)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>Admin Portal</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '0.4rem',
            }}>Đăng nhập</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Nhập thông tin tài khoản admin để tiếp tục
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
                autoFocus
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#000',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }} />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập →'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
          }}>
            Dành cho nhân viên?{' '}
            <a href="/staff-login" style={{
              color: 'var(--color-gold)',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              Đăng nhập Staff
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin