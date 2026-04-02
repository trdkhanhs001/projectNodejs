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
      status: 'pending'
    });
    await orderItem.save();
    orderItems.push(orderItem._id);
  }

  // Create order
  const order = new Order({
    user: userId,
    items: orderItems,
    totalPrice,
    deliveryAddress,
    deliveryPhone,
    notes,
    paymentMethod,
    paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
    status: 'pending'
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
    if (status === 'completed') {
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

// Soft delete order
exports.deleteOrder = async (id) => {
  const order = await Order.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return order;
};
