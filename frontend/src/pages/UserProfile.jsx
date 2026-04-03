import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import './UserProfile.css'

function UserProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (!user || user.role !== 'USER') {
      navigate('/')
      return
    }

    fetchProfile()
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [user, activeTab])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/auth/profile')
      setProfile(response.data.user)
      setFormData({
        fullName: response.data.user.fullName || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || ''
      })
      setError('')
    } catch (err) {
      setError('Không thể tải thông tin cá nhân')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/order/user/orders')
      setOrders(response.data)
      setError('')
    } catch (err) {
      setError('Không thể tải lịch sử đơn hàng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await apiClient.put('/auth/user/profile', formData)
      setProfile(prev => ({ ...prev, ...formData }))
      setSuccessMsg('Cập nhật thông tin thành công!')
      setEditMode(false)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout()
      navigate('/')
    }
  }

  if (loading && !profile) {
    return <div className="user-profile loading">Đang tải...</div>
  }

  return (
    <div className="user-profile">
      <header className="profile-header">
        <h1>Tài khoản của tôi</h1>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Đăng Xuất
        </button>
      </header>

      <div className="profile-container">
        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Thông tin cá nhân
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Lịch sử đơn hàng
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-section">
                <h2>Thông tin cá nhân</h2>
                
                {!editMode ? (
                  <div className="profile-view">
                    <div className="profile-row">
                      <span className="label">Username:</span>
                      <span className="value">{profile.username || 'N/A'}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Họ và tên:</span>
                      <span className="value">{profile.fullName || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Email:</span>
                      <span className="value">{profile.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{profile.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{profile.address || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Ngày tạo tài khoản:</span>
                      <span className="value">
                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => setEditMode(true)}
                    >
                      ✏️ Chỉnh sửa
                    </button>
                  </div>
                ) : (
                  <form className="profile-form">
                    <div className="form-group">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ"
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        💾 Lưu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditMode(false)}
                      >
                        ❌ Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-content">
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>📦 Bạn chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        <strong>Id:</strong> {order._id}
                      </div>
                      <div className={`order-status status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="detail-row">
                        <span className="label">Ngày tạo:</span>
                        <span className="value">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Số lượng:</span>
                        <span className="value">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0)} món
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Tổng cộng:</span>
                        <span className="value total">
                          ${order.total?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      {order.discountCode && (
                        <div className="detail-row discount">
                          <span className="label">Mã giảm giá:</span>
                          <span className="value">{order.discountCode.code}</span>
                        </div>
                      )}
                    </div>

                    <div className="order-items">
                      <strong>Các mặt hàng:</strong>
                      <ul>
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
