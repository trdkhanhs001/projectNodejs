import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function StaffLogin() {
  const navigate = useNavigate()
  const { loginStaff } = useAuth()

  const [form, setForm] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.username.trim() || !form.password.trim()) {
      return setError('Vui lòng nhập tên đăng nhập và mật khẩu!')
    }

    setLoading(true)
    const result = await loginStaff(form.username, form.password)

    if (result.success) {
      navigate('/staff')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="grid md:grid-cols-2 min-h-screen">
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

/* ================= LEFT ================= */
function LeftPanel() {
  return (
    <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-slate-950 to-red-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-sm space-y-6">
        <div className="inline-block bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
          Nhân viên
        </div>

        <h1 className="text-4xl font-bold text-white leading-tight">
          Hệ Thống <br />
          <span className="text-red-400">POS Staff</span>
        </h1>

        <p className="text-gray-300">
          Đăng nhập để truy cập POS, quản lý đơn và theo dõi ca làm việc.
        </p>

        <Steps />
      </div>
    </div>
  )
}

function Steps() {
  const steps = [
    'Đăng nhập tài khoản',
    'Vào màn hình POS',
    'Phục vụ khách hàng'
  ]

  return (
    <div className="space-y-4">
      {steps.map((text, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/30 text-red-300 font-bold">
            {String(i + 1).padStart(2, '0')}
          </div>
          <div>
            <p className="text-white font-medium">{text}</p>
            <span className="text-sm text-gray-400">
              {i === 0 && 'Xác thực tài khoản'}
              {i === 1 && 'Quản lý đơn hàng'}
              {i === 2 && 'Nhanh chóng & chính xác'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= RIGHT ================= */
function RightPanel({
  form,
  loading,
  error,
  showPassword,
  setShowPassword,
  handleChange,
  handleSubmit
}) {
  return (
    <div className="flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-6">
        <Header />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
              ⚠ {error}
            </div>
          )}

          <Input
            label="Tên đăng nhập"
            name="username"
            value={form.username}
            onChange={handleChange}
            icon="👤"
            disabled={loading}
          />

          <PasswordInput
            value={form.password}
            onChange={handleChange}
            show={showPassword}
            setShow={setShowPassword}
            disabled={loading}
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 disabled:bg-gray-400 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập →'
            )}
          </button>
        </form>

        <Footer />
      </div>
    </div>
  )
}

/* ================= SMALL COMPONENTS ================= */

function Header() {
  return (
    <div className="text-center space-y-2">
      <div className="text-4xl">⚡</div>
      <h2 className="text-2xl font-bold">Đăng nhập Staff</h2>
      <p className="text-gray-500 text-sm">Nhập thông tin nhân viên</p>
    </div>
  )
}

function Input({ label, icon, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center mt-1 border rounded-lg focus-within:ring-2 focus-within:ring-red-500">
        <span className="px-3">{icon}</span>
        <input
          {...props}
          className="flex-1 py-2 outline-none"
        />
      </div>
    </div>
  )
}

function PasswordInput({ value, onChange, show, setShow, disabled }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
      <div className="flex items-center mt-1 border rounded-lg focus-within:ring-2 focus-within:ring-red-500">
        <span className="px-3">🔒</span>
        <input
          name="password"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="flex-1 py-2 outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 text-gray-500"
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <div className="text-center text-sm text-gray-500 pt-4 border-t">
      Admin?{' '}
      <a href="/admin-login" className="text-red-600 font-medium">
        Đăng nhập tại đây
      </a>
    </div>
  )
}

export default StaffLogin