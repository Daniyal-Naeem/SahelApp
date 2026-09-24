require('dotenv').config()
const express = require('express');
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const productsRoute = require('./routes/productsRoute')
const authRoute = require('./routes/authRoute')
const categoryRoute = require('./routes/categoryRoute')
const orderRoute = require('./routes/orderRoute')
const notificationRoute = require('./routes/notificationRoute')
const cartRoute = require('./routes/cartRoute')
const wishlistRoute = require('./routes/wishlistRoute')
const creditRoute = require('./routes/creditRoute')
const creditV1Route = require('./routes/creditV1Route')
const creditAdminRoute = require('./routes/creditAdminRoute')
const checkoutRoute = require('./routes/checkoutRoute')
const bannerRoute = require('./routes/bannerRoute')
const giftCardRoute = require('./routes/giftCardRoute')
const couponRoute = require('./routes/couponRoute')
const reviewRoute = require('./routes/reviewRoute')
const adminRoute = require('./routes/adminRoute')

// initialize a new express application instance
const app = express();

// Vercel and other proxies terminate TLS upstream; needed for correct client IPs.
app.set('trust proxy', 1);

// middlewares
app.use(helmet())

// Keep the raw body around so webhook signatures can be verified against the
// exact bytes the gateway signed.
app.use(express.json({
  limit: '50mb', // Increase limit for base64 images
  verify: (req, res, buf) => { req.rawBody = buf }
}))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// CORS configuration - allow admin panel and mobile app.
// Origins are matched exactly; add deployment URLs via ADMIN_URL / FRONTEND_URL
// (comma-separated values are supported).
const splitList = (value) =>
  (value || '').split(',').map(item => item.trim()).filter(Boolean)

const allowedOrigins = [
  ...splitList(process.env.ADMIN_URL),
  ...splitList(process.env.FRONTEND_URL),
  ...splitList(process.env.ADDITIONAL_CORS_ORIGINS),
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://10.0.2.2:8081', // Android emulator
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}))

// Rate limiting. Credential and code-guessing endpoints get a much tighter
// budget than ordinary browsing.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' }
})

app.use('/api/', generalLimiter)

// routes
app.use("/api/auth/", authLimiter, authRoute);
app.use("/api/products/", productsRoute);
app.use("/api/categories/", categoryRoute);
app.use("/api/orders/", orderRoute);
app.use("/api/notifications/", notificationRoute);
app.use("/api/cart/", cartRoute);
app.use("/api/wishlist/", wishlistRoute);
app.use("/api/credits/", creditRoute); // Legacy credit routes
app.use("/api/v1/credits/", creditV1Route); // New v1 credit routes (top-up, transfer, etc.)
app.use("/api/v1/checkout/", checkoutRoute); // Checkout credit integration
app.use("/api/v1/admin/credits/", creditAdminRoute); // New v1 credit admin APIs
app.use("/api/", bannerRoute); // Banner & homepage content management
app.use("/api/", giftCardRoute); // Gift card management
app.use("/api/", couponRoute); // Coupon management
app.use("/api/", reviewRoute); // Review approval & moderation
app.use("/api/admin/", adminRoute);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sahal Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// 404 for unknown API routes
app.use('/api/', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central error handler. Keeps internal details out of responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

// connect to DataBase (MONGODB)

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options for better serverless support
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}

// For Vercel serverless deployment
if (process.env.VERCEL) {
  // Connect to MongoDB without listening (Vercel handles requests)
  // Use cached connection if available (for serverless)
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI, mongooseOptions)
      .then(() => console.log('Connected to MongoDB for Vercel deployment'))
      .catch((error) => console.error(`MongoDB connection error:`, error.message));
  }
} else {
  // For local development - bind all interfaces so physical devices on LAN can connect
  mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`Connected to DB, and running on http://0.0.0.0:${PORT}/ (LAN reachable)`)))
    .catch((error) => console.log(`Error:`, error.message));
}

// Export for Vercel
module.exports = app;



 