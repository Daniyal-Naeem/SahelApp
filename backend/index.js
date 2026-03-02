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
const vipRoute = require('./routes/vipRoute')
const supportRoute = require('./routes/supportRoute')
const supportAdminRoute = require('./routes/supportAdminRoute')
const adminRoute = require('./routes/adminRoute')
const debugRoute = require('./routes/debugRoute')
const celebrationRoute = require('./routes/celebrationRoute')
const deliveryRoute = require('./routes/deliveryRoute')

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

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'))

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
app.use("/api/vip/", vipRoute); // VIP Club management
app.use("/api/support/", supportRoute); // Support/Chat system (user)
app.use("/api/support/admin/", supportAdminRoute); // Support/Chat admin (admin panel)
app.use("/api/celebrations/", celebrationRoute); // Celebration events & campaigns
app.use("/api/delivery/", deliveryRoute); // Delivery tracking
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

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { setSocketIO } = require('./services/socketService');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options for better serverless support
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// For Vercel serverless deployment - no Socket.io (serverless doesn't support WebSockets)
if (process.env.VERCEL) {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI, mongooseOptions)
      .then(() => console.log('Connected to MongoDB for Vercel deployment'))
      .catch((error) => console.error(`MongoDB connection error:`, error.message));
  }
  module.exports = app;
} else {
  // Local development - HTTP server + Socket.io for real-time support chat
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8081',
        'http://10.0.2.2:8081',
      ],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.role === 'admin') {
      socket.join('admin');
    } else {
      socket.join(`user:${socket.userId}`);
    }
    socket.on('disconnect', () => {});
  });

  setSocketIO(io);

  mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
      server.listen(PORT, () => {
        console.log(`Connected to DB, and running on http://localhost:${PORT}/`);
        console.log(`Socket.io enabled for real-time support chat`);
      });
    })
    .catch((error) => console.log(`Error:`, error.message));

  module.exports = app;
}



 