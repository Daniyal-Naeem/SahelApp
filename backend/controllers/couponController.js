const couponModel = require('../models/couponModel')
const couponUsageModel = require('../models/couponUsageModel')
const orderModel = require('../models/orderModel')

/**
 * Coupon Controller
 * Phase 8: Coupon management
 */

/**
 * GET /api/coupons
 * Get active coupons (public)
 */
const getCoupons = async (req, res) => {
    try {
        const now = new Date()
        const coupons = await couponModel.find({
            isActive: true,
            startsAt: { $lte: now },
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gte: now } }
            ]
        })
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'title')
            .sort({ createdAt: -1 })

        return res.status(200).json(coupons)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/coupons/:code
 * Get coupon by code
 */
const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params
        const coupon = await couponModel.findOne({ code: code.toUpperCase() })
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'title')

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' })
        }

        // Check if expired
        const now = new Date()
        if (coupon.expiresAt && now > coupon.expiresAt) {
            return res.status(400).json({ error: 'Coupon has expired' })
        }

        if (coupon.startsAt && now < coupon.startsAt) {
            return res.status(400).json({ error: 'Coupon is not yet active' })
        }

        return res.status(200).json(coupon)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/coupons/validate
 * Validate coupon for order
 */
const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal, items } = req.body
        const userId = req.user?.userId

        const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true })
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' })
        }

        // Check expiry
        const now = new Date()
        if (coupon.expiresAt && now > coupon.expiresAt) {
            return res.status(400).json({ error: 'Coupon has expired' })
        }

        if (coupon.startsAt && now < coupon.startsAt) {
            return res.status(400).json({ error: 'Coupon is not yet active' })
        }

        // Check usage limits
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
            return res.status(400).json({ error: 'Coupon usage limit reached' })
        }

        if (userId && coupon.maxUsesPerUser) {
            const userUsage = await couponUsageModel.countDocuments({ coupon: coupon._id, user: userId })
            if (userUsage >= coupon.maxUsesPerUser) {
                return res.status(400).json({ error: 'You have reached the maximum uses for this coupon' })
            }
        }

        // Check minimum purchase
        if (orderTotal < coupon.minPurchase) {
            return res.status(400).json({ 
                error: `Minimum purchase of ${coupon.minPurchase} required`,
                minPurchase: coupon.minPurchase
            })
        }

        // Calculate discount
        let discount = 0
        if (coupon.discountType === 'percentage') {
            discount = (orderTotal * coupon.discountValue) / 100
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount)
            }
        } else {
            discount = coupon.discountValue
        }

        discount = Math.min(discount, orderTotal) // Can't discount more than total

        return res.status(200).json({
            valid: true,
            coupon: {
                code: coupon.code,
                name: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            },
            discount: discount,
            finalAmount: orderTotal - discount
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/coupons
 * Create coupon (admin only)
 */
const createCoupon = async (req, res) => {
    try {
        const couponData = {
            ...req.body,
            code: req.body.code?.toUpperCase(),
            createdBy: req.user.userId
        }
        const coupon = await couponModel.create(couponData)
        return res.status(201).json(coupon)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Coupon code already exists' })
        }
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/coupons/:code/apply
 * Apply coupon to order
 */
const applyCoupon = async (req, res) => {
    try {
        const { code } = req.params
        const { orderId, orderTotal } = req.body
        const userId = req.user.userId

        const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true })
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' })
        }

        // Check if already used for this order
        const existingUsage = await couponUsageModel.findOne({ coupon: coupon._id, order: orderId })
        if (existingUsage) {
            return res.status(400).json({ error: 'Coupon already applied to this order' })
        }

        // Validate coupon (check expiry, limits, etc.)
        const now = new Date()
        if (coupon.expiresAt && now > coupon.expiresAt) {
            return res.status(400).json({ error: 'Coupon has expired' })
        }

        if (coupon.startsAt && now < coupon.startsAt) {
            return res.status(400).json({ error: 'Coupon is not yet active' })
        }

        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
            return res.status(400).json({ error: 'Coupon usage limit reached' })
        }

        if (userId && coupon.maxUsesPerUser) {
            const userUsage = await couponUsageModel.countDocuments({ coupon: coupon._id, user: userId })
            if (userUsage >= coupon.maxUsesPerUser) {
                return res.status(400).json({ error: 'You have reached the maximum uses for this coupon' })
            }
        }

        if (orderTotal < coupon.minPurchase) {
            return res.status(400).json({ 
                error: `Minimum purchase of ${coupon.minPurchase} required`,
                minPurchase: coupon.minPurchase
            })
        }

        // Calculate discount
        let discount = 0
        if (coupon.discountType === 'percentage') {
            discount = (orderTotal * coupon.discountValue) / 100
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount)
            }
        } else {
            discount = coupon.discountValue
        }
        discount = Math.min(discount, orderTotal)

        // Record usage
        await couponUsageModel.create({
            coupon: coupon._id,
            user: userId,
            order: orderId,
            discountAmount: discount,
            orderTotal: orderTotal
        })

        // Update coupon usage count
        coupon.currentUses += 1
        await coupon.save()

        return res.status(200).json({
            message: 'Coupon applied successfully',
            discount: discount,
            finalAmount: orderTotal - discount
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/coupons/:id
 * Update coupon (admin only)
 */
const updateCoupon = async (req, res) => {
    try {
        if (req.body.code) {
            req.body.code = req.body.code.toUpperCase()
        }
        const coupon = await couponModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' })
        }
        return res.status(200).json(coupon)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/coupons/:id
 * Delete/deactivate coupon (admin only)
 */
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await couponModel.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        )
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' })
        }
        return res.status(200).json({ message: 'Coupon deactivated successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getCoupons,
    getCouponByCode,
    validateCoupon,
    createCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon
}

