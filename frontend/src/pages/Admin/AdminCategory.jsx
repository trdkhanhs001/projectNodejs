// Trang Quản lý Danh mục - thêm, sửa, xóa danh mục
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminCategory.css'

function AdminCategory() {
  // State cho danh sách danh mục
  const [categoryList, setCategoryList] = useState([])
  const [loading, setLoading] = useState(false)

  // State cho form thêm mới/chỉnh sửa
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '0',
    image: '',
    isActive: true
  })

  // State cho modal xem chi tiết
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingCategory, setViewingCategory] = useState(null)

  // State cho file ảnh
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    fetchCategoryList()
  }, [])

  // Gọi API lấy danh sách danh mục
  const fetchCategoryList = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/category')
      setCategoryList(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching categories:', err)
      alert('Lỗi: ' + (err.response?.data?.message || err.message))
      setLoading(false)
    }
  }

  // Xử lý thay đổi input form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Xử lý chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Category image selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      setImageFile(file)
      // Tạo preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('displayOrder', formData.displayOrder)
      formDataToSend.append('isActive', formData.isActive)

      if (imageFile) {
        console.log('Appending image file to FormData:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        })
        formDataToSend.append('image', imageFile)
      }

      // Nếu đang sửa
      if (editingId) {
        console.log('Updating category:', editingId)
        await apiClient.put(`/category/${editingId}`, formDataToSend)
        alert('✅ Cập nhật danh mục thành công!')
      } else {
        // Thêm mới
        console.log('Creating new category')
        await apiClient.post('/category', formDataToSend)
        alert('✅ Thêm danh mục thành công!')
      }

      resetForm()
      fetchCategoryList()
    } catch (err) {
      console.error('Error:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayOrder: '0',
      image: '',
      isActive: true
    })
    setImageFile(null)
    setPreviewUrl(null)
    setEditingId(null)
    setShowForm(false)
  }

  // Sửa danh mục - điền dữ liệu vào form
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || '0',
      image: category.image || '',
      isActive: category.isActive
    })
    setEditingId(category._id)
    if (category.image) {
      setPreviewUrl(category.image)
    }
    setImageFile(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Xóa danh mục
  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
      try {
        await apiClient.delete(`/category/${id}`)
        alert('✅ Xóa thành công!')
        fetchCategoryList()
      } catch (err) {
        alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  // Xem chi tiết danh mục
  const handleView = (category) => {
    setViewingCategory(category)
    setShowViewModal(true)
  }

  // Đóng modal xem chi tiết
  const closeViewModal = () => {
    setShowViewModal(false)
    setViewingCategory(null)
  }

  if (loading && categoryList.length === 0) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-category">
        <div className="category-header">
          <h2>Quản lý Danh mục</h2>
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
            {showForm ? '❌ Hủy' : '➕ Thêm Danh mục'}
          </button>
        </div>

        {/* Form thêm mới/chỉnh sửa */}
        {showForm && (
          <div className="card form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editingId ? '✏️ Chỉnh sửa Danh mục' : '➕ Thêm Danh mục Mới'}</h3>
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
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên danh mục *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Món khai vị"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả danh mục"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Ảnh danh mục {editingId && '(Để trống nếu không cần thay đổi)'}</label>
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

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{ width: 'auto' }}
                  />
                  <span>Kích hoạt danh mục</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  💾 Lưu
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

        {/* Danh sách danh mục */}
        <div className="card">
          <h3>Danh sách Danh mục ({categoryList.length})</h3>
          {categoryList.length === 0 ? (
            <p>Chưa có danh mục nào</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categoryList.map(category => (
                  <tr key={category._id}>
                    <td><strong>{category.name}</strong></td>
                    <td>{category.description || '—'}</td>
                    <td>{category.displayOrder}</td>
                    <td>
                      <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? '✓ Hoạt động' : '✗ Tắt'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button 
                        className="btn btn-small btn-info"
                        onClick={() => handleView(category)}
                      >
                        👁️ Xem
                      </button>
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(category)}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(category._id)}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal xem chi tiết danh mục */}
        {showViewModal && viewingCategory && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📁 Chi tiết Danh mục</h3>
                <button 
                  className="btn-close"
                  onClick={closeViewModal}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {/* Image Section */}
                <div className="category-image-section">
                  {viewingCategory.image ? (
                    <img 
                      src={viewingCategory.image} 
                      alt={viewingCategory.name}
                      className="category-image-large"
                    />
                  ) : (
                    <div className="category-image-large category-image-placeholder">
                      <span style={{ fontSize: '60px' }}>🏷️</span>
                    </div>
                  )}
                  <h2 className="category-name">{viewingCategory.name}</h2>
                  <div className="status-info">
                    {viewingCategory.isActive ? (
                      <span className="status-badge active">✓ Hoạt động</span>
                    ) : (
                      <span className="status-badge inactive">✗ Tắt</span>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="category-info-section">
                  <div className="info-item">
                    <label>📝 Mô tả</label>
                    <div className="info-value">
                      {viewingCategory.description || '—'}
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <label>🔢 Thứ tự hiển thị</label>
                      <div className="info-value">{viewingCategory.displayOrder}</div>
                    </div>
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

export default AdminCategory
