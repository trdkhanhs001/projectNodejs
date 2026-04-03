// API utilities - Dùng để gọi API backend
import axios from 'axios'

// Tạo axios instance với cấu hình mặc định
// Sử dụng relative path để lợi dụng Vite proxy trong development
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true
})

// Interceptor: Thêm token vào header (khi có)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    
    // Luôn xóa Content-Type mặc định
    delete config.headers['Content-Type']
    
    // Nếu có token, thêm vào Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Nếu dữ liệu là FormData, axios sẽ tự set Content-Type với boundary
    // Nếu không, set Content-Type: application/json
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor: Xử lý lỗi response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn -> xóa token và logout
      console.warn('[API Client] Unauthorized (401) - clearing auth')
      localStorage.removeItem('auth_token')
      delete apiClient.defaults.headers.common['Authorization']
      // Không redirect tự động - để AuthContext xử lý
    }
    
    // Log chi tiết lỗi (chỉ trong development)
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      })
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
