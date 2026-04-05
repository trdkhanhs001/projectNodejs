import apiClient from './apiClient'

// ============ PAYMENT API ============

// Create payment for an order
export const createPayment = async (orderId, amount, paymentMethod, transactionId = null, notes = null) => {
  try {
    const res = await apiClient.post('/payment', {
      orderId,
      amount,
      paymentMethod,
      transactionId,
      notes
    })
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}

// Get user's payments
export const getUserPayments = async (page = 1, limit = 10) => {
  try {
    const res = await apiClient.get('/payment/my-payments', {
      params: { page, limit }
    })
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}

// Get payments for a specific order
export const getOrderPayments = async (orderId) => {
  try {
    const res = await apiClient.get(`/payment/order/${orderId}`)
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const res = await apiClient.get(`/payment/${paymentId}`)
    return { success: true, data: res.data }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    }
  }
}
