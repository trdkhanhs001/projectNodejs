import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import { useCart } from '../contexts/CartContext'
import showToast from '../utils/toast'

/* ─── Shared token styles ─── */
const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    backgroundImage: `
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,100,0.06) 0%, transparent 60%)
    `,
  },
  container: {
    maxWidth: '1200px',
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
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
    position: 'relative',
  },
  cardTopLine: {
    position: 'absolute', top: 0, left: '10%', right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
    opacity: 0.5,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
}

function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  const handleQuantityChange = (menuId, newQuantity) => {
    let qty = parseInt(newQuantity) || 1
    if (qty < 1) qty = 1
    updateQuantity(menuId, qty)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng trống', 'warning')
      return
    }
    navigate('/checkout')
  }

  return (
    <div style={S.page}>
      <style>{`
        .cart-mobile-view { display: none; }
        .cart-desktop-view { display: block; }
        @media (max-width: 768px) {
          .cart-mobile-view { display: block; }
          .cart-desktop-view { display: none; }
        }
      `}</style>
      <UserHeader />

      <div style={S.container}>
        {/* Page Header */}
        <div>
          <h1 style={S.pageTitle}>🛒 Giỏ hàng</h1>
          {cartItems.length > 0 && (
            <p style={S.pageSub}>
              {getTotalItems()} món &nbsp;·&nbsp; {getTotalPrice().toLocaleString()} đ
            </p>
          )}
        </div>

        {/* Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: cartItems.length > 0 ? '1fr 340px' : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}>

          {/* ── MAIN: Cart Items ── */}
          <main>
            {cartItems.length === 0 ? (
              /* Empty State */
              <div style={{ ...S.card, textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={S.cardTopLine} />
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>🛒</div>
                <h2 style={{ ...S.sectionTitle, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  Giỏ hàng trống
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.875rem' }}>
                  Chưa có sản phẩm nào trong giỏ hàng
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  ➜ Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div style={S.card}>
                <div style={S.cardTopLine} />

                {/* ── Desktop Table ── */}
                <div style={{ overflowX: 'auto' }} className="cart-desktop-view">
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                    <thead>
                      <tr style={{
                        background: 'var(--color-surface-2)',
                        borderBottom: '1px solid var(--color-border)',
                      }}>
                        {['Sản phẩm', 'Đơn giá', 'Số lượng', 'Tổng cộng', ''].map((h, i) => (
                          <th key={i} style={{
                            padding: '0.875rem 1.25rem',
                            textAlign: i === 0 ? 'left' : 'center',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-gold)',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, idx) => (
                        <tr key={item._id} style={{
                          borderBottom: idx < cartItems.length - 1
                            ? '1px solid rgba(212,175,100,0.06)'
                            : 'none',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,100,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Product */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                              <img
                                src={item.image || 'https://via.placeholder.com/60'}
                                alt={item.name}
                                style={{
                                  width: '56px', height: '56px',
                                  objectFit: 'cover', borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-border)',
                                  flexShrink: 0,
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                  {item.name}
                                </div>
                                {item.description && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }} className="line-clamp-1">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            {item.price?.toLocaleString()} đ
                          </td>

                          {/* Quantity */}
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <QtyControl
                              quantity={item.quantity}
                              onDecrement={() => updateQuantity(item._id, item.quantity - 1)}
                              onIncrement={() => updateQuantity(item._id, item.quantity + 1)}
                              onChange={(v) => handleQuantityChange(item._id, v)}
                            />
                          </td>

                          {/* Total */}
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-gold)', fontSize: '0.95rem' }}>
                            {(item.price * item.quantity).toLocaleString()} đ
                          </td>

                          {/* Remove */}
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              style={{
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.2)',
                                color: 'var(--color-error)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.35rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                transition: 'var(--transition)',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                            >
                              🗑️ Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile Cards ── */}
                <div className="cart-mobile-view">
                  {cartItems.map((item, idx) => (
                    <div key={item._id} style={{
                      padding: '1rem',
                      borderBottom: idx < cartItems.length - 1 ? '1px solid rgba(212,175,100,0.06)' : 'none',
                    }}>
                      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '0.875rem' }}>
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          style={{
                            width: '60px', height: '60px',
                            objectFit: 'cover', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)', flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '0.2rem' }} className="line-clamp-2">
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            {item.price?.toLocaleString()} đ / món
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <QtyControl
                          quantity={item.quantity}
                          onDecrement={() => updateQuantity(item._id, item.quantity - 1)}
                          onIncrement={() => updateQuantity(item._id, item.quantity + 1)}
                          onChange={(v) => handleQuantityChange(item._id, v)}
                        />
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '0.95rem' }}>
                            {(item.price * item.quantity).toLocaleString()} đ
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            style={{
                              background: 'none', border: 'none',
                              color: 'var(--color-error)', fontSize: '0.78rem',
                              fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem',
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── SIDEBAR: Summary ── */}
          {cartItems.length > 0 && (
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '6rem' }}>

              {/* Summary Card */}
              <div style={S.card}>
                <div style={S.cardTopLine} />
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ ...S.sectionTitle, marginBottom: '1.25rem' }}>📋 Tóm tắt đơn hàng</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <SummaryRow label="Số lượng" value={`${getTotalItems()} món`} />
                    <div style={{ height: '1px', background: 'var(--color-border)' }} />
                    <SummaryRow
                      label="Tổng cộng"
                      value={`${getTotalPrice().toLocaleString()} đ`}
                      highlight
                    />
                  </div>

                  <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout} style={{ marginBottom: '0.75rem' }}>
                    💳 Thanh toán
                  </button>
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/')}>
                    ➜ Tiếp tục mua sắm
                  </button>
                </div>
              </div>

              {/* Promo Card */}
              <div style={S.card}>
                <div style={S.cardTopLine} />
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <h4 style={{ ...S.sectionTitle, fontSize: '0.95rem', marginBottom: '0.875rem' }}>🎁 Mã khuyến mãi</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Nhập mã khuyến mãi"
                      style={{
                        flex: 1,
                        padding: '0.625rem 0.875rem',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                      }}
                    />
                    <button className="btn btn-outline" style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Quantity Control ── */
function QtyControl({ quantity, onDecrement, onIncrement, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.25rem',
    }}>
      <button onClick={onDecrement} style={qtyBtnStyle}>−</button>
      <input
        type="number" min="1"
        value={quantity}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '40px', textAlign: 'center',
          background: 'none', border: 'none',
          color: 'var(--color-text)', fontWeight: 700,
          fontSize: '0.9rem', fontFamily: 'var(--font-body)',
        }}
      />
      <button onClick={onIncrement} style={qtyBtnStyle}>+</button>
    </div>
  )
}

const qtyBtnStyle = {
  width: '26px', height: '26px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontWeight: 700, fontSize: '0.9rem',
  transition: 'var(--transition)',
}

/* ── Summary Row ── */
function SummaryRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{label}</span>
      <strong style={{
        fontSize: highlight ? '1.15rem' : '0.875rem',
        color: highlight ? 'var(--color-gold)' : 'var(--color-text)',
      }}>{value}</strong>
    </div>
  )
}

export default Cart