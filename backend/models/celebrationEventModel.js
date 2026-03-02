const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Celebration Event Model
 * User-registered celebration events (birthday, wedding, newborn)
 */
const celebrationEventSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        index: true
    },
    // Event type
    type: {
        type: String,
        enum: ['birthday', 'wedding', 'newborn', 'anniversary', 'other'],
        required: true,
        index: true
    },
    // Event date
    eventDate: {
        type: Date,
        required: true,
        index: true
    },
    // Recurring (for birthdays/anniversaries)
    isRecurring: {
        type: Boolean,
        default: true
    },
    // Event details
    name: {
        type: String,
        trim: true
    },
    // For birthday: person's name
    // For wedding: couple names
    // For newborn: baby's name
    description: {
        type: String,
        trim: true
    },
    // Notification preferences
    notifyBeforeDays: {
        type: Number,
        default: 7 // Notify 7 days before
    },
    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, { timestamps: true })

// Indexes
celebrationEventSchema.index({ user: 1, type: 1, isActive: 1 })
celebrationEventSchema.index({ eventDate: 1, isActive: 1 })
celebrationEventSchema.index({ user: 1, eventDate: 1 })

module.exports = mongoose.model("celebrationEventModel", celebrationEventSchema)
