const express = require('express')
const {
    getGiftCards,
    getGiftCardById,
    getGiftCardByCode,
    createGiftCard,
    createBulkGiftCards,
    redeemGiftCard,
    updateGiftCard,
    deleteGiftCard,
    sendGiftCard
} = require('../controllers/giftCardController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Gift Card Routes
 * Phase 8: Gift card management
 */

// Authenticated list / send (literal paths before :code)
router.get('/gift-cards', authenticate, getGiftCards)
router.post('/gift-cards/send', authenticate, sendGiftCard)
router.post('/gift-cards/:code/redeem', authenticate, redeemGiftCard)
router.get('/gift-cards/:code', getGiftCardByCode)

// Admin routes
router.get('/gift-cards/admin/:id', authenticate, authorize('admin'), getGiftCardById)
router.post('/gift-cards', authenticate, authorize('admin'), createGiftCard)
router.post('/gift-cards/bulk', authenticate, authorize('admin'), createBulkGiftCards)
router.put('/gift-cards/:id', authenticate, authorize('admin'), updateGiftCard)
router.delete('/gift-cards/:id', authenticate, authorize('admin'), deleteGiftCard)

module.exports = router
