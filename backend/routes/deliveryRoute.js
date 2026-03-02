const express = require('express')
const {
    assignDeliveryPerson,
    updateDeliveryLocation,
    markOrderDelivered,
    getDeliveryDetails
} = require('../controllers/deliveryController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Delivery Routes
 * Handle delivery person assignment and location tracking
 */

// Assign delivery person (admin/vendor only)
router.put('/:orderId/assign', authenticate, authorize('admin'), assignDeliveryPerson)

// Update delivery location (admin only for now, could be delivery person app)
router.put('/:orderId/location', authenticate, authorize('admin'), updateDeliveryLocation)

// Mark order as delivered (admin only for now)
router.put('/:orderId/deliver', authenticate, authorize('admin'), markOrderDelivered)

// Get delivery details (authenticated users can see their own orders)
router.get('/:orderId', authenticate, getDeliveryDetails)

module.exports = router
