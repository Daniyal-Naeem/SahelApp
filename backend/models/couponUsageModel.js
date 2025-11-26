const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Coupon Usage Model
 * Track coupon usage by users
 */
const couponUsageSchema = new Schema({
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'couponModel',
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
        ref: 'orderModel',
        required: true,
        index: true
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0
    },
    orderTotal: {
        type: Number,
        required: true
    }
}, { timestamps: true })

// Index to prevent duplicate usage per order
couponUsageSchema.index({ coupon: 1, order: 1 }, { unique: true })
couponUsageSchema.index({ user: 1, coupon: 1 })
couponUsageSchema.index({ order: 1 })

module.exports = mongoose.model("couponUsageModel", couponUsageSchema)

