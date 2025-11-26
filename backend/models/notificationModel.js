const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    title: {
        type: String,
        required: [true, "Notification title is required"]
    },
    message: {
        type: String,
        required: [true, "Notification message is required"]
    },
    type: {
        type: String,
        enum: ['order', 'payment', 'system', 'promotion', 'vendor', 'credit_transfer_sent', 'credit_transfer_received', 'other'],
        default: 'system'
    },
    // Related entity (order, product, etc.)
    relatedEntity: {
        type: String,
        enum: ['order', 'product', 'user', 'vendor', 'none'],
        default: 'none'
    },
    relatedEntityId: {
        type: Schema.Types.ObjectId
    },
    // Read status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    // Action link
    actionUrl: {
        type: String
    },
    // Priority
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    // Additional data (flexible field for transaction IDs, amounts, etc.)
    data: {
        type: Schema.Types.Mixed
    }
}, { timestamps: true })

// Mark as read when isRead is set to true
notificationSchema.pre('save', function(next) {
    if (this.isModified('isRead') && this.isRead && !this.readAt) {
        this.readAt = new Date()
    }
    next()
})

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

module.exports = mongoose.model("notificationModel", notificationSchema)


