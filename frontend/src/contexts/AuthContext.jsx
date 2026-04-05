// AuthContext - Quản lý trạng thái authenticated
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import apiClient from '../utils/apiClient'

// Tạo context
const AuthContext = createContext(null)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Lấy token từ localStorage khi app mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      // Kiểm tra token còn hợp lệ không
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Xác minh token với backend
  const verifyToken = async (token) => {
    try {
      // Don't use apiClient here since it has its own interceptor
      // Use axios directly with explicit Authorization header
      const response = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data.user)
      setLoading(false)
    } catch (err) {
      console.error('[AUTH] Token verification failed:', err.message)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      setToken(null)
      setRefreshToken(null)
      setUser(null)
      setLoading(false)
    }
  }

  // Hàm login chung - lưu token và user info
  const loginWithToken = (accessToken, newRefreshToken = null, userData = null) => {
    localStorage.setItem('auth_token', accessToken)
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken)
      setRefreshToken(newRefreshToken)
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setToken(accessToken)
    if (userData) {
      setUser(userData)
    }
  }

  // Hàm login Admin
  const loginAdmin = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/admin/login', {
        username,
        password
      })

      const { accessToken: newToken, refreshToken: newRefreshToken, user: userData } = response.data
      loginWithToken(newToken, newRefreshToken, userData)

      return { success: true, message: 'Đăng nhập Admin thành công!', role: userData.role }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đăng nhập Admin'
      return { success: false, message: errorMsg }
    }
  }

  // Hàm login Staff
  const loginStaff = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/staff/login', {
        username,
        password
      })

      const { accessToken: newToken, refreshToken: newRefreshToken, user: userData } = response.data
      loginWithToken(newToken, newRefreshToken, userData)

      return { success: true, message: 'Đăng nhập Staff thành công!', role: userData.role }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đăng nhập Staff'
      return { success: false, message: errorMsg }
    }
  }

  // Hàm login User (deprecated - use OTP flow instead)
  const loginUser = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/user/login', {
        username,
        password
      })

      const { accessToken: newToken, refreshToken: newRefreshToken, user: userData } = response.data
      loginWithToken(newToken, newRefreshToken, userData)

      return { success: true, message: 'Đăng nhập thành công!', role: userData.role }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'User login via OTP flow is required'
      return { success: false, message: errorMsg }
    }
  }

  // Hàm login (giữ lại cho backwards compatibility - Admin/Staff)
  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      })

      const { accessToken: newToken, refreshToken: newRefreshToken, user: userData } = response.data
      loginWithToken(newToken, newRefreshToken, userData)

      return { success: true, message: 'Đăng nhập thành công!', role: userData.role }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đăng nhập'
      return { success: false, message: errorMsg }
    }
  }

  // Hàm logout
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    delete apiClient.defaults.headers.common['Authorization']
    setToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  // Check nếu user đã đăng nhập
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      loading,
      isAuthenticated,
      loginWithToken,
      loginAdmin,
      loginStaff,
      loginUser,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook để dùng AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
