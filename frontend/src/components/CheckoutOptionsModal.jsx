// Component modal: Hỏi user đăng nhập hay checkout guest
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../utils/apiClient'
import './CheckoutOptionsModal.css'

function CheckoutOptionsModal({ isOpen, onClose, authOnly = false }) {
  const navigate = useNavigate()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Main Modal */}
        {!showLoginForm && !showRegisterForm && (
          <>
            <div className="modal-header">
              <h2>{authOnly ? '🔐 Đăng Nhập / Tạo Tài Khoản' : '🛒 Xác Nhận Đặt Hàng'}</h2>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body">
              <p>{authOnly ? 'Chọn cách đăng nhập:' : 'Bạn muốn tiếp tục bằng cách nào?'}</p>
              
              <div className={`options-grid ${authOnly ? 'auth-only' : ''}`}>
                {/* Option 1: Login */}
                <div className="option-card">
                  <div className="option-icon">👤</div>
                  <h3>Đăng Nhập</h3>
                  <p>Sử dụng tài khoản hiện có</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowLoginForm(true)}
                  >
                    Đăng Nhập
                  </button>
                </div>

                {/* Option 2: Register */}
                <div className="option-card">
                  <div className="option-icon">✨</div>
                  <h3>Tạo Tài Khoản</h3>
                  <p>Đăng ký tài khoản mới</p>
                  <button 
                    className="btn btn-success"
                    onClick={() => setShowRegisterForm(true)}
                  >
                    Tạo Tài Khoản
                  </button>
                </div>

                {/* Option 3: Guest (chỉ hiện khi checkout, không phải auth-only) */}
                {!authOnly && (
                  <div className="option-card">
                    <div className="option-icon">🚀</div>
                    <h3>Tiếp Tục</h3>
                    <p>Không đăng nhập, điền thông tin giao hàng</p>
                    <button 
                      className="btn btn-outline"
                      onClick={() => {
                        onClose()
                        navigate('/checkout')
                      }}
                    >
                      Tiếp Tục
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Login Form */}
        {showLoginForm && (
          <LoginFormInModal 
            authOnly={authOnly}
            onSwitchToRegister={() => {
              setShowLoginForm(false)
              setShowRegisterForm(true)
            }}
            onBack={() => setShowLoginForm(false)}
            onSuccess={() => {
              onClose()
              if (authOnly) {
                window.location.reload()
              } else {
                navigate('/checkout')
              }
            }}
          />
        )}

        {/* Register Form */}
        {showRegisterForm && (
          <RegisterFormInModal 
            authOnly={authOnly}
            onSwitchToLogin={() => {
              setShowRegisterForm(false)
              setShowLoginForm(true)
            }}
            onBack={() => setShowRegisterForm(false)}
            onSuccess={() => {
              onClose()
              if (authOnly) {
                window.location.reload()
              } else {
                navigate('/checkout')
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

// Sub component: Login Form
function LoginFormInModal({ authOnly = false, onSwitchToRegister, onBack, onSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.post('/auth/user/login', formData)

      // Save token
      localStorage.setItem('auth_token', response.data.accessToken)
      // Call success callback to update UI
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <button className="back-btn" onClick={onBack}>← Quay lại</button>
        <h2>Đăng Nhập</h2>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>👤 Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nhập tên đăng nhập"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>🔒 Mật khẩu</label>
          <div className="password-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>

        <p className="form-footer">
          Chưa có tài khoản?{' '}
          <button
            type="button"
            className="link-btn"
            onClick={onSwitchToRegister}
          >
            Tạo Tài Khoản
          </button>
        </p>
      </form>
    </>
  )
}

// Sub component: Register Form
function RegisterFormInModal({ authOnly = false, onSwitchToLogin, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone
      })

      // Save token
      localStorage.setItem('auth_token', response.data.accessToken)
      // Call success callback to update UI
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <button className="back-btn" onClick={onBack}>← Quay lại</button>
        <h2>Tạo Tài Khoản</h2>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>👤 Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Chọn tên đăng nhập"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>📧 Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>👤 Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>📱 Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>🔒 Mật khẩu</label>
          <div className="password-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              required
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

        <div className="form-group">
          <label>🔒 Xác nhận mật khẩu</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
        </button>

        <p className="form-footer">
          Đã có tài khoản?{' '}
          <button
            type="button"
            className="link-btn"
            onClick={onSwitchToLogin}
          >
            Đăng Nhập
          </button>
        </p>
      </form>
    </>
  )
}

export default CheckoutOptionsModal
