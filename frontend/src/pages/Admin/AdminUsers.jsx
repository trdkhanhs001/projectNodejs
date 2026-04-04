import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminCommon.css'
import './AdminUsers.css'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'USER'
  })

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10
      }
      if (searchQuery) params.search = searchQuery
      if (roleFilter) params.role = roleFilter

      const response = await apiClient.get('/admin/users', { params })
      setUsers(response.data.users)
      setTotalPages(response.data.pages)
    } catch (err) {
      console.error('Error fetching users:', err)
      alert('Lỗi load dữ liệu người dùng')
    } finally {
      setLoading(false)
    }
  }

  // Handle create/update user
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingUser) {
        // Update user - don't send password
        const { password, ...updateData } = formData
        await apiClient.put(`/admin/users/${editingUser._id}`, updateData)
        alert('Cập nhật người dùng thành công')
      } else {
        // Create new user
        await apiClient.post('/admin/users', formData)
        alert('Tạo người dùng thành công')
      }

      setShowForm(false)
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'USER'
      })
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xử lý yêu cầu')
    }
  }

  // Handle delete user
  const handleDelete = async (userId) => {
    if (!confirm('Bạn chắc chắn muốn xóa người dùng này?')) return

    try {
      await apiClient.delete(`/admin/users/${userId}`)
      alert('Xóa người dùng thành công')
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa người dùng')
    }
  }

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role
    })
    setShowForm(true)
  }

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'USER'
    })
  }

  // Handle view user
  const handleView = (user) => {
    setViewingUser(user)
    setShowViewModal(true)
  }

  // Handle close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setViewingUser(null)
  }

  return (
    <AdminLayout>
      <div className="admin-users">
        {/* Header */}
        <div className="users-header">
          <h2>👥 Quản Lý Người Dùng</h2>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <span>＋</span> Thêm Người Dùng
          </button>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm (tên, email, username)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="search-input"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="filter-select"
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">Khách hàng</option>
            <option value="STAFF">Nhân viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Tên Đăng Nhập</th>
                    <th>Tên Đầy Đủ</th>
                    <th>Email</th>
                    <th>Vai Trò</th>
                    <th>Ngày Tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="6" className="empty-row">Không tìm thấy người dùng nào</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td><strong>{user.username}</strong></td>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role.toLowerCase()}`}>
                            {user.role === 'USER' ? 'Khách hàng' : user.role === 'STAFF' ? 'Nhân viên' : 'Quản trị viên'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div className="action-group">
                            <button className="action-btn view-btn" onClick={() => handleView(user)} title="Xem chi tiết">👁️</button>
                            <button className="action-btn edit-btn" onClick={() => handleEdit(user)} title="Sửa">✏️</button>
                            <button className="action-btn del-btn" onClick={() => handleDelete(user._id)} title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
        {showViewModal && viewingUser && (
          <div className="modal-overlay" onClick={handleCloseViewModal}>
            <div className="modal-box modal-view" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>👁️ Chi Tiết Người Dùng</h3>
                <button className="close-btn" onClick={handleCloseViewModal}>✕</button>
              </div>

              <div className="view-content">
                <div className="view-details">
                  <div className="detail-row">
                    <span className="detail-label">Tên Đăng Nhập:</span>
                    <span className="detail-value"><strong>{viewingUser.username}</strong></span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tên Đầy Đủ:</span>
                    <span className="detail-value">{viewingUser.fullName || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{viewingUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Điện Thoại:</span>
                    <span className="detail-value">{viewingUser.phone || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vai Trò:</span>
                    <span className={`detail-value role-badge role-${viewingUser.role.toLowerCase()}`}>
                      {viewingUser.role === 'USER' ? 'Khách hàng' : viewingUser.role === 'STAFF' ? 'Nhân viên' : 'Quản trị viên'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày Tạo:</span>
                    <span className="detail-value">{new Date(viewingUser.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-edit" onClick={() => { handleCloseViewModal(); handleEdit(viewingUser); }}>
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
                <h3>{editingUser ? '✏️ Sửa Người Dùng' : '➕ Thêm Người Dùng'}</h3>
                <button className="close-btn" onClick={handleCloseForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label>Tên Đăng Nhập *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!!editingUser}
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

                {!editingUser && (
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
                  <label>Tên Đầy Đủ</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

                <div className="form-group">
                  <label>Vai Trò *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="USER">Khách hàng</option>
                    <option value="STAFF">Nhân viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingUser ? 'Cập Nhật' : 'Tạo'}
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

export default AdminUsers
