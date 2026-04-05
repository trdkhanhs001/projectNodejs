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
      if (!result.success) { showToast(result.message, 'error'); return }

      const data = result.data?.data || result.data
      const applied = {
        code: data.code,
        type: data.type,
        value: data.value,
        discountAmount: data.discountAmount,
        description: data.description,
      }
      setAppliedDiscount(applied)
      showToast(`✅ Áp dụng mã ${data.code} thành công!`, 'success')
      onDiscountApplied?.({ code: data.code, amount: data.discountAmount, type: data.type, value: data.value })
    } catch (err) {
      showToast(err.message || 'Không thể kiểm tra mã khuyến mãi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    onDiscountRemoved?.()
    showToast('Đã xóa mã khuyến mãi', 'info')
  }

  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.125rem',
      transition: 'var(--transition)',
    }}>
      {/* Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.75rem',
      }}>
        <span style={{ fontSize: '0.9rem' }}>🎁</span>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}>
          Mã khuyến mãi
        </span>
      </div>

      {!appliedDiscount ? (
        <form onSubmit={handleValidateDiscount} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="VD: WELCOME20"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.6rem 0.875rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              letterSpacing: '0.04em',
              fontWeight: 500,
              outline: 'none',
              transition: 'var(--transition)',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--color-border-focus)'
              e.target.style.boxShadow = '0 0 0 3px rgba(212,175,100,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--color-border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {loading
              ? <span className="spinner" style={{ fontSize: '0.85rem' }}>⏳</span>
              : 'Áp dụng'}
          </button>
        </form>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(74, 222, 128, 0.06)',
          border: '1px solid rgba(74, 222, 128, 0.2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem' }}>✅</span>
              <span style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--color-success)',
                letterSpacing: '0.04em',
              }}>
                {appliedDiscount.code}
              </span>
            </div>
            {appliedDiscount.description && (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {appliedDiscount.description}
              </span>
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-success)' }}>
              Giảm {appliedDiscount.discountAmount?.toLocaleString()} đ
            </span>
          </div>

          <button
            onClick={handleRemoveDiscount}
            className="btn btn-danger btn-sm"
            style={{ flexShrink: 0 }}
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}