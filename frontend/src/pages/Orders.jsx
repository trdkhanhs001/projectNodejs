import { useState, useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import apiClient from '../utils/apiClient'
import './Orders.css'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/order')
      setOrders(res.data)
    } catch (err) {
      console.error('❌ Lỗi tải đơn hàng:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xác nhận', color: 'badge-pending' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'badge-confirmed' },
      PREPARING: { label: 'Đang chuẩn bị', color: 'badge-preparing' },
      COMPLETED: { label: 'Hoàn thành', color: 'badge-completed' },
      CANCELLED: { label: 'Đã hủy', color: 'badge-cancelled' }
    }
    const config = statusConfig[status] || { label: status, color: 'badge-default' }
    return config
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="orders-page">
      <UserHeader />

      <div className="orders-container">
        <div className="orders-header">
          <h1>📦 Lịch sử đơn hàng</h1>
        </div>

        {loading ? (
          <div className="loading">⏳ Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📭</div>
            <h2>Chưa có đơn hàng</h2>
            <p>Bạn chưa đặt đơn hàng nào cả</p>
          </div>
        ) : (
          <div className="orders-layout">
            {/* Orders List */}
            <div className="orders-list-section">
              <div className="orders-list">
                {orders.map(order => (
                  <div
                    key={order._id}
                    className={`order-card ${selectedOrder?._id === order._id ? 'active' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-card-header">
                      <div className="order-info">
                        <h3>Đơn #{order._id.substring(0, 8)}</h3>
                        <p className="order-date">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className={`status-badge ${getStatusBadge(order.status).color}`}>
                        {getStatusBadge(order.status).label}
                      </div>
                    </div>

                    <div className="order-card-body">
                      <p className="customer-name">
                        👤 {order.customer?.name}
                      </p>
                      <p className="order-items">
                        {order.items?.length} món | {order.totalAmount?.toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="order-details-section">
                <div className="details-card">
                  <div className="details-header">
                    <h2>Chi tiết đơn hàng</h2>
                    <button
                      className="btn-close"
                      onClick={() => setSelectedOrder(null)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status Progress */}
                  <div className="status-progress">
                    <div className={`progress-step ${['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED'].includes(selectedOrder.status) ? 'active' : ''}`}>
                      <div className="step-dot">1</div>
                      <div className="step-label">Chờ xác nhận</div>
                    </div>
                    <div className={`progress-line ${['CONFIRMED', 'PREPARING', 'COMPLETED'].includes(selectedOrder.status) ? 'active' : ''}`}></div>
                    <div className={`progress-step ${['CONFIRMED', 'PREPARING', 'COMPLETED'].includes(selectedOrder.status) ? 'active' : ''}`}>
                      <div className="step-dot">2</div>
                      <div className="step-label">Xác nhận</div>
                    </div>
                    <div className={`progress-line ${['PREPARING', 'COMPLETED'].includes(selectedOrder.status) ? 'active' : ''}`}></div>
                    <div className={`progress-step ${['PREPARING', 'COMPLETED'].includes(selectedOrder.status) ? 'active' : ''}`}>
                      <div className="step-dot">3</div>
                      <div className="step-label">Chuẩn bị</div>
                    </div>
                    <div className={`progress-line ${selectedOrder.status === 'COMPLETED' ? 'active' : ''}`}></div>
                    <div className={`progress-step ${selectedOrder.status === 'COMPLETED' ? 'active' : ''}`}>
                      <div className="step-dot">✓</div>
                      <div className="step-label">Hoàn thành</div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="info-section">
                    <h3>📋 Thông tin khách hàng</h3>
                    <div className="info-row">
                      <span>Tên:</span>
                      <strong>{selectedOrder.customer?.name}</strong>
                    </div>
                    <div className="info-row">
                      <span>Email:</span>
                      <strong>{selectedOrder.customer?.email || '—'}</strong>
                    </div>
                    <div className="info-row">
                      <span>Điện thoại:</span>
                      <strong>{selectedOrder.customer?.phone}</strong>
                    </div>
                    <div className="info-row">
                      <span>Địa chỉ:</span>
                      <strong>{selectedOrder.customer?.address}</strong>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="items-section">
                    <h3>🍽️ Danh sách món ăn</h3>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <div className="item-info">
                          <strong>{item.name || 'Món ăn'}</strong>
                          <span className="item-qty">x{item.quantity}</span>
                        </div>
                        <div className="item-price">
                          {(item.price * item.quantity).toLocaleString()} đ
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="notes-section">
                      <h3>📝 Ghi chú</h3>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="total-section">
                    <div className="total-row">
                      <span>Tổng cộng:</span>
                      <strong className="total-amount">
                        {selectedOrder.totalAmount?.toLocaleString()} đ
                      </strong>
                    </div>
                    <div className="total-row">
                      <span>Trạng thái:</span>
                      <strong className={`status-badge ${getStatusBadge(selectedOrder.status).color}`}>
                        {getStatusBadge(selectedOrder.status).label}
                      </strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-danger"
                        onClick={() => alert('Tính năng hủy đơn sẽ được cập nhật')}
                      >
                        ✕ Hủy đơn hàng
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
