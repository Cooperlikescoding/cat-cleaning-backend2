const mongoose = require('mongoose');

const userCouponSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can't have the same coupon twice
userCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true });

module.exports = mongoose.model('UserCoupon', userCouponSchema); 