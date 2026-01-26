const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Celebration Campaign Model
 * Birthday, wedding, newborn celebration campaigns
 */
const celebrationCampaignSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Campaign type
    type: {
        type: String,
        enum: ['birthday', 'wedding', 'newborn', 'anniversary', 'other'],
        required: true,
        index: true
    },
    // Discount or gift
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'gift_card'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        min: 0
    },
    // Gift card amount (if type is gift_card)
    giftCardAmount: {
        type: Number,
        min: 0
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
    // Auto-send settings
    autoSend: {
        type: Boolean,
        default: false
    },
    // Days before event to send
    sendDaysBefore: {
        type: Number,
        default: 0
    },
    // Applicable categories
    applicableCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'categoryModel'
    }],
    // Created by
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }
}, { timestamps: true })

// Indexes
celebrationCampaignSchema.index({ type: 1, isActive: 1, startDate: 1, endDate: 1 })

module.exports = mongoose.model("celebrationCampaignModel", celebrationCampaignSchema)

