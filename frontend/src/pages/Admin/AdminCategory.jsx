// Điềm Quản lý Danh mục - thêm, sửa, xóa danh mục
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import showToast from '../../utils/toast'
import { useAuth } from '../../contexts/AuthContext'
import './AdminCommon.css'
import './AdminCategory.css'

function AdminCategory() {
  const { user } = useAuth()
  
  // Debug: Log user info
  useEffect(() => {
    console.log('AdminCategory - Current user:', user)
  }, [user])
  
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
      showToast('Lỗi tải danh mục: ' + (err.response?.data?.message || err.message), 'error')
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
        formDataToSend.append('image', imageFile)
      }

      // Nếu đang sửa
      if (editingId) {
        await apiClient.put(`/category/${editingId}`, formDataToSend)
        showToast('Đơn vị cập nhật thành công', 'success')
      } else {
        // Thêm mới
        await apiClient.post('/category', formDataToSend)
        showToast('Đơn vị thêm mới thành công', 'success')
      }

      resetForm()
      fetchCategoryList()
    } catch (err) {
      console.error('Error:', err)
      showToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error')
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
        {/* Header */}
        <div className="category-header">
          <h2>📁 Quản Lý Danh Mục</h2>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Thêm Danh Mục
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
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="category-table-container">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên Danh Mục</th>
                    <th>Mô Tả</th>
                    <th>Thứ Tự</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryList.length === 0 ? (
                    <tr><td colSpan="6" className="empty-row">Không tìm thấy danh mục nào</td></tr>
                  ) : (
                    categoryList.map(category => (
                      <tr key={category._id}>
                        <td>
                          {category.image
                            ? <img src={category.image} alt={category.name} className="cat-thumb" onError={(e) => { e.target.style.display='none' }} />
                            : <div className="cat-thumb-placeholder">📁</div>
                          }
                        </td>
                        <td><strong>{category.name}</strong></td>
                        <td className="cat-desc">{category.description || '—'}</td>
                        <td>{category.displayOrder}</td>
                        <td>
                          <span className={`status-badge ${category.isActive ? 'available' : 'unavailable'}`}>
                            {category.isActive ? '✓ Hoạt động' : '✗ Tắt'}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button className="action-btn view-btn" onClick={() => handleView(category)} title="Xem chi tiết">👁️</button>
                            <button className="action-btn edit-btn" onClick={() => handleEdit(category)} title="Sửa">✏️</button>
                            <button className="action-btn del-btn" onClick={() => handleDelete(category._id)} title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal xem chi tiết danh mục */}
        {showViewModal && viewingCategory && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-box modal-view" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>📁 Chi Tiết Danh Mục</h3>
                <button className="close-btn" onClick={closeViewModal}>✕</button>
              </div>

              <div className="view-content">
                {viewingCategory.image && (
                  <div className="view-image">
                    <img src={viewingCategory.image} alt={viewingCategory.name} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="view-details">
                  <div className="detail-row">
                    <span className="detail-label">Tên Danh Mục:</span>
                    <span className="detail-value"><strong>{viewingCategory.name}</strong></span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Thứ Tự:</span>
                    <span className="detail-value">{viewingCategory.displayOrder}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mô Tả:</span>
                    <span className="detail-value">{viewingCategory.description || '(Không có mô tả)'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng Thái:</span>
                    <span className={`detail-value status-badge ${viewingCategory.isActive ? 'available' : 'unavailable'}`}>
                      {viewingCategory.isActive ? '✓ Hoạt động' : '✗ Tắt'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-edit" onClick={() => { closeViewModal(); handleEdit(viewingCategory); }}>
                  ✏️ Sửa
                </button>
                <button className="btn-cancel" onClick={closeViewModal}>
                  Đóng
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
