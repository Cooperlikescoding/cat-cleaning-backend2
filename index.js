const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (replace with a database in production)
const users = new Map();
const coupons = new Map();
const userCoupons = new Map();

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (users.has(username)) {
            return res.json({ success: false, message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.set(username, hashedPassword);
        userCoupons.set(username, new Set());

        res.json({ success: true, data: { username } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = users.get(username);

        if (!hashedPassword || !(await bcrypt.compare(password, hashedPassword))) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        res.json({ success: true, data: { username } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post('/coupons', (req, res) => {
    try {
        const { code, discount } = req.body;
        
        if (coupons.has(code)) {
            return res.json({ success: false, message: 'Coupon code already exists' });
        }

        coupons.set(code, { code, discount, createdAt: Date.now() });
        res.json({ success: true, data: coupons.get(code) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/coupons', (req, res) => {
    try {
        const couponList = Array.from(coupons.values());
        res.json({ success: true, data: couponList });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post('/coupons/assign', (req, res) => {
    try {
        const { couponCode, username } = req.body;
        
        if (!users.has(username)) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        if (!coupons.has(couponCode)) {
            return res.json({ success: false, message: 'Coupon not found' });
        }

        const userCouponSet = userCoupons.get(username);
        userCouponSet.add(couponCode);

        res.json({ 
            success: true, 
            data: { couponCode, username, assignedAt: Date.now() }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/coupons/user/:username', (req, res) => {
    try {
        const { username } = req.params;
        
        if (!users.has(username)) {
            return res.json({ success: false, message: 'User not found' });
        }

        const userCouponSet = userCoupons.get(username);
        const userCouponList = Array.from(userCouponSet)
            .map(code => coupons.get(code))
            .filter(Boolean);

        res.json({ success: true, data: userCouponList });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.delete('/coupons/:code', (req, res) => {
    try {
        const { code } = req.params;
        
        if (!coupons.has(code)) {
            return res.json({ success: false, message: 'Coupon not found' });
        }

        coupons.delete(code);
        
        // Remove coupon from all users
        for (const userCouponSet of userCoupons.values()) {
            userCouponSet.delete(code);
        }

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/coupons/check/:code', (req, res) => {
    try {
        const { code } = req.params;
        const coupon = coupons.get(code);
        
        if (!coupon) {
            return res.json({ success: false, message: 'Invalid coupon' });
        }

        res.json({ success: true, data: coupon });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.delete('/coupons/user/:username/coupon/:code', (req, res) => {
    try {
        const { username, code } = req.params;
        
        if (!users.has(username)) {
            return res.json({ success: false, message: 'User not found' });
        }

        const userCouponSet = userCoupons.get(username);
        if (!userCouponSet.has(code)) {
            return res.json({ success: false, message: 'User does not have this coupon' });
        }

        userCouponSet.delete(code);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 