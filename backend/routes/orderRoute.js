const express = require('express')
const {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getUserOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

// Create new order (authenticated users)
router.post('/', authenticate, createOrder)

// Get user's own orders (authenticated users)
router.get('/my-orders', authenticate, getUserOrders)

// Get all orders (admin/vendor only)
router.get('/all', authenticate, authorize('admin', 'vendor'), getAllOrders)

// Get single order
router.get('/:id', authenticate, getSingleOrder)

// Update order status (admin/vendor only)
router.put('/:id/status', authenticate, authorize('admin', 'vendor'), updateOrderStatus)

// Cancel order
router.put('/:id/cancel', authenticate, cancelOrder)

module.exports = router

