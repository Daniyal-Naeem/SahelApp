const express = require('express')
const {
    getUserCredits,
    getCreditTransactions,
    adminAddCredits,
    adminDeductCredits
} = require('../controllers/creditController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

// Get user's credit balance (authenticated users)
router.get('/balance', authenticate, getUserCredits)

// Get credit transaction history (authenticated users)
router.get('/transactions', authenticate, getCreditTransactions)

// Admin: Add credits to user
router.post('/admin/add', authenticate, authorize('admin'), adminAddCredits)

// Admin: Deduct credits from user
router.post('/admin/deduct', authenticate, authorize('admin'), adminDeductCredits)

module.exports = router

