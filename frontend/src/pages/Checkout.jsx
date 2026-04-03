import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
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

    if (!orderData.phone) {
      alert('⚠️ Vui lòng nhập số điện thoại')
      return
    }

    try {
      setLoading(true)

      if (!isAuthenticated) {
        // Guest
        const res = await apiClient.post('/order/guest', {
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

        alert('✅ Thành công! #' + res.data.order.orderNumber)
      } else {
        // User
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

        alert('✅ Thành công! #' + res.data.orderNumber)
      }

      clearCart()
      navigate('/orders')
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message))
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

            <input name="name" value={orderData.name} onChange={handleChange} placeholder="Tên" />
            <input name="email" value={orderData.email} onChange={handleChange} placeholder="Email" />

            <input
              name="phone"
              value={orderData.phone}
              onChange={handleChange}
              placeholder="SĐT *"
              required
            />

            <textarea
              name="address"
              value={orderData.address}
              onChange={handleChange}
              placeholder="Địa chỉ"
            />

            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleChange}
              placeholder="Ghi chú"
            />

            <select name="paymentMethod" value={orderData.paymentMethod} onChange={handleChange}>
              <option value="CASH">Tiền mặt</option>
              <option value="CARD">Thẻ</option>
              <option value="ONLINE">Online</option>
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

            <button disabled={loading}>
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