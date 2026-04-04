import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import showToast from '../../utils/toast'
import './AdminCommon.css'
import './AdminStaff.css'

function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingStaffId, setUploadingStaffId] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [viewingStaff, setViewingStaff] = useState(null)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    position: 'WAITER',
    salary: '',
    address: ''
  })

  useEffect(() => {
    fetchStaff()
  }, [currentPage, searchQuery])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, limit: 10 }
      if (searchQuery) params.search = searchQuery
      const response = await apiClient.get('/staff', { params })
      setStaff(response.data.staff || [])
      setTotalPages(response.data.pages || 1)
    } catch (err) {
      showToast('Lỗi tải danh sách nhân viên: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.phone || !formData.position || !formData.salary) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning')
      return
    }
    try {
      if (editingStaff) {
        await apiClient.patch(`/staff/${editingStaff._id}`, formData)
        showToast('Cập nhật nhân viên thành công', 'success')
      } else {
        await apiClient.post('/staff', formData)
        showToast('Thêm nhân viên thành công', 'success')
      }
      setShowForm(false)
      resetForm()
      setCurrentPage(1)
      fetchStaff()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xử lý', 'error')
    }
  }

  const handleDelete = async (staffId) => {
    if (!confirm('Bạn chắc chắn muốn xóa nhân viên này?')) return
    try {
      await apiClient.delete(`/staff/${staffId}`)
      showToast('Xóa nhân viên thành công', 'success')
      fetchStaff()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa', 'error')
    }
  }

  const handleView = (s) => { setViewingStaff(s); setShowViewModal(true) }

  const handleEdit = (s) => {
    setEditingStaff(s)
    setFormData({
      email: s.email,
      fullName: s.fullName,
      phone: s.phone || '',
      position: s.position || 'WAITER',
      salary: s.salary || '',
      address: s.address || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ email: '', fullName: '', phone: '', position: 'WAITER', salary: '', address: '' })
    setEditingStaff(null)
  }

  // Image upload handlers
  const openUploadModal = (staffMember) => {
    setUploadingStaffId(staffMember._id)
    setViewingStaff(staffMember)
    setShowUploadModal(true)
    setUploadPreview(null)
    setUploadingFile(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp ảnh', 'warning')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh không được vượt quá 5MB', 'warning')
      return
    }

    setUploadingFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!uploadingFile) {
      showToast('Vui lòng chọn ảnh để upload', 'warning')
      return
    }

    try {
      setUploadLoading(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', uploadingFile)

      const response = await apiClient.post(`/upload/staff/${uploadingStaffId}`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      showToast('Upload ảnh thành công', 'success')
      setShowUploadModal(false)
      setUploadingFile(null)
      setUploadPreview(null)
      fetchStaff()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi upload ảnh', 'error')
    } finally {
      setUploadLoading(false)
    }
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setUploadingFile(null)
    setUploadPreview(null)
    setUploadingStaffId(null)
  }

  const handleCloseForm = () => { setShowForm(false); resetForm() }

  const positionLabel = (pos) => {
    const map = { WAITER: 'Phục Vụ', CHEF: 'Đầu Bếp', CASHIER: 'Thu Ngân', MANAGER: 'Quản Lý' }
    return map[pos] || pos
  }

  const positionColor = (pos) => {
    const map = { WAITER: 'pos-waiter', CHEF: 'pos-chef', CASHIER: 'pos-cashier', MANAGER: 'pos-manager' }
    return map[pos] || ''
  }

  return (
    <AdminLayout>
      <div className="admin-staff">

        {/* Header */}
        <div className="staff-header">
          <div className="staff-title">
            <span className="staff-title-icon">💼</span>
            <div>
              <h2>Quản Lý Nhân Viên</h2>
              <p className="staff-subtitle">{staff.length} nhân viên trong hệ thống</p>
            </div>
          </div>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <span>＋</span> Thêm Nhân Viên
          </button>
        </div>

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="staff-table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên Đầy Đủ</th>
                    <th>Email</th>
                    <th>Điện Thoại</th>
                    <th>Chức Vụ</th>
                    <th>Ngày Tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-row">Không tìm thấy nhân viên nào</td>
                    </tr>
                  ) : (
                    staff.map((s, idx) => (
                      <tr key={s._id}>
                        <td className="row-num">{(currentPage - 1) * 10 + idx + 1}</td>
                        <td>
                          <div className="staff-name-cell">
                            <div className="avatar">{s.fullName?.charAt(0).toUpperCase()}</div>
                            <strong>{s.fullName}</strong>
                          </div>
                        </td>
                        <td className="text-muted">{s.email}</td>
                        <td>{s.phone || '—'}</td>
                        <td>
                          <span className={`pos-badge ${positionColor(s.position)}`}>
                            {positionLabel(s.position)}
                          </span>
                        </td>
                        <td className="text-muted">
                          {new Date(s.createdAt || s.startDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <div className="action-group">
                            <button className="action-btn view-btn" onClick={() => handleView(s)} title="Xem">👁️</button>
                            <button className="action-btn upload-btn" onClick={() => openUploadModal(s)} title="Upload ảnh">📷</button>
                            <button className="action-btn edit-btn" onClick={() => handleEdit(s)} title="Sửa">✏️</button>
                            <button className="action-btn del-btn" onClick={() => handleDelete(s._id)} title="Xóa">🗑️</button>
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

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={handleCloseForm}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>{editingStaff ? '✏️ Sửa Nhân Viên' : '➕ Thêm Nhân Viên'}</h3>
                <button className="close-btn" onClick={handleCloseForm}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Email <span className="req">*</span></label>
                    <input type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required disabled={!!editingStaff} />
                  </div>
                  <div className="form-field">
                    <label>Tên Đầy Đủ <span className="req">*</span></label>
                    <input type="text" value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Điện Thoại <span className="req">*</span></label>
                    <input type="tel" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required pattern="[0-9]{10,11}" />
                  </div>
                  <div className="form-field">
                    <label>Chức Vụ <span className="req">*</span></label>
                    <select value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })} required>
                      <option value="WAITER">Phục Vụ</option>
                      <option value="CHEF">Đầu Bếp</option>
                      <option value="CASHIER">Thu Ngân</option>
                      <option value="MANAGER">Quản Lý</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Lương <span className="req">*</span></label>
                    <input type="number" value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })} required min="0" />
                  </div>
                  <div className="form-field">
                    <label>Địa Chỉ</label>
                    <input type="text" value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit">{editingStaff ? 'Cập Nhật' : 'Thêm Mới'}</button>
                  <button type="button" className="btn-cancel" onClick={handleCloseForm}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewingStaff && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-box modal-view" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>👤 Thông Tin Nhân Viên</h3>
                <button className="close-btn" onClick={() => setShowViewModal(false)}>✕</button>
              </div>
              <div className="view-body">
                <div className="view-avatar">
                  {viewingStaff.avatar ? (
                    <img src={viewingStaff.avatar} alt={viewingStaff.fullName} className="avatar-img" />
                  ) : (
                    <div className="avatar-lg">{viewingStaff.fullName?.charAt(0).toUpperCase()}</div>
                  )}
                  <h3>{viewingStaff.fullName}</h3>
                  <span className={`pos-badge ${positionColor(viewingStaff.position)}`}>
                    {positionLabel(viewingStaff.position)}
                  </span>
                  <button className="btn-upload-small" onClick={() => { setShowViewModal(false); openUploadModal(viewingStaff) }}>
                    📷 Cập Nhật Ảnh
                  </button>
                </div>
                <div className="view-grid">
                  {[
                    { label: '📧 Email', value: viewingStaff.email },
                    { label: '📞 Điện Thoại', value: viewingStaff.phone || '—' },
                    { label: '💰 Lương', value: viewingStaff.salary ? viewingStaff.salary.toLocaleString('vi-VN') + ' đ' : '—' },
                    { label: '🏠 Địa Chỉ', value: viewingStaff.address || '—' },
                    { label: '📅 Ngày Tuyển', value: new Date(viewingStaff.startDate || viewingStaff.createdAt).toLocaleDateString('vi-VN') },
                  ].map((item, i) => (
                    <div className="view-item" key={i}>
                      <span className="view-label">{item.label}</span>
                      <span className="view-value">{item.value}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-cancel full-width" onClick={() => setShowViewModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Image Modal */}
        {showUploadModal && uploadingStaffId && (
          <div className="modal-overlay" onClick={closeUploadModal}>
            <div className="modal-box modal-upload" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>📸 Upload Ảnh Nhân Viên</h3>
                <button className="close-btn" onClick={closeUploadModal}>✕</button>
              </div>
              <div className="upload-content">
                <div 
                  className="upload-dropzone" 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadPreview ? (
                    <div className="upload-preview">
                      <img src={uploadPreview} alt="Preview" />
                      <button type="button" className="btn-change" onClick={() => { setUploadPreview(null); setUploadingFile(null) }}>
                        Chọn ảnh khác
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="dropzone-icon">📁</div>
                      <p className="dropzone-text">Kéo ảnh vào đây hoặc</p>
                      <label className="btn-select-file">
                        Chọn tệp
                        <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                      </label>
                      <p className="dropzone-hint">Hỗ trợ: JPG, PNG, GIF (Max 5MB)</p>
                    </>
                  )}
                </div>
                <div className="upload-actions">
                  <button 
                    type="button" 
                    className="btn-submit" 
                    onClick={handleUpload}
                    disabled={!uploadPreview || uploadLoading}
                  >
                    {uploadLoading ? 'Đang upload...' : '✅ Upload'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={closeUploadModal}
                    disabled={uploadLoading}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

export default AdminStaff