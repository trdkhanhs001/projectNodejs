import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import apiClient from '../../utils/apiClient'
import './AdminCommon.css'
import './AdminDiscountCode.css'

function AdminDiscountCode() {
  const [codeList, setCodeList] = useState([])
  const [loading, setLoading] = useState(false)

  // State cho form thêm mới/chỉnh sửa
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: 0,
    maxDiscountAmount: '',
    minOrderAmount: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUsage: '',
    isActive: true,
    applicableRoles: ['USER']
  })

  // State cho modal xem chi tiết
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingCode, setViewingCode] = useState(null)

  // Lấy danh sách mã giảm giá
  useEffect(() => {
    fetchDiscountCodes()
  }, [])

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/discount-codes/admin/all')
      setCodeList(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching discount codes:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
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

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    if (!formData.code || !formData.discountValue) {
      alert('⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    try {
      const dataToSend = {
        code: formData.code,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        isActive: formData.isActive,
        applicableRoles: formData.applicableRoles
      }

      if (editingId) {
        // Update
        await apiClient.put(`/discount-codes/${editingId}`, dataToSend)
        alert('✅ Cập nhật mã giảm giá thành công!')
      } else {
        // Create
        await apiClient.post('/discount-codes', dataToSend)
        alert('✅ Thêm mã giảm giá thành công!')
      }

      resetForm()
      fetchDiscountCodes()
    } catch (err) {
      console.error('Error:', err)
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: 0,
      maxDiscountAmount: '',
      minOrderAmount: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUsage: '',
      isActive: true,
      applicableRoles: ['USER']
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Chỉnh sửa mã giảm giá
  const handleEdit = (code) => {
    setFormData({
      code: code.code,
      description: code.description || '',
      discountType: code.discountType,
      discountValue: code.discountValue,
      maxDiscountAmount: code.maxDiscountAmount || '',
      minOrderAmount: code.minOrderAmount || 0,
      validFrom: code.validFrom.split('T')[0],
      validTo: code.validTo.split('T')[0],
      maxUsage: code.maxUsage || '',
      isActive: code.isActive,
      applicableRoles: code.applicableRoles
    })
    setEditingId(code._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Xóa mã giảm giá
  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await apiClient.delete(`/discount-codes/${id}`)
        alert('✅ Xóa thành công!')
        fetchDiscountCodes()
      } catch (err) {
        alert('❌ Lỗi: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  // Xem chi tiết mã giảm giá
  const handleView = (code) => {
    setViewingCode(code)
    setShowViewModal(true)
  }

  // Đóng modal xem chi tiết
  const closeViewModal = () => {
    setShowViewModal(false)
    setViewingCode(null)
  }

  if (loading && codeList.length === 0) {
    return (
      <AdminLayout>
        <div className="spinner"></div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-discount-code">
        <div className="code-header">
          <h2>🎁 Quản lý Mã Giảm Giá</h2>
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
            {showForm ? '❌ Hủy' : '➕ Thêm Mã'}
          </button>
        </div>

        {/* Form thêm mới/chỉnh sửa */}
        {showForm && (
          <div className="card form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editingId ? '✏️ Chỉnh sửa Mã Giảm Giá' : '➕ Thêm Mã Giảm Giá Mới'}</h3>
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
            <form onSubmit={handleSubmit} className="discount-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Giảm Giá *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="VD: SUMMER20, WELCOME10"
                    disabled={editingId}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loại Giảm Giá *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (đ)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá Trị Giảm *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder={formData.discountType === 'PERCENT' ? '20 (%)' : '50000 (đ)'}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giảm Giá Tối Đa {formData.discountType === 'PERCENT' ? '(nếu %)' : ''}</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="Nếu không có để trống"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Đơn Hàng Tối Thiểu</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Số Lần Sử Dụng Tối Đa</label>
                  <input
                    type="number"
                    name="maxUsage"
                    value={formData.maxUsage}
                    onChange={handleInputChange}
                    placeholder="Để trống = không giới hạn"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Bắt Đầu *</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày Kết Thúc *</label>
                  <input
                    type="date"
                    name="validTo"
                    value={formData.validTo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô Tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả mã giảm giá"
                  rows="3"
                ></textarea>
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
                  <span>Kích hoạt mã giảm giá</span>
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

        {/* Danh sách mã giảm giá */}
        <div className="card">
          <h3>Danh sách Mã Giảm Giá ({codeList.length})</h3>
          {codeList.length === 0 ? (
            <p>Chưa có mã giảm giá nào</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã Giảm Giá</th>
                  <th>Loại</th>
                  <th>Giá Trị</th>
                  <th>Đơn Hàng TT</th>
                  <th>Trong Hạn</th>
                  <th>Sử Dụng</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {codeList.map(code => {
                  const now = new Date()
                  const validFrom = new Date(code.validFrom)
                  const validTo = new Date(code.validTo)
                  const isInTime = now >= validFrom && now <= validTo
                  
                  return (
                    <tr key={code._id}>
                      <td><strong>{code.code}</strong></td>
                      <td>{code.discountType === 'PERCENT' ? '%' : 'Tiền cố định'}</td>
                      <td>{code.discountValue}{code.discountType === 'PERCENT' ? '%' : 'đ'}</td>
                      <td>{code.minOrderAmount.toLocaleString()}đ</td>
                      <td>
                        <span className={`status-badge ${isInTime ? 'active' : 'inactive'}`}>
                          {isInTime ? '✓ Có' : '✗ Hết'}
                        </span>
                      </td>
                      <td>{code.usageCount}/{code.maxUsage || '∞'}</td>
                      <td>
                        <span className={`status-badge ${code.isActive ? 'active' : 'inactive'}`}>
                          {code.isActive ? '✓ Hoạt động' : '✗ Tắt'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button 
                          className="btn btn-small btn-info"
                          onClick={() => handleView(code)}
                        >
                          👁️ Xem
                        </button>
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => handleEdit(code)}
                        >
                          ✏️ Sửa
                        </button>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(code._id)}
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal xem chi tiết mã giảm giá */}
        {showViewModal && viewingCode && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🎁 Chi tiết Mã Giảm Giá</h3>
                <button 
                  className="btn-close"
                  onClick={closeViewModal}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="code-details">
                  <div className="detail-row">
                    <label>Mã Giảm Giá</label>
                    <div className="detail-value code-badge">{viewingCode.code}</div>
                  </div>

                  <div className="detail-row">
                    <label>Mô Tả</label>
                    <div className="detail-value">{viewingCode.description || '—'}</div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-row">
                      <label>Loại Giảm Giá</label>
                      <div className="detail-value">
                        {viewingCode.discountType === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                      </div>
                    </div>

                    <div className="detail-row">
                      <label>Giá Trị Giảm</label>
                      <div className="detail-value">
                        {viewingCode.discountValue}{viewingCode.discountType === 'PERCENT' ? '%' : 'đ'}
                      </div>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-row">
                      <label>Giảm Giá Tối Đa</label>
                      <div className="detail-value">{viewingCode.maxDiscountAmount || '—'}</div>
                    </div>

                    <div className="detail-row">
                      <label>Đơn Hàng Tối Thiểu</label>
                      <div className="detail-value">{viewingCode.minOrderAmount.toLocaleString()}đ</div>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-row">
                      <label>Ngày Bắt Đầu</label>
                      <div className="detail-value">{new Date(viewingCode.validFrom).toLocaleDateString('vi-VN')}</div>
                    </div>

                    <div className="detail-row">
                      <label>Ngày Kết Thúc</label>
                      <div className="detail-value">{new Date(viewingCode.validTo).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-row">
                      <label>Số Lần Sử Dụng</label>
                      <div className="detail-value">{viewingCode.usageCount}/{viewingCode.maxUsage || '∞'}</div>
                    </div>

                    <div className="detail-row">
                      <label>Trạng Thái</label>
                      <div className="detail-value">
                        <span className={`status-badge ${viewingCode.isActive ? 'active' : 'inactive'}`}>
                          {viewingCode.isActive ? '✓ Hoạt động' : '✗ Tắt'}
                        </span>
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

export default AdminDiscountCode
