// Trang Quản lý Staff - thêm, sửa, xóa nhân viên
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminStaff.css'

function AdminStaff() {
  // State cho danh sách staff
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(false)

  // State cho form thêm mới/ chỉnh sửa
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: 'WAITER',
    salary: '',
    address: ''
  })

  // State cho file avatar
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // State cho modal xem chi tiết
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingStaff, setViewingStaff] = useState(null)

  // Lấy danh sách staff khi component mount
  useEffect(() => {
    fetchStaffList()
  }, [])

  // Gọi API lấy danh sách staff
  const fetchStaffList = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/staff')
      setStaffList(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching staff:', err)
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.config?.headers
      })
      alert('Lỗi: ' + (err.response?.data?.message || err.message))
      setLoading(false)
    }
  }

  // Xử lý thay đổi input form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Xử lý chọn file avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Avatar file selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      setAvatarFile(file)
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
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('position', formData.position)
      formDataToSend.append('salary', formData.salary)
      formDataToSend.append('address', formData.address)

      if (avatarFile) {
        console.log('Appending avatar file to FormData:', {
          name: avatarFile.name,
          size: avatarFile.size,
          type: avatarFile.type
        })
        formDataToSend.append('avatar', avatarFile)
      } else {
        console.log('⚠️ No avatar file selected')
      }

      // Nếu đang sửa
      if (editingId) {
        console.log('Updating staff:', editingId)
        await apiClient.patch(`/staff/${editingId}`, formDataToSend)
        alert('✅ Cập nhật nhân viên thành công!')
      } else {
        // Thêm mới
        console.log('Creating new staff')
        await apiClient.post('/staff', formDataToSend)
        alert('✅ Thêm nhân viên thành công!')
      }

      resetForm()
      fetchStaffList()
    } catch (err) {
      console.error('Error:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    }
  }

  // Sửa staff - điền dữ liệu vào form
  const handleEdit = (staff) => {
    setFormData({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      position: staff.position,
      salary: staff.salary,
      address: staff.address || ''
    })
    setEditingId(staff._id)
    if (staff.avatar) {
      setPreviewUrl(staff.avatar)
    }
    setAvatarFile(null)
    setShowForm(true)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      position: 'WAITER',
      salary: '',
      address: ''
    })
    setAvatarFile(null)
    setPreviewUrl(null)
    setEditingId(null)
    setShowForm(false)
  }

  // Xóa staff
  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa nhân viên này?')) {
      try {
        await apiClient.delete(`/staff/${id}`)
        alert('✅ Xóa thành công!')
        fetchStaffList()
      } catch (err) {
        alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  // Xem chi tiết staff
  const handleView = (staff) => {
    console.log('Viewing staff:', staff)
    console.log('Avatar URL:', staff.avatar)
    setViewingStaff(staff)
    setShowViewModal(true)
  }

  // Đóng modal xem chi tiết
  const closeViewModal = () => {
    setShowViewModal(false)
    setViewingStaff(null)
  }

  if (loading && staffList.length === 0) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-staff">
        <div className="staff-header">
          <h2>Quản lý Nhân viên</h2>
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
            {showForm ? '❌ Hủy' : '➕ Thêm Nhân viên'}
          </button>
        </div>

        {/* Form thêm mới/ chỉnh sửa */}
        {showForm && (
          <div className="card form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editingId ? '✏️ Chỉnh sửa Nhân viên' : '➕ Thêm Nhân viên Mới'}</h3>
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
            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Vị trí *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="WAITER">Bồi bàn</option>
                    <option value="CHEF">Đầu bếp</option>
                    <option value="CASHIER">Thu ngân</option>
                    <option value="MANAGER">Quản lý</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lương *</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="form-group">
                <label>Avatar {editingId && '(Để trống nếu không cần thay đổi)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                {previewUrl && (
                  <div className="avatar-preview">
                    <img src={previewUrl} alt="Preview" />
                    {editingId && avatarFile && (
                      <p style={{ marginTop: '5px', fontSize: '12px', color: '#27ae60', textAlign: 'center' }}>
                        ✓ Ảnh mới sẽ thay thế ảnh hiện tại
                      </p>
                    )}
                  </div>
                )}
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

        {/* Danh sách staff */}
        <div className="card">
          <h3>Danh sách Nhân viên ({staffList.length})</h3>
          {staffList.length === 0 ? (
            <p>Chưa có nhân viên nào</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Vị trí</th>
                  <th>Lương</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff._id}>
                    <td>{staff.fullName}</td>
                    <td>{staff.email}</td>
                    <td>{staff.phone}</td>
                    <td>{staff.position}</td>
                    <td>{staff.salary?.toLocaleString('vi-VN')} đ</td>
                    <td className="action-cell">
                      <button 
                        className="btn btn-small btn-info"
                        onClick={() => handleView(staff)}
                      >
                        👁️ Xem
                      </button>
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(staff)}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(staff._id)}
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

        {/* Modal xem chi tiết nhân viên */}
        {showViewModal && viewingStaff && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>👤 Chi tiết Nhân viên</h3>
                <button 
                  className="btn-close"
                  onClick={closeViewModal}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {/* Avatar Section */}
                <div className="staff-avatar-section">
                  {viewingStaff.avatar ? (
                    <img 
                      src={viewingStaff.avatar} 
                      alt={viewingStaff.fullName}
                      className="staff-avatar-large"
                    />
                  ) : (
                    <div className="staff-avatar-large staff-avatar-placeholder">
                      <span style={{ fontSize: '60px' }}>👤</span>
                    </div>
                  )}
                  <h2 className="staff-name">{viewingStaff.fullName}</h2>
                  <div className="position-badge">
                    {viewingStaff.position === 'WAITER' && '🪑 Bồi bàn'}
                    {viewingStaff.position === 'CHEF' && '👨‍🍳 Đầu bếp'}
                    {viewingStaff.position === 'CASHIER' && '💳 Thu ngân'}
                    {viewingStaff.position === 'MANAGER' && '📊 Quản lý'}
                  </div>
                </div>

                {/* Info Section */}
                <div className="staff-info-section">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>📧 Email</label>
                      <div className="info-value">{viewingStaff.email}</div>
                    </div>
                    <div className="info-item">
                      <label>📱 Số điện thoại</label>
                      <div className="info-value">{viewingStaff.phone}</div>
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <label>💰 Lương</label>
                      <div className="info-value salary">
                        {viewingStaff.salary?.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div className="info-item">
                      <label>📍 Địa chỉ</label>
                      <div className="info-value">
                        {viewingStaff.address || '—'}
                      </div>
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

export default AdminStaff
