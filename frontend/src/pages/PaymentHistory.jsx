import { useState, useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import { useAuth } from '../contexts/AuthContext'
import { getUserPayments } from '../utils/paymentApi'
import showToast from '../utils/toast'

export default function PaymentHistory() {
  const { isAuthenticated, user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments()
    }
  }, [isAuthenticated, page])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const result = await getUserPayments(page, 10)
      
      if (result.success) {
        setPayments(result.data?.data || [])
        setPagination(result.data?.pagination)
      } else {
        showToast(result.message, 'error')
      }
    } catch (err) {
      showToast('Không thể tải lịch sử thanh toán', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-blue-100 text-blue-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': '⏳ Chờ xác nhận',
      'COMPLETED': '✅ Hoàn tất',
      'FAILED': '❌ Thất bại',
      'REFUNDED': '🔄 Đã hoàn lại'
    }
    return labels[status] || status
  }

  const getMethodLabel = (method) => {
    const labels = {
      'CASH': '💵 Tiền mặt',
      'CARD': '💳 Thẻ tín dụng',
      'ONLINE': '📱 Thanh toán online',
      'WALLET': '💰 Ví điện tử'
    }
    return labels[method] || method
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để xem lịch sử thanh toán</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">💳 Lịch Sử Thanh Toán</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">⏳ Đang tải...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Chưa có thanh toán nào</p>
          </div>
        ) : (
          <div>
            <div className="grid gap-4">
              {payments.map(payment => (
                <div key={payment._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-600">Đơn Hàng</p>
                      <p className="font-bold text-gray-900">#{payment.order?.orderNumber}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Số Tiền</p>
                      <p className="font-bold text-lg text-purple-600">
                        {payment.amount?.toLocaleString()}đ
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Phương Thức</p>
                      <p className="font-semibold text-gray-900">{getMethodLabel(payment.paymentMethod)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Trạng Thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ngày thanh toán</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {payment.transactionId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Mã giao dịch: <span className="font-mono">{payment.transactionId}</span>
                      </p>
                    </div>
                  )}

                  {payment.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Ghi chú: {payment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50 hover:bg-gray-400"
                >
                  ← Trước
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      page === p
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50 hover:bg-gray-400"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
