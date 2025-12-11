const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Review Model
 * Product reviews with moderation support
 */
const reviewSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'productsModel',
        required: true,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        index: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'orderModel'
    },
    // Rating (1-5 stars)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        index: true
    },
    // Review title
    title: {
        type: String,
        trim: true
    },
    // Review content
    comment: {
        type: String,
        required: true,
        trim: true
    },
    // Review images
    images: [{
        type: String
    }],
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending',
        index: true
    },
    // Moderation
    moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    moderatedAt: {
        type: Date
    },
    moderationNotes: {
        type: String
    },
    // Flagged for review
    flagged: {
        type: Boolean,
        default: false,
        index: true
    },
    flaggedReason: {
        type: String
    },
    flaggedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    flaggedAt: {
        type: Date
    },
    // Helpful votes
    helpfulCount: {
        type: Number,
        default: 0
    },
    // Report count
    reportCount: {
        type: Number,
        default: 0
    },
    // Verified purchase
    verifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Indexes
reviewSchema.index({ product: 1, status: 1, createdAt: -1 })
reviewSchema.index({ user: 1, product: 1 }, { unique: true }) // One review per user per product
reviewSchema.index({ status: 1, flagged: 1, createdAt: -1 })
reviewSchema.index({ rating: 1 })

module.exports = mongoose.model("reviewModel", reviewSchema)















