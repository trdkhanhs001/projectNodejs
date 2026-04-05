// User Register Page - Trang đăng ký riêng cho người dùng
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  requestSignupOTP,
  verifyOTPAndRegister
} from '../utils/authApi'
import { AuthContainer, AuthCard, InputField, Alert } from '../components/AuthComponents'

function UserRegister() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [registerStep, setRegisterStep] = useState('email') // 'email', 'otp', 'details'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    fullName: '',
    username: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    address: ''
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

  // Bước 1: Yêu cầu OTP để xác minh email
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('❌ Vui lòng nhập email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('❌ Email không hợp lệ')
      return
    }

    try {
      setLoading(true)
      const result = await requestSignupOTP(formData.email)
      
      if (!result.success) {
        setError('❌ ' + result.message)
        return
      }

      setSuccess('✅ Mã OTP đã gửi tới email của bạn!')
      setRegisterStep('otp')
      setOtpTimer(600) // 10 phút
    } catch (err) {
      setError('❌ ' + (err.message || 'Không thể gửi OTP'))
    } finally {
      setLoading(false)
    }
  }

  // Bước 2: Xác thực OTP và đăng ký tài khoản
  const handleVerifyOTPAndRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate
    if (!formData.otp || !formData.username || !formData.password || 
        !formData.passwordConfirm || !formData.fullName || !formData.phone) {
      setError('❌ Vui lòng điền tất cả các trường bắt buộc')
      return
    }

    if (formData.otp.length !== 6) {
      setError('❌ Mã OTP phải là 6 chữ số')
      return
    }

    if (formData.password.length < 6) {
      setError('❌ Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.username.length < 3) {
      setError('❌ Tên đăng nhập phải có ít nhất 3 ký tự')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('❌ Mật khẩu không trùng khớp')
      return
    }

    try {
      setLoading(true)
      const result = await verifyOTPAndRegister({
        email: formData.email,
        otp: formData.otp,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      })
      
      if (!result.success) {
        setError('❌ ' + result.message)
        return
      }

      // Đăng ký thành công
      const { accessToken, refreshToken, user } = result.data
      loginWithToken(accessToken, refreshToken, user)
      
      setSuccess('✅ Đăng ký thành công!')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      setError('❌ ' + (err.message || 'Đăng ký thất bại'))
    } finally {
      setLoading(false)
    }
  }

  // Quay lại bước xác thực email
  const handleBackToEmailStep = () => {
    setRegisterStep('email')
    setFormData(prev => ({
      ...prev,
      otp: '',
      username: '',
      password: '',
      passwordConfirm: '',
      fullName: '',
      phone: '',
      address: ''
    }))
    setError('')
    setSuccess('')
    setOtpTimer(0)
  }

  return (
    <AuthContainer>
      <AuthCard title="👤 Đăng Ký Tài Khoản" subtitle="Tạo tài khoản để đặt hàng">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {registerStep === 'email' && (
          <form onSubmit={handleRequestOTP}>
            <h3 className="text-lg font-semibold mb-2">📧 Bước 1: Xác Minh Email</h3>
            <p className="text-sm text-gray-600 mb-5">
              Chúng tôi sẽ gửi mã OTP tới email của bạn
            </p>

            <InputField
              id="email"
              label="Email *"
              type="email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? '⏳ Đang gửi OTP...' : '📬 Gửi Mã OTP'}
            </button>

            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '20px', textAlign: 'center' }}>
              Đã có tài khoản? <Link to="/user-login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập tại đây</Link>
            </div>
          </form>
        )}

        {registerStep === 'otp' && (
          <form onSubmit={handleVerifyOTPAndRegister}>
            <h3 className="text-lg font-semibold mb-2">✅ Bước 2: Hoàn Thành Đăng Ký</h3>
            <p className="text-sm text-gray-600 mb-5">
              Nhập mã OTP từ email và điền thông tin cá nhân
            </p>

            <div className="space-y-1 mb-4">
              <InputField
                id="otp"
                label={<span>Mã OTP * <span className="text-xs text-red-600">6 chữ số</span></span>}
                type="text"
                placeholder="Nhập 6 chữ số OTP"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength="6"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-600">✉️ Kiểm tra email để nhận mã</p>
              {otpTimer > 0 && (
                <p className="text-xs text-blue-600 font-semibold">
                  ⏱️ Hết hạn trong {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>

            <InputField
              id="fullName"
              label="Họ Tên *"
              type="text"
              placeholder="Nhập họ tên đầy đủ"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <InputField
              id="username"
              label={<span>Tên Đăng Nhập * <span className="text-xs text-gray-600">3-50 ký tự</span></span>}
              type="text"
              placeholder="Chọn tên đăng nhập"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <InputField
              id="phone"
              label="Số Điện Thoại *"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <InputField
              id="password"
              label={<span>Mật Khẩu * <span className="text-xs text-gray-600">Tối thiểu 6 ký tự</span></span>}
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <InputField
              id="passwordConfirm"
              label="Xác Nhận Mật Khẩu *"
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              disabled={loading}
              required
            />

            <InputField
              id="address"
              label="Địa Chỉ (Tùy chọn)"
              type="text"
              placeholder="Nhập địa chỉ giao hàng"
              value={formData.address}
              onChange={handleInputChange}
              disabled={loading}
            />

            <button type="submit" className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50" disabled={loading}>
              {loading ? '⏳ Đang tạo tài khoản...' : '✅ Hoàn Thành Đăng Ký'}
            </button>

            <button 
              type="button" 
              onClick={handleBackToEmailStep}
              disabled={loading}
              className="w-full mt-3 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              ← Quay Lại
            </button>
          </form>
        )}

        <div className="mt-8 pt-5 border-t border-gray-200 text-center text-xs text-gray-500">
          💡 Tiếp tục mua sắm không đăng nhập → <Link to="/" className="text-purple-600 font-semibold hover:underline">Xem Menu</Link>
        </div>
      </AuthCard>
    </AuthContainer>
  )
}

export default UserRegister
