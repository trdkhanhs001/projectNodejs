import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminOrders.css'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch orders
  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10
      }
      if (statusFilter) params.status = statusFilter

      const response = await apiClient.get('/admin/orders', { params })
      setOrders(response.data.orders || [])
      setTotalPages(response.data.pages || 1)
    } catch (err) {
      console.error('Error fetching orders:', err)
      alert('Lỗi load đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)
      await apiClient.put(`/admin/orders/${orderId}/status`, {
        status: newStatus
      })
      alert('Cập nhật trạng thái thành công')
      fetchOrders()
      setSelectedOrder(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật')
    } finally {
      setUpdatingId(null)
    }
  }

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Nhập lý do hủy:')
    if (!reason) return

    try {
      setUpdatingId(orderId)
      await apiClient.put(`/admin/orders/${orderId}/cancel`, {
        reason
      })
      alert('Hủy đơn hàng thành công')
      fetchOrders()
      setSelectedOrder(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi hủy đơn')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#f39c12',
      'CONFIRMED': '#3498db',
      'PREPARING': '#9b59b6',
      'READY': '#27ae60',
      'DELIVERED': '#2980b9',
      'COMPLETED': '#27ae60',
      'CANCELLED': '#e74c3c'
    }
    return colors[status] || '#95a5a6'
  }

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': '⏳ Chờ xác nhận',
      'CONFIRMED': '✔️ Đã xác nhận',
      'PREPARING': '🍳 Đang chuẩn bị',
      'READY': '✅ Sẵn sàng',
      'DELIVERED': '🚚 Đã giao',
      'COMPLETED': '✓ Hoàn thành',
      'CANCELLED': '❌ Đã hủy'
    }
    return badges[status] || status
  }

  return (
    <AdminLayout>
      <div className="admin-orders">
        <div className="orders-header">
          <h2>📦 Quản Lý Đơn Hàng</h2>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="search-input"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PREPARING">Đang chuẩn bị</option>
            <option value="READY">Sẵn sàng</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID Đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order._id.substring(0, 8)}...</strong></td>
                      <td>{order.userId?.fullName || 'Ẩn danh'}</td>
                      <td><strong style={{color: '#e74c3c'}}>{parseFloat(order.totalAmount).toLocaleString('vi-VN')} đ</strong></td>
                      <td>
                        <span style={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {getStatusBadge(order.status)}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => setSelectedOrder(order)}
                          title="Chi tiết"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="btn btn-sm"
                >
                  ← Trước
                </button>
                <span>Trang {currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="btn btn-sm"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📋 Chi tiết đơn hàng</h3>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              <div className="modal-body">
                {/* Order Header */}
                <div className="order-section">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="info-row">
                    <span>ID:</span>
                    <strong>{selectedOrder._id}</strong>
                  </div>
                  <div className="info-row">
                    <span>Ngày:</span>
                    <strong>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</strong>
                  </div>
                  <div className="info-row">
                    <span>Trạng thái:</span>
                    <strong style={{
                      backgroundColor: getStatusColor(selectedOrder.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px'
                    }}>
                      {getStatusBadge(selectedOrder.status)}
                    </strong>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="order-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="info-row">
                    <span>Tên:</span>
                    <strong>{selectedOrder.userId?.fullName || 'Ẩn danh'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Email:</span>
                    <strong>{selectedOrder.userId?.email || '—'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Điện thoại:</span>
                    <strong>{selectedOrder.userId?.phone || '—'}</strong>
                  </div>
                  <div className="info-row">
                    <span>Địa chỉ:</span>
                    <strong>{selectedOrder.address || '—'}</strong>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-section">
                  <h4>Các món hàng</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.menuId?.name || item.name || '—'}</td>
                          <td>{item.quantity}</td>
                          <td>{parseFloat(item.price).toLocaleString('vi-VN')} đ</td>
                          <td><strong>{(item.quantity * item.price).toLocaleString('vi-VN')} đ</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="order-section">
                  <div className="info-row large">
                    <span>Tổng tiền hàng:</span>
                    <strong>{parseFloat(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div className="info-row large">
                    <span>Phương thức thanh toán:</span>
                    <strong>{selectedOrder.paymentMethod || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-footer">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'CONFIRMED')}
                    disabled={updatingId === selectedOrder._id}
                  >
                    ✔️ Xác nhận
                  </button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'PREPARING')}
                    disabled={updatingId === selectedOrder._id}
                  >
                    🍳 Bắt đầu chuẩn bị
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'READY')}
                    disabled={updatingId === selectedOrder._id}
                  >
                    ✅ Sẵn sàng
                  </button>
                )}
                {selectedOrder.status === 'READY' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'DELIVERED')}
                    disabled={updatingId === selectedOrder._id}
                  >
                    🚚 Giao hàng
                  </button>
                )}
                {selectedOrder.status === 'DELIVERED' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'COMPLETED')}
                    disabled={updatingId === selectedOrder._id}
                  >
                    ✓ Hoàn thành
                  </button>
                )}
                
                {!['COMPLETED', 'CANCELLED'].includes(selectedOrder.status) && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    disabled={updatingId === selectedOrder._id}
                  >
                    ❌ Hủy đơn
                  </button>
                )}
                
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminOrders
