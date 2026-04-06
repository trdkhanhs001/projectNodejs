import { useState, useRef, useEffect } from 'react'
import { validateDiscount } from '../utils/discountApi'
import showToast from '../utils/toast'

export default function DiscountInput({ orderAmount, onDiscountApplied, onDiscountRemoved }) {
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const autoApplyTimer = useRef(null)

  useEffect(() => {
    if (appliedDiscount || !discountCode.trim()) return
    clearTimeout(autoApplyTimer.current)
    autoApplyTimer.current = setTimeout(() => {
      handleValidateDiscount()
    }, 1500)
    return () => clearTimeout(autoApplyTimer.current)
  }, [discountCode])

  const handleValidateDiscount = async (e) => {
    if (e?.preventDefault) e.preventDefault()
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
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.92); opacity: 0; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes ticketAppear {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .discount-apply-btn {
          background: linear-gradient(135deg, var(--color-gold), #b8952e);
          color: #0f0e0b;
          border: none;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0 1.125rem;
          height: 40px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          box-shadow: 0 2px 12px rgba(212,175,100,0.25);
          white-space: nowrap;
        }
        .discount-apply-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
          box-shadow: 0 4px 20px rgba(212,175,100,0.4);
          transform: translateY(-1px);
        }
        .discount-apply-btn:active:not(:disabled) {
          transform: scale(0.97) translateY(0);
        }
        .discount-apply-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .discount-remove-btn {
          background: rgba(248,113,113,0.1);
          color: var(--color-error);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 0.3rem 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .discount-remove-btn:hover {
          background: rgba(248,113,113,0.18);
          border-color: rgba(248,113,113,0.4);
        }
        .discount-input-field {
          width: 100%;
          height: 40px;
          padding: 0 0.875rem;
          background: var(--color-bg);
          border: 1px solid ${focused ? 'var(--color-border-focus)' : 'var(--color-border)'};
          border-radius: var(--radius-sm);
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
          box-shadow: ${focused ? '0 0 0 3px rgba(212,175,100,0.1)' : 'none'};
        }
        .discount-input-field::placeholder {
          color: var(--color-text-dim);
          font-weight: 400;
          letter-spacing: 0.03em;
        }
      `}</style>

      <div style={{
        border: `1px solid ${appliedDiscount
          ? 'rgba(74,222,128,0.25)'
          : focused
            ? 'rgba(212,175,100,0.35)'
            : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-2)',
        overflow: 'hidden',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        boxShadow: appliedDiscount
          ? '0 0 0 3px rgba(74,222,128,0.06)'
          : focused
            ? '0 0 0 3px rgba(212,175,100,0.07)'
            : 'none',
      }}>

        {/* ── Header bar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          borderBottom: `1px solid ${appliedDiscount ? 'rgba(74,222,128,0.1)' : 'rgba(212,175,100,0.08)'}`,
          background: appliedDiscount
            ? 'rgba(74,222,128,0.04)'
            : 'rgba(212,175,100,0.04)',
        }}>
          {/* Ticket icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={appliedDiscount ? '#4ade80' : 'var(--color-gold)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <line x1="9" y1="2" x2="9" y2="22" strokeDasharray="3 3"/>
          </svg>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: appliedDiscount ? 'var(--color-success)' : 'var(--color-gold)',
          }}>
            {appliedDiscount ? 'Mã đã áp dụng' : 'Mã khuyến mãi'}
          </span>

          {/* Shimmer badge khi chưa có mã */}
          {!appliedDiscount && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, rgba(212,175,100,0.15) 0%, rgba(232,204,136,0.35) 50%, rgba(212,175,100,0.15) 100%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 2.5s linear infinite',
              color: 'var(--color-gold)',
              border: '1px solid rgba(212,175,100,0.2)',
            }}>
              SALE
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '0.875rem 1rem' }}>

          {/* INPUT STATE */}
          {!appliedDiscount && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Input wrapper with dashed left border */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  className="discount-input-field"
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidateDiscount()}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Nhập mã giảm giá..."
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
                {/* Loading spinner inside input */}
                {loading && (
                  <div style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(212,175,100,0.2)',
                    borderTopColor: 'var(--color-gold)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                )}
              </div>

              {/* Apply button — chỉ hiện khi có text */}
              {discountCode.trim() && (
                <button
                  className="discount-apply-btn"
                  onClick={handleValidateDiscount}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{
                      display: 'inline-block',
                      width: '12px', height: '12px',
                      border: '2px solid rgba(15,14,11,0.3)',
                      borderTopColor: '#0f0e0b',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Áp dụng
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Hint text */}
          {!appliedDiscount && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.7rem',
              color: loading ? 'var(--color-gold)' : 'var(--color-text-dim)',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'color 0.2s',
            }}>
              {loading
                ? <><span>⏳</span> Đang kiểm tra mã...</>
                : <><span style={{ opacity: 0.6 }}>↵</span> Nhấn Enter hoặc đợi 1.5s để tự động áp dụng</>
              }
            </div>
          )}

          {/* APPLIED STATE */}
          {appliedDiscount && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              animation: 'successPop 0.35s cubic-bezier(0.4, 0, 0.2, 1) both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                {/* Code tag */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  background: 'rgba(74,222,128,0.08)',
                  border: '1px dashed rgba(74,222,128,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  flexShrink: 0,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-success)',
                    letterSpacing: '0.08em',
                  }}>
                    {appliedDiscount.code}
                  </span>
                </div>

                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  {appliedDiscount.description && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {appliedDiscount.description}
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--color-success)',
                    marginTop: appliedDiscount.description ? '0.15rem' : 0,
                  }}>
                    − {appliedDiscount.discountAmount?.toLocaleString()} đ
                  </div>
                </div>
              </div>

              <button className="discount-remove-btn" onClick={handleRemoveDiscount}>
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}