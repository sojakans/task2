# E-Commerce Checkout & Payment System

Live Demo:
YOUR_DEPLOYMENT_URL

GitHub:
YOUR_GITHUB_URL

---

## Project Overview
The **Techloom Store E-Commerce Platform** is a specialized mini e-commerce platform built for maker electronics, microcontrollers, and IoT development kits. Developed as part of **Task 02 of the Techloom.ai Software Engineer Intern Practical Assessment**, the system implements clean architecture, production-grade inventory safeguards, atomic stock reservations with guaranteed 5-minute hold windows, duplicate-payment idempotency protection, automated background expiration workers, cancellation workflows with instant refund simulations, and the official **"Precision Spec Modern"** UI design from the Stitch specification.

---

## Features
- **Parametric Hardware Discovery**: Backend-driven multi-parameter search, category filtering (Microcontrollers, Sensors, Displays, Robotics), price bounds, in-stock toggles, and multi-field sorting.
- **Authoritative Server Pricing**: All subtotals, quantity adjustments, and final order totals are verified and calculated strictly on the backend. Client prices are never trusted.
- **Atomic Stock Reservation (5-Minute Hold)**: Prevents race conditions and overselling using MongoDB atomic operations (`$inc: -qty` conditioned on `availableStock >= qty`).
- **Background Expiration Sweeper**: Autonomous background worker (every 15s) detects expired holds, marks orders `EXPIRED`, and restores inventory without duplicate restorations.
- **Idempotency Shield**: Uses unique `idempotencyKey` values to detect replay attacks and rapid duplicate clicks, returning existing records without double charges.
- **Mock Payment Gateway Simulator**: Labeled sandbox supporting `SUCCESS` (200), `FAILED` (402 decline), and `TIMEOUT` (504 delay) scenarios.
- **Cancellation & Refund Automation**: One-click cancellation for `RESERVED` orders (releases hold) and `PAID` orders (creates simulated `Refund` record and restores stock).
- **Comprehensive Order Audit Trail**: Complete historical logs maintaining immutable prices, payment states, and refund links.

---

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Axios, Responsive Vanilla CSS adhering to the Stitch *Precision Spec Modern* Design System.
- **Backend**: Node.js, Express.js (REST API architecture).
- **Database**: MongoDB / MongoDB Atlas via Mongoose with built-in zero-config in-memory fallback (`mongodb-memory-server`) for evaluation environments.
- **Testing**: Automated concurrency testing suites and end-to-end integration test runners.

---

## Architecture

```
task-02/
│
├── client/                     # React 18 + Vite Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Header, Footer, ProductCard, StatusBadge, ReservationCountdown, CancelOrderModal
│   │   ├── pages/              # Home, Products, ProductDetails, Cart, Checkout, Payment, OrderSuccess, OrderHistory, OrderDetails
│   │   ├── services/           # Axios API Client (productService, cartService, orderService, paymentService)
│   │   ├── hooks/              # useCart, useCountdown
│   │   ├── context/            # CartContext (Local storage persistence + backend synchronization)
│   │   ├── utils/              # formatters.js (currency, dates, idempotency keys)
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── main.jsx            # Entry DOM mounting
│   │   └── index.css           # Stitch "Precision Spec Modern" design tokens & utilities
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection with memory-server fallback (db.js)
│   │   ├── controllers/        # productController, cartController, orderController, paymentController, refundController
│   │   ├── models/             # Product, Cart, Order, Payment, Refund (Mongoose schemas)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # inventoryService, orderService, paymentService
│   │   ├── middleware/         # errorHandler, request logger
│   │   ├── utils/              # stateMachine (order transitions), ApiError
│   │   ├── jobs/               # expirationSweeper (automated background reservation sweeper)
│   │   ├── seeds/              # seedProducts (10 realistic hardware electronics products)
│   │   └── app.js              # Express app & listener
│   ├── tests/                  # concurrencyTest.js, runAllTests.js
│   ├── .env.example
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Database Models

### 1. Product
```javascript
{
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true },
  image: { type: String, required: true },
  availableStock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, sparse: true },
  specs: { architecture, clockSpeed, operatingVoltage, flashMemory, ram, interfaces, packageType },
  timestamps: true
}
```

### 2. Cart
```javascript
{
  cartId: { type: String, required: true, unique: true, index: true },
  sessionIdentifier: { type: String, default: null },
  items: [
    {
      productId: { type: ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      image: String,
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  status: { type: String, enum: ['ACTIVE', 'CHECKED_OUT'], default: 'ACTIVE' },
  timestamps: true
}
```

### 3. Order
```javascript
{
  orderId: { type: String, required: true, unique: true, index: true },
  cartId: { type: String, required: true, index: true },
  items: [
    {
      productId: { type: ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      quantity: Number,
      subtotal: Number,
      image: String
    }
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['PENDING', 'RESERVED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID', 'FAILED'], default: 'UNPAID' },
  reservationExpiresAt: { type: Date, required: true, index: true },
  customer: { fullName, email, address, city, postalCode },
  cancelledAt: Date,
  cancelReason: String,
  stockReleased: { type: Boolean, default: false },
  timestamps: true
}
```

### 4. Payment
```javascript
{
  paymentId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  outcome: { type: String, enum: ['SUCCESS', 'FAILED', 'TIMEOUT'], required: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  gatewayReference: String,
  timestamps: true
}
```

### 5. Refund
```javascript
{
  refundId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  paymentId: { type: String, required: true, unique: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'SUCCESS' },
  reason: String,
  timestamps: true
}
```

---

## API Endpoints

### Products
- `GET /api/products`: Query params: `search`, `category`, `minPrice`, `maxPrice`, `available`, `sort`, `page`, `limit`.
- `GET /api/products/:id`: Full technical datasheet and parameters.

### Cart
- `POST /api/carts`: Initialize or retrieve cart (`{ cartId }`).
- `GET /api/carts/:cartId`: Retrieve cart with server-verified prices and totals.
- `POST /api/carts/:cartId/items`: Add item with stock check (`{ productId, quantity }`).
- `PUT /api/carts/:cartId/items/:productId`: Adjust item quantity (`{ quantity }`).
- `DELETE /api/carts/:cartId/items/:productId`: Remove item from cart.

### Checkout & Orders
- `POST /api/checkout`: Atomically reserves stock and locks order for 5 minutes (`{ cartId, customer }`).
- `GET /api/orders`: Complete order history with payments and refunds.
- `GET /api/orders/:orderId`: Single order details with live reservation calculation.
- `POST /api/orders/:orderId/cancel`: Cancel order (`{ reason }`). Releases stock; creates instant refund if paid.

### Payments & Refunds
- `POST /api/payments`: Mock payment endpoint (`{ orderId, outcome, idempotencyKey }`).
- `POST /api/refunds`: Issue refund simulation (`{ orderId, paymentId, amount, reason }`).
- `GET /api/refunds`: List all processed refunds.

### Maintenance
- `POST /api/seed`: Reset and re-seed the hardware catalog with 10 electronics components.
- `GET /api/health`: Service health ping.

---

## Stock Reservation Logic
1. **Atomic Decrement**: When checkout is initiated, `inventoryService.reserveStock(items)` executes conditional atomic updates:
   ```javascript
   Product.findOneAndUpdate(
     { _id: item.productId, availableStock: { $gte: quantity } },
     { $inc: { availableStock: -quantity } },
     { new: true }
   );
   ```
2. **Multi-Item Rollback**: If any single component in a multi-item cart cannot be fulfilled, any preceding decrements in that checkout are immediately compensated and restored.
3. **Idempotent Restoration**: Orders contain an atomic `stockReleased` boolean flag. Once stock is returned upon cancellation or expiration, `stockReleased` is set to `true`, guaranteeing stock is never restored twice.

---

## Concurrency Protection
Simultaneous checkout requests competing for limited stock are protected by database-level row conditions:
- **Scenario Tested**: Product with `availableStock = 1`.
- Two concurrent customers fire checkout simultaneously.
- Only the first atomic transaction succeeds and sets available stock to `0`.
- The second transaction detects `availableStock: { $gte: 1 }` is false, fails immediately with `409 Conflict`, and stock never goes below zero.
- **Stress Tested**: 12 simultaneous checkouts against 5 available items: Exactly 5 succeed, 7 fail, remaining stock equals `0`.

---

## Payment Flow
1. Customer initiates checkout -> Order created in `RESERVED` status with `reservationExpiresAt = now + 5 minutes`.
2. Customer navigates to `/payment/:orderId`.
3. In the sandbox, the user selects:
   - **SUCCESS**: Sets order to `PAID`, payment to `SUCCESS`, and reserves stock permanently.
   - **FAILED**: Sets order to `FAILED`, payment to `FAILED`, and immediately releases reserved stock back to the pool.
   - **TIMEOUT**: Payment remains `PENDING`. If 5 minutes pass without confirmation, the background sweeper marks the order `EXPIRED` and restores stock.

---

## Duplicate Payment Protection
- Every payment request requires a client-generated `idempotencyKey`.
- Before executing any payment logic, the server queries `Payment.findOne({ idempotencyKey })`.
- If an existing payment is found, the server immediately returns the cached payment record with HTTP 200 and `{ isIdempotentReplay: true }`.
- No secondary payment is created, no duplicate order state is altered, and no stock is modified.
- Payments submitted against `PAID`, `EXPIRED`, `FAILED`, or `CANCELLED` orders are strictly rejected with HTTP 409.

---

## Cancellation & Refund
- **Cancelling a `RESERVED` Order**: Order transitions to `CANCELLED`, and held inventory is atomically restored.
- **Cancelling a `PAID` Order**: Order transitions to `CANCELLED`, a `Refund` record is generated with status `SUCCESS` for the exact amount, and inventory is restored.
- **Duplicate Cancellation Rejection**: Already `CANCELLED` or `EXPIRED` orders reject subsequent cancellation attempts with HTTP 409.

---

## Order Lifecycle

```
           ┌────────────────┐
           │    PENDING     │
           └───────┬────────┘
                   │ (Checkout starts)
                   ▼
           ┌────────────────┐
           │    RESERVED    │ (5-Minute Hold)
           └──┬────┬────┬───┘
              │    │    │
   (Payment   │    │    │ (Payment   (Reservation
    SUCCESS)  │    │    │  FAILED)    Expires)
              │    │    │
              ▼    │    ▼               ▼
     ┌──────────┐  │ ┌──────────┐  ┌──────────┐
     │   PAID   │  │ │  FAILED  │  │ EXPIRED  │
     └────┬─────┘  │ └──────────┘  └──────────┘
          │        │
 (Cancel  │        │ (Cancel before payment)
  & Refund│        │
          ▼        ▼
       ┌───────────────┐
       │   CANCELLED   │
       └───────────────┘
```

**Invalid Transitions Prevented by State Machine:**
- `EXPIRED` -> `PAID` ❌
- `FAILED` -> `PAID` ❌
- `CANCELLED` -> `PAID` ❌
- `PAID` -> `RESERVED` ❌

---

## Environment Variables

Create `.env` inside `task-02/server/`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=
RESERVATION_MINUTES=5
SWEEPER_INTERVAL_MS=15000
```
*(Note: If `MONGODB_URI` is left blank, the server automatically starts an in-memory MongoDB instance for zero-config evaluation).*

---

## Local Setup

### 1. Clone Repository & Enter Task Directory
```bash
cd task-02
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## Running Backend
From `task-02/server`:
```bash
npm run dev
# or
npm start
```
The server will boot at `http://localhost:5000`, automatically initialize the database, seed 10 sample products, and start the background expiration sweeper.

---

## Running Frontend
From `task-02/client`:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Testing

### Run All 35 Integration & Lifecycle Tests
From `task-02/server`:
```bash
npm test
```
Validates:
1. Product discovery, search, category, price range, availability, and sort queries.
2. Cart operations and server-calculated price verification.
3. Atomic stock reservation at checkout.
4. Duplicate payment prevention via idempotency key.
5. Payment failure and automatic stock release.
6. Reservation expiration sweeper and idempotent stock recovery.
7. Order cancellation on reserved and paid orders with simulated refunds.
8. Duplicate cancellation and refund rejections.

### Run Critical Concurrency Test
From `task-02/server`:
```bash
npm run test:concurrency
```
Validates:
- 2 simultaneous checkout requests for a product with 1 available unit. (Result: exactly 1 succeeds, 1 fails, remaining stock is 0).
- 12 concurrent requests for a product with 5 units. (Result: exactly 5 succeed, 7 fail, remaining stock is 0).

---

## Deployment
1. Build the production React bundle:
   ```bash
   cd task-02/client
   npm run build
   ```
2. Serve the backend via Node.js / Docker / Render / Railway / AWS EC2 with environment variables:
   - `MONGODB_URI`: Connection string to MongoDB Atlas.
   - `PORT`: `5000` (or host port).
   - `CLIENT_URL`: URL of the deployed frontend.
