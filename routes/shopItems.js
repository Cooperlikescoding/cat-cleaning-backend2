const express = require('express');
const router = express.Router();
const ShopItem = require('../models/ShopItem');
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');

// Get all items for a shop
router.get('/shop/:shopId', async (req, res) => {
    try {
        const items = await ShopItem.find({ shop: req.params.shopId });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new item
router.post('/', auth, async (req, res) => {
    try {
        // Check if user owns the shop
        const shop = await Shop.findById(req.body.shop);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const item = new ShopItem(req.body);
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update item
router.patch('/:id', auth, async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user owns the shop
        const shop = await Shop.findById(item.shop);
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(item, req.body);
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user owns the shop
        const shop = await Shop.findById(item.shop);
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await item.remove();
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 