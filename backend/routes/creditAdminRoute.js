const express = require('express')
const {
    getCreditBalances,
    getCreditTransactions,
    getUserCreditBalance,
    getCreditStats,
    adjustCredit
} = require('../controllers/creditAdminController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

// All credit admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

/**
 * Credit Admin Routes (v1)
 * Phase 1: Read-only monitoring APIs
 */

// Get credit system statistics
router.get('/stats', getCreditStats)

// Get all user credit balances with filters
router.get('/balances', getCreditBalances)

// Get specific user's credit balance
router.get('/balance/:userId', getUserCreditBalance)

// Get all credit transactions with filters
router.get('/transactions', getCreditTransactions)

// Manually adjust user credit balance
router.post('/adjust', adjustCredit)

module.exports = router

