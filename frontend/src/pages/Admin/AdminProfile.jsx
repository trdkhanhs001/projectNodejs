// Trang Profile Admin
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../utils/apiClient'
import './AdminProfile.css'

function AdminProfile() {
  const { user, token } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Lấy thông tin profile từ API
  useEffect(() => {
    fetchProfile()
  }, [token])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/profile')
      const admin = response.data
      
      setFormData({
        fullName: admin.fullName || '',
        email: admin.email || '',
        phone: admin.phone || '',
        username: admin.username || ''
      })
      setMessage({ type: '', text: '' })
    } catch (err) {
      console.error('Error fetching profile:', err)
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể tải thông tin profile'
      })
    } finally {
      setLoading(false)
    }
  }

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Validate dữ liệu
      if (!formData.fullName.trim()) {
        setMessage({ type: 'error', text: 'Vui lòng nhập họ tên' })
        return
      }
      
      if (!formData.email.trim()) {
        setMessage({ type: 'error', text: 'Vui lòng nhập email' })
        return
      }

      // Gửi request update profile
      const response = await apiClient.put('/admin/profile', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      })

      setMessage({
        type: 'success',
        text: 'Cập nhật thông tin thành công! ✅'
      })

      // Update lại form data từ response
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        username: response.data.username || ''
      })

      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)

    } catch (err) {
      console.error('Error updating profile:', err)
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi cập nhật thông tin'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="profile-container">
          <div className="loading">Đang tải thông tin...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>👨‍💼</span>
            </div>
            <h2>Thông tin cá nhân</h2>
          </div>

          {message.text && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Username - Read only */}
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="form-control disabled"
              />
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Họ tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-control"
                placeholder="Nhập họ tên"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Nhập email"
                required
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '🔄 Đang lưu...' : '💾 Cập nhật thông tin'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fetchProfile}
                disabled={saving}
              >
                🔄 Tải lại
              </button>
            </div>
          </form>
        </div>

        <div className="profile-info">
          <h3>ℹ️ Thông tin bổ sung</h3>
          <ul>
            <li><strong>Role:</strong> {user?.role || 'N/A'}</li>
            <li><strong>Trạng thái:</strong> <span className="status-badge">Hoạt động</span></li>
            <li><strong>Ngày tạo:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminProfile
