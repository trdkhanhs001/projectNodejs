// User Login Page - Đăng nhập cho người dùng (direct login)
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'

const spinnerStyle = {
  width: '16px', height: '16px',
  border: '2px solid rgba(0,0,0,0.2)',
  borderTopColor: '#000',
  borderRadius: '50%',
  display: 'inline-block',
}

function UserLogin() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({ username: '', password: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.post('/auth/user/login', {
        username: formData.username,
        password: formData.password,
      })

      const { accessToken, refreshToken, user } = response.data
      loginWithToken(accessToken, refreshToken, user)

      setSuccess('Đăng nhập thành công! Đang chuyển hướng...')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đăng nhập'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundImage: `
        radial-gradient(ellipse 70% 50% at 50% -5%, rgba(212,175,100,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 85% 95%, rgba(212,175,100,0.04) 0%, transparent 50%)
      `,
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }} className="animate-slide-up">
        <div className="login-card">

          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>🍽️</div>
            <div className="login-logo">Đăng Nhập</div>
            <p className="login-subtitle">Đăng nhập để xem đơn hàng và đặt thêm món</p>
          </div>

          <div className="divider" />

          {/* Alerts */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              ✅ {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Tên Đăng Nhập</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.9rem', color: 'var(--color-text-dim)',
                  pointerEvents: 'none',
                }}>👤</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  autoFocus
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Mật Khẩu</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.9rem', color: 'var(--color-text-dim)',
                  pointerEvents: 'none',
                }}>🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0,
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
                  <span className="spinner" style={spinnerStyle} />
                  Đang đăng nhập...
                </>
              ) : '🔓 Đăng Nhập'}
            </button>
          </form>

          {/* Register link */}
          <p className="login-footer" style={{ marginTop: '1.5rem' }}>
            Chưa có tài khoản?{' '}
            <Link to="/user-register" style={{
              color: 'var(--color-gold)',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              Đăng ký tại đây
            </Link>
          </p>

          {/* Copyright */}
          <p className="login-copyright">© 2024 Restaurant Management System</p>
        </div>
      </div>
    </div>
  )
}

export default UserLogin