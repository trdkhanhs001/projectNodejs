// Trang Dashboard Admin - hiển thị thống kê tổng hợp
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminDashboard.css'

function AdminDashboard() {
  // State để lưu trữ thống kê
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

  // Lấy dữ liệu thống kê từ API
  useEffect(() => {
    fetchStats()
  }, [dateRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/dashboard/stats', {
        params: { range: dateRange }
      })
      setDashboardStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      alert('Lỗi load thống kê')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Đang tải thống kê...</div>
      </AdminLayout>
    )
  }

  if (!dashboardStats) {
    return (
      <AdminLayout>
        <div className="error">Không thể load dữ liệu</div>
      </AdminLayout>
    )
  }

  const stats = dashboardStats

  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Bảng Điều Khiển</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-selector"
          >
            <option value="day">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm này</option>
          </select>
        </div>

        {/* Main Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Doanh Thu</h3>
              <p className="stat-value">{stats.revenue.total.toLocaleString('vi-VN')} đ</p>
              <small>Trung bình: {stats.revenue.average.toLocaleString('vi-VN')} đ/đơn</small>
            </div>
          </div>

          <div className="stat-card orders">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Đơn Hàng</h3>
              <p className="stat-value">{stats.orders.total}</p>
              <small>✅ {stats.orders.completed} | ❌ {stats.orders.cancelled}</small>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Người Dùng Mới</h3>
              <p className="stat-value">{stats.users.new}</p>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Đợi Xử Lý</h3>
              <p className="stat-value">{stats.orders.byStatus.pending + stats.orders.byStatus.confirmed}</p>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="status-breakdown">
          <h3>📈 Trạng Thái Đơn Hàng</h3>
          <div className="status-grid">
            <div className="status-item pending-item">
              <div className="status-label">⏳ Chờ Xác Nhận</div>
              <div className="status-value">{stats.orders.byStatus.pending}</div>
            </div>
            <div className="status-item confirmed-item">
              <div className="status-label">✔️ Đã Xác Nhận</div>
              <div className="status-value">{stats.orders.byStatus.confirmed}</div>
            </div>
            <div className="status-item preparing-item">
              <div className="status-label">🍳 Đang Chuẩn Bị</div>
              <div className="status-value">{stats.orders.byStatus.preparing}</div>
            </div>
            <div className="status-item ready-item">
              <div className="status-label">✅ Sẵn Sàng</div>
              <div className="status-value">{stats.orders.byStatus.ready}</div>
            </div>
            <div className="status-item delivered-item">
              <div className="status-label">🚚 Đã Giao</div>
              <div className="status-value">{stats.orders.byStatus.delivered}</div>
            </div>
            <div className="status-item completed-item">
              <div className="status-label">✓ Hoàn Thành</div>
              <div className="status-value">{stats.orders.byStatus.completed}</div>
            </div>
          </div>
        </div>

        {/* Top Menus */}
        {stats.topMenus && stats.topMenus.length > 0 && (
          <div className="top-menus-section">
            <h3>🔝 Top 5 Món Bán Chạy</h3>
            <div className="top-menus-list">
              {stats.topMenus.map((item, idx) => (
                <div key={idx} className="top-menu-item">
                  <span className="menu-rank">#{idx + 1}</span>
                  <div className="menu-info">
                    <p className="menu-name">{item.menu?.name || 'N/A'}</p>
                    <small className="menu-price">{item.menu?.price.toLocaleString('vi-VN')} đ</small>
                  </div>
                  <div className="menu-qty">
                    <strong>{item.quantity}</strong> <span>suất</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="info-card">
          📌 <strong>Thống kê từ:</strong> {new Date(stats.period.start).toLocaleDateString('vi-VN')} đến {new Date(stats.period.end).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
