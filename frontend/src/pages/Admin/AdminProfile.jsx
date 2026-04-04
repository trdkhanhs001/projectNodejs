import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../utils/apiClient'
import './AdminCommon.css'
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
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể tải thông tin profile'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập họ tên' })
      return
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email' })
      return
    }

    try {
      setSaving(true)
      const response = await apiClient.put('/admin/profile', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      })

      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        username: response.data.username || ''
      })

      setMessage({ type: 'success', text: '✅ Cập nhật thông tin thành công!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
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
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="profile-container">

        {/* Profile Card */}
        <div className="profile-card">
          {/* Banner */}
          <div className="profile-banner" />

          {/* Header */}
          <div className="profile-header">
            <div className="profile-avatar">👨‍💼</div>
            <h2 className="profile-name">{formData.fullName || 'Admin'}</h2>
            <span className="profile-role">{user?.role || 'Administrator'}</span>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`profile-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">

              <div className="form-field">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  disabled
                />
                <span className="field-hint">Không thể thay đổi</span>
              </div>

              <div className="form-field">
                <label>Họ tên <span className="req">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  required
                />
              </div>

              <div className="form-field">
                <label>Email <span className="req">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div className="form-field">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>

            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? '🔄 Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
              <button type="button" className="btn-reset" onClick={fetchProfile} disabled={saving}>
                🔄 Tải lại
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <p className="info-card-title">ℹ️ Thông tin bổ sung</p>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Vai trò</span>
              <span className="info-value">{user?.role || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái</span>
              <span className="status-active">✓ Hoạt động</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày tạo tài khoản</span>
              <span className="info-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminProfile