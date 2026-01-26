const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Gift Card Model
 * Physical and digital gift cards with denominations
 */
const giftCardSchema = new Schema({
    // Card code (unique identifier)
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        trim: true
    },
    // Denomination
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    // Currency
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'SAR', 'AED', 'EUR']
    },
    // Card type
    type: {
        type: String,
        enum: ['physical', 'digital', 'libre_bundle'],
        default: 'digital'
    },
    // Status
    status: {
        type: String,
        enum: ['active', 'redeemed', 'expired', 'cancelled'],
        default: 'active',
        index: true
    },
    // Assigned to user (if purchased/assigned)
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        index: true
    },
    // Purchased by
    purchasedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    // Redeemed by
    redeemedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    // Redeemed at
    redeemedAt: {
        type: Date
    },
    // Expiry date
    expiresAt: {
        type: Date,
        index: true
    },
    // Usage limits
    maxUses: {
        type: Number,
        default: 1
    },
    currentUses: {
        type: Number,
        default: 0
    },
    // Applicable categories (if any restrictions)
    applicableCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'categoryModel'
    }],
    // Applicable vendors (if any restrictions)
    applicableVendors: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    // Minimum purchase amount
    minPurchase: {
        type: Number,
        default: 0
    },
    // Created by (admin)
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }
}, { timestamps: true })

// Indexes
giftCardSchema.index({ code: 1 })
giftCardSchema.index({ status: 1, expiresAt: 1 })
giftCardSchema.index({ assignedTo: 1 })
giftCardSchema.index({ purchasedBy: 1 })

// Generate unique code before saving
giftCardSchema.pre('save', async function(next) {
    if (!this.code) {
        // Generate unique code: GC-XXXX-XXXX-XXXX
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = 'GC-'
        for (let i = 0; i < 3; i++) {
            let segment = ''
            for (let j = 0; j < 4; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            code += segment + (i < 2 ? '-' : '')
        }
        
        // Check if code exists
        const existing = await mongoose.model('giftCardModel').findOne({ code })
        if (existing) {
            // Regenerate if exists
            return this.constructor.generateUniqueCode().then(uniqueCode => {
                this.code = uniqueCode
                next()
            })
        }
        this.code = code
    }
    next()
})

module.exports = mongoose.model("giftCardModel", giftCardSchema)















