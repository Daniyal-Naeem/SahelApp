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
const adminRoute = require('./routes/adminRoute')

// initialize a new express application instance
const app = express();

// middlewares
app.use(express.json())
app.use(cors())

// routes
app.use("/api/auth/", authRoute);
app.use("/api/products/", productsRoute);
app.use("/api/categories/", categoryRoute);
app.use("/api/orders/", orderRoute);
app.use("/api/notifications/", notificationRoute);
app.use("/api/credits/", creditRoute);
app.use("/api/admin/", adminRoute);



// connect to DataBase (MONGODB)

const PORT = process.env.PORT // http://localhost:4000/api/products/ -> POST
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Connected to DB, and running on http://localhost:${PORT}/`)))
    .catch((error) => console.log(`Error:`, error.message))



 