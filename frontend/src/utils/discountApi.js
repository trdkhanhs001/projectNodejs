import apiClient from './apiClient'

// ============ DISCOUNT API ============

// Validate discount code
export const validateDiscount = async (code, orderAmount) => {
  try {
    const res = await apiClient.post('/discount/validate', {
      code,
      orderAmount
    })
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}

// Apply discount to order
export const applyDiscountToOrder = async (orderId, code) => {
  try {
    const res = await apiClient.post('/discount/apply', {
      orderId,
      code
    })
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}

// Get active discounts (public)
export const getActiveDiscounts = async () => {
  try {
    const res = await apiClient.get('/discount/active')
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}

// Get discount by code (public)
export const getDiscountByCode = async (code) => {
  try {
    const res = await apiClient.get(`/discount/code/${code}`)
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}
