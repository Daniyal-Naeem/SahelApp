const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Wallet Model
 * Separate wallet collection for better tracking and audit
 * This complements the user.credits field for backward compatibility
 */
const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'SAR', 'AED', 'EUR']
    },
    // Lock mechanism for concurrent operations
    locked: {
        type: Boolean,
        default: false
    },
    lockedAt: {
        type: Date
    },
    // Metadata
    lastTransactionAt: {
        type: Date
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    totalTransferred: {
        type: Number,
        default: 0
    },
    totalReceived: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    // Auto-create wallet when user is created
    collection: 'wallets'
})

// Indexes for performance
walletSchema.index({ userId: 1 })
walletSchema.index({ balance: 1 })
walletSchema.index({ lastTransactionAt: -1 })

// Ensure wallet is created for user (can be called from user creation hook)
walletSchema.statics.getOrCreateWallet = async function(userId) {
    let wallet = await this.findOne({ userId })
    if (!wallet) {
        wallet = await this.create({ userId, balance: 0 })
    }
    return wallet
}

module.exports = mongoose.model("walletModel", walletSchema)







