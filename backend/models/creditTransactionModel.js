const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Enhanced Credit Transaction Model
 * Supports: top-up, transfer, consume, refund, adjust operations
 */
const creditTransactionSchema = new Schema({
    // Transaction ID for idempotency
    txId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    // Primary user (sender for transfers, recipient for top-ups)
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        index: true
    },
    // Transfer-specific fields
    type: {
        type: String,
        enum: [
            'topup',           // Credit top-up via payment gateway
            'transfer',        // Transfer to another user
            'consume',         // Used in checkout/purchase
            'refund',          // Refund from order cancellation
            'adjust',          // Admin adjustment
            'earned',          // Legacy: earned credits
            'spent',           // Legacy: spent credits
            'bonus',           // Legacy: bonus credits
            'admin_adjustment' // Legacy: admin adjustment
        ],
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Transfer-specific: receiver information
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        index: true
    },
    receiverEmail: {
        type: String
    },
    receiverPhone: {
        type: String
    },
    // Transfer-specific: sender information (if different from user)
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        index: true
    },
    // Hide sender flag for transfers
    hideSender: {
        type: Boolean,
        default: false
    },
    // Transfer note/message
    note: {
        type: String
    },
    // Top-up specific: payment gateway info
    paymentIntentId: {
        type: String,
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'wallet', 'other']
    },
    paymentGateway: {
        type: String
    },
    // Related entity (order, referral, etc.)
    relatedEntity: {
        type: String,
        enum: ['order', 'referral', 'promotion', 'admin', 'gift_card', 'coupon', 'none'],
        default: 'none'
    },
    relatedEntityId: {
        type: Schema.Types.ObjectId
    },
    // Admin who made adjustment (if applicable)
    adminUser: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    adminReason: {
        type: String
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'failed'],
        default: 'completed',
        index: true
    },
    // Metadata for fraud detection and audit
    meta: {
        ipAddress: String,
        userAgent: String,
        deviceId: String,
        location: String
    },
    // Idempotency key for preventing duplicate operations
    idempotencyKey: {
        type: String,
        index: true,
        sparse: true
    },
    // Webhook confirmation data
    webhookData: {
        type: Schema.Types.Mixed
    },
    // Timestamps
    completedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    }
}, { 
    timestamps: true,
    collection: 'credit_transactions'
})

// Indexes for faster queries
creditTransactionSchema.index({ user: 1, createdAt: -1 })
creditTransactionSchema.index({ type: 1, createdAt: -1 })
creditTransactionSchema.index({ status: 1, createdAt: -1 })
creditTransactionSchema.index({ receiverId: 1, createdAt: -1 })
creditTransactionSchema.index({ senderId: 1, createdAt: -1 })
creditTransactionSchema.index({ paymentIntentId: 1 })
creditTransactionSchema.index({ txId: 1 })

// Generate unique transaction ID
creditTransactionSchema.pre('save', async function(next) {
    if (!this.txId) {
        const timestamp = Date.now().toString(36).toUpperCase()
        const random = Math.random().toString(36).substring(2, 10).toUpperCase()
        this.txId = `TX-${timestamp}-${random}`
    }
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date()
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
        this.cancelledAt = new Date()
    }
    next()
})

module.exports = mongoose.model("creditTransactionModel", creditTransactionSchema)


