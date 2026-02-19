const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/authMiddleware')
const {
    getVIPStatus,
    joinVIPClub,
    updateVIPTier,
    addVIPPoints
} = require('../controllers/vipController')

// Get user's VIP status (authenticated)
router.get('/status', authenticate, getVIPStatus)

// Join VIP Club (authenticated)
router.post('/join', authenticate, joinVIPClub)

// Update VIP tier (admin only)
router.put('/:userId/tier', authenticate, authorize('admin'), updateVIPTier)

// Add VIP points (authenticated - can be called by system after orders/reviews)
router.post('/points', authenticate, addVIPPoints)

module.exports = router

