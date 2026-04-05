const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, transactionId, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and payment method are required'
      });
    }

    // Check if order exists and belongs to user (for non-admin)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership for non-admin users
    if (req.user.role === 'USER' && order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create payment for this order'
      });
    }

    // Create payment
    const payment = new Payment({
      order: orderId,
      user: userId,
      amount,
      paymentMethod,
      status: 'COMPLETED',
      transactionId: transactionId || null,
      notes: notes || null,
      createdBy: req.user.username || userId
    });

    await payment.save();

    // Update order's paymentStatus
    if (payment.status === 'COMPLETED') {
      const totalPaid = await Payment.aggregate([
        { $match: { order: order._id, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
      
      if (paidAmount >= order.total) {
        order.paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        order.paymentStatus = 'PARTIAL';
      }
      
      await order.save();
    }

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all payments'
      });
    }

    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('order', 'orderNumber total')
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get user's payments
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: userId, isDeleted: false })
      .populate('order', 'orderNumber total status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ user: userId, isDeleted: false });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get payments for a specific order
exports.getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify access
    if (req.user.role === 'USER' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view payments for this order'
      });
    }

    const payments = await Payment.find({ order: orderId, isDeleted: false })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('order')
      .populate('user', 'fullName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify access
    if (req.user.role === 'USER' && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update payment status'
      });
    }

    const { paymentId } = req.params;
    const { status, notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update status
    if (status) payment.status = status;
    if (notes) payment.notes = notes;
    payment.updatedBy = req.user.username || req.user.id;

    await payment.save();

    // Update order's paymentStatus based on all payments
    const order = await Order.findById(payment.order);
    if (order) {
      const totalPaid = await Payment.aggregate([
        { $match: { order: order._id, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;

      if (paidAmount >= order.total) {
        order.paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        order.paymentStatus = 'PARTIAL';
      } else {
        order.paymentStatus = 'UNPAID';
      }

      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Refund payment (admin only)
exports.refundPayment = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can refund payments'
      });
    }

    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already refunded'
      });
    }

    // Update payment status
    payment.status = 'REFUNDED';
    payment.notes = reason || 'Refunded by admin';
    payment.updatedBy = req.user.username || req.user.id;

    await payment.save();

    // Update order's paymentStatus
    const order = await Order.findById(payment.order);
    if (order) {
      const totalPaid = await Payment.aggregate([
        { $match: { order: order._id, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;

      if (paidAmount >= order.total) {
        order.paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        order.paymentStatus = 'PARTIAL';
      } else {
        order.paymentStatus = 'UNPAID';
      }

      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view payment statistics'
      });
    }

    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      {
        $facet: {
          totalAmount: [
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          byStatus: [
            { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          byMethod: [
            { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          dailyTotals: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAmount: stats[0].totalAmount[0] || { total: 0 },
        byStatus: stats[0].byStatus || [],
        byMethod: stats[0].byMethod || [],
        dailyTotals: stats[0].dailyTotals || []
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete payment (soft delete - admin only)
exports.deletePayment = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete payments'
      });
    }

    const { paymentId } = req.params;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { isDeleted: true, updatedBy: req.user.username || req.user.id },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
