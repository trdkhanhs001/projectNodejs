const mongoose = require('mongoose');

const diningTableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true,
      minlength: [1, 'Table number must be at least 1 character'],
      maxlength: [20, 'Table number must not exceed 20 characters']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [50, 'Capacity must not exceed 50']
    },
    area: {
      type: String,
      trim: true,
      maxlength: [50, 'Area name must not exceed 50 characters'],
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'],
        message: 'Status must be one of: AVAILABLE, OCCUPIED, RESERVED, CLEANING'
      },
      default: 'AVAILABLE'
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes must not exceed 200 characters'],
      default: null
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
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

diningTableSchema.index({ tableNumber: 1 });
diningTableSchema.index({ status: 1 });
diningTableSchema.index({ isDeleted: 1 });
diningTableSchema.index({ isActive: 1 });
diningTableSchema.index({ area: 1 });

module.exports = mongoose.model('DiningTable', diningTableSchema);
