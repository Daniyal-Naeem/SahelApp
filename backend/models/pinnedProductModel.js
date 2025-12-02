const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Pinned Product Model
 * Products pinned to homepage or featured sections
 */
const pinnedProductSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'productsModel',
        required: true,
        unique: true,
        index: true
    },
    // Section where product is pinned
    section: {
        type: String,
        enum: ['homepage', 'featured', 'trending', 'deals', 'new_arrivals'],
        default: 'homepage',
        index: true
    },
    // Display order
    order: {
        type: Number,
        default: 0,
        index: true
    },
    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    // Pinned by
    pinnedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    // Expiry date (optional)
    expiresAt: {
        type: Date
    }
}, { timestamps: true })

// Indexes
pinnedProductSchema.index({ section: 1, isActive: 1, order: 1 })
pinnedProductSchema.index({ product: 1 })

module.exports = mongoose.model("pinnedProductModel", pinnedProductSchema)







