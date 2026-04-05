import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import showToast from '../../utils/toast'
import './AdminCommon.css'
import './AdminOrders.css'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, limit: 10 }
      if (statusFilter) params.status = statusFilter
      const response = await apiClient.get('/admin/orders', { params })
      setOrders(response.data.orders || [])
      setTotalPages(response.data.pages || 1)
    } catch (err) {
      showToast('Lỗi tải đơn hàng', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)
      await apiClient.put(`/admin/orders/${orderId}/status`, { status: newStatus })
      showToast('Cập nhật trạng thái thành công', 'success')
      fetchOrders()
      setSelectedOrder(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Nhập lý do hủy:')
    if (!reason) return
    try {
      setUpdatingId(orderId)
      await apiClient.put(`/admin/orders/${orderId}/cancel`, { reason })
      showToast('Hủy đơn hàng thành công', 'success')
      fetchOrders()
      setSelectedOrder(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi hủy đơn', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const STATUS_CONFIG = {
    PENDING:   { label: '⏳ Chờ xác nhận', cls: 'status-PENDING' },
    CONFIRMED: { label: '✔️ Đã xác nhận',  cls: 'status-CONFIRMED' },
    PREPARING: { label: '🍳 Đang chuẩn bị', cls: 'status-PREPARING' },
    READY:     { label: '✅ Sẵn sàng',      cls: 'status-READY' },
    DELIVERED: { label: '🚚 Đã giao',       cls: 'status-DELIVERED' },
    COMPLETED: { label: '✓ Hoàn thành',    cls: 'status-COMPLETED' },
    CANCELLED: { label: '❌ Đã hủy',        cls: 'status-CANCELLED' },
  }

  const StatusPill = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, cls: '' }
    return <span className={`status-pill ${cfg.cls}`}>{cfg.label}</span>
  }

  return (
    <AdminLayout>
      <div className="admin-orders">

        {/* Header */}
        <div className="orders-header">
          <h2>📦 Quản Lý Đơn Hàng</h2>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">⏳ Chờ xác nhận</option>
            <option value="CONFIRMED">✔️ Đã xác nhận</option>
            <option value="PREPARING">🍳 Đang chuẩn bị</option>
            <option value="READY">✅ Sẵn sàng</option>
            <option value="DELIVERED">🚚 Đã giao</option>
            <option value="COMPLETED">✓ Hoàn thành</option>
            <option value="CANCELLED">❌ Đã hủy</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="6" className="empty-row">Không có đơn hàng nào</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order._id}>
                        <td><span className="order-id">{order._id.substring(0, 8)}…</span></td>
                        <td>{order.user?.fullName || order.guestName || 'Ẩn danh'}</td>
                        <td><span className="order-amount">{parseFloat(order.total || 0).toLocaleString('vi-VN')} đ</span></td>
                        <td><StatusPill status={order.status} /></td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <button className="btn-view" onClick={() => setSelectedOrder(order)} title="Xem chi tiết">
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">← Trước</button>
                <span className="page-info">Trang {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">Sau →</button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>📋 Chi tiết đơn hàng</h3>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              <div className="modal-body">
                {/* Order Info */}
                <div className="order-section">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="info-row">
                    <span>ID</span>
                    <strong><span className="order-id">{selectedOrder._id}</span></strong>
                  </div>
                  <div className="info-row">
                    <span>Ngày tạo</span>
                    <strong>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</strong>
                  </div>
                  <div className="info-row">
                    <span>Trạng thái</span>
                    <strong><StatusPill status={selectedOrder.status} /></strong>
                  </div>
                  <div className="info-row">
                    <span>Thanh toán</span>
                    <strong>{selectedOrder.paymentMethod || '—'}</strong>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="order-section">
                  <h4>Thông tin khách hàng</h4>
                  {[
                    ['Tên', selectedOrder.user?.fullName || selectedOrder.guestName || 'Ẩn danh'],
                    ['Email', selectedOrder.user?.email || selectedOrder.guestEmail || '—'],
                    ['Điện thoại', selectedOrder.user?.phone || selectedOrder.guestPhone || '—'],
                    ['Địa chỉ', selectedOrder.deliveryAddress || selectedOrder.guestAddress || '—'],
                  ].map(([label, value]) => (
                    <div className="info-row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div className="order-section">
                  <h4>Các món hàng</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Tên món</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.menu?.name || item.name || '—'}</td>
                          <td>{item.quantity}</td>
                          <td>{parseFloat(item.unitPrice || 0).toLocaleString('vi-VN')} đ</td>
                          <td><strong>{parseFloat(item.subtotal || 0).toLocaleString('vi-VN')} đ</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="order-section">
                  <div className="info-row large">
                    <span>Tổng tiền</span>
                    <strong style={{ color: '#e53e3e', fontSize: '18px' }}>
                      {parseFloat(selectedOrder.total || 0).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="modal-footer">
                {selectedOrder.status === 'PENDING' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder._id, 'CONFIRMED')} disabled={updatingId === selectedOrder._id}>
                    ✔️ Xác nhận
                  </button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder._id, 'PREPARING')} disabled={updatingId === selectedOrder._id}>
                    🍳 Bắt đầu chuẩn bị
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder._id, 'READY')} disabled={updatingId === selectedOrder._id}>
                    ✅ Sẵn sàng
                  </button>
                )}
                {selectedOrder.status === 'READY' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder._id, 'DELIVERED')} disabled={updatingId === selectedOrder._id}>
                    🚚 Giao hàng
                  </button>
                )}
                {selectedOrder.status === 'DELIVERED' && (
                  <button className="btn btn-success" onClick={() => handleUpdateStatus(selectedOrder._id, 'COMPLETED')} disabled={updatingId === selectedOrder._id}>
                    ✓ Hoàn thành
                  </button>
                )}
                {!['COMPLETED', 'CANCELLED'].includes(selectedOrder.status) && (
                  <button className="btn btn-danger" onClick={() => handleCancelOrder(selectedOrder._id)} disabled={updatingId === selectedOrder._id}>
                    ❌ Hủy đơn
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

export default AdminOrders