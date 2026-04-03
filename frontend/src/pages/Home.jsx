import { useState, useEffect, useMemo } from 'react'
import UserHeader from '../components/UserHeader'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import CheckoutOptionsModal from '../components/CheckoutOptionsModal'
import apiClient from '../utils/apiClient'
import './Home.css'

function Home() {
  const [menuList, setMenuList] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const { addToCart, getTotalItems } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, menuRes] = await Promise.all([
        apiClient.get('/category'),
        apiClient.get('/menu')
      ])
      setCategoryList(categoriesRes.data)
      setMenuList(menuRes.data)
    } catch (err) {
      console.error('❌ Lỗi tải dữ liệu:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Tối ưu filter (tránh lag)
  const filteredMenu = useMemo(() => {
    if (!selectedCategory) return menuList
    return menuList.filter(item => item.category?._id === selectedCategory)
  }, [menuList, selectedCategory])

  const handleAddToCart = (menuItem) => {
    const previousTotal = getTotalItems()
    addToCart(menuItem, 1)
    showNotification(`✅ Đã thêm "${menuItem.name}"`)
    
    // Nếu giỏ trướ đó trống (first item) và user chưa login -> show checkout options
    if (previousTotal === 0 && !isAuthenticated) {
      setTimeout(() => {
        setShowCheckoutModal(true)
      }, 500)
    }
  }

  const showNotification = (message) => {
    const id = Date.now()

    setNotifications(prev => [...prev, { id, message }])

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 2500)
  }

  return (
    <div className="home-page">
      <UserHeader />

      {/* Checkout Options Modal */}
      <CheckoutOptionsModal 
        isOpen={showCheckoutModal} 
        onClose={() => setShowCheckoutModal(false)}
      />

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className="notification">
            {n.message}
          </div>
        ))}
      </div>

      <div className="home-container">
        {/* Hero */}
        <section className="hero-banner">
          <div className="hero-content">
            <h1>🍽️ Chào mừng đến nhà hàng</h1>
            <p>Ăn là ghiền 😎</p>
          </div>
        </section>

        <div className="menu-content">
          {/* Category */}
          <aside className="category-filter">
            <h3>📂 Danh mục</h3>

            <button
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Tất cả ({menuList.length})
            </button>

            {categoryList.map(cat => {
              const count = menuList.filter(i => i.category?._id === cat._id).length
              return (
                <button
                  key={cat._id}
                  className={`category-btn ${selectedCategory === cat._id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat._id)}
                >
                  {cat.name} ({count})
                </button>
              )
            })}
          </aside>

          {/* Menu */}
          <main className="menu-grid-section">
            <div className="menu-header">
              <h2>
                {selectedCategory
                  ? categoryList.find(c => c._id === selectedCategory)?.name
                  : 'Tất cả món'}
              </h2>
              <p className="item-count">{filteredMenu.length} món</p>
            </div>

            {loading ? (
              <div className="loading">⏳ Đang tải...</div>
            ) : filteredMenu.length === 0 ? (
              <div className="empty-state">
                😐 Không có món nào
              </div>
            ) : (
              <div className="menu-grid">
                {filteredMenu.map(item => (
                  <div key={item._id} className="menu-card">
                    <div className="menu-card-image">
                      <img
                        src={item.image || '/no-image.png'}
                        alt={item.name}
                        onError={(e) => (e.target.src = '/no-image.png')}
                      />

                      <div className="menu-card-overlay">
                        <button
                          className="btn-add-cart"
                          onClick={() => handleAddToCart(item)}
                        >
                          🛒 Thêm
                        </button>
                      </div>
                    </div>

                    <div className="menu-card-info">
                      <h3>{item.name}</h3>

                      <p className="menu-description">
                        {item.description || 'Không có mô tả'}
                      </p>

                      {item.ingredients && (
                        <p className="menu-ingredients">
                          📦 {item.ingredients.slice(0, 40)}
                          {item.ingredients.length > 40 && '...'}
                        </p>
                      )}

                      <div className="menu-footer">
                        <span className="menu-price">
                          {item.price?.toLocaleString()} đ
                        </span>
                        <span className="menu-category">
                          {item.category?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Home