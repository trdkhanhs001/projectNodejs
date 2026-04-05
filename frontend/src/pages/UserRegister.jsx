// User Register Page - Trang đăng ký riêng cho người dùng
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { requestSignupOTP, verifyOTPAndRegister } from '../utils/authApi'

/* ─── Shared styles ─── */
const spinnerStyle = {
  width: '16px', height: '16px',
  border: '2px solid rgba(0,0,0,0.2)',
  borderTopColor: '#000',
  borderRadius: '50%',
  display: 'inline-block',
}

const iconWrap = { position: 'relative' }

const iconPin = {
  position: 'absolute', left: '0.875rem', top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '0.9rem', color: 'var(--color-text-dim)',
  pointerEvents: 'none',
}

/* ─── Step Bubble ─── */
function StepBubble({ num, active, done }) {
  return (
    <div style={{
      width: '32px', height: '32px',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontSize: '0.78rem', fontWeight: 700,
      transition: 'all 0.3s',
      background: done
        ? 'var(--color-gold)'
        : active ? 'rgba(212,175,100,0.15)' : 'var(--color-surface-2)',
      border: `2px solid ${done || active ? 'var(--color-gold)' : 'var(--color-border)'}`,
      color: done ? '#0f0e0b' : active ? 'var(--color-gold)' : 'var(--color-text-dim)',
    }}>
      {done ? '✓' : num}
    </div>
  )
}

/* ─── Password input with show/hide ─── */
function PasswordField({ id, label, hint, value, onChange, disabled, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="form-group">
      <label htmlFor={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        {hint && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{hint}</span>}
      </label>
      <div style={iconWrap}>
        <span style={iconPin}>🔒</span>
        <input
          id={id} name={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
        />
        <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
          style={{
            position: 'absolute', right: '0.875rem', top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0,
          }}>
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
function UserRegister() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [registerStep, setRegisterStep] = useState('email') // 'email' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)

  const [formData, setFormData] = useState({
    email: '', otp: '',
    fullName: '', username: '',
    phone: '', password: '',
    passwordConfirm: '', address: ''
  })

  /* OTP countdown */
  useEffect(() => {
    if (otpTimer <= 0) return
    const t = setInterval(() => setOtpTimer(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [otpTimer])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatTimer = (t) =>
    `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`

  /* Step 1 — send OTP */
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!formData.email) { setError('Vui lòng nhập email'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email không hợp lệ'); return
    }
    try {
      setLoading(true)
      const result = await requestSignupOTP(formData.email)
      if (!result.success) { setError(result.message); return }
      setSuccess('Mã OTP đã được gửi tới email của bạn!')
      setRegisterStep('otp')
      setOtpTimer(600)
    } catch (err) {
      setError(err.message || 'Không thể gửi OTP')
    } finally { setLoading(false) }
  }

  /* Step 2 — verify OTP + register */
  const handleVerifyOTPAndRegister = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!formData.otp || !formData.username || !formData.password ||
        !formData.passwordConfirm || !formData.fullName || !formData.phone) {
      setError('Vui lòng điền tất cả các trường bắt buộc'); return
    }
    if (formData.otp.length !== 6)        { setError('Mã OTP phải là 6 chữ số'); return }
    if (formData.username.length < 3)     { setError('Tên đăng nhập phải có ít nhất 3 ký tự'); return }
    if (formData.password.length < 6)     { setError('Mật khẩu phải có ít nhất 6 ký tự'); return }
    if (formData.password !== formData.passwordConfirm) { setError('Mật khẩu không trùng khớp'); return }

    try {
      setLoading(true)
      const result = await verifyOTPAndRegister({
        email: formData.email, otp: formData.otp,
        username: formData.username, password: formData.password,
        fullName: formData.fullName, phone: formData.phone,
        address: formData.address,
      })
      if (!result.success) { setError(result.message); return }
      const { accessToken, refreshToken, user } = result.data
      loginWithToken(accessToken, refreshToken, user)
      setSuccess('Đăng ký thành công! Đang chuyển hướng...')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally { setLoading(false) }
  }

  const handleBack = () => {
    setRegisterStep('email')
    setFormData(prev => ({
      ...prev, otp: '', username: '', password: '',
      passwordConfirm: '', fullName: '', phone: '', address: ''
    }))
    setError(''); setSuccess(''); setOtpTimer(0)
  }

  /* ── RENDER ── */
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
      <div style={{ width: '100%', maxWidth: '480px' }} className="animate-slide-up">
        <div className="login-card">

          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👤</div>
            <div className="login-logo">Đăng Ký Tài Khoản</div>
            <p className="login-subtitle">Tạo tài khoản để đặt hàng và xem đơn</p>
          </div>

          <div className="divider" />

          {/* ── Step indicator ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0 1.5rem' }}>
            <StepBubble num={1} active={registerStep === 'email'} done={registerStep === 'otp'} />
            <div style={{
              flex: 1, height: '1px',
              background: registerStep === 'otp' ? 'var(--color-gold)' : 'var(--color-border)',
              transition: 'background 0.4s',
            }} />
            <StepBubble num={2} active={registerStep === 'otp'} done={false} />
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠️ {error}</div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✅ {success}</div>
          )}

          {/* ════════════════════════
              STEP 1: Email
          ════════════════════════ */}
          {registerStep === 'email' && (
            <form onSubmit={handleRequestOTP}>
              <div className="login-step-label"><span>📧</span> Bước 1: Xác Minh Email</div>
              <p className="login-step-desc">Chúng tôi sẽ gửi mã OTP tới email của bạn</p>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div style={iconWrap}>
                  <span style={iconPin}>✉️</span>
                  <input
                    id="email" name="email" type="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoFocus
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.25rem' }}>
                {loading ? (
                  <><span className="spinner" style={spinnerStyle} /> Đang gửi OTP...</>
                ) : '📬 Gửi Mã OTP'}
              </button>

              <p className="login-footer" style={{ marginTop: '1.25rem' }}>
                Đã có tài khoản?{' '}
                <Link to="/user-login" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 500 }}>
                  Đăng nhập tại đây
                </Link>
              </p>
            </form>
          )}

          {/* ════════════════════════
              STEP 2: OTP + Details
          ════════════════════════ */}
          {registerStep === 'otp' && (
            <form onSubmit={handleVerifyOTPAndRegister}>
              <div className="login-step-label"><span>✅</span> Bước 2: Hoàn Thành Đăng Ký</div>
              <p className="login-step-desc">Nhập mã OTP và điền thông tin cá nhân</p>

              {/* OTP */}
              <div className="form-group">
                <label htmlFor="otp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Mã OTP</span>
                  {otpTimer > 0 && (
                    <span style={{
                      fontSize: '0.78rem', fontWeight: 600,
                      color: otpTimer < 60 ? 'var(--color-error)' : 'var(--color-gold)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      ⏱ {formatTimer(otpTimer)}
                    </span>
                  )}
                </label>
                <input
                  id="otp" name="otp" type="text" inputMode="numeric"
                  placeholder="_ _ _ _ _ _"
                  value={formData.otp}
                  onChange={handleInputChange}
                  maxLength={6} disabled={loading} autoFocus
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.4em', fontWeight: 600 }}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)', marginTop: '0.35rem' }}>
                  ✉️ Kiểm tra email để nhận mã
                </p>
              </div>

              <div className="divider" style={{ margin: '1rem 0' }} />

              {/* 2-col grid: fullName + username */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label htmlFor="fullName">Họ Tên</label>
                  <div style={iconWrap}>
                    <span style={iconPin}>👤</span>
                    <input id="fullName" name="fullName" type="text"
                      placeholder="Họ và tên"
                      value={formData.fullName} onChange={handleInputChange}
                      disabled={loading} style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tên Đăng Nhập</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>≥ 3 ký tự</span>
                  </label>
                  <div style={iconWrap}>
                    <span style={iconPin}>@</span>
                    <input id="username" name="username" type="text"
                      placeholder="username"
                      value={formData.username} onChange={handleInputChange}
                      disabled={loading} style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại</label>
                <div style={iconWrap}>
                  <span style={iconPin}>📱</span>
                  <input id="phone" name="phone" type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone} onChange={handleInputChange}
                    disabled={loading} style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>

              {/* Passwords */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <PasswordField
                  id="password" label="Mật Khẩu" hint="≥ 6 ký tự"
                  placeholder="Mật khẩu"
                  value={formData.password} onChange={handleInputChange} disabled={loading} />
                <PasswordField
                  id="passwordConfirm" label="Xác Nhận"
                  placeholder="Nhập lại"
                  value={formData.passwordConfirm} onChange={handleInputChange} disabled={loading} />
              </div>

              {/* Address (optional) */}
              <div className="form-group">
                <label htmlFor="address" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Địa Chỉ</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Tùy chọn</span>
                </label>
                <div style={iconWrap}>
                  <span style={iconPin}>📍</span>
                  <input id="address" name="address" type="text"
                    placeholder="Địa chỉ giao hàng"
                    value={formData.address} onChange={handleInputChange}
                    disabled={loading} style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.25rem' }}>
                {loading ? (
                  <><span className="spinner" style={spinnerStyle} /> Đang tạo tài khoản...</>
                ) : '✅ Hoàn Thành Đăng Ký'}
              </button>

              {/* Back */}
              <button type="button" onClick={handleBack} disabled={loading}
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.75rem' }}>
                ← Quay Lại
              </button>

              <p className="login-footer" style={{ marginTop: '1.25rem' }}>
                Không nhận được mã?{' '}
                <button type="button" onClick={handleBack}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', fontWeight: 500, fontSize: 'inherit', padding: 0 }}>
                  Gửi lại
                </button>
              </p>
            </form>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--color-text-dim)',
          }}>
            💡 Tiếp tục mua sắm không đăng nhập →{' '}
            <Link to="/" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 500 }}>
              Xem Menu
            </Link>
          </div>

          <p className="login-copyright">© 2024 Restaurant Management System</p>
        </div>
      </div>
    </div>
  )
}

export default UserRegister