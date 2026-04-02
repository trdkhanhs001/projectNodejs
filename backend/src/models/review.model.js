const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'Menu item is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [500, 'Comment must not exceed 500 characters']
    },
    helpful: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative']
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: [0, 'Not helpful count cannot be negative']
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    hiddenReason: {
      type: String,
      maxlength: [200, 'Hidden reason must not exceed 200 characters'],
      default: null
    },
    hiddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Index for query optimization
reviewSchema.index({ menu: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isDeleted: 1 });
reviewSchema.index({ isHidden: 1 });

module.exports = mongoose.model('Review', reviewSchema);
