const express = require('express')
const {
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
} = require('../controllers/reviewController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Review Routes
 * Phase 9: Review approval & moderation
 */

// Public routes
router.get('/reviews', getReviews)
router.get('/reviews/:id', getReviewById)

// Authenticated routes
router.post('/reviews', authenticate, createReview)
router.put('/reviews/:id', authenticate, updateReview)
router.delete('/reviews/:id', authenticate, deleteReview)
router.post('/reviews/:id/report', authenticate, reportReview)

// Admin routes
router.get('/reviews/pending', authenticate, authorize('admin'), getPendingReviews)
router.get('/reviews/flagged', authenticate, authorize('admin'), getFlaggedReviews)
router.post('/reviews/:id/approve', authenticate, authorize('admin'), approveReview)
router.post('/reviews/:id/reject', authenticate, authorize('admin'), rejectReview)
router.post('/reviews/:id/flag', authenticate, authorize('admin'), flagReview)
router.post('/reviews/:id/unflag', authenticate, authorize('admin'), unflagReview)
router.post('/reviews/bulk-approve', authenticate, authorize('admin'), bulkApproveReviews)
router.post('/reviews/bulk-reject', authenticate, authorize('admin'), bulkRejectReviews)

module.exports = router















