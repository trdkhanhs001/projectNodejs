import { useState, useEffect } from 'react'
import AdminLayout from '../components/Admin/AdminLayout'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import showToast from '../utils/toast'

export default function AdminDiscounts() {
  const { user, isAuthenticated } = useAuth()
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [pagination, setPagination] = useState(null)

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    description: '',
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchDiscounts()
    }
  }, [isAuthenticated, user, page])

  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/discount', { params: { page, limit: 10 } })
      setDiscounts(res.data?.data || [])
      setPagination(res.data?.pagination)
    } catch (err) {
      showToast('Không thể tải danh sách khuyến mãi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.code.trim()) {
      showToast('Mã khuyến mãi không được để trống', 'warning')
      return
    }

    try {
      setLoading(true)
      await apiClient.post('/discount', {
        ...formData,
        value: parseFloat(formData.value),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      })

      showToast('✅ Tạo khuyến mãi thành công', 'success')
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        description: '',
        minOrderAmount: 0,
        maxDiscountAmount: '',
        usageLimit: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      setShowForm(false)
      setPage(1)
      fetchDiscounts()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi tạo khuyến mãi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (discountId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa khuyến mãi này?')) return

    try {
      await apiClient.delete(`/discount/${discountId}`)
      showToast('✅ Xóa khuyến mãi thành công', 'success')
      fetchDiscounts()
    } catch (err) {
      showToast('Lỗi xóa khuyến mãi', 'error')
    }
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-bold">Chỉ Admin mới có quyền truy cập</p>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">🎟️ Quản Lý Khuyến Mãi</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {showForm ? '✕ Đóng' : '+ Thêm Khuyến Mãi'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tạo Khuyến Mãi Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Mã Khuyến Mãi *</label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="VD: WELCOME20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Loại *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="PERCENTAGE">Phần Trăm (%)</option>
                    <option value="FIXED">Cố Định (đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Giá Trị *</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Số Lần Dùng Tối Đa</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Để trống = Không giới hạn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Đơn Hàng Tối Thiểu (đ)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Giảm Tối Đa (đ)</label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleChange}
                      placeholder="Để trống = Không giới hạn"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2">Ngày Bắt Đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Ngày Kết Thúc *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mô Tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả khuyến mãi"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? '⏳ Tạo...' : 'Tạo Khuyến Mãi'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">⏳ Đang tải...</p>
        ) : discounts.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có khuyến mãi nào</p>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Mã</th>
                  <th className="px-6 py-3 text-left font-semibold">Loại</th>
                  <th className="px-6 py-3 text-left font-semibold">Giá Trị</th>
                  <th className="px-6 py-3 text-left font-semibold">Dùng/Giới Hạn</th>
                  <th className="px-6 py-3 text-left font-semibold">Trạng Thái</th>
                  <th className="px-6 py-3 text-center font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 font-bold">{d.code}</td>
                    <td className="px-6 py-3">{d.type === 'PERCENTAGE' ? '%' : 'đ'}</td>
                    <td className="px-6 py-3 font-semibold">{d.value}</td>
                    <td className="px-6 py-3">
                      {d.usedCount}/{d.usageLimit || 'Unlimited'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        d.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        d.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex gap-2 justify-center">
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  page === p ? 'bg-purple-500 text-white' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
