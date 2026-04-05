import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function StaffLogin() {
  const navigate = useNavigate()
  const { loginStaff } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password.trim())
      return setError('Vui lòng nhập tên đăng nhập và mật khẩu!')

    setLoading(true)
    const result = await loginStaff(form.username, form.password)
    if (result.success) navigate('/staff')
    else setError(result.message)
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <LeftPanel />
      <RightPanel
        form={form}
        loading={loading}
        error={error}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

/* ─── LEFT PANEL ─── */
function LeftPanel() {
  const steps = [
    { label: '01', title: 'Đăng nhập tài khoản', desc: 'Xác thực nhân viên' },
    { label: '02', title: 'Vào màn hình POS',    desc: 'Quản lý đơn hàng' },
    { label: '03', title: 'Phục vụ khách hàng',  desc: 'Nhanh chóng & chính xác' },
  ]

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f0e0b 0%, #1a0e0e 60%, #200e0e 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '3rem',
      position: 'relative',
      overflow: 'hidden',
      borderRight: '1px solid rgba(239,68,68,0.12)',
    }}>
      {/* Glow blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '360px', width: '100%' }}>
        {/* Badge */}
        <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.75rem',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '999px',
          color: '#f87171',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>Nhân viên</span>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 1.15,
            marginBottom: '0.5rem',
          }}>
            Hệ Thống <br />
            <span style={{ color: '#f87171' }}>POS Staff</span>
          </div>
          <div style={{
            width: '40px', height: '2px',
            background: 'linear-gradient(90deg, #ef4444, transparent)',
            marginBottom: '1rem',
          }} />
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}>
            Đăng nhập để truy cập POS, quản lý đơn và theo dõi ca làm việc.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((step) => (
            <div key={step.label} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '0.875rem 1rem',
              background: 'rgba(239,68,68,0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239,68,68,0.1)',
            }}>
              <div style={{
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#f87171',
                fontWeight: 700,
                fontSize: '0.78rem',
                flexShrink: 0,
              }}>{step.label}</div>
              <div>
                <div style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>
                  {step.title}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── RIGHT PANEL ─── */
function RightPanel({ form, loading, error, showPassword, setShowPassword, handleChange, handleSubmit }) {
  return (
    <div style={{
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-slide-up">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '1rem' }}>⚡</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '0.4rem',
          }}>Đăng nhập Staff</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Nhập thông tin nhân viên để tiếp tục
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="s-username">Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '0.875rem', top: '50%',
                transform: 'translateY(-50%)', fontSize: '0.9rem',
                color: 'var(--color-text-dim)',
              }}>👤</span>
              <input
                id="s-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
                autoFocus
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="s-password">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '0.875rem', top: '50%',
                transform: 'translateY(-50%)', fontSize: '0.9rem',
                color: 'var(--color-text-dim)',
              }}>🔒</span>
              <input
                id="s-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
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

          {/* Submit — red accent for staff */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 2rem',
              marginTop: '0.5rem',
              background: loading
                ? 'rgba(239,68,68,0.3)'
                : 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'var(--transition)',
              boxShadow: '0 2px 16px rgba(239,68,68,0.25)',
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
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
          Admin?{' '}
          <a href="/admin-login" style={{
            color: '#f87171',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Đăng nhập tại đây
          </a>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin