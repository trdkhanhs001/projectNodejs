const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['CASH', 'CARD', 'ONLINE', 'WALLET'],
        message: 'Payment method must be one of: CASH, CARD, ONLINE, WALLET'
      },
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        message: 'Status must be one of: PENDING, COMPLETED, FAILED, REFUNDED'
      },
      default: 'PENDING'
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction ID must not exceed 100 characters'],
      default: null
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes must not exceed 500 characters'],
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    createdBy: {
      type: String,
      default: 'system'
    },
    updatedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for query optimization
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Payment', paymentSchema);