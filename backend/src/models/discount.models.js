const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Discount code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'Code must not exceed 50 characters']
    },

    description: {
      type: String,
      maxlength: [255, 'Description must not exceed 255 characters'],
      default: null
    },

    type: {
      type: String,
      enum: {
        values: ['PERCENTAGE', 'FIXED'],
        message: 'Type must be either PERCENTAGE or FIXED'
      },
      required: [true, 'Discount type is required']
    },

    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Value cannot be negative']
    },

    maxDiscountAmount: {
      type: Number,
      min: [0, 'Max discount amount cannot be negative'],
      default: null
    },

    minOrderAmount: {
      type: Number,
      min: [0, 'Min order amount cannot be negative'],
      default: 0
    },

    usageLimit: {
      type: Number,
      min: [0, 'Usage limit cannot be negative'],
      default: null // null = unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative']
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },

    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
        message: 'Status must be ACTIVE, INACTIVE or EXPIRED'
      },
      default: 'ACTIVE'
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

discountSchema.index({ code: 1 }, { unique: true });
discountSchema.index({ status: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });
discountSchema.index({ isDeleted: 1 });

discountSchema.methods.isValid = function () {
  const now = new Date();

  return (
    this.status === 'ACTIVE' &&
    !this.isDeleted &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

discountSchema.methods.calculateDiscount = function (orderAmount) {
  if (!this.isValid()) return 0;

  if (orderAmount < this.minOrderAmount) return 0;

  let discount = 0;

  if (this.type === 'PERCENTAGE') {
    discount = (orderAmount * this.value) / 100;

    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = this.value;
  }

  return discount;
};

module.exports = mongoose.model('Discount', discountSchema);
