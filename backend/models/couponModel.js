const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Coupon Model
 * Discount coupons and promotional codes
 */
const couponSchema = new Schema({
    // Coupon code
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        trim: true
    },
    // Coupon name/description
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Discount type
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    // Discount value
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    // Maximum discount amount (for percentage)
    maxDiscount: {
        type: Number
    },
    // Minimum purchase amount
    minPurchase: {
        type: Number,
        default: 0
    },
    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    // Expiry date
    expiresAt: {
        type: Date,
        index: true
    },
    // Start date
    startsAt: {
        type: Date,
        default: Date.now
    },
    // Usage limits
    maxUses: {
        type: Number
    },
    maxUsesPerUser: {
        type: Number,
        default: 1
    },
    currentUses: {
        type: Number,
        default: 0
    },
    // Applicable categories
    applicableCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'categoryModel'
    }],
    // Applicable products
    applicableProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'productsModel'
    }],
    // Excluded categories
    excludedCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'categoryModel'
    }],
    // Excluded products
    excludedProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'productsModel'
    }],
    // Applicable vendors
    applicableVendors: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    // Created by
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }
}, { timestamps: true })

// Indexes
couponSchema.index({ code: 1, isActive: 1 })
couponSchema.index({ expiresAt: 1, isActive: 1 })
couponSchema.index({ applicableCategories: 1 })
couponSchema.index({ applicableProducts: 1 })

module.exports = mongoose.model("couponModel", couponSchema)















