import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './StaffDashboard.css'

function StaffDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averagePerOrder: 0
  })
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/staff/stats/today')
      setStats({
        totalRevenue: res.data.totalRevenue || 0,
        totalOrders: res.data.totalOrders || 0,
        averagePerOrder: res.data.averagePerOrder || 0
      })
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(date)
  }

  return (
    <AdminLayout>
      <div className="staff-dashboard">
        {/* Header */}
        <div className="dashboard-top">
          <div className="dashboard-title">
            <span className="title-icon">👨‍💼</span>
            <h1>Bảng điều khiển nhân viên</h1>
            <span className="welcome-text">chào, {user?.fullName || 'staff'}!</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            🚪 ĐĂNG XUẤT
          </button>
        </div>

        {/* Main Stats */}
        <div className="stats-card">
          <div className="stats-header">
            <h2>📊 Tổng kết doanh thu hôm nay</h2>
            <div className="stats-meta">
              <span className="date-text">📅 {formatDate(lastUpdated)}</span>
              <button 
                className="btn-refresh"
                onClick={fetchStats}
                disabled={loading}
              >
                {loading ? '⏳ Đang cập nhật...' : '🔄 CẬP NHẬT'}
              </button>
            </div>
          </div>

          <div className="stats-grid">
            {/* Revenue Card */}
            <div className="stat-box revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">DOANH THU</div>
                <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="stat-box orders">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <div className="stat-label">SỐ ĐƠN HÀNG</div>
                <div className="stat-value">{stats.totalOrders} đơn</div>
              </div>
            </div>

            {/* Average Card */}
            <div className="stat-box average">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">TRUNG BÌNH/ĐƠN</div>
                <div className="stat-value">{formatCurrency(stats.averagePerOrder)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="notes-card">
          <div className="notes-header">
            <span className="notes-icon">⚡</span>
            <h3>Lưu ý</h3>
          </div>
          <div className="notes-list">
            <div className="note-item">
              <span className="note-check">✓</span>
              <span>Doanh thu sẽ được tự động reset vào 00:00 hàng ngày</span>
            </div>
            <div className="note-item">
              <span className="note-check">✓</span>
              <span>Nhấn "Cập nhật" để lấy doanh thu mới nhất</span>
            </div>
            <div className="note-item">
              <span className="note-check">✓</span>
              <span>Doanh thu chỉ bao gồm các đơn hàng đã hoàn thành</span>
            </div>
            <div className="note-item">
              <span className="note-check">✓</span>
              <span>Đăng xuất rồi đăng nhập lại vào ngày mới để xem doanh thu ngày mới</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StaffDashboard
