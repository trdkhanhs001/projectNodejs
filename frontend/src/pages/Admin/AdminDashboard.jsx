// Trang Dashboard Admin - hiển thị thống kê tổng hợp
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminDashboard.css'

function AdminDashboard() {
  // State để lưu trữ thống kê
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0
  })

  const [loading, setLoading] = useState(true)

  // Lấy dữ liệu thống kê từ API
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Lấy dữ liệu từ các endpoint khác nhau
      const [staffRes, menuRes, orderRes] = await Promise.all([
        apiClient.get('/staff'),
        apiClient.get('/menu'),
        apiClient.get('/order')
      ])

      // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
      const totalRevenue = orderRes.data
        .filter(order => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0)

      setStats({
        totalStaff: staffRes.data.length,
        totalMenuItems: menuRes.data.length,
        totalOrders: orderRes.data.length,
        totalRevenue: totalRevenue
      })
      setLoading(false)
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Dùng giá trị mặc định nếu lỗi
      setStats({
        totalStaff: 0,
        totalMenuItems: 0,
        totalOrders: 0,
        totalRevenue: 0
      })
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="dashboard">
        <h2>Bảng điều khiển</h2>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Nhân viên</h3>
              <p className="stat-value">{stats.totalStaff}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-content">
              <h3>Món ăn</h3>
              <p className="stat-value">{stats.totalMenuItems}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Đơn hàng</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Doanh thu</h3>
              <p className="stat-value">
                {(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>🔄 Hoạt động gần đây</h3>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            ✅ Dữ liệu đang được cập nhật từ API backend
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
