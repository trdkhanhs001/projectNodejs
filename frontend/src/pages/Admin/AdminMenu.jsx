import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import showToast from '../../utils/toast'
import './AdminCommon.css'
import './AdminMenu.css'

function AdminMenu() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState([])
  const searchTimeout = useRef(null)

  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingMenu, setViewingMenu] = useState(null)
  const [formData, setFormData] = useState({
    name: '', description: '', price: '',
    category: '', image: '', isAvailable: true
  })

  useEffect(() => {
    fetchCategories()
    fetchMenus()
  }, [currentPage, debouncedSearch, categoryFilter])

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, limit: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      if (categoryFilter) params.category = categoryFilter
      const response = await apiClient.get('/admin/menus', { params })
      setMenus(response.data.menus)
      setTotalPages(response.data.pages)
    } catch (err) {
      showToast('Lỗi tải menu', 'error')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.category) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warning')
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
        showToast('Cập nhật menu thành công', 'success')
      } else {
        await apiClient.post('/admin/menus', data)
        showToast('Thêm menu thành công', 'success')
      }
      handleCloseForm()
      setCurrentPage(1)
      fetchMenus()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xử lý', 'error')
    }
  }

  const handleDelete = async (menuId) => {
    if (!confirm('Bạn chắc chắn muốn xóa menu này?')) return
    try {
      await apiClient.delete(`/admin/menus/${menuId}`)
      showToast('Xóa menu thành công', 'success')
      fetchMenus()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa', 'error')
    }
  }

  const handleEdit = (menu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      category: menu.category?._id || menu.category || '',
      image: menu.image || '',
      isAvailable: menu.isAvailable
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMenu(null)
    setFormData({ name: '', description: '', price: '', category: '', image: '', isAvailable: true })
  }

  const handleView = (menu) => {
    setViewingMenu(menu)
    setShowViewModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setViewingMenu(null)
  }

  return (
    <AdminLayout>
      <div className="admin-menu">

        {/* Header */}
        <div className="menu-header">
          <h2>🍽️ Quản Lý Menu</h2>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <span>＋</span> Thêm Menu
          </button>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="menu-table-container">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên Món</th>
                    <th>Danh Mục</th>
                    <th>Giá</th>
                    <th>Mô Tả</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.length === 0 ? (
                    <tr><td colSpan="6" className="empty-row">Không tìm thấy món nào</td></tr>
                  ) : (
                    menus.map(menu => (
                      <tr key={menu._id}>
                        <td>
                          {menu.image
                            ? <img src={menu.image} alt={menu.name} className="menu-thumb" onError={(e) => { e.target.style.display='none' }} />
                            : <div className="menu-thumb-placeholder">🍽️</div>
                          }
                        </td>
                        <td className="menu-name-cell"><strong>{menu.name}</strong></td>
                        <td>
                          <span className="cat-badge">
                            {menu.category?.name || menu.category || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="menu-price">
                            {parseFloat(menu.price).toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td>
                          <span className="menu-desc">{menu.description || '—'}</span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button className="action-btn view-btn" onClick={() => handleView(menu)} title="Xem chi tiết">👁️</button>
                            <button className="action-btn edit-btn" onClick={() => handleEdit(menu)} title="Sửa">✏️</button>
                            <button className="action-btn del-btn" onClick={() => handleDelete(menu._id)} title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">← Trước</button>
                <span className="page-info">Trang {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">Sau →</button>
              </div>
            )}
          </>
        )}

        {/* View Modal */}
        {showViewModal && viewingMenu && (
          <div className="modal-overlay" onClick={handleCloseViewModal}>
            <div className="modal-box modal-view" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>👁️ Chi Tiết Menu</h3>
                <button className="close-btn" onClick={handleCloseViewModal}>✕</button>
              </div>

              <div className="view-content">
                {viewingMenu.image && (
                  <div className="view-image">
                    <img src={viewingMenu.image} alt={viewingMenu.name} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="view-details">
                  <div className="detail-row">
                    <span className="detail-label">Tên Món:</span>
                    <span className="detail-value">{viewingMenu.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Danh Mục:</span>
                    <span className="detail-value cat-badge">
                      {viewingMenu.category?.name || viewingMenu.category || '—'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Giá:</span>
                    <span className="detail-value price-value">
                      {parseFloat(viewingMenu.price).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mô Tả:</span>
                    <span className="detail-value">{viewingMenu.description || '(Không có mô tả)'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng Thái:</span>
                    <span className={`detail-value status-badge ${viewingMenu.isAvailable ? 'available' : 'unavailable'}`}>
                      {viewingMenu.isAvailable ? '✓ Đang có sẵn' : '✕ Không có sẵn'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-edit" onClick={() => { handleCloseViewModal(); handleEdit(viewingMenu); }}>
                  ✏️ Sửa
                </button>
                <button className="btn-cancel" onClick={handleCloseViewModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={handleCloseForm}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>{editingMenu ? '✏️ Sửa Menu' : '➕ Thêm Menu'}</h3>
                <button className="close-btn" onClick={handleCloseForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="menu-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Tên món <span className="req">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Bò Kobe"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Danh mục <span className="req">*</span></label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Giá (đ) <span className="req">*</span></label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Hình ảnh URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {formData.image && (
                  <div className="img-preview">
                    <img src={formData.image} alt="preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}

                <div className="form-field full-width">
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả món ăn..."
                    rows="3"
                  />
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Món đang có sẵn
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingMenu ? 'Cập Nhật' : 'Thêm Mới'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={handleCloseForm}>
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