require('dotenv').config()
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const productsRoute = require('./routes/productsRoute')
const authRoute = require('./routes/authRoute')
const categoryRoute = require('./routes/categoryRoute')
const orderRoute = require('./routes/orderRoute')
const notificationRoute = require('./routes/notificationRoute')
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

// middlewares
app.use(express.json({ limit: '50mb' })) // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cors())

// routes
app.use("/api/auth/", authRoute);
app.use("/api/products/", productsRoute);
app.use("/api/categories/", categoryRoute);
app.use("/api/orders/", orderRoute);
app.use("/api/notifications/", notificationRoute);
app.use("/api/credits/", creditRoute); // Legacy credit routes
app.use("/api/v1/credits/", creditV1Route); // New v1 credit routes (top-up, transfer, etc.)
app.use("/api/v1/checkout/", checkoutRoute); // Checkout credit integration
app.use("/api/v1/admin/credits/", creditAdminRoute); // New v1 credit admin APIs
app.use("/api/", bannerRoute); // Banner & homepage content management
app.use("/api/", giftCardRoute); // Gift card management
app.use("/api/", couponRoute); // Coupon management
app.use("/api/", reviewRoute); // Review approval & moderation
app.use("/api/admin/", adminRoute);



// connect to DataBase (MONGODB)

const PORT = process.env.PORT // http://localhost:4000/api/products/ -> POST
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Connected to DB, and running on http://localhost:${PORT}/`)))
    .catch((error) => console.log(`Error:`, error.message))



 