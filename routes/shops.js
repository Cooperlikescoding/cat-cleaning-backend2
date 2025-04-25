const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');

// Get all shops
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find().populate('owner', 'username');
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get shop by ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'username');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new shop
router.post('/', auth, async (req, res) => {
    const shop = new Shop({
        ...req.body,
        owner: req.user._id
    });

    try {
        const newShop = await shop.save();
        res.status(201).json(newShop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update shop
router.patch('/:id', auth, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check if user is the owner
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(shop, req.body);
        const updatedShop = await shop.save();
        res.json(updatedShop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete shop
router.delete('/:id', auth, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check if user is the owner
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await shop.remove();
        res.json({ message: 'Shop deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;