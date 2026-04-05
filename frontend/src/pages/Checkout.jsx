import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import DiscountInput from '../components/DiscountInput'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import { createPayment } from '../utils/paymentApi'
import showToast from '../utils/toast'

/* ─── Shared token styles ─── */
const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,100,0.06) 0%, transparent 60%)`,
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.2rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '0.4rem',
  },
  pageSub: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    marginBottom: '2rem',
  },
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopLine: {
    position: 'absolute', top: 0, left: '10%', right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
    opacity: 0.5,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.15rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '1.25rem',
    paddingBottom: '0.875rem',
    borderBottom: '1px solid var(--color-border)',
  },
}

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [orderData, setOrderData] = useState({
    name: '', email: '', phone: '', address: '', notes: '', paymentMethod: 'CASH'
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      setOrderData(prev => ({
        ...prev,
        name:  user.fullName || '',
        email: user.email    || '',
        phone: user.phone    || '',
      }))
    }
  }, [isAuthenticated, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setOrderData(prev => ({ ...prev, [name]: value }))
  }

  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0)
  const tax      = subtotal * 0.1
  const discount = appliedDiscount?.amount || 0
  const total    = subtotal + tax - discount

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderData.name.trim())    { showToast('Vui lòng nhập tên khách hàng', 'warning'); return }
    if (!orderData.email.trim())   { showToast('Vui lòng nhập email', 'warning'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) { showToast('Email không hợp lệ', 'error'); return }
    if (!orderData.phone.trim())   { showToast('Vui lòng nhập số điện thoại', 'warning'); return }
    if (!/^[0-9]{10,11}$/.test(orderData.phone)) { showToast('Số điện thoại phải là 10-11 chữ số', 'error'); return }
    if (!orderData.address.trim()) { showToast('Vui lòng nhập địa chỉ giao hàng', 'warning'); return }

    try {
      setLoading(true)
      const payload = isAuthenticated
        ? {
            orderType: 'ONLINE',
            items: cartItems.map(i => ({ menuId: i._id, quantity: i.quantity })),
            deliveryAddress: orderData.address,
            notes: orderData.notes,
            paymentMethod: orderData.paymentMethod,
            discountCode: appliedDiscount?.code || null,
            discountAmount: discount, subtotal, tax, total,
          }
        : {
            orderType: 'ONLINE',
            items: cartItems.map(i => ({ menuId: i._id, quantity: i.quantity })),
            guestName: orderData.name, guestEmail: orderData.email,
            guestPhone: orderData.phone, guestAddress: orderData.address,
            deliveryAddress: orderData.address,
            notes: orderData.notes, paymentMethod: orderData.paymentMethod,
            discountCode: appliedDiscount?.code || null,
          }

      const res = await apiClient.post('/order', payload)
      const orderId = res.data._id

      if (orderData.paymentMethod !== 'CASH') {
        const payRes = await createPayment(orderId, total, orderData.paymentMethod)
        if (!payRes.success) showToast('⚠️ Lệnh thanh toán thất bại, nhưng đơn hàng đã được tạo', 'warning')
      }

      showToast(`✅ Đơn hàng #${res.data.orderNumber} được tạo thành công!`, 'success')
      clearCart()
      navigate('/orders')
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Lỗi đặt hàng', 'error')
    } finally {
      setLoading(false)
    }
  }

  /* ── Empty cart ── */
  if (cartItems.length === 0) {
    return (
      <div style={S.page}>
        <UserHeader />
        <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ ...S.card, textAlign: 'center', padding: '5rem 3rem', maxWidth: '420px', width: '100%' }}>
            <div style={S.cardTopLine} />
            <div style={{ fontSize: '3.5rem', opacity: 0.3, marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ ...S.sectionTitle, borderBottom: 'none', textAlign: 'center', marginBottom: '0.5rem' }}>
              Giỏ hàng trống
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              Hãy thêm món ăn trước khi thanh toán
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              ← Quay lại menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <style>{`
        .co-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 860px) {
          .co-grid { grid-template-columns: 1fr; }
          .co-sidebar { position: static !important; }
        }
      `}</style>

      <UserHeader />

      <div style={S.container}>
        {/* Header */}
        <div>
          <h1 style={S.pageTitle}>💳 Thanh toán</h1>
          <p style={S.pageSub}>{cartItems.length} món &nbsp;·&nbsp; Tổng {total.toLocaleString()} đ</p>
        </div>

        <div className="co-grid">
          {/* ── LEFT: Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Customer Info */}
            <div style={S.card}>
              <div style={S.cardTopLine} />
              <div style={{ padding: '1.75rem' }}>
                <h3 style={S.sectionTitle}>👤 Thông tin khách hàng</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Họ và tên <Req /></label>
                    <input name="name" value={orderData.name} onChange={handleChange} placeholder="Nhập họ và tên" required />
                  </div>
                  <div className="form-group">
                    <label>Email <Req /></label>
                    <input name="email" type="email" value={orderData.email} onChange={handleChange} placeholder="example@email.com" required />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại <Req /></label>
                    <input name="phone" value={orderData.phone} onChange={handleChange} placeholder="0xxxxxxxxx" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div style={S.card}>
              <div style={S.cardTopLine} />
              <div style={{ padding: '1.75rem' }}>
                <h3 style={S.sectionTitle}>📍 Địa chỉ giao hàng</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Địa chỉ <Req /></label>
                    <textarea name="address" value={orderData.address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" rows={3} required />
                  </div>
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea name="notes" value={orderData.notes} onChange={handleChange} placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)" rows={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={S.card}>
              <div style={S.cardTopLine} />
              <div style={{ padding: '1.75rem' }}>
                <h3 style={S.sectionTitle}>💰 Phương thức thanh toán</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { value: 'CASH',   label: '💵 Tiền mặt',         desc: 'Thanh toán khi nhận hàng' },
                    { value: 'CARD',   label: '💳 Thẻ tín dụng',     desc: 'Visa, Mastercard, JCB' },
                    { value: 'ONLINE', label: '📱 Thanh toán online', desc: 'Chuyển khoản, ví điện tử' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${orderData.paymentMethod === opt.value ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
                        background: orderData.paymentMethod === opt.value ? 'var(--color-gold-dim)' : 'var(--color-surface-2)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={orderData.paymentMethod === opt.value}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Discount */}
                {isAuthenticated && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                    <DiscountInput
                      orderAmount={subtotal}
                      onDiscountApplied={setAppliedDiscount}
                      onDiscountRemoved={() => setAppliedDiscount(null)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ fontSize: '1rem' }}
            >
              {loading
                ? <><span className="spinner" style={{ marginRight: '0.5rem' }}>⏳</span>Đang xử lý...</>
                : '✅ Đặt hàng ngay'}
            </button>
          </form>

          {/* ── RIGHT: Summary ── */}
          <aside className="co-sidebar" style={{ position: 'sticky', top: '5.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Items */}
            <div style={S.card}>
              <div style={S.cardTopLine} />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={S.sectionTitle}>📋 Tóm tắt đơn hàng</h3>

                <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {cartItems.map((item, idx) => (
                    <div key={item._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.625rem 0',
                      borderBottom: idx < cartItems.length - 1 ? '1px solid rgba(212,175,100,0.06)' : 'none',
                      gap: '0.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '22px', height: '22px', padding: '0 5px',
                          background: 'rgba(212,175,100,0.12)',
                          border: '1px solid rgba(212,175,100,0.25)',
                          borderRadius: '4px',
                          fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-gold)',
                          flexShrink: 0,
                        }}>
                          {item.quantity}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', flexShrink: 0 }}>
                        {(item.price * item.quantity).toLocaleString()} đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <TotalRow label="Tạm tính" value={`${subtotal.toLocaleString()} đ`} />
                  <TotalRow label="Thuế (10%)" value={`${tax.toLocaleString()} đ`} />
                  {discount > 0 && (
                    <TotalRow label="Giảm giá" value={`-${discount.toLocaleString()} đ`} green />
                  )}
                  <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Tổng cộng</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                      {total.toLocaleString()} đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes card */}
            <div style={S.card}>
              <div style={S.cardTopLine} />
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.875rem' }}>
                  📌 Lưu ý
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Kiểm tra thông tin trước khi đặt hàng',
                    'Đơn hàng sẽ được xác nhận qua email',
                    'Liên hệ hotline nếu cần hỗ trợ',
                  ].map((note, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}

/* ── Required mark ── */
function Req() {
  return <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>
}

/* ── Total row ── */
function TotalRow({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: green ? 'var(--color-success)' : 'var(--color-text)' }}>
        {value}
      </span>
    </div>
  )
}

export default Checkout