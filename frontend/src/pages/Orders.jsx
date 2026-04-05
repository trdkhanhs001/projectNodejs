import { useState, useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import apiClient from '../utils/apiClient'

/* ─── Status config ─── */
const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xác nhận', bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  CONFIRMED: { label: 'Đã xác nhận',  bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  PREPARING: { label: 'Đang chuẩn bị',bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
  COMPLETED: { label: 'Hoàn thành',   bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  CANCELLED: { label: 'Đã hủy',       bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
}

const PROGRESS_STEPS = [
  { label: 'Chờ xác nhận', statuses: ['PENDING','CONFIRMED','PREPARING','COMPLETED'] },
  { label: 'Xác nhận',     statuses: ['CONFIRMED','PREPARING','COMPLETED'] },
  { label: 'Chuẩn bị',    statuses: ['PREPARING','COMPLETED'] },
  { label: 'Hoàn thành',  statuses: ['COMPLETED'] },
]

const formatDate = (d) => new Date(d).toLocaleString('vi-VN')

/* ─── Shared styles ─── */
const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,100,0.06) 0%, transparent 60%)`,
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
    marginBottom: '2rem',
  },
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    overflow: 'hidden',
    position: 'relative',
  },
  topLine: {
    position: 'absolute', top: 0, left: '10%', right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
    opacity: 0.5,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--color-border)',
  },
}

/* ════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════ */
function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => { fetchOrders() }, [])

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

  return (
    <div style={S.page}>
      <UserHeader />

      <div style={S.container}>
        <h1 style={S.pageTitle}>📦 Lịch Sử Đơn Hàng</h1>

        {/* Loading */}
        {loading && (
          <div style={{
            ...S.card, textAlign: 'center',
            padding: '4rem', color: 'var(--color-gold)',
            fontSize: '1rem', fontWeight: 600,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
            Đang tải đơn hàng...
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={S.topLine} />
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.35 }}>📭</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.5rem',
              fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem',
            }}>Chưa có đơn hàng</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Bạn chưa đặt đơn hàng nào cả
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && orders.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedOrder ? '360px 1fr' : '1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}>

            {/* ── LEFT: Order List ── */}
            <div style={{
              ...S.card,
              position: 'sticky', top: '6rem',
              maxHeight: 'calc(100vh - 8rem)',
              overflowY: 'auto',
            }}>
              <div style={S.topLine} />
              {/* Scrollbar is handled by global CSS */}
              {orders.map((order, idx) => {
                const cfg = STATUS_CONFIG[order.status] || { label: order.status, bg: 'rgba(154,145,128,0.1)', color: 'var(--color-text-muted)', border: 'var(--color-border)' }
                const isActive = selectedOrder?._id === order._id

                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(isActive ? null : order)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: idx < orders.length - 1 ? '1px solid rgba(212,175,100,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      background: isActive ? 'rgba(212,175,100,0.08)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(212,175,100,0.04)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                          Đơn #{order._id.substring(0, 8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.15rem' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.2rem 0.6rem', borderRadius: '999px',
                        background: cfg.bg, color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        whiteSpace: 'nowrap', letterSpacing: '0.04em',
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      👤 {order.user?.fullName || order.user?.username || 'User'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 600, marginTop: '0.2rem' }}>
                      {order.items?.length || 0} món &nbsp;·&nbsp; {(order.total || 0).toLocaleString()} đ
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── RIGHT: Order Detail ── */}
            {selectedOrder && (
              <div style={S.card} className="animate-slide-up">
                <div style={S.topLine} />
                <div style={{ padding: '1.75rem' }}>

                  {/* Detail Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem', fontWeight: 700,
                      color: 'var(--color-text)', margin: 0,
                    }}>Chi Tiết Đơn Hàng</h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-muted)',
                        width: '32px', height: '32px',
                        cursor: 'pointer', fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>

                  {/* ── Progress Bar ── */}
                  {selectedOrder.status !== 'CANCELLED' && (
                    <div style={{
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem 1.5rem',
                      marginBottom: '1.5rem',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        {PROGRESS_STEPS.map((step, idx) => {
                          const done = step.statuses.includes(selectedOrder.status)
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                                <div style={{
                                  width: '36px', height: '36px',
                                  borderRadius: '50%',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: '0.82rem',
                                  background: done
                                    ? 'var(--color-gold)'
                                    : 'var(--color-surface)',
                                  color: done ? '#0f0e0b' : 'var(--color-text-dim)',
                                  border: `2px solid ${done ? 'var(--color-gold)' : 'var(--color-border)'}`,
                                  transition: 'all 0.3s',
                                }}>
                                  {done && idx === PROGRESS_STEPS.length - 1 ? '✓' : idx + 1}
                                </div>
                                <div style={{
                                  fontSize: '0.7rem', marginTop: '0.4rem',
                                  color: done ? 'var(--color-gold)' : 'var(--color-text-dim)',
                                  fontWeight: done ? 600 : 400,
                                  textAlign: 'center', maxWidth: '70px',
                                  lineHeight: 1.3,
                                }}>{step.label}</div>
                              </div>
                              {idx < PROGRESS_STEPS.length - 1 && (
                                <div style={{
                                  flex: 1, height: '2px', marginTop: '17px',
                                  background: done ? 'var(--color-gold)' : 'var(--color-border)',
                                  transition: 'background 0.3s',
                                }} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Customer Info ── */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={S.sectionTitle}>📋 Thông Tin Khách Hàng</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem' }}>
                      {[
                        { label: 'Tên', value: selectedOrder.user?.fullName || selectedOrder.user?.username || '—' },
                        { label: 'Email', value: selectedOrder.user?.email || '—' },
                        { label: 'Điện thoại', value: selectedOrder.deliveryPhone || '—' },
                        { label: 'Địa chỉ', value: selectedOrder.deliveryAddress || '—' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 600 }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Items ── */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={S.sectionTitle}>🍽️ Danh Sách Món Ăn</h3>
                    <div style={{
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      overflow: 'hidden',
                    }}>
                      {selectedOrder.items?.length > 0 ? selectedOrder.items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderBottom: idx < selectedOrder.items.length - 1
                            ? '1px solid rgba(212,175,100,0.06)' : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <span style={{
                              background: 'rgba(212,175,100,0.15)',
                              color: 'var(--color-gold)',
                              border: '1px solid rgba(212,175,100,0.25)',
                              borderRadius: '4px',
                              padding: '0.1rem 0.45rem',
                              fontSize: '0.72rem', fontWeight: 700,
                            }}>x{item.quantity}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 500 }}>
                              {item.menu?.name || item.name || 'Món ăn'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                            {((item.menu?.price || item.price || 0) * item.quantity).toLocaleString()} đ
                          </span>
                        </div>
                      )) : (
                        <p style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          Không có món ăn nào
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Notes ── */}
                  {selectedOrder.notes && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={S.sectionTitle}>📝 Ghi Chú</h3>
                      <p style={{
                        fontSize: '0.875rem', color: 'var(--color-text-muted)',
                        background: 'var(--color-surface-2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.875rem 1rem',
                        borderLeft: '3px solid var(--color-gold)',
                        margin: 0, lineHeight: 1.6,
                      }}>{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* ── Total ── */}
                  <div style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1.25rem',
                    marginBottom: '1.25rem',
                  }}>
                    {[
                      { label: 'Tổng cộng', value: `${(selectedOrder.total || 0).toLocaleString()} đ`, gold: true, large: true },
                      { label: 'Phương thức thanh toán', value: selectedOrder.paymentMethod || 'CASH' },
                      {
                        label: 'Trạng thái thanh toán',
                        value: selectedOrder.paymentStatus === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán',
                        color: selectedOrder.paymentStatus === 'PAID' ? 'var(--color-success)' : 'var(--color-error)',
                      },
                      {
                        label: 'Trạng thái đơn',
                        value: STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status,
                      },
                      { label: 'Ngày đặt', value: formatDate(selectedOrder.createdAt) },
                    ].map(({ label, value, gold, large, color }) => (
                      <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.5rem 0',
                      }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</span>
                        <strong style={{
                          fontSize: large ? '1.1rem' : '0.875rem',
                          color: color || (gold ? 'var(--color-gold)' : 'var(--color-text)'),
                        }}>{value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* ── Cancel Button ── */}
                  {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                    <button
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.25)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-error)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem', fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.18)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
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