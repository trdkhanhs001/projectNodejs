import { useState } from 'react'
import { validateDiscount } from '../utils/discountApi'
import showToast from '../utils/toast'

export default function DiscountInput({ orderAmount, onDiscountApplied, onDiscountRemoved }) {
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleValidateDiscount = async (e) => {
    e.preventDefault()
    
    if (!discountCode.trim()) {
      showToast('Vui lòng nhập mã khuyến mãi', 'warning')
      return
    }

    try {
      setLoading(true)
      const result = await validateDiscount(discountCode.toUpperCase(), orderAmount)
      
      if (!result.success) {
        showToast(result.message, 'error')
        return
      }

      const data = result.data?.data || result.data
      setAppliedDiscount({
        code: data.code,
        type: data.type,
        value: data.value,
        discountAmount: data.discountAmount,
        description: data.description
      })

      showToast(`✅ Áp dụng mã ${data.code} thành công!`, 'success')
      
      if (onDiscountApplied) {
        onDiscountApplied({
          code: data.code,
          amount: data.discountAmount,
          type: data.type,
          value: data.value
        })
      }
    } catch (err) {
      showToast(err.message || 'Không thể kiểm tra mã khuyến mãi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    if (onDiscountRemoved) {
      onDiscountRemoved()
    }
    showToast('Đã xóa mã khuyến mãi', 'info')
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
      {!appliedDiscount ? (
        <form onSubmit={handleValidateDiscount} className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">
            🎟️ Có mã khuyến mãi? Nhập ở đây
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã khuyến mãi (VD: WELCOME20)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '⏳' : 'Áp Dụng'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-700">✅ {appliedDiscount.code}</p>
              <p className="text-sm text-gray-600">{appliedDiscount.description}</p>
              <p className="text-sm font-semibold text-green-600">
                Giảm: {appliedDiscount.discountAmount.toLocaleString()}đ
              </p>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
