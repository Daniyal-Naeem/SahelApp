const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const creditTransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    type: {
        type: String,
        enum: ['earned', 'spent', 'refunded', 'bonus', 'admin_adjustment'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Related entity (order, referral, etc.)
    relatedEntity: {
        type: String,
        enum: ['order', 'referral', 'promotion', 'admin', 'none'],
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
    // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed'
    }
}, { timestamps: true })

// Index for faster queries
creditTransactionSchema.index({ user: 1, createdAt: -1 })
creditTransactionSchema.index({ type: 1, createdAt: -1 })

module.exports = mongoose.model("creditTransactionModel", creditTransactionSchema)

