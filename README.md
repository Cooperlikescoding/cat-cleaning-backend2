# Cat Cleaning Backend

This is the backend server for the Cat Cleaning app, built with Express.js and MongoDB.

## Setup

1. Install MongoDB locally or use a cloud service
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/cat-cleaning
   PORT=3000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
  - Body: `{ username, password }`
- `POST /auth/login` - Login user
  - Body: `{ username, password }`

### Coupons
- `POST /coupons` - Create a new coupon
  - Body: `{ code, discount }`
- `GET /coupons` - Get all coupons
- `POST /coupons/assign` - Assign coupon to user
  - Body: `{ username, code }`
- `GET /coupons/user/:username` - Get user's coupons
- `DELETE /coupons/:code` - Remove coupon globally
- `DELETE /coupons/user/:username/coupon/:code` - Remove coupon from user

### Rewards
- `POST /rewards/purchase` - Record a purchase and calculate rewards
  - Body: `{ username, amount }`
- `GET /rewards/balance/:username` - Get user's rewards balance
- `GET /rewards/purchases/:username` - Get user's purchase history
- `POST /rewards/redeem` - Redeem rewards for a coupon
  - Body: `{ username, code }` 