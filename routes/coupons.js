const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const UserCoupon = require('../models/UserCoupon');

// Create coupon
router.post('/', async (req, res) => {
  try {
    const { code, discount } = req.body;

    // Check if coupon exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon already exists' });
    }

    // Create coupon
    const coupon = new Coupon({ code, discount });
    await coupon.save();

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign coupon to user
router.post('/assign', async (req, res) => {
  try {
    const { username, code } = req.body;

    // Find user and coupon
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(400).json({ error: 'Coupon not found' });
    }

    // Assign coupon to user
    const userCoupon = new UserCoupon({
      userId: user._id,
      couponId: coupon._id
    });
    await userCoupon.save();

    res.json({ message: 'Coupon assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's coupons
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Get user's coupons
    const userCoupons = await UserCoupon.find({ userId: user._id })
      .populate('couponId');

    const coupons = userCoupons.map(uc => uc.couponId);
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove coupon globally
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Find and delete coupon
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(400).json({ error: 'Coupon not found' });
    }

    // Delete coupon and all its assignments
    await Promise.all([
      Coupon.deleteOne({ _id: coupon._id }),
      UserCoupon.deleteMany({ couponId: coupon._id })
    ]);

    res.json({ message: 'Coupon removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove coupon from user
router.delete('/user/:username/coupon/:code', async (req, res) => {
  try {
    const { username, code } = req.params;

    // Find user and coupon
    const [user, coupon] = await Promise.all([
      User.findOne({ username }),
      Coupon.findOne({ code })
    ]);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (!coupon) {
      return res.status(400).json({ error: 'Coupon not found' });
    }

    // Remove coupon from user
    await UserCoupon.deleteOne({
      userId: user._id,
      couponId: coupon._id
    });

    res.json({ message: 'Coupon removed from user successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 