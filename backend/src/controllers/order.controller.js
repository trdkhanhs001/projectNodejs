const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Menu = require('../models/menu.model');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');

// Get all orders
exports.getAllOrders = async () => {
  const orders = await Order.find({ isDeleted: false })
    .populate('user', 'fullName email phone')
    .populate('items')
    .sort({ createdAt: -1 });
  return orders;
};

// Get user's orders
exports.getUserOrders = async (userId) => {
  const orders = await Order.find({ user: userId, isDeleted: false })
    .populate('items')
    .sort({ createdAt: -1 });
  return orders;
};

// Get staff's orders
exports.getStaffOrders = async (staffId) => {
  const orders = await Order.find({ assignedStaff: staffId, isDeleted: false })
    .populate('user', 'fullName email phone')
    .populate('items')
    .sort({ createdAt: -1 });
  return orders;
};

// Get order by ID
exports.getOrderById = async (id, user) => {
  const order = await Order.findById(id)
    .populate('user', 'fullName email phone')
    .populate('items');

  if (!order || order.isDeleted) {
    return null;
  }

  // Check access: user, admin, or assigned staff
  if (user.role === 'USER' && order.user.toString() !== user.id) {
    return null;
  }
  if (user.role === 'STAFF' && (!order.assignedStaff || order.assignedStaff.toString() !== user.id)) {
    return null;
  }

  return order;
};

// Create new order from cart
exports.createOrder = async (userId, data) => {
  const { deliveryAddress, deliveryPhone, notes, paymentMethod } = data;

  // Get user's cart
  const cart = await Cart.findOne({ user: userId }).populate('items.menu');
  
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Create order items
  let totalPrice = 0;
  const orderItems = [];

  for (const cartItem of cart.items) {
    const menuItem = await Menu.findById(cartItem.menu._id);
    if (!menuItem) {
      throw new Error(`Menu item not found`);
    }

    const itemPrice = menuItem.price * cartItem.quantity;
    totalPrice += itemPrice;

    const orderItem = new OrderItem({
      menu: menuItem._id,
      quantity: cartItem.quantity,
      price: menuItem.price,
      status: 'PENDING'
    });
    await orderItem.save();
    orderItems.push(orderItem._id);
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order
  const order = new Order({
    orderNumber,
    user: userId,
    items: orderItems,
    total: totalPrice,
    deliveryAddress,
    notes,
    paymentMethod: paymentMethod || 'CASH',
    paymentStatus: paymentMethod && paymentMethod.toUpperCase() !== 'CASH' ? 'PAID' : 'UNPAID',
    status: 'PENDING'
  });

  await order.save();
  await order.populate('items');

  // Clear cart
  cart.items = [];
  await cart.save();

  return order;
};

// Update order status
exports.updateOrderStatus = async (orderId, data, user) => {
  const { status, itemId } = data;

  const order = await Order.findById(orderId);
  if (!order) {
    return null;
  }

  // Check valid status for role
  const validStatuses = {
    'STAFF': ['CONFIRMED', 'PREPARING', 'READY', 'CANCELLED'],
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
    
    await order.save();
  }

  await order.populate('items');
  return order;
};

// Update payment status
exports.updatePaymentStatus = async (orderId, data) => {
  const { paymentStatus } = data;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus },
    { new: true }
  ).populate('items');

  return order;
};

// Create guest order (no login required)
exports.createGuestOrder = async (data) => {
  const { items, guestInfo, notes, paymentMethod } = data;

  if (!items || items.length === 0) {
    throw new Error('Order items required');
  }

  if (!guestInfo || !guestInfo.name || !guestInfo.phone) {
    throw new Error('Guest info (name, phone) required');
  }

  // Create order items
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
      price: menuItem.price,
      status: 'PENDING'
    });
    await orderItem.save();
    orderItems.push(orderItem._id);
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create guest order (no user reference)
  const order = new Order({
    orderNumber,
    items: orderItems,
    total: totalPrice,
    guestName: guestInfo.name,
    guestEmail: guestInfo.email || '',
    guestPhone: guestInfo.phone,
    guestAddress: guestInfo.address || '',
    deliveryAddress: guestInfo.address || guestInfo.phone,
    notes: notes || '',
    paymentMethod: paymentMethod || 'CASH',
    paymentStatus: 'UNPAID',
    status: 'PENDING'
  });

  await order.save();
  await order.populate('items');

  return {
    message: 'Guest order created successfully',
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
    .populate('user', 'fullName email phone')
    .populate('items')
    .sort({ createdAt: -1 });
  
  return orders;
};

// Get order statistics for dashboard
exports.getOrderStats = async () => {
  const stats = {
    total: await Order.countDocuments({ isDeleted: false }),
    pending: await Order.countDocuments({ status: 'PENDING', isDeleted: false }),
    confirmed: await Order.countDocuments({ status: 'CONFIRMED', isDeleted: false }),
    preparing: await Order.countDocuments({ status: 'PREPARING', isDeleted: false }),
    ready: await Order.countDocuments({ status: 'READY', isDeleted: false }),
    completed: await Order.countDocuments({ status: 'DELIVERED', isDeleted: false })
  };
  return stats;
};
