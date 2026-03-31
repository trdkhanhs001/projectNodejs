const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true
    },
    items: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Menu',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          max: [100, 'Quantity cannot exceed 100']
        },
        notes: {
          type: String,
          maxlength: [200, 'Notes must not exceed 200 characters'],
          default: null
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    subtotal: {
      type: Number,
      default: 0,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be less than 0'],
      max: [100, 'Discount cannot be more than 100']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative']
    },
    isEmpty: {
      type: Boolean,
      default: true
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
cartSchema.index({ user: 1 });
cartSchema.index({ isEmpty: 1 });

module.exports = mongoose.model('Cart', cartSchema);
