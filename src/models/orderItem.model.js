const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'Menu item is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [100, 'Quantity cannot exceed 100']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes must not exceed 200 characters'],
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'],
        message: 'Status must be one of: PENDING, PREPARING, READY, SERVED, CANCELLED'
      },
      default: 'PENDING'
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Index for query optimization
orderItemSchema.index({ menu: 1 });
orderItemSchema.index({ status: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
