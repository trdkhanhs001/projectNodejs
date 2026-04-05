import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import DiscountInput from '../components/DiscountInput'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import { getActiveDiscounts } from '../utils/discountApi'
import { createPayment } from '../utils/paymentApi'
import showToast from '../utils/toast'

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState(null)

  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'CASH'
  })

  // Auto fill khi login
  useEffect(() => {
    if (isAuthenticated && user) {
      setOrderData(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [isAuthenticated, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setOrderData(prev => ({ ...prev, [name]: value }))
  }

  const handleDiscountApplied = (discount) => {
    setAppliedDiscount(discount)
  }

  const handleDiscountRemoved = () => {
    setAppliedDiscount(null)
  }

  // ================= CALC =================
  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0)
  const tax = subtotal * 0.1
  const discount = appliedDiscount?.amount || 0
  const total = subtotal + tax - discount

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields for online orders
    if (!orderData.name || orderData.name.trim() === '') {
      showToast('Vui lòng nhập tên khách hàng', 'warning')
      return
    }

    if (!orderData.email || orderData.email.trim() === '') {
      showToast('Vui lòng nhập email', 'warning')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) {
      showToast('Email không hợp lệ', 'error')
      return
    }

    if (!orderData.phone || orderData.phone.trim() === '') {
      showToast('Vui lòng nhập số điện thoại', 'warning')
      return
    }

    if (!/^[0-9]{10,11}$/.test(orderData.phone)) {
      showToast('Số điện thoại phải là 10-11 chữ số', 'error')
      return
    }

    if (!orderData.address || orderData.address.trim() === '') {
      showToast('Vui lòng nhập địa chỉ giao hàng', 'warning')
      return
    }

    try {
      setLoading(true)

      if (!isAuthenticated) {
        // Online guest order - requires full info
        const res = await apiClient.post('/order', {
          orderType: 'ONLINE',
          items: cartItems.map(i => ({
            menuId: i._id,
            quantity: i.quantity
          })),
          guestName: orderData.name,
          guestEmail: orderData.email,
          guestPhone: orderData.phone,
          guestAddress: orderData.address,
          deliveryAddress: orderData.address,
          notes: orderData.notes,
          paymentMethod: orderData.paymentMethod,
          discountCode: appliedDiscount?.code || null
        })

        const orderId = res.data._id
        
        // Create payment for guest order
        if (res.data.paymentMethod !== 'CASH') {
          await createPayment(orderId, total, orderData.paymentMethod)
        }

        showToast(`✅ Đơn hàng #${res.data.orderNumber} được tạo thành công!`, 'success')
      } else {
        // Authenticated user order
        const res = await apiClient.post('/order', {
          orderType: 'ONLINE',
          items: cartItems.map(i => ({
            menuId: i._id,
            quantity: i.quantity
          })),
          deliveryAddress: orderData.address,
          notes: orderData.notes,
          paymentMethod: orderData.paymentMethod,
          discountCode: appliedDiscount?.code || null,
          discountAmount: discount,
          subtotal,
          tax,
          total
        })

        const orderId = res.data._id

        // Apply discount if exists
        if (appliedDiscount?.code) {
          // The discount is already applied via API
        }

        // Create payment
        if (orderData.paymentMethod !== 'CASH') {
          const paymentRes = await createPayment(orderId, total, orderData.paymentMethod)
          if (!paymentRes.success) {
            showToast('⚠️ Lệnh thanh toán thất bại, nhưng đơn hàng đã được tạo', 'warning')
          }
        }

        showToast(`✅ Đơn hàng #${res.data.orderNumber} được tạo thành công!`, 'success')
      }

      clearCart()
      navigate('/orders')
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Lỗi đặt hàng', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">💳 Thanh Toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* FORM - Main Content */}
          <form onSubmit={handleSubmit} className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Thông Tin Khách Hàng</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tên <span className="text-red-600">*</span>
                    </label>
                    <input 
                      name="name" 
                      value={orderData.name} 
                      onChange={handleChange} 
                      placeholder="Nhập tên của bạn" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input 
                      name="email" 
                      type="email"
                      value={orderData.email} 
                      onChange={handleChange} 
                      placeholder="Nhập email của bạn" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Số Điện Thoại <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="phone"
                      value={orderData.phone}
                      onChange={handleChange}
                      placeholder="Nhập 10-11 chữ số"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Địa Chỉ Giao Hàng <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={orderData.address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ giao hàng"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Ghi Chú (Tùy Chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={orderData.notes}
                      onChange={handleChange}
                      placeholder="Ghi chú thêm (không bắt buộc)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phương Thức Thanh Toán
                    </label>
                    <select 
                      name="paymentMethod" 
                      value={orderData.paymentMethod} 
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="CASH">💵 Tiền Mặt</option>
                      <option value="CARD">💳 Thẻ Tín Dụng</option>
                      <option value="ONLINE">📱 Thanh Toán Online</option>
                    </select>
                  </div>

                  {/* Discount Input */}
                  {isAuthenticated && (
                    <DiscountInput 
                      orderAmount={subtotal}
                      onDiscountApplied={handleDiscountApplied}
                      onDiscountRemoved={handleDiscountRemoved}
                    />
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Đang xử lý...' : 'Đặt Hàng'}
              </button>
            </div>
          </form>

          {/* SUMMARY - Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Tóm Tắt Đơn Hàng</h3>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cartItems.map(i => (
                  <div key={i._id} className="flex justify-between text-gray-700 text-sm">
                    <span>{i.name} x{i.quantity}</span>
                    <strong>{(i.price * i.quantity).toLocaleString()}đ</strong>
                  </div>
                ))}
              </div>

              <div className="border-t-2 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <strong>{subtotal.toLocaleString()}đ</strong>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Thuế (10%):</span>
                  <strong>{tax.toLocaleString()}đ</strong>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm:</span>
                    <strong>-{discount.toLocaleString()}đ</strong>
                  </div>
                )}
                <div className="border-t-2 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng Cộng:</span>
                  <strong className="text-2xl text-purple-600">{total.toLocaleString()}đ</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout