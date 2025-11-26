const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Deal Model
 * Weekly/monthly/daily deals and under-price categories
 */
const dealSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Deal type
    type: {
        type: String,
        enum: ['weekly', 'monthly', 'daily', 'flash', 'under_price'],
        required: true,
        index: true
    },
    // Discount percentage
    discount: {
        type: Number,
        min: 0,
        max: 100
    },
    // Fixed discount amount
    discountAmount: {
        type: Number,
        min: 0
    },
    // Applicable categories
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'categoryModel'
    }],
    // Applicable products
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'productsModel'
    }],
    // Minimum purchase amount
    minPurchase: {
        type: Number,
        default: 0
    },
    // Maximum discount amount
    maxDiscount: {
        type: Number
    },
    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    // Schedule
    startDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        required: true,
        index: true
    },
    // Usage limits
    maxUses: {
        type: Number
    },
    currentUses: {
        type: Number,
        default: 0
    },
    // Created by
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }
}, { timestamps: true })

// Indexes
dealSchema.index({ type: 1, isActive: 1, startDate: 1, endDate: 1 })
dealSchema.index({ categories: 1 })
dealSchema.index({ products: 1 })

module.exports = mongoose.model("dealModel", dealSchema)

