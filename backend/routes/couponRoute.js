const express = require('express')
const {
    getCoupons,
    getCouponByCode,
    validateCoupon,
    createCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Coupon Routes
 * Phase 8: Coupon management
 */

// Public routes
router.get('/coupons', getCoupons)
router.get('/coupons/:code', getCouponByCode)
router.post('/coupons/validate', authenticate, validateCoupon)

// Authenticated routes
router.post('/coupons/:code/apply', authenticate, applyCoupon)

// Admin routes
router.post('/coupons', authenticate, authorize('admin'), createCoupon)
router.put('/coupons/:id', authenticate, authorize('admin'), updateCoupon)
router.delete('/coupons/:id', authenticate, authorize('admin'), deleteCoupon)

module.exports = router







