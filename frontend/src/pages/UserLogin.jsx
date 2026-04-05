// User Login Page - Đăng nhập cho người dùng (với OTP)
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { requestLoginOTP, verifyLoginOTP } from '../utils/authApi'

/* ─── Shared input style helper ─── */
const inputIconWrap = {
  position: 'relative',
}
const iconStyle = {
  position: 'absolute', left: '0.875rem', top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '0.9rem',
  color: 'var(--color-text-dim)',
  pointerEvents: 'none',
}

function UserLogin() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [step, setStep] = useState('credentials') // 'credentials' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)
  const [userId, setUserId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({ username: '', password: '', otp: '' })

  /* OTP countdown */
  useEffect(() => {
    if (otpTimer <= 0) return
    const timer = setInterval(() => setOtpTimer(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [otpTimer])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /* Step 1 — request OTP */
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }
    try {
      setLoading(true)
      const result = await requestLoginOTP(formData.username, formData.password)
      if (!result.success) { setError(result.message); return }
      setUserId(result.data.userId)
      setSuccess('Mã OTP đã được gửi tới email của bạn!')
      setStep('otp')
      setOtpTimer(600)
    } catch (err) {
      setError(err.message || 'Không thể gửi OTP')
    } finally {
      setLoading(false)
    }
  }

  /* Step 2 — verify OTP */
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.otp) { setError('Vui lòng nhập mã OTP'); return }
    if (formData.otp.length !== 6) { setError('Mã OTP phải là 6 chữ số'); return }
    try {
      setLoading(true)
      const result = await verifyLoginOTP(userId, formData.otp)
      if (!result.success) { setError(result.message); return }
      const { accessToken, refreshToken, user } = result.data
      loginWithToken(accessToken, refreshToken, user)
      setSuccess('Đăng nhập thành công! Đang chuyển hướng...')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message || 'Xác thực OTP thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCredentials = () => {
    setStep('credentials')
    setFormData(prev => ({ ...prev, otp: '' }))
    setError('')
    setSuccess('')
    setOtpTimer(0)
  }

  const formatTimer = (t) =>
    `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`

  return (
    /* Full-screen wrapper */
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
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-slide-up">

        {/* ── Card ── */}
        <div className="login-card">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>🍽️</div>
            <div className="login-logo">Đăng Nhập</div>
            <p className="login-subtitle">Đăng nhập để xem đơn hàng và đặt thêm món</p>
          </div>

          {/* Divider */}
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

          {/* ── STEP INDICATOR ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            {/* Step 1 bubble */}
            <StepBubble num={1} active={step === 'credentials'} done={step === 'otp'} />
            {/* Connector */}
            <div style={{
              flex: 1, height: '1px',
              background: step === 'otp'
                ? 'var(--color-gold)'
                : 'var(--color-border)',
              transition: 'background 0.4s',
            }} />
            {/* Step 2 bubble */}
            <StepBubble num={2} active={step === 'otp'} done={false} />
          </div>

          {/* ── STEP 1: Credentials ── */}
          {step === 'credentials' && (
            <form onSubmit={handleRequestOTP}>
              <div className="login-step-label">
                <span>🔐</span> Bước 1: Nhập Thông Tin
              </div>
              <p className="login-step-desc">
                Chúng tôi sẽ gửi mã xác thực (OTP) tới email của bạn
              </p>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Tên Đăng Nhập</label>
                <div style={inputIconWrap}>
                  <span style={iconStyle}>👤</span>
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
                <div style={inputIconWrap}>
                  <span style={iconStyle}>🔒</span>
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
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0,
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.25rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={spinnerStyle} />
                    Đang gửi OTP...
                  </>
                ) : '→ Tiếp tục'}
              </button>

              <p className="login-footer" style={{ marginTop: '1.25rem' }}>
                Chưa có tài khoản?{' '}
                <Link to="/user-register" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 500 }}>
                  Đăng ký tại đây
                </Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP Verify ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <div className="login-step-label">
                <span>✉️</span> Bước 2: Xác Thực OTP
              </div>
              <p className="login-step-desc">
                Kiểm tra email của bạn và nhập mã 6 chữ số
              </p>

              {/* OTP input */}
              <div className="form-group">
                <label htmlFor="otp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Mã OTP</span>
                  {otpTimer > 0 && (
                    <span style={{
                      fontSize: '0.78rem',
                      color: otpTimer < 60 ? 'var(--color-error)' : 'var(--color-gold)',
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      ⏱ {formatTimer(otpTimer)}
                    </span>
                  )}
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="_ _ _ _ _ _"
                  value={formData.otp}
                  onChange={handleInputChange}
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                  style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.4em',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Verify btn */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full btn-lg"
              >
                {loading ? (
                  <>
                    <span className="spinner" style={spinnerStyle} />
                    Đang xác thực...
                  </>
                ) : '✅ Đăng nhập'}
              </button>

              {/* Back btn */}
              <button
                type="button"
                onClick={handleBackToCredentials}
                disabled={loading}
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.75rem' }}
              >
                ← Quay lại
              </button>

              <p className="login-footer" style={{ marginTop: '1.25rem' }}>
                Không nhận được mã?{' '}
                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-gold)', fontWeight: 500, fontSize: 'inherit',
                    padding: 0,
                  }}
                >
                  Gửi lại
                </button>
              </p>
            </form>
          )}

          {/* Copyright */}
          <p className="login-copyright" style={{ marginTop: '1.5rem' }}>
            © 2024 Restaurant Management System
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Step Bubble ─── */
function StepBubble({ num, active, done }) {
  return (
    <div style={{
      width: '32px', height: '32px',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontSize: '0.8rem',
      fontWeight: 700,
      transition: 'all 0.3s',
      background: done
        ? 'var(--color-gold)'
        : active
          ? 'rgba(212,175,100,0.15)'
          : 'var(--color-surface-2)',
      border: `2px solid ${done || active ? 'var(--color-gold)' : 'var(--color-border)'}`,
      color: done
        ? '#0f0e0b'
        : active
          ? 'var(--color-gold)'
          : 'var(--color-text-dim)',
    }}>
      {done ? '✓' : num}
    </div>
  )
}

/* ─── Spinner style ─── */
const spinnerStyle = {
  width: '16px', height: '16px',
  border: '2px solid rgba(0,0,0,0.2)',
  borderTopColor: '#000',
  borderRadius: '50%',
  display: 'inline-block',
}

export default UserLogin