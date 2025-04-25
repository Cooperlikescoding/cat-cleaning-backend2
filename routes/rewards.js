const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Coupon = require('../models/Coupon');
const UserCoupon = require('../models/UserCoupon');

// Add purchase and calculate rewards
router.post('/purchase', async (req, res) => {
  try {
    const { username, amount } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Calculate rewards (1 point per $1 spent)
    const rewardsEarned = Math.floor(amount);

    // Create purchase record
    const purchase = new Purchase({
      userId: user._id,
      amount,
      rewardsEarned
    });
    await purchase.save();

    // Update user's rewards balance
    user.rewardsPoints += rewardsEarned;
    await user.save();

    res.json({
      message: 'Purchase recorded successfully',
      rewardsEarned,
      newBalance: user.rewardsPoints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rewards balance
router.get('/balance/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    res.json({ rewardsPoints: user.rewardsPoints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get purchase history
router.get('/purchases/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const purchases = await Purchase.find({ userId: user._id })
      .sort({ timestamp: -1 });

    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem rewards for a coupon
router.post('/redeem', async (req, res) => {
  try {
    const { username, code } = req.body;

    // Find user and coupon
    const [user, coupon] = await Promise.all([
      User.findOne({ username }),
      Coupon.findOne({ code, type: 'rewards' })
    ]);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (!coupon) {
      return res.status(400).json({ error: 'Rewards coupon not found' });
    }

    // Check if user has enough points
    if (user.rewardsPoints < coupon.points) {
      return res.status(400).json({ error: 'Insufficient rewards points' });
    }

    // Deduct points and assign coupon
    user.rewardsPoints -= coupon.points;
    await user.save();

    const userCoupon = new UserCoupon({
      userId: user._id,
      couponId: coupon._id
    });
    await userCoupon.save();

    res.json({
      message: 'Rewards redeemed successfully',
      newBalance: user.rewardsPoints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 