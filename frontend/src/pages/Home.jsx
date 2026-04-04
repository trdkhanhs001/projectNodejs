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
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const { addToCart, getTotalItems } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => { fetchData() }, [])

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
      console.error('Lỗi tải dữ liệu:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMenu = useMemo(() => {
    let filtered = menuList
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category?._id === selectedCategory)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.ingredients?.toLowerCase().includes(term)
      )
    }
    return filtered
  }, [menuList, selectedCategory, searchTerm])

  const handleAddToCart = (menuItem) => {
    const previousTotal = getTotalItems()
    addToCart(menuItem, 1)
    showNotification(`Đã thêm "${menuItem.name}"`)
    if (previousTotal === 0 && !isAuthenticated) {
      setTimeout(() => setShowCheckoutModal(true), 500)
    }
  }

  const showNotification = (message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 2500)
  }

  return (
    <div className="home-page">
      <UserHeader />

      <CheckoutOptionsModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
      />

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className="notification">✓ {n.message}</div>
        ))}
      </div>

      <div className="home-container">
        {/* Hero */}
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">Chào mừng đến với</span>
            <h1>Nhà Hàng ABC</h1>
            <p>Đồ ăn ngon, phục vụ tận tình — Trải nghiệm ẩm thực tuyệt vời mỗi ngày</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Món ăn</span>
              </div>
              <div className="stat">
                <span className="stat-number">1K+</span>
                <span className="stat-label">Khách hàng</span>
              </div>
              <div className="stat">
                <span className="stat-number">5 ⭐</span>
                <span className="stat-label">Đánh giá</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/hero-food.jpg"
              alt="Món ăn ngon"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        </section>

        <div className="menu-content">
          {/* Featured */}
          {menuList.length > 0 && (
            <section className="featured-section">
              <h2>⭐ Món Ăn Nổi Bật</h2>
              <div className="featured-grid">
                {menuList.slice(0, 4).map(item => (
                  <div
                    key={item._id}
                    className="featured-card"
                    onClick={() => handleAddToCart(item)}
                  >
                    <div className="featured-image">
                      <img
                        src={item.image || '/no-image.png'}
                        alt={item.name}
                        onError={(e) => (e.target.src = '/no-image.png')}
                      />
                    </div>
                    <div className="featured-info">
                      <h3>{item.name}</h3>
                      <p className="featured-price">{item.price?.toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Search */}
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
          </div>

          {/* Category sidebar */}
          <aside className="category-filter">
            <h3>Danh mục</h3>

            <button
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Tất cả
              <span className="cat-count">{menuList.length}</span>
            </button>

            {categoryList.map(cat => {
              const count = menuList.filter(i => i.category?._id === cat._id).length
              return (
                <button
                  key={cat._id}
                  className={`category-btn ${selectedCategory === cat._id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat._id)}
                >
                  {cat.name}
                  <span className="cat-count">{count}</span>
                </button>
              )
            })}
          </aside>

          {/* Menu grid */}
          <main className="menu-grid-section">
            <div className="menu-header">
              <h2>
                {selectedCategory
                  ? categoryList.find(c => c._id === selectedCategory)?.name
                  : 'Tất cả món'}
              </h2>
              <span className="item-count">{filteredMenu.length} món</span>
            </div>

            {loading ? (
              <div className="loading">Đang tải thực đơn...</div>
            ) : filteredMenu.length === 0 ? (
              <div className="empty-state">Không tìm thấy món nào phù hợp</div>
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
                          🛒 Thêm vào giỏ
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
                          {item.ingredients.slice(0, 50)}{item.ingredients.length > 50 && '...'}
                        </p>
                      )}

                      <div className="menu-footer">
                        <span className="menu-price">
                          {item.price?.toLocaleString('vi-VN')} đ
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