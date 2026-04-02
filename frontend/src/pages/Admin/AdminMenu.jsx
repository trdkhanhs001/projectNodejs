import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminMenu.css'

function AdminMenu() {
  const [menuList, setMenuList] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    price: '',
    category: ''
  })

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  // State cho modal xem chi tiết
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingMenu, setViewingMenu] = useState(null)

  useEffect(() => {
    fetchCategoryList()
    fetchMenuList()
  }, [])

  // ================= FETCH =================
  const fetchCategoryList = async () => {
    try {
      const res = await apiClient.get('/category')
      setCategoryList(res.data)
      // Set default category to first category if available
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, category: res.data[0]._id }))
      }
    } catch (err) {
      console.error('❌ Lỗi tải danh mục:', err)
    }
  }

  const fetchMenuList = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/menu')
      setMenuList(res.data)
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // ================= INPUT =================
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result)
    reader.readAsDataURL(file)
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      return alert('⚠️ Vui lòng nhập đầy đủ thông tin!')
    }

    if (formData.price <= 0) {
      return alert('⚠️ Giá phải lớn hơn 0')
    }

    try {
      setSubmitting(true)

      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('ingredients', formData.ingredients)
      data.append('price', formData.price)
      data.append('category', formData.category)

      if (imageFile) {
        data.append('image', imageFile)
      }

      if (editingId) {
        // Update
        await apiClient.put(`/menu/${editingId}`, data)
        alert('✅ Cập nhật món thành công!')
      } else {
        // Create
        await apiClient.post('/menu', data)
        alert('✅ Thêm món thành công!')
      }

      resetForm()
      fetchMenuList()

    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ingredients: '',
      price: '',
      category: categoryList.length > 0 ? categoryList[0]._id : ''
    })
    setImageFile(null)
    setPreviewUrl(null)
    setEditingId(null)
    setShowForm(false)
  }

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa món này?')) return

    try {
      await apiClient.delete(`/menu/${id}`)
      alert('✅ Xóa thành công!')
      fetchMenuList()
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    }
  }

  // ================= VIEW =================
  const handleView = (menu) => {
    setViewingMenu(menu)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setViewingMenu(null)
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  // ================= UI =================
  return (
    <AdminLayout>
      <div className="admin-menu">

        {/* HEADER */}
        <div className="menu-header">
          <h2>Quản lý Menu</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (showForm) {
                resetForm()
              } else {
                setShowForm(true)
              }
            }}
          >
            {showForm ? '❌ Hủy' : '➕ Thêm Món Ăn'}
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="card form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editingId ? '✏️ Chỉnh sửa Món Ăn' : '➕ Thêm Món Ăn Mới'}</h3>
              {editingId && (
                <span style={{ 
                  backgroundColor: '#3498db', 
                  color: 'white', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Chế độ chỉnh sửa
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="menu-form">

              <div className="form-row">
                <div className="form-group">
                  <label>Tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoryList.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Nguyên liệu</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="VD: Cà chua, hành tây, tỏi, ..."
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh {editingId && '(Để trống nếu không cần thay đổi)'}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange} 
                />
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                    {editingId && imageFile && (
                      <p style={{ marginTop: '5px', fontSize: '12px', color: '#27ae60', textAlign: 'center' }}>
                        ✓ Ảnh mới sẽ thay thế ảnh hiện tại
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : (editingId ? '💾 Cập nhật' : '💾 Thêm mới')}
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  🚫 Hủy
                </button>
              </div>

            </form>
          </div>
        )}

        {/* LIST */}
        <div className="card">
          <h3>Danh sách ({menuList.length})</h3>

          {menuList.length === 0 ? (
            <p>Chưa có món</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Món</th>
                  <th>Danh mục</th>
                  <th>Nguyên liệu</th>
                  <th>Giá</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {menuList.map(item => (
                  <tr key={item._id}>
                    <td>
                      <img 
                        src={item.image || 'https://via.placeholder.com/50'} 
                        alt={item.name}
                        className="table-thumbnail"
                      />
                    </td>
                    <td>
                      <div className="menu-cell">
                        <strong>{item.name}</strong>
                        <small style={{ color: '#7f8c8d', display: 'block', marginTop: '4px' }}>
                          {item.description}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{item.category?.name || '—'}</span>
                    </td>
                    <td>
                      <small style={{ wordBreak: 'break-word' }}>
                        {(item.ingredients || '—').substring(0, 50)}
                        {(item.ingredients?.length || 0) > 50 ? '...' : ''}
                      </small>
                    </td>
                    <td>
                      <strong style={{ color: '#e74c3c', fontSize: '15px' }}>
                        {item.price?.toLocaleString()} đ
                      </strong>
                    </td>
                    <td className="action-cell">
                      <button 
                        className="btn btn-tiny btn-info"
                        onClick={() => handleView(item)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn btn-tiny btn-secondary"
                        onClick={() => {
                          setFormData({
                            name: item.name,
                            description: item.description,
                            ingredients: item.ingredients || '',
                            price: item.price,
                            category: item.category._id
                          });
                          setPreviewUrl(item.image);
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-tiny btn-danger"
                        onClick={() => handleDelete(item._id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        {/* Modal xem chi tiết món ăn */}
        {showViewModal && viewingMenu && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🍽️ Chi tiết Món Ăn</h3>
                <button 
                  className="btn-close"
                  onClick={closeViewModal}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {/* Image Section */}
                <div className="menu-image-section">
                  {viewingMenu.image ? (
                    <img 
                      src={viewingMenu.image} 
                      alt={viewingMenu.name}
                      className="menu-image-large"
                    />
                  ) : (
                    <div className="menu-image-large menu-image-placeholder">
                      <span style={{ fontSize: '60px' }}>🍽️</span>
                    </div>
                  )}
                  <h2 className="menu-name">{viewingMenu.name}</h2>
                </div>

                {/* Price Section */}
                <div className="menu-price-section">
                  <p className="menu-price-large">{viewingMenu.price?.toLocaleString()} đ</p>
                  <span className="menu-category-badge">{viewingMenu.category?.name || '—'}</span>
                </div>

                {/* Info Section */}
                <div className="menu-info-detail">
                  <div className="info-item">
                    <label>📝 Mô tả</label>
                    <div className="info-value">
                      {viewingMenu.description || '—'}
                    </div>
                  </div>

                  <div className="info-item">
                    <label>🥘 Nguyên liệu</label>
                    <div className="info-value">
                      {viewingMenu.ingredients || '—'}
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <label>⏱️ Thời gian nấu</label>
                      <div className="info-value">{viewingMenu.preparationTime || '15'} phút</div>
                    </div>

                    <div className="info-item">
                      <label>🔥 Calo</label>
                      <div className="info-value">{viewingMenu.calories || '—'} kcal</div>
                    </div>

                    <div className="info-item">
                      <label>⭐ Đánh giá</label>
                      <div className="info-value">{viewingMenu.rating || '0'} / 5.0</div>
                    </div>

                    <div className="info-item">
                      <label>📊 Bán được</label>
                      <div className="info-value">{viewingMenu.quantitySold || '0'} cái</div>
                    </div>
                  </div>

                  <div className="info-features">
                    {viewingMenu.isVegan && (
                      <span className="feature-badge vegan">🌿 Ăn chay</span>
                    )}
                    {viewingMenu.isSpicy && (
                      <span className="feature-badge spicy">🌶️ Cay</span>
                    )}
                    {viewingMenu.isPopular && (
                      <span className="feature-badge popular">⭐ Nổi tiếng</span>
                    )}
                    {viewingMenu.isActive ? (
                      <span className="feature-badge active">✓ Hoạt động</span>
                    ) : (
                      <span className="feature-badge inactive">✗ Tắt</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={closeViewModal}
                >
                  ✕ Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminMenu