import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminOrders.css'

function AdminOrders() {
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    fetchOrders()
  }, [])

  // ================= FETCH =================
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/order')
      setOrdersList(res.data)
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // ================= FILTER =================
  const filteredOrders = filterStatus === 'ALL'
    ? ordersList
    : ordersList.filter(order => order.status === filterStatus)

  // ================= UPDATE STATUS =================
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)

      await apiClient.patch(`/order/${orderId}`, { status: newStatus })

      // Update UI ngay (không cần gọi lại API)
      setOrdersList(prev =>
        prev.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      )

    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingId(null)
    }
  }

  // ================= STATUS =================
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending'
      case 'CONFIRMED': return 'status-confirmed'
      case 'PREPARING': return 'status-preparing'
      case 'COMPLETED': return 'status-completed'
      case 'CANCELLED': return 'status-cancelled'
      default: return ''
    }
  }

  const translateStatus = (status) => {
    const map = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PREPARING: 'Đang chuẩn bị',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    }
    return map[status] || status
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  // ================= UI =================
  return (
    <AdminLayout>
      <div className="admin-orders">

        <h2>Quản lý Đơn Hàng</h2>

        {/* FILTER */}
        <div className="filter-buttons">
          {['ALL','PENDING','CONFIRMED','PREPARING','COMPLETED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL'
                ? `Tất cả (${ordersList.length})`
                : translateStatus(status)
              }
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="card">
              <p className="empty">Không có đơn hàng</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="card order-card">

                {/* HEADER */}
                <div className="order-header">
                  <div>
                    <h3>{order.orderCode}</h3>
                    <p>{order.customerName}</p>
                    <p>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  </div>

                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {translateStatus(order.status)}
                  </span>

                  <div>
                    <p>Tổng tiền</p>
                    <strong>{order.totalPrice?.toLocaleString()} đ</strong>
                  </div>
                </div>

                {/* ITEMS */}
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Món</th>
                      <th>SL</th>
                      <th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {(item.price * item.quantity).toLocaleString()} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ACTIONS */}
                <div className="order-actions">

                  {order.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-success"
                        disabled={updatingId === order._id}
                        onClick={() => updateOrderStatus(order._id, 'CONFIRMED')}
                      >
                        ✓ Xác nhận
                      </button>

                      <button
                        className="btn btn-danger"
                        disabled={updatingId === order._id}
                        onClick={() => updateOrderStatus(order._id, 'CANCELLED')}
                      >
                        ✗ Hủy
                      </button>
                    </>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button
                      className="btn btn-primary"
                      disabled={updatingId === order._id}
                      onClick={() => updateOrderStatus(order._id, 'PREPARING')}
                    >
                      🍳 Chuẩn bị
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      className="btn btn-success"
                      disabled={updatingId === order._id}
                      onClick={() => updateOrderStatus(order._id, 'COMPLETED')}
                    >
                      ✓ Hoàn thành
                    </button>
                  )}

                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminOrders