import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../utils/apiClient'
import './StaffDashboard.css'

function StaffDashboard() {
  const { user, logout } = useAuth()
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastLogin, setLastLogin] = useState(null)
  const [notifications, setNotifications] = useState([])

  // ❌ Chỉ STAFF mới vào được trang này
  if (user?.role !== 'STAFF') {
    return <Navigate to="/staff-login" replace />
  }

  useEffect(() => {
    fetchTodayData()
    // Reset doanh thu hàng ngày
    checkDailyReset()
  }, [])

  // Hàm lấy doanh thu hôm nay
  const fetchTodayData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

      // Gọi API lấy đơn hàng hôm nay
      const response = await apiClient.get(`/order/daily-summary?date=${today}`)
      
      if (response.data) {
        setTodayRevenue(response.data.totalRevenue || 0)
        setTodayOrders(response.data.totalOrders || 0)
        
        // Lưu thời gian login hôm nay
        const lastLoginDate = localStorage.getItem(`staff_login_date_${user._id}`)
        const today = new Date().toISOString().split('T')[0]
        
        if (lastLoginDate !== today) {
          // Reset nếu là ngày mới
          localStorage.setItem(`staff_login_date_${user._id}`, today)
          showNotification('🆕 Ngày mới - Doanh thu đã được reset!')
        }
        setLastLogin(new Date())
      }
    } catch (err) {
      console.error('❌ Lỗi tải doanh thu hôm nay:', err)
      setTodayRevenue(0)
      setTodayOrders(0)
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra nếu là ngày mới -> reset doanh thu
  const checkDailyReset = () => {
    const lastLoginDate = localStorage.getItem(`staff_login_date_${user._id}`)
    const today = new Date().toISOString().split('T')[0]

    if (lastLoginDate && lastLoginDate !== today) {
      // Là ngày mới - doanh thu sẽ reset khi fetch
      showNotification('✨ Chào buổi sáng! Doanh thu hôm nay đã được reset.')
    }
    localStorage.setItem(`staff_login_date_${user._id}`, today)
  }

  const showNotification = (message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }

  const handleLogout = () => {
    logout()
  }

  const handleRefresh = () => {
    fetchTodayData()
    showNotification('🔄 Đã cập nhật doanh thu!')
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <header className="staff-header">
        <div className="staff-header-content">
          <h1>👨‍💼 Bảng điều khiển nhân viên</h1>
          <div className="staff-info">
            <span className="staff-name">Xin chào, {user?.username || user?.name}!</span>
            <button className="btn btn-logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notif => (
          <div key={notif.id} className="notification staff-notification">
            {notif.message}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="staff-container">
        {/* Daily Summary Card */}
        <section className="summary-section">
          <div className="summary-header">
            <h2>📊 Tổng kết doanh thu hôm nay</h2>
            <div>
              <span className="date-info">
                📅 {new Date().toLocaleDateString('vi-VN')}
              </span>
              <button className="btn btn-refresh" onClick={handleRefresh}>
                🔄 Cập nhật
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Đang tải dữ liệu...</div>
          ) : (
            <div className="summary-cards">
              {/* Card 1: Revenue */}
              <div className="summary-card revenue-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Doanh thu</h3>
                  <p className="card-value">
                    {todayRevenue.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              {/* Card 2: Orders */}
              <div className="summary-card orders-card">
                <div className="card-icon">🛒</div>
                <div className="card-content">
                  <h3>Số đơn hàng</h3>
                  <p className="card-value">{todayOrders} đơn</p>
                </div>
              </div>

              {/* Card 3: Average */}
              <div className="summary-card average-card">
                <div className="card-icon">📈</div>
                <div className="card-content">
                  <h3>Trung bình/đơn</h3>
                  <p className="card-value">
                    {todayOrders > 0
                      ? (todayRevenue / todayOrders).toLocaleString('vi-VN', {
                          maximumFractionDigits: 0
                        })
                      : '0'}{' '}
                    ₫
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Note */}
        <section className="note-section">
          <div className="note-card">
            <h3>📌 Lưu ý</h3>
            <ul>
              <li>✅ Doanh thu sẽ được tự động reset vào 00:00 hàng ngày</li>
              <li>✅ Nhấn "Cập nhật" để lấy doanh thu mới nhất</li>
              <li>✅ Doanh thu chỉ bao gồm các đơn hàng đã hoàn thành</li>
              <li>✅ Đăng xuất rồi đăng nhập lại vào ngày mới để xem doanh thu ngày mới</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StaffDashboard
