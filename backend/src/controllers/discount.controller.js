const Discount = require('../models/discount.models');
const Order = require('../models/order.model');

// Validate discount code
exports.validateDiscount = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
    }

    // Find discount by code
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isDeleted: false
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Invalid discount code'
      });
    }

    // Check if discount is active
    const now = new Date();
    if (discount.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This discount code is not active'
      });
    }

    // Check expiration
    if (now > discount.endDate) {
      discount.status = 'EXPIRED';
      await discount.save();
      return res.status(400).json({
        success: false,
        message: 'This discount code has expired'
      });
    }

    // Check start date
    if (now < discount.startDate) {
      return res.status(400).json({
        success: false,
        message: 'This discount code is not yet valid'
      });
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has reached its usage limit'
      });
    }

    // Check minimum order amount
    if (orderAmount && orderAmount < discount.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${discount.minOrderAmount} to use this discount`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * discount.value) / 100;
      if (discount.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
      }
    } else if (discount.type === 'FIXED') {
      discountAmount = discount.value;
    }

    res.status(200).json({
      success: true,
      message: 'Discount code is valid',
      data: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: discountAmount,
        description: discount.description,
        maxDiscountAmount: discount.maxDiscountAmount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Apply discount to order
exports.applyDiscountToOrder = async (req, res) => {
  try {
    const { orderId, code } = req.body;

    if (!orderId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and discount code are required'
      });
    }

    // Get order
    const order = await Order.findById(orderId).select('+isDeleted');
    if (!order || order.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership for non-admin users
    if (req.user.role === 'USER' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to apply discount to this order'
      });
    }

    // Find discount
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isDeleted: false
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Invalid discount code'
      });
    }

    // Validate discount
    const now = new Date();
    if (discount.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This discount code is not active'
      });
    }

    if (now > discount.endDate) {
      discount.status = 'EXPIRED';
      await discount.save();
      return res.status(400).json({
        success: false,
        message: 'This discount code has expired'
      });
    }

    if (now < discount.startDate) {
      return res.status(400).json({
        success: false,
        message: 'This discount code is not yet valid'
      });
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has reached its usage limit'
      });
    }

    if (order.subtotal < discount.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${discount.minOrderAmount} to use this discount`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    let discountPercent = 0;

    if (discount.type === 'PERCENTAGE') {
      discountPercent = discount.value;
      discountAmount = (order.subtotal * discount.value) / 100;
      if (discount.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
      }
    } else if (discount.type === 'FIXED') {
      discountAmount = discount.value;
    }

    // Update order with discount
    order.discountAmount = Math.round(discountAmount * 100) / 100;
    order.discountPercent = discountPercent;
    order.discountCode = discount.code;
    order.total = order.subtotal + order.tax + order.deliveryFee - order.discountAmount;

    await order.save();

    // Increment usage count
    discount.usedCount += 1;
    await discount.save();

    res.status(200).json({
      success: true,
      message: 'Discount applied successfully',
      data: {
        discountAmount: order.discountAmount,
        discountPercent: order.discountPercent,
        newTotal: order.total
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Create new discount (admin only)
exports.createDiscount = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create discounts'
      });
    }

    const { code, type, value, description, maxDiscountAmount, minOrderAmount, usageLimit, startDate, endDate } = req.body;

    // Validate required fields
    if (!code || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, type, value, startDate, and endDate are required'
      });
    }

    // Check if code already exists
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
    if (existingDiscount) {
      return res.status(400).json({
        success: false,
        message: 'Discount code already exists'
      });
    }

    // Create discount
    const discount = new Discount({
      code: code.toUpperCase(),
      type,
      value,
      description: description || null,
      maxDiscountAmount: maxDiscountAmount || null,
      minOrderAmount: minOrderAmount || 0,
      usageLimit: usageLimit || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'ACTIVE',
      createdBy: req.user.username || req.user.id
    });

    await discount.save();

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data: discount
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get all discounts (admin only)
exports.getAllDiscounts = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all discounts'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };
    if (status) filter.status = status;

    const discounts = await Discount.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Discount.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: discounts,
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

// Get active discounts (public)
exports.getActiveDiscounts = async (req, res) => {
  try {
    const now = new Date();

    const discounts = await Discount.find({
      status: 'ACTIVE',
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).select('code type value description minOrderAmount maxDiscountAmount');

    res.status(200).json({
      success: true,
      data: discounts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get discount by code
exports.getDiscountByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isDeleted: false
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.status(200).json({
      success: true,
      data: discount
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update discount (admin only)
exports.updateDiscount = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update discounts'
      });
    }

    const { discountId } = req.params;
    const updates = req.body;

    // Don't allow updating code (must delete and create new)
    if (updates.code) {
      delete updates.code;
    }

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      { ...updates, updatedBy: req.user.username || req.user.id },
      { new: true, runValidators: true }
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Discount updated successfully',
      data: discount
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete discount (soft delete - admin only)
exports.deleteDiscount = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete discounts'
      });
    }

    const { discountId } = req.params;

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      { isDeleted: true, updatedBy: req.user.username || req.user.id },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Discount deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get discount statistics (admin only)
exports.getDiscountStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view discount statistics'
      });
    }

    const stats = await Discount.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          totalDiscounts: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          mostUsed: [
            { $sort: { usedCount: -1 } },
            { $limit: 5 },
            { $project: { code: 1, usedCount: 1, value: 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDiscounts: stats[0].totalDiscounts[0]?.count || 0,
        byStatus: stats[0].byStatus || [],
        byType: stats[0].byType || [],
        mostUsed: stats[0].mostUsed || []
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
