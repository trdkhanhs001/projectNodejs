const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'forgot_password', 'verify_email'],
    default: 'signup'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL: 10 minutes
  }
});

module.exports = mongoose.model('OTP', otpSchema);
