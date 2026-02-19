const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const supportAttachmentSchema = new Schema({
    type: {
        type: String,
        enum: ['image', 'file'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    filename: {
        type: String
    },
    size: {
        type: Number
    }
}, { _id: true })

const supportMessageSchema = new Schema({
    sender: {
        type: String,
        enum: ['user', 'support'],
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    attachments: [supportAttachmentSchema],
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, { timestamps: true })

const supportConversationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        index: true
    },
    subject: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'pending'],
        default: 'open',
        index: true
    },
    messages: [supportMessageSchema],
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// Update lastMessageAt when a message is added
supportConversationSchema.pre('save', function(next) {
    if (this.messages && this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1]
        this.lastMessageAt = lastMessage.createdAt || new Date()
    }
    next()
})

// Index for faster queries
supportConversationSchema.index({ user: 1, status: 1, createdAt: -1 })
supportConversationSchema.index({ lastMessageAt: -1 })

module.exports = mongoose.model("supportConversationModel", supportConversationSchema)

