const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * OTP Model
 * Stores OTP codes for password reset
 */
const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'sms'],
        required: true,
        default: 'email'
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Auto-delete expired documents
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5 // Maximum verification attempts
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    }
}, { timestamps: true })

// Index for faster lookups
otpSchema.index({ email: 1, type: 1, expiresAt: 1 })
otpSchema.index({ phone: 1, type: 1, expiresAt: 1 })

module.exports = mongoose.model("otpModel", otpSchema)

