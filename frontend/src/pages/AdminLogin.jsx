import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './AdminLogin.css'

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
    <div className="login-page">

      {/* LEFT — Branding */}
      <div className="login-left">
        <div className="brand-block">
          <span className="brand-icon">🍽️</span>
          <h1>Nhà Hàng <span>ABC</span></h1>
          <p className="brand-tagline">
            Hệ thống quản lý nhà hàng toàn diện —<br />
            Nhanh chóng, chính xác, hiệu quả
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="feature-icon">📦</div>
              <div className="feature-text">
                <strong>Quản lý đơn hàng</strong>
                <span>Theo dõi realtime mọi đơn</span>
              </div>
            </div>
            <div className="brand-feature">
              <div className="feature-icon">🍴</div>
              <div className="feature-text">
                <strong>Quản lý thực đơn</strong>
                <span>Thêm, sửa, xóa dễ dàng</span>
              </div>
            </div>
            <div className="brand-feature">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <strong>Quản lý nhân viên</strong>
                <span>Phân quyền & theo dõi ca</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <h2>Đăng nhập</h2>
            <p>Nhập thông tin tài khoản admin để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

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

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-show-password"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập →'
              )}
            </button>
          </form>

          <div className="login-footer">
            Dành cho nhân viên?
            <a href="/staff-login">Đăng nhập Staff</a>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AdminLogin