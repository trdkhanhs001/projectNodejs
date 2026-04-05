// User Login Page - Đăng nhập cho người dùng (direct login)
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthContainer, AuthCard, InputField, Alert } from '../components/AuthComponents'
import apiClient from '../utils/apiClient'

function UserLogin() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username || !formData.password) {
      setError('❌ Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.post('/auth/user/login', {
        username: formData.username,
        password: formData.password
      })

      const { accessToken, refreshToken, user } = response.data
      loginWithToken(accessToken, refreshToken, user)
      
      setSuccess('✅ Đăng nhập thành công!')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đăng nhập'
      setError('❌ ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContainer>
      <AuthCard title="🍽️ Đăng Nhập Tài Khoản" subtitle="Đăng nhập để xem đơn hàng và đặt thêm món">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <form onSubmit={handleSubmit}>
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
            {loading ? '⏳ Đang đăng nhập...' : '🔓 Đăng Nhập'}
          </button>

          <p className="text-xs text-gray-500 mt-5 text-center">
            Chưa có tài khoản? <Link to="/user-register" className="text-purple-600 font-semibold hover:underline">Đăng ký tại đây</Link>
          </p>
        </form>
      </AuthCard>
    </AuthContainer>
  )
} 
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
