import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import showToast from '../../utils/toast'
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
    email: '',
    fullName: '',
    phone: '',
    position: 'WAITER',
    salary: '',
    address: ''
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
        limit: 10
      }
      if (searchQuery) params.search = searchQuery

      console.log('[FETCH STAFF] Fetching with params:', params)
      const response = await apiClient.get('/staff', { params })
      console.log('[FETCH STAFF] Full response:', response)
      console.log('[FETCH STAFF] Response data:', response.data)
      console.log('[FETCH STAFF] Staff array:', response.data.staff)
      
      setStaff(response.data.staff || [])
      setTotalPages(response.data.pages || 1)
    } catch (err) {
      console.error('[FETCH STAFF ERROR] Full error:', err)
      console.error('[FETCH STAFF ERROR] Error message:', err.message)
      console.error('[FETCH STAFF ERROR] Error response:', err.response?.data)
      console.error('[FETCH STAFF ERROR] Error status:', err.response?.status)
      showToast('Lỗi tải danh sách nhân viên: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle create/update
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
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        position: 'WAITER',
        salary: '',
        address: ''
      })
      setCurrentPage(1)
      fetchStaff()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xử lý', 'error')
    }
  }

  // Handle delete
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

  // Handle edit
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

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStaff(null)
    setFormData({
      email: '',
      fullName: '',
      phone: '',
      position: 'WAITER',
      salary: '',
      address: ''
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
                    <th>Tên Đầy Đủ</th>
                    <th>Email</th>
                    <th>Điện Thoại</th>
                    <th>Chức Vụ</th>
                    <th>Ngày Tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s._id}>
                      <td><strong>{s.fullName}</strong></td>
                      <td>{s.email}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{s.position}</td>
                      <td>{new Date(s.startDate).toLocaleDateString('vi-VN')}</td>
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
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingStaff}
                  />
                </div>

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
                  <label>Điện Thoại *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    pattern="[0-9]{10,11}"
                    title="Điện thoại phải có 10-11 chữ số"
                  />
                </div>

                <div className="form-group">
                  <label>Chức Vụ *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  >
                    <option value="WAITER">Phục Vụ</option>
                    <option value="CHEF">Đầu Bếp</option>
                    <option value="CASHIER">Thu Ngân</option>
                    <option value="MANAGER">Quản Lý</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Lương *</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Địa Chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
