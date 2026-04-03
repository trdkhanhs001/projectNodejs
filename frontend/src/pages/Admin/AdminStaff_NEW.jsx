import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminStaff.css'

function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Form States
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })

  // Fetch staff
  useEffect(() => {
    fetchStaff()
  }, [currentPage, searchQuery])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        role: 'STAFF'
      }
      if (searchQuery) params.search = searchQuery

      const response = await apiClient.get('/admin/users', { params })
      setStaff(response.data.users)
      setTotalPages(response.data.pages)
    } catch (err) {
      console.error('Error fetching staff:', err)
      alert('Lỗi load danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }

  // Handle create/update
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      if (editingStaff) {
        const { password, ...updateData } = formData
        await apiClient.put(`/admin/users/${editingStaff._id}`, updateData)
        alert('Cập nhật nhân viên thành công')
      } else {
        if (!formData.password) {
          alert('Vui lòng nhập mật khẩu')
          return
        }
        const staffData = { ...formData, role: 'STAFF' }
        await apiClient.post('/admin/users', staffData)
        alert('Thêm nhân viên thành công')
      }
      
      setShowForm(false)
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: ''
      })
      setCurrentPage(1)
      fetchStaff()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xử lý')
    }
  }

  // Handle delete
  const handleDelete = async (staffId) => {
    if (!confirm('Bạn chắc chắn muốn xóa nhân viên này?')) return

    try {
      await apiClient.delete(`/admin/users/${staffId}`)
      alert('Xóa nhân viên thành công')
      fetchStaff()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa')
    }
  }

  // Handle edit
  const handleEdit = (s) => {
    setEditingStaff(s)
    setFormData({
      username: s.username,
      email: s.email,
      password: '',
      fullName: s.fullName,
      phone: s.phone || ''
    })
    setShowForm(true)
  }

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStaff(null)
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: ''
    })
  }

  return (
    <AdminLayout>
      <div className="admin-staff">
        <div className="staff-header">
          <h2>💼 Quản Lý Nhân Viên</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Thêm Nhân Viên
          </button>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm nhân viên..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="search-input"
          />
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="staff-table-container">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Tên Đăng Nhập</th>
                    <th>Tên Đầy Đủ</th>
                    <th>Email</th>
                    <th>Điện Thoại</th>
                    <th>Ngày Tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s._id}>
                      <td><strong>{s.username}</strong></td>
                      <td>{s.fullName}</td>
                      <td>{s.email}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleEdit(s)}
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(s._id)}
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
                <h3>{editingStaff ? '✏️ Sửa Nhân Viên' : '➕ Thêm Nhân Viên'}</h3>
                <button className="btn-close" onClick={handleCloseForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-group">
                  <label>Tên Đăng Nhập *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!!editingStaff}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {!editingStaff && (
                  <div className="form-group">
                    <label>Mật Khẩu *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength="6"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Tên Đầy Đủ *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Điện Thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingStaff ? 'Cập Nhật' : 'Thêm'}
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

export default AdminStaff
