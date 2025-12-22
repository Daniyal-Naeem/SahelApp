require('dotenv').config()
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const productsRoute = require('./routes/productsRoute')

const app = express();

app.use(express.json())
app.use(cors())

app.use("/api/products/", productsRoute);

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Connected to DB, and running on http://localhost:${PORT}/`)))
    .catch((error) => console.log(`Error:`, error.message))