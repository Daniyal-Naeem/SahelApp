const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * App-to-App Ad Model
 * Advertisements shown within the app
 */
const appAdSchema = new Schema({
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
    // Target URL
    targetUrl: {
        type: String,
        required: true
    },
    // Ad position
    position: {
        type: String,
        enum: ['homepage', 'product_detail', 'cart', 'checkout', 'category', 'search'],
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
appAdSchema.index({ position: 1, isActive: 1, order: 1 })
appAdSchema.index({ startDate: 1, endDate: 1 })

module.exports = mongoose.model("appAdModel", appAdSchema)

