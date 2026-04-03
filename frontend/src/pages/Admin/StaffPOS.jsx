import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './StaffPOS.css'

function StaffPOS() {
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // POS State
  const [posOrder, setPosOrder] = useState({
    tableNumber: 1,
    items: [],
    notes: '',
    paymentMethod: 'CASH'
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Load menus and categories
  useEffect(() => {
    fetchMenusAndCategories()
  }, [])

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

  // Filter menus
  const getFilteredMenus = () => {
    let filtered = menus

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.categoryId === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  // Add item to order
  const addItemToOrder = (menu) => {
    const existingItem = posOrder.items.find(item => item.menuId === menu._id)

    if (existingItem) {
      // Increase quantity
      setPosOrder(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.menuId === menu._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }))
    } else {
      // Add new item
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

  // Update item quantity
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

  // Remove item from order
  const removeItemFromOrder = (menuId) => {
    setPosOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.menuId !== menuId)
    }))
  }

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = posOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = calculateTotals()

  // Submit order
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

      // Create order
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

      // Reset order
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

  // Clear order
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
          <h2>🏪 Hệ Thống POS - Quán Ăn Trực Tiếp</h2>
        </div>

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
                    {menu.image && (
                      <img src={menu.image} alt={menu.name} className="menu-image" />
                    )}
                    {!menu.image && (
                      <div className="menu-image-placeholder">
                        <span>🍗</span>
                      </div>
                    )}
                    <div className="menu-info">
                      <h4>{menu.name}</h4>
                      <p className="menu-price">{menu.price.toLocaleString()}đ</p>
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
      </div>
    </AdminLayout>
  )
}

export default StaffPOS
