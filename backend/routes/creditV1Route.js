const express = require('express')
const {
    initiateTopup,
    confirmTopup,
    getTopupStatus
} = require('../controllers/creditTopupController')
const {
    transferCredits,
    getTransferLimits
} = require('../controllers/creditTransferController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Credit V1 Routes
 * New credit system APIs with wallet support
 */

// Top-up routes
router.post('/topup', authenticate, initiateTopup)
router.get('/topup/:paymentIntentId', authenticate, getTopupStatus)

// Webhook endpoint (should be secured with webhook signature verification)
// In production, this should be a separate endpoint with different auth
router.post('/topup/confirm', confirmTopup)

// Transfer routes
router.post('/transfer', authenticate, transferCredits)
router.get('/transfer/limits', authenticate, getTransferLimits)

module.exports = router

