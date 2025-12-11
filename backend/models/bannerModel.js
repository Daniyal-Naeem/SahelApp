const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Banner Model
 * Homepage slider banners and promotional content
 */
const bannerSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    // Target URL when banner is clicked
    targetUrl: {
        type: String
    },
    // Banner type
    type: {
        type: String,
        enum: ['slider', 'promotional', 'ad', 'deal'],
        default: 'slider'
    },
    // Display order (lower number = higher priority)
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
    // Schedule
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    // Click tracking
    clickCount: {
        type: Number,
        default: 0
    },
    // View tracking
    viewCount: {
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
bannerSchema.index({ isActive: 1, order: 1 })
bannerSchema.index({ startDate: 1, endDate: 1 })

module.exports = mongoose.model("bannerModel", bannerSchema)















