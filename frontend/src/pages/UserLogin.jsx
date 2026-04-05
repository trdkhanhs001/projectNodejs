// User Login Page - Đăng nhập cho người dùng (với OTP)
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthContainer, AuthCard, InputField, Alert } from '../components/AuthComponents'
import {
  requestLoginOTP,
  verifyLoginOTP
} from '../utils/authApi'

function UserLogin() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [step, setStep] = useState('credentials') // 'credentials' or 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)
  const [userId, setUserId] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    otp: ''
  })

  // OTP Timer effect
  useEffect(() => {
    if (otpTimer <= 0) return
    const timer = setInterval(() => setOtpTimer(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [otpTimer])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Bước 1: Yêu cầu OTP đăng nhập
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username || !formData.password) {
      setError('❌ Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }

    try {
      setLoading(true)
      const result = await requestLoginOTP(formData.username, formData.password)
      
      if (!result.success) {
        setError('❌ ' + result.message)
        return
      }

      setUserId(result.data.userId)
      setSuccess('✅ Mã OTP đã gửi tới email của bạn!')
      setStep('otp')
      setOtpTimer(600) // 10 phút
    } catch (err) {
      setError('❌ ' + (err.message || 'Không thể gửi OTP'))
    } finally {
      setLoading(false)
    }
  }

  // Bước 2: Xác thực OTP đăng nhập
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.otp) {
      setError('❌ Vui lòng nhập mã OTP')
      return
    }

    if (formData.otp.length !== 6) {
      setError('❌ Mã OTP phải là 6 chữ số')
      return
    }

    try {
      setLoading(true)
      const result = await verifyLoginOTP(userId, formData.otp)
      
      if (!result.success) {
        setError('❌ ' + result.message)
        return
      }

      // Đăng nhập thành công
      const { accessToken, refreshToken, user } = result.data
      loginWithToken(accessToken, refreshToken, user)
      
      setSuccess('✅ Đăng nhập thành công!')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      setError('❌ ' + (err.message || 'Xác thực OTP thất bại'))
    } finally {
      setLoading(false)
    }
  }

  // Quay lại bước 1
  const handleBackToCredentials = () => {
    setStep('credentials')
    setFormData(prev => ({
      ...prev,
      otp: ''
    }))
    setError('')
    setSuccess('')
    setOtpTimer(0)
  }

  return (
    <AuthContainer>
      <AuthCard title="🍽️ Đăng Nhập Tài Khoản" subtitle="Đăng nhập để xem đơn hàng và đặt thêm món">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {step === 'credentials' ? (
          <form onSubmit={handleRequestOTP}>
            <h3 className="text-lg font-semibold mb-2">🔐 Bước 1: Nhập Thông Tin</h3>
            <p className="text-sm text-gray-600 mb-5">
              Chúng tôi sẽ gửi mã xác thực (OTP) tới email của bạn
            </p>

            <InputField
              id="username"
              label="Tên Đăng Nhập *"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              autoFocus
              required
            />

            <InputField
              id="password"
              label="Mật Khẩu *"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <button 
              type="submit" 
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? '⏳ Gửi mã OTP...' : '➜ Tiếp tục'}
            </button>

            <p className="text-xs text-gray-500 mt-5 text-center">
              Chưa có tài khoản? <Link to="/user-register" className="text-purple-600 font-semibold hover:underline">Đăng ký tại đây</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <h3 className="text-lg font-semibold mb-2">✔️ Bước 2: Xác Thực OTP</h3>

            <div className="space-y-1 mb-4">
              <InputField
                id="otp"
                label={<span>Mã OTP * <span className="text-xs text-red-600">6 chữ số</span></span>}
                type="text"
                placeholder="Nhập mã 6 chữ số"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength="6"
                disabled={loading}
                autoFocus
                required
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-gray-600">✉️ Kiểm tra email của bạn để lấy mã</p>
              {otpTimer > 0 && (
                <p className="text-xs text-blue-600 font-semibold">
                  ⏱️ Hết hạn trong {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '⏳ Đang xác thực...' : '✅ Đăng nhập'}
            </button>

            <button 
              type="button" 
              className="w-full mt-3 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
              onClick={handleBackToCredentials}
              disabled={loading}
            >
              ← Quay Lại
            </button>

            <p className="text-xs text-gray-500 mt-5 text-center">
              Không nhận được mã? <button onClick={(e) => {
                e.preventDefault()
                handleBackToCredentials()
              }} className="text-purple-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">Gửi lại</button>
            </p>
          </form>
        )}

        <div className="mt-8 pt-5 border-t border-gray-200 text-center text-xs text-gray-500">
          © 2024 Restaurant Management System
        </div>
      </AuthCard>
    </AuthContainer>
  )
}

export default UserLogin
