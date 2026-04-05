import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import UserHeader from '../components/UserHeader'

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
    maxWidth: '1000px',
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
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '1.5rem',
    paddingBottom: '0.875rem',
    borderBottom: '1px solid var(--color-border)',
  },
}

const statusMap = {
  PENDING:   { label: 'Chờ xác nhận', cls: 'badge-gold' },
  CONFIRMED: { label: 'Đã xác nhận',  cls: 'badge-success' },
  PREPARING: { label: 'Đang chuẩn bị', cls: 'badge-neutral' },
  COMPLETED: { label: 'Hoàn thành',   cls: 'badge-success' },
  CANCELLED: { label: 'Đã hủy',       cls: 'badge-error' },
}

function UserProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: ''
  })

  useEffect(() => {
    if (!user || user.role !== 'USER') { navigate('/'); return }
    fetchProfile()
  }, [user])

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders()
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/auth/profile')
      setProfile(res.data.user)
      setFormData({
        fullName: res.data.user.fullName || '',
        email:    res.data.user.email    || '',
        phone:    res.data.user.phone    || '',
        address:  res.data.user.address  || '',
      })
      setError('')
    } catch (err) {
      setError('Không thể tải thông tin cá nhân')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/order/user/orders')
      setOrders(res.data)
      setError('')
    } catch (err) {
      setError('Không thể tải lịch sử đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await apiClient.put('/auth/user/profile', formData)
      setProfile(prev => ({ ...prev, ...formData }))
      setSuccessMsg('Cập nhật thông tin thành công!')
      setEditMode(false)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout(); navigate('/')
    }
  }

  if (loading && !profile) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          <span className="spinner" style={{ marginRight: '0.5rem' }}>⏳</span>
          Đang tải...
        </span>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <UserHeader />

      <div style={S.container}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={S.pageTitle}>👤 Tài khoản</h1>
            {profile && (
              <p style={S.pageSub}>
                Xin chào, <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{profile.fullName || profile.username}</span>
              </p>
            )}
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
            style={{ alignSelf: 'center' }}
          >
            🚪 Đăng xuất
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error animate-slide-up">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success animate-slide-up">
            ✅ {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {[
            { key: 'profile', label: '👤 Thông tin cá nhân' },
            { key: 'orders',  label: '📦 Lịch sử đơn hàng' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key
                  ? '2px solid var(--color-gold)'
                  : '2px solid transparent',
                color: activeTab === tab.key
                  ? 'var(--color-gold)'
                  : 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'var(--transition)',
                letterSpacing: '0.02em',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && profile && (
          <div style={{ ...S.card }} className="animate-slide-up">
            <div style={S.cardTopLine} />
            <div style={{ padding: '2rem' }}>
              <h2 style={S.sectionTitle}>Thông Tin Cá Nhân</h2>

              {!editMode ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                    <ProfileField label="Tên đăng nhập" value={profile.username} />
                    <ProfileField label="Họ và tên"     value={profile.fullName} />
                    <ProfileField label="Email"          value={profile.email} />
                    <ProfileField label="Số điện thoại" value={profile.phone} />
                    <ProfileField label="Địa chỉ"       value={profile.address} wide />
                    <ProfileField
                      label="Ngày tạo tài khoản"
                      value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : null}
                    />
                  </div>
                  <button className="btn btn-outline" onClick={() => setEditMode(true)}>
                    ✏️ Chỉnh sửa
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label>Họ và tên</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nhập họ và tên" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Nhập email" />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ" rows={3} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      className="btn btn-success"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <span className="spinner">⏳</span> : '💾'} Lưu
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                      ✕ Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div className="animate-slide-up">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                <span className="spinner">⏳</span> Đang tải đơn hàng...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={S.cardTopLine} />
                <div style={{ fontSize: '3.5rem', opacity: 0.3, marginBottom: '1rem' }}>📦</div>
                <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                  Bạn chưa có đơn hàng nào
                </p>
                <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/')}>
                  ➜ Đặt món ngay
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map(order => {
                  const st = statusMap[order.status] || { label: order.status, cls: 'badge-neutral' }
                  return (
                    <div key={order._id} style={S.card}>
                      <div style={S.cardTopLine} />
                      <div style={{ padding: '1.5rem' }}>

                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                          <div>
                            <div className="text-label" style={{ marginBottom: '0.3rem' }}>ID Đơn Hàng</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', letterSpacing: '0.01em' }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </div>

                        {/* Order Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
                          <DetailBox label="Ngày tạo" value={new Date(order.createdAt).toLocaleDateString('vi-VN')} />
                          <DetailBox label="Số lượng" value={`${order.items?.reduce((s, i) => s + i.quantity, 0) || 0} món`} />
                          <DetailBox
                            label="Tổng cộng"
                            value={`${order.total?.toLocaleString() || '0'} đ`}
                            highlight
                          />
                          {order.discountCode && (
                            <DetailBox label="Mã giảm giá" value={order.discountCode.code} gold />
                          )}
                        </div>

                        {/* Items List */}
                        <div>
                          <div className="text-label" style={{ marginBottom: '0.625rem' }}>Các mặt hàng</div>
                          <div style={{
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.875rem 1rem',
                          }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.85rem',
                                color: 'var(--color-text)',
                                padding: '0.3rem 0',
                                borderBottom: idx < order.items.length - 1 ? '1px solid rgba(212,175,100,0.06)' : 'none',
                              }}>
                                <span>
                                  <span style={{ color: 'var(--color-gold)', marginRight: '0.5rem' }}>•</span>
                                  {item.name} <span style={{ color: 'var(--color-text-muted)' }}>× {item.quantity}</span>
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                  {(item.price * item.quantity).toLocaleString()} đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Profile Field ── */
function ProfileField({ label, value, wide }) {
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.875rem 1rem',
      gridColumn: wide ? '1 / -1' : undefined,
    }}>
      <div className="text-label" style={{ marginBottom: '0.35rem' }}>{label}</div>
      <div style={{
        fontSize: '0.95rem',
        fontWeight: 500,
        color: value ? 'var(--color-text)' : 'var(--color-text-dim)',
        fontStyle: value ? 'normal' : 'italic',
      }}>
        {value || 'Chưa cập nhật'}
      </div>
    </div>
  )
}

/* ── Detail Box ── */
function DetailBox({ label, value, highlight, gold }) {
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.75rem 1rem',
    }}>
      <div className="text-label" style={{ marginBottom: '0.3rem' }}>{label}</div>
      <div style={{
        fontSize: highlight ? '1.05rem' : '0.9rem',
        fontWeight: 700,
        color: highlight ? 'var(--color-gold)' : gold ? 'var(--color-gold-light)' : 'var(--color-text)',
      }}>
        {value}
      </div>
    </div>
  )
}

export default UserProfile