// AuthContext - Quản lý trạng thái authenticated
import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../utils/apiClient'

// Tạo context
const AuthContext = createContext(null)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Lấy token từ localStorage khi app mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
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
      const response = await apiClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data.user)
      setLoading(false)
    } catch (err) {
      console.error('Token verification failed:', err)
      localStorage.removeItem('admin_token')
      setToken(null)
      setUser(null)
      setLoading(false)
    }
  }

  // Hàm login
  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      })

      const { token: newToken, user: userData } = response.data

      // Lưu token vào localStorage
      localStorage.setItem('admin_token', newToken)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(userData)

      return { success: true, message: 'Đăng nhập thành công!' }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đăng nhập'
      return { success: false, message: errorMsg }
    }
  }

  // Hàm logout
  const logout = () => {
    localStorage.removeItem('admin_token')
    delete apiClient.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  // Check nếu user đã đăng nhập
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
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
