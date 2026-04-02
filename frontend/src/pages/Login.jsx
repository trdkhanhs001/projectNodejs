// Login page - Đăng nhập admin/staff
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // State cho form
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate input
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu!')
      setLoading(false)
      return
    }

    // Gọi hàm login từ AuthContext
    const result = await login(username, password)

    if (result.success) {
      // Đăng nhập thành công -> chuyển sang trang admin
      navigate('/admin')
    } else {
      // Đăng nhập thất bại -> hiển thị lỗi
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Header */}
        <div className="login-header">
          <h1>🍽️ Restaurant Admin</h1>
          <p>Hệ thống quản lý nhà hàng</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Error message */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Username field */}
          <div className="form-group">
            <label>👤 Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label>🔒 Mật khẩu</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Đang đăng nhập...
              </>
            ) : (
              '➜ Đăng nhập'
            )}
          </button>
        </form>

        {/* Test accounts info */}
        <div className="test-accounts">
          <p><strong>🧪 Tài khoản test:</strong></p>
          <ul>
            <li><strong>Admin:</strong> admin / admin123</li>
            <li><strong>Staff:</strong> staff / staff123</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2024 Restaurant Management System</p>
        </div>
      </div>
    </div>
  )
}

export default Login
