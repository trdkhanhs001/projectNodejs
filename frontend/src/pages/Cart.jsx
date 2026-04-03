import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import { useCart } from '../contexts/CartContext'
import './Cart.css'

function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  const handleQuantityChange = (menuId, newQuantity) => {
    const qty = parseInt(newQuantity) || 0
    updateQuantity(menuId, qty)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('⚠️ Giỏ hàng trống!')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="cart-page">
      <UserHeader />

      <div className="cart-container">
        {/* Page Title */}
        <div className="cart-header">
          <h1>🛒 Giỏ hàng của bạn</h1>
          {cartItems.length > 0 && (
            <p className="cart-summary">
              {getTotalItems()} món | {getTotalPrice().toLocaleString()} đ
            </p>
          )}
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <main className="cart-items-section">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <h2>Giỏ hàng trống</h2>
                <p>Chưa có sản phẩm nào trong giỏ hàng</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  ➜ Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="cart-table">
                <div className="cart-table-header">
                  <div className="col-product">Sản phẩm</div>
                  <div className="col-price">Đơn giá</div>
                  <div className="col-quantity">Số lượng</div>
                  <div className="col-total">Tổng cộng</div>
                  <div className="col-action">Hành động</div>
                </div>

                <div className="cart-table-body">
                  {cartItems.map(item => (
                    <div key={item._id} className="cart-item">
                      {/* Product */}
                      <div className="col-product">
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>{item.description || '—'}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-price">
                        <strong>{item.price?.toLocaleString()} đ</strong>
                      </div>

                      {/* Quantity */}
                      <div className="col-quantity">
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            className="qty-input"
                          />
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-total">
                        <strong className="total-price">
                          {(item.price * item.quantity).toLocaleString()} đ
                        </strong>
                      </div>

                      {/* Action */}
                      <div className="col-action">
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => removeFromCart(item._id)}
                          title="Xóa khỏi giỏ"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Cart Summary Sidebar */}
          {cartItems.length > 0 && (
            <aside className="cart-summary-section">
              <div className="summary-card">
                <h3>📋 Tóm tắt đơn hàng</h3>

                <div className="summary-row">
                  <span>Số lượng:</span>
                  <strong>{getTotalItems()} món</strong>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span>Thực tế:</span>
                  <strong>{getTotalItems()} sản phẩm</strong>
                </div>

                <div className="summary-row">
                  <span>Tổng cộng:</span>
                  <strong className="total-amount">
                    {getTotalPrice().toLocaleString()} đ
                  </strong>
                </div>

                <button
                  className="btn btn-success btn-checkout"
                  onClick={handleCheckout}
                >
                  💳 Thanh toán
                </button>

                <button
                  className="btn btn-secondary btn-continue"
                  onClick={() => navigate('/')}
                >
                  ➜ Tiếp tục mua sắm
                </button>
              </div>

              {/* Promo Code */}
              <div className="promo-card">
                <h4>🎁 Mã khuyến mãi</h4>
                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Nhập mã khuyến mãi"
                    className="promo-field"
                  />
                  <button className="btn btn-small">Áp dụng</button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart
