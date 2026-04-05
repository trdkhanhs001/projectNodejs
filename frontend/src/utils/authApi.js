// Auth API Helper Functions
import apiClient from './apiClient'

/**
 * 📧 Yêu cầu OTP cho đăng ký
 * @param {string} email - Email người dùng
 * @returns {Promise} Response từ server
 */
export const requestSignupOTP = async (email) => {
  try {
    const response = await apiClient.post('/auth/request-otp', { email })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message
    }
  }
}

/**
 * ✅ Xác thực OTP và đăng ký tài khoản
 * @param {Object} userData - Dữ liệu người dùng
 * @returns {Promise} Response từ server
 */
export const verifyOTPAndRegister = async (userData) => {
  try {
    const response = await apiClient.post('/auth/verify-otp', userData)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message
    }
  }
}

/**
 * 🔐 Yêu cầu OTP cho đăng nhập (bước 1)
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response từ server
 */
export const requestLoginOTP = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/user/request-login-otp', {
      username,
      password
    })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message
    }
  }
}

/**
 * ✔️ Xác thực OTP và đăng nhập (bước 2)
 * @param {string} userId - ID người dùng
 * @param {string} otp - Mã OTP
 * @returns {Promise} Response từ server
 */
export const verifyLoginOTP = async (userId, otp) => {
  try {
    const response = await apiClient.post('/auth/user/verify-login-otp', {
      userId,
      otp
    })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message
    }
  }
}

/**
 * 🏢 Đăng nhập Admin
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response từ server
 */
export const loginAdmin = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/admin/login', {
      username,
      password
    })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Admin login failed'
    }
  }
}

/**
 * 👨‍💼 Đăng nhập Staff
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response từ server
 */
export const loginStaff = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/staff/login', {
      username,
      password
    })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Staff login failed'
    }
  }
}

/**
 * 🔄 Làm mới Access Token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} Response từ server
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Token refresh failed'
    }
  }
}

/**
 * 👤 Lấy thông tin người dùng hiện tại
 * @returns {Promise} Response từ server
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/profile')
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user profile'
    }
  }
}
