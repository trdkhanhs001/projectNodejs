const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must not exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits'],
      unique: true
    },
    address: {
      type: String,
      maxlength: [200, 'Address must not exceed 200 characters']
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      enum: {
        values: ['WAITER', 'CHEF', 'CASHIER', 'MANAGER'],
        message: 'Position must be one of: WAITER, CHEF, CASHIER, MANAGER'
      }
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative']
    },
    avatar: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: 'STAFF',
      enum: {
        values: ['STAFF'],
        message: 'Role must be STAFF'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null  // null for system-created accounts (e.g., POS)
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for query optimization
staffSchema.index({ email: 1 });
staffSchema.index({ isDeleted: 1 });
staffSchema.index({ position: 1 });

module.exports = mongoose.model('Staff', staffSchema);
