import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">⏳ Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">👤 Tài Khoản Của Tôi</h1>
          <button 
            className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            onClick={handleLogout}
          >
            🚪 Đăng Xuất
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
          <button
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Thông Tin Cá Nhân
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'orders'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Lịch Sử Đơn Hàng
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Cá Nhân</h2>
            
            {!editMode ? (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Tên Đăng Nhập</label>
                    <p className="text-lg text-gray-900 font-semibold mt-1">{profile.username || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Họ Và Tên</label>
                    <p className="text-lg text-gray-900 font-semibold mt-1">{profile.fullName || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-lg text-gray-900 font-semibold mt-1">{profile.email || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Số Điện Thoại</label>
                    <p className="text-lg text-gray-900 font-semibold mt-1">{profile.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Địa Chỉ</label>
                    <p className="text-lg text-gray-900 font-semibold mt-1">{profile.address || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Ngày Tạo Tài Khoản</label>
                    <p className="text-lg text-gray-900 font-semibold mt-1">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>

                <button
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition mt-6"
                  onClick={() => setEditMode(true)}
                >
                  ✏️ Chỉnh Sửa
                </button>
              </div>
            ) : (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Họ Và Tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Địa Chỉ</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    💾 Lưu
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition"
                    onClick={() => setEditMode(false)}
                  >
                    ❌ Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">📦 Bạn chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-600">ID Đơn Hàng</p>
                        <p className="font-bold text-gray-900">{order._id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
                        {
                          PENDING: 'bg-yellow-100 text-yellow-700',
                          CONFIRMED: 'bg-blue-100 text-blue-700',
                          PREPARING: 'bg-purple-100 text-purple-700',
                          COMPLETED: 'bg-green-100 text-green-700',
                          CANCELLED: 'bg-red-100 text-red-700'
                        }[order.status] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Ngày Tạo</label>
                        <p className="text-gray-900 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Số Lượng</label>
                        <p className="text-gray-900 mt-1">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0)} món
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Tổng Cộng</label>
                        <p className="text-lg font-bold text-purple-600 mt-1">
                          {order.total?.toLocaleString() || '0'} đ
                        </p>
                      </div>
                    </div>

                    {order.discountCode && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Mã Giảm Giá: <span className="font-semibold text-green-700">{order.discountCode.code}</span></p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-semibold text-gray-900 block mb-2">📦 Các Mặt Hàng:</label>
                      <ul className="space-y-1 bg-gray-50 p-3 rounded-lg">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">
                            • {item.name} x {item.quantity} = {(item.price * item.quantity).toLocaleString()} đ
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
