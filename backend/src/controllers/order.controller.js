const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Menu = require('../models/menu.model');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const DiningTable = require('../models/diningTable.model');
const Discount = require('../models/discount.models');

exports.getAllOrders = async () => {
  const orders = await Order.find({ isDeleted: false })
    .select('+isDeleted')
    .populate('user', 'fullName email phone')
    .populate({
      path: 'items',
      populate: {
        path: 'menu',
        select: 'name price'
      }
    })
    .sort({ createdAt: -1 });
  return orders;
};

exports.getUserOrders = async (userId) => {
  const orders = await Order.find({ user: userId, isDeleted: false })
    .select('+isDeleted')
    .populate({
      path: 'items',
      populate: {
        path: 'menu',
        select: 'name price'
      }
    })
    .sort({ createdAt: -1 });
  return orders;
};

exports.getStaffOrders = async (staffId) => {
  const orders = await Order.find({ assignedStaff: staffId, isDeleted: false })
    .select('+isDeleted')
    .populate('user', 'fullName email phone')
    .populate({
      path: 'items',
      populate: {
        path: 'menu',
        select: 'name price'
      }
    })
    .sort({ createdAt: -1 });
  return orders;
};

// Get order by ID
exports.getOrderById = async (id, user) => {
  const order = await Order.findById(id)
    .select('+isDeleted')
    .populate('user', 'fullName email phone')
    .populate({
      path: 'items',
      populate: {
        path: 'menu',
        select: 'name price'
      }
    });

  if (!order || order.isDeleted) {
    return null;
  }

  // Check access: user, admin, or assigned staff
  if (user.role === 'USER' && order.user && order.user.toString() !== user.id) {
    return null;
  }
  if (user.role === 'STAFF' && (!order.assignedStaff || order.assignedStaff.toString() !== user.id)) {
    return null;
  }

  return order;
};

// Create new order from cart
exports.createOrder = async (userId, data) => {
  const { items, deliveryAddress, notes, paymentMethod, discountCode, subtotal, tax } = data;

  // Validate items
  if (!items || items.length === 0) {
    throw new Error('Order items required');
  }

  // Create order items
  let calculatedSubtotal = 0;
  const orderItems = [];

  for (const cartItem of items) {
    const menuItem = await Menu.findById(cartItem.menuId);
    if (!menuItem) {
      throw new Error(`Menu item not found`);
    }

    const itemPrice = menuItem.price * cartItem.quantity;
    calculatedSubtotal += itemPrice;

    const orderItem = new OrderItem({
      menu: menuItem._id,
      quantity: cartItem.quantity,
      unitPrice: menuItem.price,
      subtotal: itemPrice,
      status: 'PENDING'
    });
    await orderItem.save();
    orderItems.push(orderItem._id);
  }

  // Process discount code
  let discountAmount = 0;
  let discountPercent = 0;
  let validatedDiscount = null;

  if (discountCode) {
    const discount = await Discount.findOne({
      code: discountCode.toUpperCase(),
      isDeleted: false,
      status: 'ACTIVE'
    });

    if (discount) {
      const now = new Date();
      if (now > discount.endDate) {
        throw new Error('This discount code has expired');
      }
      if (now < discount.startDate) {
        throw new Error('This discount code is not yet valid');
      }
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        throw new Error('This discount code has reached its usage limit');
      }
      if (calculatedSubtotal < discount.minOrderAmount) {
        throw new Error(`Minimum order amount is ${discount.minOrderAmount} to use this discount`);
      }

      // Calculate discount amount
      if (discount.type === 'PERCENTAGE') {
        discountPercent = discount.value;
        discountAmount = (calculatedSubtotal * discount.value) / 100;
        if (discount.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
        }
      } else if (discount.type === 'FIXED') {
        discountAmount = discount.value;
      }

      validatedDiscount = discount;
    } else {
      throw new Error('Invalid discount code');
    }
  }

  // Calculate final total
  const calculatedTax = subtotal ? tax : (calculatedSubtotal * 0.1);
  const finalTotal = calculatedSubtotal + calculatedTax - discountAmount;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order
  const order = new Order({
    orderNumber,
    user: userId,
    items: orderItems,
    subtotal: calculatedSubtotal,
    tax: calculatedTax,
    discountCode: discountCode ? discountCode.toUpperCase() : null,
    discountAmount: discountAmount,
    discountPercent: discountPercent,
    total: finalTotal,
    orderType: 'ONLINE',
    deliveryAddress,
    notes,
    paymentMethod: paymentMethod || 'CASH',
    paymentStatus: paymentMethod && paymentMethod.toUpperCase() !== 'CASH' ? 'PAID' : 'UNPAID',
    status: 'PENDING'
  });

  await order.save();
  
  // Increment discount usage count if applied
  if (validatedDiscount) {
    await Discount.findByIdAndUpdate(validatedDiscount._id, {
      $inc: { usedCount: 1 }
    });
  }

  await order.populate('items');

  // Clear cart
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return order;
};

// Update order status
exports.updateOrderStatus = async (orderId, data, user) => {
  const { status, itemId } = data;

  const order = await Order.findById(orderId)
    .select('+isDeleted');
  
  if (!order || order.isDeleted) {
    return null;
  }

  // Check valid status for role
  const validStatuses = {
    'STAFF': ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'],
    'ADMIN': ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED']
  };

  const userValidStatuses = validStatuses[user.role];
  if (!userValidStatuses || !userValidStatuses.includes(status)) {
    throw new Error(`Role ${user.role} cannot set status to ${status}`);
  }

  // If updating specific item status
  if (itemId) {
    const orderItem = await OrderItem.findById(itemId);
    if (!orderItem) {
      throw new Error('Order item not found');
    }
    orderItem.status = status;
    await orderItem.save();
  } else {
    // Update entire order status
    order.status = status;
    
    // Set staff info
    if (user.role === 'STAFF') {
      if (status === 'PREPARING') {
        order.preparedBy = user.id;
      } else if (status === 'READY' || status === 'DELIVERING') {
        order.servedBy = user.id;
      }
    }
    
    // Set completion timestamp
    if (status === 'DELIVERED' || status === 'READY') {
      order.completedAt = new Date();
    }
    
    // Auto-mark as PAID when order is delivered or completed
    if (status === 'DELIVERED' || status === 'COMPLETED') {
      order.paymentStatus = 'PAID';
    }
    
    await order.save();

    // Mark table as available if order is delivered or cancelled (for DINE_IN)
    if ((status === 'DELIVERED' || status === 'CANCELLED') && order.tableNumber) {
      await DiningTable.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: 'AVAILABLE' }
      );
    }
  }

  await order.populate('items');
  return order;
};

// Update payment status
exports.updatePaymentStatus = async (orderId, data) => {
  const { paymentStatus } = data;

  // Check if order exists and is not deleted
  const orderCheck = await Order.findById(orderId).select('+isDeleted');
  if (!orderCheck || orderCheck.isDeleted) {
    return null;
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus },
    { new: true }
  ).select('+isDeleted').populate('items');

  return order;
};

// Create guest order (no login required)
exports.createGuestOrder = async (data) => {
  const { items, guestName, guestEmail, guestPhone, guestAddress, notes, paymentMethod, orderType, tableNumber, discountCode } = data;

  if (!items || items.length === 0) {
    throw new Error('Order items required');
  }

  // For DINE_IN orders (staff POS), guest info optional
  // For ONLINE orders (user checkout), guest info required
  if (orderType !== 'DINE_IN') {
    if (!guestName || !guestPhone) {
      throw new Error('Guest name and phone are required for online orders');
    }
  }

  // Create order items
  let calculatedSubtotal = 0;
  const orderItems = [];

  for (const cartItem of items) {
    const menuItem = await Menu.findById(cartItem.menuId);
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuId}`);
    }

    const itemPrice = menuItem.price * cartItem.quantity;
    calculatedSubtotal += itemPrice;

    const orderItem = new OrderItem({
      menu: menuItem._id,
      quantity: cartItem.quantity,
      unitPrice: menuItem.price,
      subtotal: itemPrice,
      status: 'PENDING'
    });
    await orderItem.save();
    orderItems.push(orderItem._id);
  }

  // Process discount code
  let discountAmount = 0;
  let discountPercent = 0;
  let validatedDiscount = null;

  if (discountCode) {
    const discount = await Discount.findOne({
      code: discountCode.toUpperCase(),
      isDeleted: false,
      status: 'ACTIVE'
    });

    if (discount) {
      const now = new Date();
      if (now > discount.endDate) {
        throw new Error('This discount code has expired');
      }
      if (now < discount.startDate) {
        throw new Error('This discount code is not yet valid');
      }
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        throw new Error('This discount code has reached its usage limit');
      }
      if (calculatedSubtotal < discount.minOrderAmount) {
        throw new Error(`Minimum order amount is ${discount.minOrderAmount} to use this discount`);
      }

      // Calculate discount amount
      if (discount.type === 'PERCENTAGE') {
        discountPercent = discount.value;
        discountAmount = (calculatedSubtotal * discount.value) / 100;
        if (discount.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
        }
      } else if (discount.type === 'FIXED') {
        discountAmount = discount.value;
      }

      validatedDiscount = discount;
    } else {
      throw new Error('Invalid discount code');
    }
  }

  // Calculate final total (tax 10%)
  const calculatedTax = calculatedSubtotal * 0.1;
  const finalTotal = calculatedSubtotal + calculatedTax - discountAmount;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create guest order (no user reference)
  const order = new Order({
    orderNumber,
    items: orderItems,
    subtotal: calculatedSubtotal,
    tax: calculatedTax,
    discountCode: discountCode ? discountCode.toUpperCase() : null,
    discountAmount: discountAmount,
    discountPercent: discountPercent,
    total: finalTotal,
    guestName: guestName || '',
    guestEmail: guestEmail || '',
    guestPhone: guestPhone || '',
    guestAddress: guestAddress || '',
    deliveryAddress: guestAddress || '',
    tableNumber: tableNumber || null,
    orderType: orderType || 'ONLINE',
    notes: notes || '',
    paymentMethod: paymentMethod || 'CASH',
    paymentStatus: paymentMethod && paymentMethod.toUpperCase() !== 'CASH' ? 'PAID' : 'UNPAID',
    status: 'PENDING'
  });

  await order.save();

  // Increment discount usage count if applied
  if (validatedDiscount) {
    await Discount.findByIdAndUpdate(validatedDiscount._id, {
      $inc: { usedCount: 1 }
    });
  }

  await order.populate('items');

  // Mark table as occupied if DINE_IN order
  if (orderType === 'DINE_IN' && tableNumber) {
    const normalizedTableNum = String(tableNumber).trim();
    await DiningTable.findOneAndUpdate(
      { tableNumber: normalizedTableNum },
      { status: 'OCCUPIED' }
    );
  }

  return {
    message: 'Guest order created successfully',
    order
  };
};


exports.createPosOrder = async (staffId, data) => {
  const { items, tableNumber, notes, paymentMethod } = data;
  if (!items || items.length === 0) {
    throw new Error('Order items required');
  }
  if (!tableNumber) {
    throw new Error('Table number required for POS orders');
  }

  // Normalize table number - trim whitespace
  const normalizedTableNumber = String(tableNumber).trim();

  const table = await DiningTable.findOne({ tableNumber: normalizedTableNumber });
  if (!table) {
    throw new Error(`Table ${normalizedTableNumber} not found. Available format: T1-1, T2-5, L-1, etc.`);
  }
  if (table.status === 'OCCUPIED') {
    throw new Error(`Table ${normalizedTableNumber} is already occupied`);
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const cartItem of items) {
    const menuItem = await Menu.findById(cartItem.menuId);
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuId}`);
    }

    const itemPrice = menuItem.price * cartItem.quantity;
    totalPrice += itemPrice;

    const orderItem = new OrderItem({
      menu: menuItem._id,
      quantity: cartItem.quantity,
      unitPrice: menuItem.price,
      subtotal: itemPrice,
      status: 'PENDING'
    });
    await orderItem.save();
    orderItems.push(orderItem._id);
  }

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = new Order({
    orderNumber,
    items: orderItems,
    total: totalPrice,
    tableNumber,
    orderType: 'DINE_IN',
    preparedBy: staffId, 
    notes: notes || '',
    paymentMethod: paymentMethod || 'CASH',
    paymentStatus: paymentMethod && paymentMethod.toUpperCase() !== 'CASH' ? 'PAID' : 'UNPAID',
    status: 'PENDING'
  });

  await order.save();
  await order.populate([
    { path: 'items' },
    { path: 'preparedBy', select: 'fullName email' }
  ]);

  // Mark table as occupied
  await DiningTable.findOneAndUpdate(
    { tableNumber: normalizedTableNumber },
    { status: 'OCCUPIED' }
  );

  return {
    message: 'POS order created successfully',
    order
  };
};

// Soft delete order
exports.deleteOrder = async (id) => {
  const order = await Order.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return order;
};

// Get pending orders for POS staff
exports.getPendingOrders = async () => {
  const orders = await Order.find({ 
    status: 'PENDING',
    isDeleted: false 
  })
    .select('+isDeleted')
    .populate('user', 'fullName email phone')
    .populate('items')
    .sort({ createdAt: -1 });
  return orders;
};

// Get orders by status for POS staff view
exports.getOrdersByStatus = async (statusFilter) => {
  const statuses = statusFilter.split(',').map(s => s.trim().toUpperCase());
  
  const orders = await Order.find({
    status: { $in: statuses },
    isDeleted: false
  })
    .select('+isDeleted')
    .populate('user', 'fullName email phone')
    .populate({
      path: 'items',
      populate: {
        path: 'menu',
        select: 'name price description image'
      }
    })
    .sort({ createdAt: -1 });
  
  return orders;
};

// Get order statistics for dashboard
exports.getOrderStats = async () => {
  const stats = {
    total: await Order.countDocuments({ isDeleted: { $ne: true } }),
    pending: await Order.countDocuments({ status: 'PENDING', isDeleted: { $ne: true } }),
    confirmed: await Order.countDocuments({ status: 'CONFIRMED', isDeleted: { $ne: true } }),
    preparing: await Order.countDocuments({ status: 'PREPARING', isDeleted: { $ne: true } }),
    ready: await Order.countDocuments({ status: 'READY', isDeleted: { $ne: true } }),
    completed: await Order.countDocuments({ status: 'DELIVERED', isDeleted: { $ne: true } })
  };
  return stats;
};

// Get daily revenue summary
exports.getDailySummary = async (date) => {
  try {
    // Parse date to get start and end of day
    const parseDate = new Date(date);
    parseDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(parseDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Query completed orders for the specific date
    const completedOrders = await Order.find({
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      createdAt: {
        $gte: parseDate,
        $lt: nextDay
      },
      isDeleted: false
    })
      .select('+isDeleted');
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = completedOrders.length;
    const averagePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      date: date,
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      averagePerOrder: Math.round(averagePerOrder),
      orderDetails: completedOrders
    };
  } catch (error) {
    throw new Error('Failed to get daily summary: ' + error.message);
  }
};
