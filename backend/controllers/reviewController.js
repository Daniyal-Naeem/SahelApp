const reviewModel = require('../models/reviewModel')
const reviewReportModel = require('../models/reviewReportModel')
const productsModel = require('../models/productsModel')
const orderModel = require('../models/orderModel')

/**
 * Review Controller
 * Phase 9: Review approval & moderation
 */

/**
 * GET /api/reviews
 * Get reviews (public: approved only, admin: all)
 */
const getReviews = async (req, res) => {
    try {
        const { productId, userId, status, flagged, page = 1, limit = 20 } = req.query
        const userRole = req.user?.role

        const query = {}
        if (productId) query.product = productId
        if (userId) query.user = userId
        if (status) query.status = status
        if (flagged !== undefined) query.flagged = flagged === 'true'

        // Users can only see approved reviews
        if (userRole !== 'admin') {
            query.status = 'approved'
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const reviews = await reviewModel.find(query)
            .populate('user', 'name email avatar')
            .populate('product', 'title image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await reviewModel.countDocuments(query)

        return res.status(200).json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/reviews/:id
 * Get single review
 */
const getReviewById = async (req, res) => {
    try {
        const review = await reviewModel.findById(req.params.id)
            .populate('user', 'name email avatar')
            .populate('product', 'title image')
            .populate('moderatedBy', 'name email')

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        // Users can only see approved reviews
        if (req.user?.role !== 'admin' && review.status !== 'approved') {
            return res.status(403).json({ error: 'Review not available' })
        }

        return res.status(200).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews
 * Create review (authenticated users)
 */
const createReview = async (req, res) => {
    try {
        const userId = req.user.userId
        const { productId, rating, title, comment, images, orderId } = req.body

        // Check if product exists
        const product = await productsModel.findById(productId)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        // Check if user already reviewed this product
        const existingReview = await reviewModel.findOne({ user: userId, product: productId })
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' })
        }

        // Check if order exists and belongs to user (for verified purchase)
        let verifiedPurchase = false
        if (orderId) {
            const order = await orderModel.findOne({ _id: orderId, user: userId })
            if (order) {
                verifiedPurchase = true
            }
        }

        const review = await reviewModel.create({
            product: productId,
            user: userId,
            order: orderId,
            rating,
            title,
            comment,
            images: images || [],
            verifiedPurchase,
            status: 'pending' // Requires moderation
        })

        // Update product rating (average)
        await updateProductRating(productId)

        return res.status(201).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/reviews/:id
 * Update review (own review or admin)
 */
const updateReview = async (req, res) => {
    try {
        const userId = req.user.userId
        const userRole = req.user.role
        const review = await reviewModel.findById(req.params.id)

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        // Users can only update their own reviews
        if (userRole !== 'admin' && review.user.toString() !== userId) {
            return res.status(403).json({ error: 'You can only update your own reviews' })
        }

        // If updating, reset status to pending for re-moderation
        if (userRole !== 'admin') {
            req.body.status = 'pending'
        }

        const updatedReview = await reviewModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        // Update product rating if rating changed
        if (req.body.rating) {
            await updateProductRating(review.product)
        }

        return res.status(200).json(updatedReview)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/reviews/:id
 * Delete review (own review or admin)
 */
const deleteReview = async (req, res) => {
    try {
        const userId = req.user.userId
        const userRole = req.user.role
        const review = await reviewModel.findById(req.params.id)

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        // Users can only delete their own reviews
        if (userRole !== 'admin' && review.user.toString() !== userId) {
            return res.status(403).json({ error: 'You can only delete your own reviews' })
        }

        const productId = review.product
        await reviewModel.findByIdAndDelete(req.params.id)

        // Update product rating
        await updateProductRating(productId)

        return res.status(200).json({ message: 'Review deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/:id/approve
 * Approve review (admin only)
 */
const approveReview = async (req, res) => {
    try {
        const { notes } = req.body
        const review = await reviewModel.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                moderatedBy: req.user.userId,
                moderatedAt: new Date(),
                moderationNotes: notes
            },
            { new: true }
        )

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        return res.status(200).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/:id/reject
 * Reject review (admin only)
 */
const rejectReview = async (req, res) => {
    try {
        const { notes } = req.body
        const review = await reviewModel.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                moderatedBy: req.user.userId,
                moderatedAt: new Date(),
                moderationNotes: notes
            },
            { new: true }
        )

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        return res.status(200).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/:id/flag
 * Flag review for moderation (admin only)
 */
const flagReview = async (req, res) => {
    try {
        const { reason } = req.body
        const review = await reviewModel.findByIdAndUpdate(
            req.params.id,
            {
                flagged: true,
                flaggedReason: reason,
                flaggedBy: req.user.userId,
                flaggedAt: new Date(),
                status: 'flagged'
            },
            { new: true }
        )

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        return res.status(200).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/:id/unflag
 * Unflag review (admin only)
 */
const unflagReview = async (req, res) => {
    try {
        const review = await reviewModel.findByIdAndUpdate(
            req.params.id,
            {
                flagged: false,
                flaggedReason: null,
                flaggedBy: null,
                flaggedAt: null,
                status: 'approved'
            },
            { new: true }
        )

        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        return res.status(200).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/:id/report
 * Report review (authenticated users)
 */
const reportReview = async (req, res) => {
    try {
        const userId = req.user.userId
        const { reason, description } = req.body

        const review = await reviewModel.findById(req.params.id)
        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }

        // Check if already reported
        const existingReport = await reviewReportModel.findOne({
            review: req.params.id,
            reportedBy: userId
        })
        if (existingReport) {
            return res.status(400).json({ error: 'You have already reported this review' })
        }

        // Create report
        await reviewReportModel.create({
            review: req.params.id,
            reportedBy: userId,
            reason,
            description
        })

        // Increment report count
        review.reportCount += 1
        if (review.reportCount >= 3) {
            review.flagged = true
            review.status = 'flagged'
        }
        await review.save()

        return res.status(200).json({ message: 'Review reported successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/reviews/pending
 * Get pending reviews (admin only)
 */
const getPendingReviews = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query
        const skip = (parseInt(page) - 1) * parseInt(limit)

        const reviews = await reviewModel.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('product', 'title image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await reviewModel.countDocuments({ status: 'pending' })

        return res.status(200).json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/reviews/flagged
 * Get flagged reviews (admin only)
 */
const getFlaggedReviews = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query
        const skip = (parseInt(page) - 1) * parseInt(limit)

        const reviews = await reviewModel.find({ flagged: true })
            .populate('user', 'name email')
            .populate('product', 'title image')
            .populate('flaggedBy', 'name email')
            .sort({ flaggedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await reviewModel.countDocuments({ flagged: true })

        return res.status(200).json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/bulk-approve
 * Bulk approve reviews (admin only)
 */
const bulkApproveReviews = async (req, res) => {
    try {
        const { reviewIds } = req.body

        if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
            return res.status(400).json({ error: 'reviewIds array is required' })
        }

        const result = await reviewModel.updateMany(
            { _id: { $in: reviewIds } },
            {
                status: 'approved',
                moderatedBy: req.user.userId,
                moderatedAt: new Date()
            }
        )

        return res.status(200).json({
            message: `${result.modifiedCount} reviews approved`,
            count: result.modifiedCount
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/reviews/bulk-reject
 * Bulk reject reviews (admin only)
 */
const bulkRejectReviews = async (req, res) => {
    try {
        const { reviewIds, notes } = req.body

        if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
            return res.status(400).json({ error: 'reviewIds array is required' })
        }

        const result = await reviewModel.updateMany(
            { _id: { $in: reviewIds } },
            {
                status: 'rejected',
                moderatedBy: req.user.userId,
                moderatedAt: new Date(),
                moderationNotes: notes
            }
        )

        return res.status(200).json({
            message: `${result.modifiedCount} reviews rejected`,
            count: result.modifiedCount
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Helper: Update product rating
 */
const updateProductRating = async (productId) => {
    try {
        const reviews = await reviewModel.find({ product: productId, status: 'approved' })
        if (reviews.length === 0) return

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length
        const numberOfReview = reviews.length

        await productsModel.findByIdAndUpdate(productId, {
            stars: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            numberOfReview
        })
    } catch (error) {
        console.error('Error updating product rating:', error)
    }
}

module.exports = {
    getReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    approveReview,
    rejectReview,
    flagReview,
    unflagReview,
    reportReview,
    getPendingReviews,
    getFlaggedReviews,
    bulkApproveReviews,
    bulkRejectReviews
}

