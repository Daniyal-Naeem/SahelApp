const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Review Report Model
 * Track reports on reviews
 */
const reviewReportSchema = new Schema({
    review: {
        type: Schema.Types.ObjectId,
        ref: 'reviewModel',
        required: true,
        index: true
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        index: true
    },
    reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other'],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    reviewedAt: {
        type: Date
    }
}, { timestamps: true })

// Index to prevent duplicate reports
reviewReportSchema.index({ review: 1, reportedBy: 1 }, { unique: true })
reviewReportSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model("reviewReportModel", reviewReportSchema)

