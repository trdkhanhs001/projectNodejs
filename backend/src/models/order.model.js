const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null  // Optional for guest orders
    },

    // Guest info (for guest/offline orders)
    guestName: {
      type: String,
      default: null
    },
    guestEmail: {
      type: String,
      default: null
    },
    guestPhone: {
      type: String,
      default: null
    },
    guestAddress: {
      type: String,
      default: null
    },


    orderType: {
      type: String,
      enum: {
        values: ['ONLINE', 'DINE_IN'],
        message: 'Order type must be one of: ONLINE, DINE_IN'
      },
      required: [true, 'Order type is required']
    },


    tableNumber: {
      type: String,
      default: null,
      trim: true,
      minlength: [1, 'Table number must be at least 1 character'],
      maxlength: [20, 'Table number must not exceed 20 characters']
    },

    deliveryAddress: {
      type: String,
      maxlength: [200, 'Delivery address must not exceed 200 characters'],
      default: null
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative']
    },

    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem'
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
    discountCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'],
        message: 'Status must be one of: PENDING, CONFIRMED, PREPARING, READY, DELIVERING, DELIVERED, CANCELLED'
      },
      default: 'PENDING'
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['UNPAID', 'PAID', 'PARTIAL', 'REFUNDED'],
        message: 'Payment status must be one of: UNPAID, PAID, PARTIAL, REFUNDED'
      },
      default: 'UNPAID'
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['CASH', 'CARD', 'ONLINE', 'WALLET'],
        message: 'Payment method must be one of: CASH, CARD, ONLINE, WALLET'
      },
      default: 'CASH'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes must not exceed 500 characters'],
      default: null
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    rating: {
      type: Number,
      default: null,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    review: {
      type: String,
      maxlength: [500, 'Review must not exceed 500 characters'],
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ✅ THÊM MỚI: Validation theo orderType
orderSchema.pre('validate', function (next) {
  if (this.orderType === 'DINE_IN') {
    if (!this.tableNumber) {
      return next(new Error('Đặt tại quán (DINE_IN) phải có tableNumber'));
    }
    // DINE_IN không cần deliveryFee
    this.deliveryFee = 0;
    this.deliveryAddress = null;
  }

  if (this.orderType === 'ONLINE') {
    if (!this.deliveryAddress) {
      return next(new Error('Đặt online phải có deliveryAddress'));
    }
    // ONLINE không cần tableNumber
    this.tableNumber = null;
  }

  next();
});

// Index for query optimization
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderType: 1 }); // ✅ THÊM MỚI
orderSchema.index({ isDeleted: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);