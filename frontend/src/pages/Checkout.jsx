import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import showToast from '../utils/toast'
import './Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(false)
  const [availableDiscounts, setAvailableDiscounts] = useState([])
  const [selectedDiscount, setSelectedDiscount] = useState(null)

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

  // Load discount
  useEffect(() => {
    if (isAuthenticated) {
      fetchDiscounts()
    }
  }, [isAuthenticated])

  const fetchDiscounts = async () => {
    try {
      const res = await apiClient.get('/discount-codes')
      setAvailableDiscounts(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setOrderData(prev => ({ ...prev, [name]: value }))
  }

  // ================= CALC =================
  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0)
  const tax = subtotal * 0.1

  const getDiscountValue = () => {
    if (!selectedDiscount) return 0
    const code = availableDiscounts.find(d => d._id === selectedDiscount)
    if (!code) return 0

    if (code.discountType === 'PERCENT') {
      return subtotal * (code.discountValue / 100)
    }
    return code.discountValue
  }

  const discount = getDiscountValue()
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
        const res = await apiClient.post('/order/guest', {
          orderType: 'ONLINE',
          items: cartItems.map(i => ({
            menuId: i._id,
            quantity: i.quantity
          })),
          guestInfo: {
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone,
            address: orderData.address
          },
          notes: orderData.notes,
          paymentMethod: orderData.paymentMethod
        })

        showToast(`Được! Thành công tạo đơn #${res.data.order.orderNumber}`, 'success')
      } else {
        // Authenticated user order
        const res = await apiClient.post('/order', {
          deliveryAddress: orderData.address,
          notes: orderData.notes,
          paymentMethod: orderData.paymentMethod
        })

        const orderId = res.data._id

        if (selectedDiscount) {
          await apiClient.post(`/order/${orderId}/apply-discount`, {
            discountCodeId: selectedDiscount
          })
        }

        showToast(`Được! Thành công tạo đơn #${res.data.orderNumber}`, 'success')
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
      <div className="checkout-page">
        <UserHeader />
        <div className="empty">
          <h2>Giỏ hàng trống</h2>
          <button onClick={() => navigate('/')}>Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <UserHeader />

      <div className="checkout-container">
        <h1>💳 Thanh toán</h1>

        <div className="checkout-content">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="card">
            <h3>Thông tin khách hàng</h3>

            <label>Tên <span className="required">*</span></label>
            <input 
              name="name" 
              value={orderData.name} 
              onChange={handleChange} 
              placeholder="Nhập tên của bạn" 
              required
            />

            <label>Email <span className="required">*</span></label>
            <input 
              name="email" 
              type="email"
              value={orderData.email} 
              onChange={handleChange} 
              placeholder="Nhập email của bạn" 
              required
            />

            <label>Số điện thoại <span className="required">*</span></label>
            <input
              name="phone"
              value={orderData.phone}
              onChange={handleChange}
              placeholder="Nhập 10-11 chữ số"
              required
            />

            <label>Địa chỉ giao hàng <span className="required">*</span></label>
            <textarea
              name="address"
              value={orderData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ giao hàng"
              required
            />

            <label>Ghi chú (tùy chọn)</label>
            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleChange}
              placeholder="Ghi chú thêm (không bắt buộc)"
            />

            <label>Phương thức thanh toán</label>
            <select name="paymentMethod" value={orderData.paymentMethod} onChange={handleChange}>
              <option value="CASH">💵 Tiền mặt</option>
              <option value="CARD">💳 Thẻ tín dụng</option>
              <option value="ONLINE">📱 Thanh toán online</option>
            </select>

            {/* Discount */}
            {isAuthenticated && availableDiscounts.length > 0 && (
              <select
                value={selectedDiscount || ''}
                onChange={(e) => setSelectedDiscount(e.target.value || null)}
              >
                <option value="">-- Không dùng mã --</option>
                {availableDiscounts.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.code} ({d.discountType === 'PERCENT'
                      ? d.discountValue + '%'
                      : d.discountValue + 'đ'})
                  </option>
                ))}
              </select>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </form>

          {/* SUMMARY */}
          <div className="card">
            <h3>Đơn hàng</h3>

            {cartItems.map(i => (
              <div key={i._id}>
                {i.name} x{i.quantity} - {(i.price * i.quantity).toLocaleString()}đ
              </div>
            ))}

            <hr />
            <p>Tạm tính: {subtotal.toLocaleString()}đ</p>
            <p>Thuế: {tax.toLocaleString()}đ</p>
            <p>Giảm: -{discount.toLocaleString()}đ</p>
            <h3>Tổng: {total.toLocaleString()}đ</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout