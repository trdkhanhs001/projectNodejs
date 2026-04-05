import { useNavigate } from 'react-router-dom'
import UserHeader from '../components/UserHeader'
import { useCart } from '../contexts/CartContext'
import showToast from '../utils/toast'

function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  const handleQuantityChange = (menuId, newQuantity) => {
    let qty = parseInt(newQuantity) || 0
    // Prevent 0 or negative quantities
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
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🛒 Giỏ hàng của bạn</h1>
          {cartItems.length > 0 && (
            <p className="text-gray-600 mt-2">
              {getTotalItems()} món | {getTotalPrice().toLocaleString()} đ
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <main className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-600 mb-6">Chưa có sản phẩm nào trong giỏ hàng</p>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  onClick={() => navigate('/')}
                >
                  ➜ Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Sản phẩm</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">Đơn giá</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">Số lượng</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">Tổng cộng</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {cartItems.map(item => (
                        <tr key={item._id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || 'https://via.placeholder.com/60'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.description || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center font-semibold text-gray-900">
                            {item.price?.toLocaleString()} đ
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2 w-fit mx-auto">
                              <button
                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold transition"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                className="w-12 text-center border border-gray-300 rounded py-1 font-semibold"
                              />
                              <button
                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold transition"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center font-bold text-purple-600">
                            {(item.price * item.quantity).toLocaleString()} đ
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                              onClick={() => removeFromCart(item._id)}
                              title="Xóa khỏi giỏ"
                            >
                              🗑️ Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden divide-y">
                  {cartItems.map(item => (
                    <div key={item._id} className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.price?.toLocaleString()} đ</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm font-bold"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            className="w-10 text-center border border-gray-300 rounded py-1 text-sm"
                          />
                          <button
                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm font-bold"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">
                            {(item.price * item.quantity).toLocaleString()} đ
                          </p>
                          <button
                            className="text-red-600 hover:text-red-700 text-xs font-semibold mt-1"
                            onClick={() => removeFromCart(item._id)}
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

          {/* Cart Summary Sidebar */}
          {cartItems.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="space-y-4 sticky top-24">
                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Tóm tắt đơn hàng</h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Số lượng:</span>
                      <strong className="text-gray-900">{getTotalItems()} món</strong>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-gray-600 mb-2">
                        <span>Thực tế:</span>
                        <strong className="text-gray-900">{getTotalItems()} sản phẩm</strong>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Tổng cộng:</span>
                        <strong className="text-2xl text-purple-600">
                          {getTotalPrice().toLocaleString()} đ
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all mb-3"
                    onClick={handleCheckout}
                  >
                    💳 Thanh toán
                  </button>

                  <button
                    className="w-full px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                    onClick={() => navigate('/')}
                  >
                    ➜ Tiếp tục mua sắm
                  </button>
                </div>

                {/* Promo Code */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="font-bold text-gray-900 mb-3">🎁 Mã khuyến mãi</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã khuyến mãi"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                    <button className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition">
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

export default Cart
