import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../utils/apiClient'
import './StaffPOS.css'

function StaffPOS() {
  const { user, logout } = useAuth()

  if (user?.role !== 'STAFF') {
    return <Navigate to="/staff-login" replace />
  }

  const [activeTab, setActiveTab] = useState('create')
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [availableTables, setAvailableTables] = useState([])
  const [tableStats, setTableStats] = useState({ total: 0, available: 0, occupied: 0 })
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [posOrder, setPosOrder] = useState({
    tableNumber: null, items: [], notes: '', paymentMethod: 'CASH'
  })

  const [orderStats, setOrderStats] = useState({ total:0, pending:0, confirmed:0, preparing:0, ready:0, completed:0 })
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [processedOrders, setProcessedOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    fetchMenusAndCategories()
    fetchAvailableTables()
    if (activeTab === 'process' || activeTab === 'history') {
      fetchPendingOrders()
      fetchOrderStats()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'process' || activeTab === 'history') fetchPendingOrders()
  }, [filterStatus])

  const fetchMenusAndCategories = async () => {
    try {
      setLoading(true)
      const [menusRes, categoriesRes] = await Promise.all([
        apiClient.get('/menu'),
        apiClient.get('/category')
      ])
      setMenus(menusRes.data)
      setCategories([{ _id: 'all', name: 'Tất cả' }, ...categoriesRes.data])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableTables = async () => {
    try {
      const [tablesRes, statsRes] = await Promise.all([
        apiClient.get('/table/available'),
        apiClient.get('/table/stats')
      ])
      setAvailableTables(tablesRes.data)
      setTableStats(statsRes.data)
      if (tablesRes.data.length > 0 && !posOrder.tableNumber) {
        setPosOrder(prev => ({ ...prev, tableNumber: tablesRes.data[0].tableNumber }))
      }
    } catch (err) { console.error(err) }
  }

  const fetchPendingOrders = async () => {
    try {
      const res = await apiClient.get(`/order/filter/status?status=${filterStatus}`)
      setProcessedOrders(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchOrderStats = async () => {
    try {
      const res = await apiClient.get('/order/stats/dashboard')
      setOrderStats(res.data)
    } catch (err) { console.error(err) }
  }

  const getFilteredMenus = () => {
    let filtered = menus
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => {
        const catId = typeof m.category === 'object' ? m.category?._id : m.category
        return catId === selectedCategory
      })
    }
    if (searchQuery) {
      filtered = filtered.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return filtered
  }

  const addItemToOrder = (menu) => {
    const existing = posOrder.items.find(i => i.menuId === menu._id)
    if (existing) {
      setPosOrder(prev => ({
        ...prev,
        items: prev.items.map(i => i.menuId === menu._id ? { ...i, quantity: i.quantity + 1 } : i)
      }))
    } else {
      setPosOrder(prev => ({
        ...prev,
        items: [...prev.items, { menuId: menu._id, name: menu.name, price: menu.price, quantity: 1 }]
      }))
    }
  }

  const updateItemQuantity = (menuId, qty) => {
    if (qty <= 0) { removeItemFromOrder(menuId); return }
    setPosOrder(prev => ({
      ...prev,
      items: prev.items.map(i => i.menuId === menuId ? { ...i, quantity: qty } : i)
    }))
  }

  const removeItemFromOrder = (menuId) => {
    setPosOrder(prev => ({ ...prev, items: prev.items.filter(i => i.menuId !== menuId) }))
  }

  const calculateTotals = () => {
    const subtotal = posOrder.items.reduce((t, i) => t + i.price * i.quantity, 0)
    const tax = subtotal * 0.1
    return { subtotal, tax, total: subtotal + tax }
  }

  const { subtotal, tax, total } = calculateTotals()

  const handleSubmitOrder = async () => {
    if (posOrder.items.length === 0) { alert('⚠️ Vui lòng thêm ít nhất một món'); return }
    if (!posOrder.tableNumber) { alert('⚠️ Vui lòng chọn bàn'); return }
    try {
      setLoading(true)
      const response = await apiClient.post('/order/guest', {
        orderType: 'DINE_IN',
        tableNumber: posOrder.tableNumber,
        items: posOrder.items.map(i => ({ menuId: i.menuId, quantity: i.quantity })),
        notes: posOrder.notes || null,
        paymentMethod: posOrder.paymentMethod
      })
      alert('✅ Đơn #' + response.data.order.orderNumber + ' đã được tạo!')
      fetchAvailableTables()
      setPosOrder({ tableNumber: null, items: [], notes: '', paymentMethod: 'CASH' })
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleClearOrder = () => {
    if (window.confirm('Xóa tất cả món?')) {
      setPosOrder({ tableNumber: posOrder.tableNumber, items: [], notes: '', paymentMethod: 'CASH' })
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      await apiClient.put(`/order/${orderId}/status`, { status: newStatus })
      fetchPendingOrders()
      fetchOrderStats()
      if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') fetchAvailableTables()
      setSelectedOrder(null)
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const STATUS_MAP = {
    PENDING:   { label: '⏳ Chờ xác nhận', color: '#f59e0b' },
    CONFIRMED: { label: '✔️ Đã xác nhận',  color: '#3b82f6' },
    PREPARING: { label: '🍳 Đang chuẩn bị', color: '#a855f7' },
    READY:     { label: '✅ Sẵn sàng',      color: '#10b981' },
    DELIVERED: { label: '📦 Đã giao',       color: '#6b7280' },
    CANCELLED: { label: '❌ Đã hủy',        color: '#ef4444' },
  }

  if (loading && menus.length === 0) {
    return <div className="staff-pos"><div className="spinner" /></div>
  }

  const filteredMenus = getFilteredMenus()

  return (
    <div className="staff-pos">
      {/* Header */}
      <div className="staff-pos-header">
        <div className="staff-pos-header-content">
          <h1>⚡ POS Terminal</h1>
          <div className="staff-pos-info">
            <span className="staff-pos-name">👤 {user?.username || user?.name}</span>
            <button className="btn-logout-small" onClick={logout}>🚪 Đăng xuất</button>
          </div>
        </div>
      </div>

      <div className="staff-pos-container">
        {/* Tabs */}
        <div className="pos-tabs">
          <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
            📝 Tạo Đơn
          </button>
          <button className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`} onClick={() => setActiveTab('process')}>
            🔄 Xử Lý ({orderStats.pending})
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            📊 Lịch Sử
          </button>
        </div>

        {/* ===== CREATE ORDER ===== */}
        {activeTab === 'create' && (
          <div className="pos-container">
            {/* LEFT: Menu */}
            <div className="pos-menu-section">
              <div className="menu-controls">
                <div className="search-group">
                  <input
                    type="text"
                    placeholder="Tìm kiếm món ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="category-tabs">
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      className={`category-tab ${selectedCategory === cat._id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat._id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="menu-grid">
                {filteredMenus.length === 0 ? (
                  <div className="empty-menu">Không tìm thấy món ăn</div>
                ) : (
                  filteredMenus.map(menu => (
                    <div key={menu._id} className="menu-card" onClick={() => addItemToOrder(menu)}>
                      <div className="menu-img-wrapper">
                        {menu.image
                          ? <img src={menu.image} alt={menu.name} className="menu-image" onError={(e) => e.target.style.display='none'} />
                          : <div className="menu-image-placeholder">🍽️</div>
                        }
                        <div className="menu-badges">
                          {menu.isVegan && <span className="badge vegan">🌱</span>}
                          {menu.isSpicy && <span className="badge spicy">🌶️</span>}
                        </div>
                      </div>
                      <div className="menu-info">
                        <h4 className="menu-name">{menu.name}</h4>
                        {menu.description && <p className="menu-description">{menu.description}</p>}
                        <div className="menu-footer">
                          <span className="menu-price">{menu.price.toLocaleString('vi-VN')}đ</span>
                          <button className="add-btn" onClick={(e) => { e.stopPropagation(); addItemToOrder(menu) }}>+ Thêm</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Order */}
            <div className="pos-order-section">
              {/* Table */}
              <div className="order-box">
                <h3>📍 Chọn bàn — {tableStats.available}/{tableStats.total} trống</h3>
                {availableTables.length === 0 ? (
                  <p style={{ color: '#ef4444', fontSize: '13px' }}>❌ Không có bàn trống</p>
                ) : (
                  <select
                    value={posOrder.tableNumber || ''}
                    onChange={(e) => setPosOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                    className="table-input"
                  >
                    <option value="">-- Chọn bàn --</option>
                    {availableTables.map(t => (
                      <option key={t._id} value={t.tableNumber}>
                        {t.tableNumber} · {t.capacity} người
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Items */}
              <div className="order-box" style={{ paddingBottom: 0 }}>
                <h3>🛍️ Đơn hàng · {posOrder.items.length} món</h3>
              </div>
              <div className="order-items">
                {posOrder.items.length === 0 ? (
                  <div className="empty-order">Chưa có món — bấm vào menu để thêm</div>
                ) : (
                  posOrder.items.map(item => (
                    <div key={item.menuId} className="order-item">
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">{item.price.toLocaleString('vi-VN')}đ</div>
                      </div>
                      <div className="item-controls">
                        <button className="qty-btn" onClick={() => updateItemQuantity(item.menuId, item.quantity - 1)}>−</button>
                        <span className="qty-display">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateItemQuantity(item.menuId, item.quantity + 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeItemFromOrder(item.menuId)}>✕</button>
                      </div>
                      <div className="item-total">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                    </div>
                  ))
                )}
              </div>

              {/* Notes */}
              <div className="order-box">
                <h3>📝 Ghi chú</h3>
                <textarea
                  value={posOrder.notes}
                  onChange={(e) => setPosOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Không cay, ít đá, thêm nước..."
                  className="notes-input"
                  rows="2"
                />
              </div>

              {/* Payment */}
              <div className="order-box">
                <h3>💳 Thanh toán</h3>
                <select
                  value={posOrder.paymentMethod}
                  onChange={(e) => setPosOrder(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="payment-select"
                >
                  <option value="CASH">💵 Tiền mặt</option>
                  <option value="CARD">💳 Thẻ</option>
                  <option value="ONLINE">📱 Online</option>
                </select>
              </div>

              {/* Summary */}
              <div className="order-summary">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="summary-row">
                  <span>Thuế 10%</span>
                  <span>{tax.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="summary-row total">
                  <span>TỔNG CỘNG</span>
                  <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pos-actions">
                <button className="btn btn-primary" onClick={handleSubmitOrder} disabled={loading || posOrder.items.length === 0}>
                  ✓ Tạo Đơn Hàng
                </button>
                <button className="btn btn-secondary" onClick={handleClearOrder} disabled={posOrder.items.length === 0}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROCESS ORDERS ===== */}
        {activeTab === 'process' && (
          <div className="process-container">
            <div className="stats-cards">
              {[
                { n: orderStats.pending,   l: 'Chờ xác nhận' },
                { n: orderStats.confirmed, l: 'Đã xác nhận' },
                { n: orderStats.preparing, l: 'Đang chuẩn bị' },
                { n: orderStats.ready,     l: 'Sẵn sàng' },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-number">{s.n}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="status-filter-buttons">
                <button 
                  className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('PENDING')}
                >
                  ⏳ Chờ Xác Nhận
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('CONFIRMED')}
                >
                  ✔️ Đã Xác Nhận
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'PREPARING' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('PREPARING')}
                >
                  🍳 Đang Chuẩn Bị
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'READY' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('READY')}
                >
                  ✅ Sẵn Sàng
                </button>
              </div>
            </div>

            <div className="process-layout">
              {/* Order List */}
              <div className="orders-list">
                <h3>Danh sách đơn ({processedOrders.length})</h3>
                {processedOrders.length === 0 ? (
                  <div className="empty-state">Không có đơn nào</div>
                ) : (
                  processedOrders.map(order => {
                    const cfg = STATUS_MAP[order.status] || { label: order.status, color: '#6b7280' }
                    return (
                      <div
                        key={order._id}
                        className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="order-card-header">
                          <span className="order-number">#{order.orderNumber}</span>
                          <span className="order-status" style={{ backgroundColor: cfg.color }}>{cfg.label}</span>
                        </div>
                        <div className="order-card-body">
                          <div>📍 {order.tableNumber || 'N/A'}</div>
                          <div>🕐 {new Date(order.createdAt).toLocaleTimeString('vi-VN')}</div>
                          <div>💰 {order.total?.toLocaleString('vi-VN')}đ</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Detail Panel */}
              <div className="order-detail">
                {selectedOrder ? (
                  <>
                    <h3>📦 Chi tiết đơn #{selectedOrder.orderNumber}</h3>
                    <div className="detail-box">
                      {[
                        ['Bàn', selectedOrder.tableNumber],
                        ['Trạng thái', STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status],
                        ['Thời gian', new Date(selectedOrder.createdAt).toLocaleString('vi-VN')],
                        ['Ghi chú', selectedOrder.notes || 'Không có'],
                      ].map(([k, v]) => (
                        <div className="detail-row" key={k}><span>{k}</span><strong>{v}</strong></div>
                      ))}
                    </div>

                    <h4>🍽️ Món đã gọi</h4>
                    <div className="items-list">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="item-detail">
                          <div>{item.menu?.name || item.menuId} × {item.quantity}</div>
                          <div>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                        </div>
                      ))}
                    </div>

                    <div className="detail-box" style={{ marginTop: 10 }}>
                      <div className="detail-row total">
                        <span>Tổng cộng</span>
                        <strong>{selectedOrder.total?.toLocaleString('vi-VN')}đ</strong>
                      </div>
                    </div>

                    <div className="action-buttons">
                      {selectedOrder.status === 'PENDING' && (
                        <button className="btn btn-success" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'CONFIRMED')} disabled={updatingOrderId === selectedOrder._id}>
                          ✔️ Xác nhận
                        </button>
                      )}
                      {selectedOrder.status === 'CONFIRMED' && (
                        <button className="btn btn-warning" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'PREPARING')} disabled={updatingOrderId === selectedOrder._id}>
                          🍳 Bắt đầu nấu
                        </button>
                      )}
                      {selectedOrder.status === 'PREPARING' && (
                        <button className="btn btn-info" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'READY')} disabled={updatingOrderId === selectedOrder._id}>
                          ✅ Sẵn sàng
                        </button>
                      )}
                      {selectedOrder.status === 'READY' && (
                        <button className="btn btn-primary" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'DELIVERED')} disabled={updatingOrderId === selectedOrder._id}>
                          📦 Giao hàng
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">← Chọn một đơn hàng để xem chi tiết</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== HISTORY ===== */}
        {activeTab === 'history' && (
          <div className="history-container">
            <div className="history-header">
              <h2>📜 Lịch sử đơn hàng — Tất cả đơn hàng</h2>
              <div className="history-filters">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="status-filter"
                >
                  <option value="PENDING">⏳ Chờ xử lý</option>
                  <option value="CONFIRMED">✅ Đã xác nhận</option>
                  <option value="PREPARING">👨‍🍳 Đang chuẩn bị</option>
                  <option value="READY">📦 Sẵn sàng</option>
                  <option value="DELIVERED">🚚 Đã giao</option>
                  <option value="COMPLETED">✔️ Hoàn thành</option>
                  <option value="CANCELLED">❌ Hủy</option>
                </select>
              </div>
            </div>

            {processedOrders.length === 0 ? (
              <div className="empty-history">
                <p>📭 Không có đơn hàng nào</p>
              </div>
            ) : (
              <div className="orders-list">
                {processedOrders.map(order => (
                  <div key={order._id} className="order-history-item">
                    <div className="order-header">
                      <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                      <span className={`order-status status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                      <span className="order-time">
                        {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><strong>Bàn:</strong> {order.tableNumber || 'Mang về'}</p>
                      <p><strong>Địa chỉ:</strong> {order.deliveryAddress || 'Dùng tại chỗ'}</p>
                      <p><strong>Khách:</strong> {order.user?.fullName || 'Khách lẻ'}</p>
                      <p><strong>Số lượng:</strong> {order.items?.length || 0} món</p>
                      <p><strong>Tổng:</strong> {order.total?.toLocaleString('vi-VN')} ₫</p>
                      <p>
                        <strong>Thanh toán:</strong> 
                        <span className={`payment-badge payment-${(order.paymentStatus || 'UNPAID').toLowerCase()}`}>
                          {order.paymentStatus === 'PAID' && '✅ Đã thanh toán'}
                          {order.paymentStatus === 'PARTIAL' && '⚠️ Thanh toán một phần'}
                          {order.paymentStatus === 'UNPAID' && '❌ Chưa thanh toán'}
                          {order.paymentStatus === 'REFUNDED' && '🔄 Đã hoàn tiền'}
                          {!order.paymentStatus && '❓ Không xác định'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffPOS