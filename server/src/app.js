require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedProducts, sampleProducts } = require('./seeds/seedProducts');
const { startExpirationSweeper } = require('./jobs/expirationSweeper');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const refundRoutes = require('./routes/refundRoutes');
const orderController = require('./controllers/orderController');
const { optionalAuth } = require('./middleware/auth');
const Product = require('./models/Product');

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Request logger for assessment demonstration
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Techloom E-Commerce Engine',
  });
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.post('/api/checkout', optionalAuth, orderController.checkout);
app.use('/api/orders', optionalAuth, orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);

// Database Re-seed endpoint for testing
app.post('/api/seed', async (req, res, next) => {
  try {
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    res.json({
      success: true,
      message: `Database re-seeded with ${inserted.length} fresh products`,
    });
  } catch (err) {
    next(err);
  }
});

// 404 Route Catch-all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize server if run directly
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedProducts();
      startExpirationSweeper(Number(process.env.SWEEPER_INTERVAL_MS) || 15000);

      app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Techloom Store Engine running on http://localhost:${PORT}`);
        console.log(`   Frontend client allowed: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
        console.log(`====================================================`);
      });
    } catch (error) {
      console.error('Fatal initialization error:', error);
      process.exit(1);
    }
  })();
}

module.exports = app;
