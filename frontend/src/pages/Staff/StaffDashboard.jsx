import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../utils/apiClient'
import './StaffDashboard.css'

function StaffDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  if (user?.role !== 'STAFF') {
    return <Navigate to="/staff-login" replace />
  }

  useEffect(() => {
    fetchTodayData()
    checkDailyReset()
  }, [])

  const fetchTodayData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await apiClient.get(`/order/daily-summary?date=${today}`)
      if (response.data) {
        setTodayRevenue(response.data.totalRevenue || 0)
        setTodayOrders(response.data.totalOrders || 0)
      }
    } catch (err) {
      setTodayRevenue(0)
      setTodayOrders(0)
    } finally {
      setLoading(false)
    }
  }

  const checkDailyReset = () => {
    const lastDate = localStorage.getItem(`staff_login_date_${user._id}`)
    const today = new Date().toISOString().split('T')[0]
    if (lastDate && lastDate !== today) {
      showNotification('✨ Ngày mới! Doanh thu đã reset.')
    }
    localStorage.setItem(`staff_login_date_${user._id}`, today)
  }

  const showNotification = (message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000)
  }

  const handleRefresh = () => {
    fetchTodayData()
    showNotification('🔄 Đã cập nhật!')
  }

  const avgPerOrder = todayOrders > 0
    ? (todayRevenue / todayOrders).toLocaleString('vi-VN', { maximumFractionDigits: 0 })
    : '0'

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <header className="staff-header">
        <div className="staff-header-content">
          <h1>⚡ Staff Dashboard</h1>
          <div className="staff-info">
            <span className="staff-name">👤 {user?.username || user?.name}</span>
            <button className="btn btn-pos-link" onClick={() => navigate('/staff/pos')}>
              🏪 Mở POS
            </button>
            <button className="btn btn-logout" onClick={logout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className="staff-notification">{n.message}</div>
        ))}
      </div>

      {/* Content */}
      <div className="staff-container">
        <section className="summary-section">
          <div className="summary-header">
            <h2>📊 Doanh thu hôm nay</h2>
            <div>
              <span className="date-info">
                📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}
              </span>
              <button className="btn btn-refresh" onClick={handleRefresh}>🔄 Cập nhật</button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="summary-cards">
              <div className="summary-card revenue-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Doanh thu</h3>
                  <p className="card-value">{todayRevenue.toLocaleString('vi-VN')} ₫</p>
                </div>
              </div>
              <div className="summary-card orders-card">
                <div className="card-icon">🛒</div>
                <div className="card-content">
                  <h3>Số đơn hàng</h3>
                  <p className="card-value">{todayOrders} đơn</p>
                </div>
              </div>
              <div className="summary-card average-card">
                <div className="card-icon">📈</div>
                <div className="card-content">
                  <h3>Trung bình / đơn</h3>
                  <p className="card-value">{avgPerOrder} ₫</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="note-section">
          <div className="note-card">
            <h3>📌 Lưu ý</h3>
            <ul>
              <li>✅ Doanh thu tự động reset lúc 00:00 hàng ngày</li>
              <li>✅ Nhấn "Cập nhật" để lấy số liệu mới nhất</li>
              <li>✅ Chỉ tính đơn hàng đã hoàn thành</li>
              <li>✅ Nhấn "Mở POS" để tạo đơn hàng mới</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StaffDashboard