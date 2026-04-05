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
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* LEFT — Branding */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-sm text-center">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Nhà Hàng <span className="text-amber-500">ABC</span>
          </h1>
          <p className="text-gray-300 mb-8 text-lg">
            Hệ thống quản lý nhà hàng toàn diện — Nhanh chóng, chính xác, hiệu quả
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 text-gray-300">
              <span className="text-3xl">📦</span>
              <div className="text-left">
                <strong className="text-white block">Quản lý đơn hàng</strong>
                <span className="text-sm">Theo dõi realtime mọi đơn</span>
              </div>
            </div>
            <div className="flex items-start gap-4 text-gray-300">
              <span className="text-3xl">🍴</span>
              <div className="text-left">
                <strong className="text-white block">Quản lý thực đơn</strong>
                <span className="text-sm">Thêm, sửa, xóa dễ dàng</span>
              </div>
            </div>
            <div className="flex items-start gap-4 text-gray-300">
              <span className="text-3xl">👥</span>
              <div className="text-left">
                <strong className="text-white block">Quản lý nhân viên</strong>
                <span className="text-sm">Phân quyền & theo dõi ca</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="bg-white flex justify-center items-center p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
            <p className="text-gray-600">Nhập thông tin tài khoản admin để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin-slow w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            Dành cho nhân viên? <a href="/staff-login" className="text-blue-600 hover:text-blue-700 font-medium">Đăng nhập Staff</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin