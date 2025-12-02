const express = require('express')
const {
    applyCredit,
    completeCheckout,
    refundCredit
} = require('../controllers/checkoutCreditController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Checkout Routes
 * Credit integration for checkout flow
 */

// All routes require authentication
router.use(authenticate)

// Apply credit to order (reserve)
router.post('/apply-credit', applyCredit)

// Complete checkout (consume reserved credits)
router.post('/complete', completeCheckout)

// Refund credit from cancelled order
router.post('/refund-credit', refundCredit)

module.exports = router







