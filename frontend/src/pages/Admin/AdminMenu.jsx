import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminMenu.css'

function AdminMenu() {
  // State Management
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState([])
  
  // Form States
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true
  })

  // Fetch menus and categories
  useEffect(() => {
    fetchCategories()
    fetchMenus()
  }, [currentPage, searchQuery, categoryFilter])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10
      }
      if (searchQuery) params.search = searchQuery
      if (categoryFilter) params.category = categoryFilter

      const response = await apiClient.get('/admin/menus', { params })
      setMenus(response.data.menus)
      setTotalPages(response.data.pages)
    } catch (err) {
      console.error('Error fetching menus:', err)
      alert('Lỗi load menu')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/category')
      setCategories(response.data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
        isAvailable: formData.isAvailable
      }

      if (editingMenu) {
        await apiClient.put(`/admin/menus/${editingMenu._id}`, data)
        alert('Cập nhật menu thành công')
      } else {
        await apiClient.post('/admin/menus', data)
        alert('Thêm menu thành công')
      }

      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isAvailable: true
      })
      setCurrentPage(1)
      fetchMenus()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xử lý')
    }
  }

  // Handle delete
  const handleDelete = async (menuId) => {
    if (!confirm('Bạn chắc chắn muốn xóa menu này?')) return

    try {
      await apiClient.delete(`/admin/menus/${menuId}`)
      alert('Xóa menu thành công')
      fetchMenus()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa')
    }
  }

  // Handle edit
  const handleEdit = (menu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      category: menu.category,
      image: menu.image,
      isAvailable: menu.isAvailable
    })
    setShowForm(true)
  }

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMenu(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true
    })
  }

  return (
    <AdminLayout>
      <div className="admin-menu">
        <div className="menu-header">
          <h2>🍽️ Quản Lý Menu</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Thêm Menu
          </button>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm menu..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="search-input"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="search-input"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Menu Table */}
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="menu-table-container">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Mô tả</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map(menu => (
                    <tr key={menu._id}>
                      <td>
                        <img 
                          src={menu.image || '🍽️'} 
                          alt={menu.name}
                          className="menu-thumb"
                          onError={(e) => e.target.textContent = '🍽️'}
                        />
                      </td>
                      <td><strong>{menu.name}</strong></td>
                      <td>{menu.category}</td>
                      <td><strong style={{color: '#e74c3c'}}>{parseFloat(menu.price).toLocaleString('vi-VN')} đ</strong></td>
                      <td>{menu.description || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleEdit(menu)}
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(menu._id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="btn btn-sm"
                >
                  ← Trước
                </button>
                <span>Trang {currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="btn btn-sm"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={handleCloseForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingMenu ? '✏️ Sửa Menu' : '➕ Thêm Menu'}</h3>
                <button className="btn-close" onClick={handleCloseForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="menu-form">
                <div className="form-group">
                  <label>Tên Menu *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ví dụ: Cơm, Mì, Nước"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá (đ) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Hình ảnh URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    Có sẵn
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingMenu ? 'Cập Nhật' : 'Thêm'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminMenu
