import { useState, useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import apiClient from '../utils/apiClient'

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
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📦 Lịch Sử Đơn Hàng</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg">⏳ Đang tải...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
            <p className="text-gray-600">Bạn chưa đặt đơn hàng nào cả</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {orders.map(order => {
                  const statusConfig = {
                    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
                    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
                    PREPARING: { label: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-700' },
                    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
                    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
                  }
                  const config = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' }

                  return (
                    <div
                      key={order._id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOrder?._id === order._id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">Đơn #{order._id.substring(0, 8)}</h3>
                          <p className="text-xs text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-1">
                        👤 {order.user?.fullName || order.user?.username || 'User'}
                      </p>
                      <p className="text-sm font-semibold text-purple-600">
                        {order.items?.length || 0} món | {(order.total || 0).toLocaleString()} đ
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Đơn Hàng</h2>
                    <button
                      className="text-2xl text-gray-400 hover:text-gray-600 transition"
                      onClick={() => setSelectedOrder(null)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status Progress */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      {[
                        { step: 1, label: 'Chờ xác nhận', statuses: ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED'] },
                        { step: 2, label: 'Xác nhận', statuses: ['CONFIRMED', 'PREPARING', 'COMPLETED'] },
                        { step: 3, label: 'Chuẩn bị', statuses: ['PREPARING', 'COMPLETED'] },
                        { step: 4, label: 'Hoàn thành', statuses: ['COMPLETED'] }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                            item.statuses.includes(selectedOrder.status)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}>
                            {item.step === 4 && item.statuses.includes(selectedOrder.status) ? '✓' : item.step}
                          </div>
                          <div className="text-xs text-center text-gray-600">{item.label}</div>
                          {idx < 3 && (
                            <div className={`h-1 w-full mt-2 ${
                              item.statuses.includes(selectedOrder.status) && selectedOrder.status !== item.statuses[0]
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Thông Tin Khách Hàng</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Tên</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.user?.fullName || selectedOrder.user?.username || '—'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.user?.email || '—'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Điện Thoại</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.deliveryPhone || '—'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Địa Chỉ Giao</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.deliveryAddress || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🍽️ Danh Sách Món Ăn</h3>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{item.menu?.name || item.name || 'Món ăn'}</p>
                              <p className="text-sm text-gray-600">x{item.quantity}</p>
                            </div>
                            <p className="font-bold text-purple-600">
                              {((item.menu?.price || item.price || 0) * item.quantity).toLocaleString()} đ
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Không có món ăn nào</p>
                    )}
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">📝 Ghi Chú</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Total Section */}
                  <div className="border-t-2 pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng Cộng:</span>
                        <strong className="text-lg text-purple-600">
                          {(selectedOrder.total || 0).toLocaleString()} đ
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương Thức Thanh Toán:</span>
                        <strong className="text-gray-900">{selectedOrder.paymentMethod || 'CASH'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng Thái Thanh Toán:</span>
                        <strong className={selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'}>
                          {selectedOrder.paymentStatus === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng Thái Đơn:</span>
                        <strong className="text-gray-900">{
                          {
                            PENDING: 'Chờ xác nhận',
                            CONFIRMED: 'Đã xác nhận',
                            PREPARING: 'Đang chuẩn bị',
                            COMPLETED: 'Hoàn thành',
                            CANCELLED: 'Đã hủy'
                          }[selectedOrder.status] || selectedOrder.status
                        }</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày Đặt:</span>
                        <strong className="text-gray-900">{formatDate(selectedOrder.createdAt)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                    <button
                      className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                      onClick={() => alert('Tính năng hủy đơn sẽ được cập nhật')}
                    >
                      ✕ Hủy Đơn Hàng
                    </button>
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
