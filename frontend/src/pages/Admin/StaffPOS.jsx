import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminCommon.css'
import './StaffPOS.css'

function StaffPOS() {
  // Tab State
  const [activeTab, setActiveTab] = useState('create') // 'create', 'process', 'history'

  // Shared States
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Order State
  const [posOrder, setPosOrder] = useState({
    tableNumber: 1,
    items: [],
    notes: '',
    paymentMethod: 'CASH'
  })

  // Process Order States
  const [pendingOrders, setPendingOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  })
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [processedOrders, setProcessedOrders] = useState([])
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // Load menus, categories, and pending orders
  useEffect(() => {
    fetchMenusAndCategories()
    if (activeTab === 'process' || activeTab === 'history') {
      fetchPendingOrders()
      fetchOrderStats()
    }
  }, [activeTab])

  const fetchMenusAndCategories = async () => {
    try {
      setLoading(true)
      const [menusRes, categoriesRes] = await Promise.all([
        apiClient.get('/menu'),
        apiClient.get('/category')
      ])
      setMenus(menusRes.data)
      setCategories([{ _id: 'all', name: 'Tất cả' }, ...categoriesRes.data])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      setLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const res = await apiClient.get(`/order/filter/status?status=${filterStatus}`)
      setProcessedOrders(res.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    }
  }

  const fetchOrderStats = async () => {
    try {
      const res = await apiClient.get('/order/stats/dashboard')
      setOrderStats(res.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  // Refresh orders when filter changes
  useEffect(() => {
    if (activeTab === 'process' || activeTab === 'history') {
      fetchPendingOrders()
    }
  }, [filterStatus])

  // ===================== CREATE ORDER FUNCTIONS =====================

  const getFilteredMenus = () => {
    let filtered = menus

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => {
        // Handle both ObjectId and string comparison
        const catId = typeof m.category === 'object' ? m.category?._id : m.category
        return catId === selectedCategory
      })
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const addItemToOrder = (menu) => {
    const existingItem = posOrder.items.find(item => item.menuId === menu._id)

    if (existingItem) {
      setPosOrder(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.menuId === menu._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }))
    } else {
      setPosOrder(prev => ({
        ...prev,
        items: [...prev.items, {
          menuId: menu._id,
          name: menu.name,
          price: menu.price,
          quantity: 1
        }]
      }))
    }
  }

  const updateItemQuantity = (menuId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(menuId)
      return
    }

    setPosOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.menuId === menuId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }))
  }

  const removeItemFromOrder = (menuId) => {
    setPosOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.menuId !== menuId)
    }))
  }

  const calculateTotals = () => {
    const subtotal = posOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = calculateTotals()

  const handleSubmitOrder = async () => {
    if (posOrder.items.length === 0) {
      alert('⚠️ Vui lòng thêm ít nhất một món ăn')
      return
    }

    if (!posOrder.tableNumber) {
      alert('⚠️ Vui lòng chọn bàn')
      return
    }

    try {
      setLoading(true)

      const orderPayload = {
        orderType: 'DINE_IN',
        tableNumber: parseInt(posOrder.tableNumber),
        guestInfo: {
          phone: null,
          email: null,
          name: null
        },
        items: posOrder.items.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity
        })),
        notes: posOrder.notes || null,
        paymentMethod: posOrder.paymentMethod,
        deliveryAddress: null,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'PENDING',
        paymentStatus: 'UNPAID'
      }

      const response = await apiClient.post('/order/guest', orderPayload)

      alert('✅ Đơn hàng được tạo thành công! Đơn #' + response.data.orderNumber)

      setPosOrder({
        tableNumber: 1,
        items: [],
        notes: '',
        paymentMethod: 'CASH'
      })

      setLoading(false)
    } catch (err) {
      console.error('Error creating order:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      setLoading(false)
    }
  }

  const handleClearOrder = () => {
    if (window.confirm('Bạn chắc chắn muốn xóa tất cả?')) {
      setPosOrder({
        tableNumber: 1,
        items: [],
        notes: '',
        paymentMethod: 'CASH'
      })
    }
  }

  // ===================== PROCESS ORDER FUNCTIONS =====================

  const handleConfirmOrder = async (orderId) => {
    try {
      setUpdatingOrderId(orderId)
      await apiClient.put(`/order/${orderId}/status`, { status: 'CONFIRMED' })
      alert('✅ Đơn hàng đã được xác nhận')
      fetchPendingOrders()
      fetchOrderStats()
      setSelectedOrder(null)
      setUpdatingOrderId(null)
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      setUpdatingOrderId(null)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      await apiClient.put(`/order/${orderId}/status`, { status: newStatus })
      alert(`✅ Đơn hàng đã cập nhật sang ${newStatus}`)
      fetchPendingOrders()
      fetchOrderStats()
      setSelectedOrder(null)
      setUpdatingOrderId(null)
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      setUpdatingOrderId(null)
    }
  }

  const translateStatus = (status) => {
    const map = {
      PENDING: '⏳ Chờ xác nhận',
      CONFIRMED: '✔️ Đã xác nhận',
      PREPARING: '🍳 Đang chuẩn bị',
      READY: '✅ Sẵn sàng',
      DELIVERING: '🚚 Đang giao',
      DELIVERED: '📦 Đã giao',
      CANCELLED: '❌ Đã hủy'
    }
    return map[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#ffc107',
      CONFIRMED: '#17a2b8',
      PREPARING: '#ff6b6b',
      READY: '#28a745',
      DELIVERED: '#6c757d',
      CANCELLED: '#dc3545'
    }
    return colors[status] || '#6c757d'
  }

  // ===================== LOADING & RENDERING =====================

  if (loading && menus.length === 0) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  const filteredMenus = getFilteredMenus()

  return (
    <AdminLayout>
      <div className="staff-pos">
        <div className="pos-header">
          <h2>🏪 Hệ Thống POS - Quản Lý Bàn</h2>
        </div>

        {/* Tab Navigation */}
        <div className="pos-tabs">
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            📝 Tạo Đơn Hàng
          </button>
          <button
            className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            🔄 Xử Lý Đơn ({orderStats.pending})
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 Lịch Sử
          </button>
        </div>

        {/* CREATE ORDER TAB */}
        {activeTab === 'create' && (
          <div className="pos-container">
          {/* Menu Section */}
          <div className="pos-menu-section">
            <div className="menu-controls">
              <div className="search-group">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm món ăn..."
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
                  <div
                    key={menu._id}
                    className="menu-card"
                    onClick={() => addItemToOrder(menu)}
                  >
                    <div className="menu-img-wrapper">
                      {menu.image && (
                        <img src={menu.image} alt={menu.name} className="menu-image" onError={(e) => e.target.style.display='none'} />
                      )}
                      {!menu.image && (
                        <div className="menu-image-placeholder">🍗</div>
                      )}
                      <div className="menu-badges">
                        {menu.isVegan && <span className="badge vegan">🌱 Vegan</span>}
                        {menu.isSpicy && <span className="badge spicy">🌶️ Cay</span>}
                      </div>
                    </div>
                    <div className="menu-info">
                      <h4 className="menu-name">{menu.name}</h4>
                      <p className="menu-description">{menu.description}</p>
                      <div className="menu-meta">
                        {menu.preparationTime && <span className="meta-item">⏱️ {menu.preparationTime}min</span>}
                        {menu.calories && <span className="meta-item">🔥 {menu.calories}cal</span>}
                      </div>
                      <div className="menu-footer">
                        <span className="menu-price">{menu.price.toLocaleString()}đ</span>
                        <button className="add-btn">+ Thêm</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="pos-order-section">
            {/* Table Selection */}
            <div className="order-box">
              <h3>📍 Bàn</h3>
              <div className="table-selector">
                <select
                  value={posOrder.tableNumber}
                  onChange={(e) => setPosOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                  className="table-input"
                >
                  {Array.from({ length: 20 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Bàn {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Items */}
            <div className="order-box">
              <h3>🛍️ Đơn Hàng ({posOrder.items.length})</h3>

              <div className="order-items">
                {posOrder.items.length === 0 ? (
                  <div className="empty-order">Chưa có món nào</div>
                ) : (
                  posOrder.items.map(item => (
                    <div key={item.menuId} className="order-item">
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">{item.price.toLocaleString()}đ</div>
                      </div>

                      <div className="item-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateItemQuantity(item.menuId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateItemQuantity(item.menuId, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => removeItemFromOrder(item.menuId)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="item-total">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="order-box">
              <h3>📝 Ghi Chú</h3>
              <textarea
                value={posOrder.notes}
                onChange={(e) => setPosOrder(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ghi chú đơn hàng (không cay, thêm nước...)"
                className="notes-input"
                rows="3"
              ></textarea>
            </div>

            {/* Payment Method */}
            <div className="order-box">
              <h3>💳 Thanh Toán</h3>
              <select
                value={posOrder.paymentMethod}
                onChange={(e) => setPosOrder(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="payment-select"
              >
                <option value="CASH">💵 Tiền mặt</option>
                <option value="CARD">💳 Thẻ tín dụng</option>
                <option value="ONLINE">📱 Thanh toán online</option>
              </select>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString()}đ</span>
              </div>
              <div className="summary-row">
                <span>Thuế (10%):</span>
                <span>{tax.toLocaleString()}đ</span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pos-actions">
              <button
                className="btn btn-primary"
                onClick={handleSubmitOrder}
                disabled={loading || posOrder.items.length === 0}
              >
                ✓ Tạo Đơn Hàng
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleClearOrder}
                disabled={posOrder.items.length === 0}
              >
                Xóa Tất Cả
              </button>
            </div>
          </div>
        </div>
        )}

        {/* PROCESS ORDERS TAB */}
        {activeTab === 'process' && (
          <div className="process-container">
            <div className="process-header">
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-number">{orderStats.pending}</div>
                  <div className="stat-label">Chờ Xác Nhận</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{orderStats.confirmed}</div>
                  <div className="stat-label">Đã Xác Nhận</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{orderStats.preparing}</div>
                  <div className="stat-label">Đang Chuẩn Bị</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{orderStats.ready}</div>
                  <div className="stat-label">Sẵn Sàng</div>
                </div>
              </div>
            </div>

            <div className="filter-section">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="PENDING">⏳ Chờ Xác Nhận</option>
                <option value="CONFIRMED">✔️ Đã Xác Nhận</option>
                <option value="PREPARING">🍳 Đang Chuẩn Bị</option>
                <option value="READY">✅ Sẵn Sàng</option>
              </select>
            </div>

            <div className="process-layout">
              <div className="orders-list">
                <h3>📋 Danh Sách Đơn</h3>
                {processedOrders.length === 0 ? (
                  <div className="empty-state">Không có đơn hàng nào</div>
                ) : (
                  processedOrders.map(order => (
                    <div
                      key={order._id}
                      className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="order-card-header">
                        <div className="order-number">#{order.orderNumber}</div>
                        <div
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {translateStatus(order.status)}
                        </div>
                      </div>
                      <div className="order-card-body">
                        <div>📍 Bàn: {order.tableNumber || 'N/A'}</div>
                        <div>🕐 {new Date(order.createdAt).toLocaleTimeString()}</div>
                        <div>💰 {order.total.toLocaleString()}đ</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="order-detail">
                {selectedOrder ? (
                  <>
                    <h3>📦 Chi Tiết Đơn</h3>
                    <div className="detail-box">
                      <div className="detail-row">
                        <span>Mã Đơn:</span>
                        <strong>{selectedOrder.orderNumber}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Bàn:</span>
                        <strong>{selectedOrder.tableNumber}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Trạng Thái:</span>
                        <strong
                          style={{ color: getStatusColor(selectedOrder.status) }}
                        >
                          {translateStatus(selectedOrder.status)}
                        </strong>
                      </div>
                      <div className="detail-row">
                        <span>Thời Gian:</span>
                        <strong>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Ghi Chú:</span>
                        <strong>{selectedOrder.notes || 'Không có'}</strong>
                      </div>
                    </div>

                    <h4>🍽️ Các Món</h4>
                    <div className="items-list">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="item-detail">
                          <div>{item.menu?.name} x {item.quantity}</div>
                          <div>{(item.price * item.quantity).toLocaleString()}đ</div>
                        </div>
                      ))}
                    </div>

                    <div className="detail-box">
                      <div className="detail-row total">
                        <span>Tổng Cộng:</span>
                        <strong>{selectedOrder.total.toLocaleString()}đ</strong>
                      </div>
                    </div>

                    <div className="action-buttons">
                      {selectedOrder.status === 'PENDING' && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleConfirmOrder(selectedOrder._id)}
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          ✔️ Xác Nhận Đơn
                        </button>
                      )}
                      {selectedOrder.status === 'CONFIRMED' && (
                        <button
                          className="btn btn-warning"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'PREPARING')}
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          🍳 Bắt Đầu Chuẩn Bị
                        </button>
                      )}
                      {selectedOrder.status === 'PREPARING' && (
                        <button
                          className="btn btn-info"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'READY')}
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          ✅ Sẵn Sàng
                        </button>
                      )}
                      {selectedOrder.status === 'READY' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'DELIVERED')}
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          📦 Giao Hàng
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">Chọn một đơn hàng để xem chi tiết</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="history-container">
            <h3>📊 Lịch Sử Đơn Hàng</h3>
            <div className="history-list">
              {processedOrders.length === 0 ? (
                <div className="empty-state">Không có đơn hàng nào</div>
              ) : (
                processedOrders.map(order => (
                  <div key={order._id} className="history-card">
                    <div className="history-header">
                      <span className="order-id">#{order.orderNumber}</span>
                      <span
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {translateStatus(order.status)}
                      </span>
                    </div>
                    <div className="history-body">
                      <div>📍 Bàn: {order.tableNumber || 'N/A'}</div>
                      <div>🕐 {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                      <div>💰 {order.total.toLocaleString()}đ</div>
                      <div>🍽️ {order.items?.length || 0} món</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default StaffPOS
