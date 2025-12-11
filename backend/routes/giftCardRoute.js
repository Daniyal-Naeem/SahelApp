const express = require('express')
const {
    getGiftCards,
    getGiftCardByCode,
    createGiftCard,
    createBulkGiftCards,
    redeemGiftCard,
    updateGiftCard,
    deleteGiftCard
} = require('../controllers/giftCardController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Gift Card Routes
 * Phase 8: Gift card management
 */

// Public routes
router.get('/gift-cards/:code', getGiftCardByCode)

// Authenticated routes
router.get('/gift-cards', authenticate, getGiftCards)
router.post('/gift-cards/:code/redeem', authenticate, redeemGiftCard)

// Admin routes
router.post('/gift-cards', authenticate, authorize('admin'), createGiftCard)
router.post('/gift-cards/bulk', authenticate, authorize('admin'), createBulkGiftCards)
router.put('/gift-cards/:id', authenticate, authorize('admin'), updateGiftCard)
router.delete('/gift-cards/:id', authenticate, authorize('admin'), deleteGiftCard)

module.exports = router















