require('dotenv').config()
const express = require('express');
const cors = require('cors')
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
const debugRoute = require('./routes/debugRoute')

// initialize a new express application instance
const app = express();

// middlewares
app.use(express.json({ limit: '50mb' })) // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// CORS configuration - allow admin panel and mobile app
const allowedOrigins = [
  process.env.ADMIN_URL || 'http://localhost:3000',
  process.env.FRONTEND_URL || 'http://localhost:8081',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://10.0.2.2:8081', // Android emulator
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow Vercel deployments (admin panel and backend)
    if (origin.includes('.vercel.app') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))

// routes
app.use("/api/auth/", authRoute);
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
app.use("/api/", debugRoute); // Debug endpoint

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

// connect to DataBase (MONGODB)

const PORT = process.env.PORT // http://localhost:4000/api/products/ -> POST
const MONGODB_URI = process.env.MONGODB_URI;

// For Vercel serverless deployment
if (process.env.VERCEL) {
  // Connect to MongoDB without listening (Vercel handles requests)
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for Vercel deployment'))
    .catch((error) => console.log(`Error:`, error.message));
} else {
  // For local development
  mongoose.connect(MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Connected to DB, and running on http://localhost:${PORT}/`)))
    .catch((error) => console.log(`Error:`, error.message));
}

// Export for Vercel
module.exports = app;



 