const mongoose = require('mongoose')
const supportConversationModel = require('../models/supportConversationModel')
const multer = require('multer')
const { getSocketIO } = require('../services/socketService')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/support'
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow images and common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        
        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only images and documents are allowed.'))
        }
    }
})

// Middleware for handling file uploads
const uploadMiddleware = upload.array('attachments', 5) // Max 5 files

/**
 * Get all conversations for the current user
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId

        const conversations = await supportConversationModel.find({ user: userId })
            .sort({ lastMessageAt: -1 })
            .select('subject status messages unreadCount lastMessageAt createdAt updatedAt')

        return res.status(200).json({ conversations })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Get single conversation with messages
 */
const getConversation = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid conversation ID" })
        }

        const conversation = await supportConversationModel.findOne({
            _id: id,
            user: userId
        })

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }

        return res.status(200).json(conversation)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Create a new support conversation
 */
const createConversation = async (req, res) => {
    try {
        const userId = req.user.userId
        const { subject, initialMessage } = req.body

        if (!initialMessage || initialMessage.trim() === '') {
            return res.status(400).json({ error: "Initial message is required" })
        }

        // Handle file uploads
        const attachments = []
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    type: file.mimetype.startsWith('image/') ? 'image' : 'file',
                    url: `/uploads/support/${file.filename}`,
                    filename: file.originalname,
                    size: file.size
                })
            })
        }

        const conversation = await supportConversationModel.create({
            user: userId,
            subject: subject || 'Support Request',
            status: 'open',
            messages: [{
                sender: 'user',
                text: initialMessage,
                attachments: attachments.length > 0 ? attachments : undefined,
                isRead: false
            }],
            unreadCount: 1
        })

        await conversation.populate('user', 'name email')

        const firstMessage = conversation.messages[0]
        const messagePayload = {
            _id: firstMessage._id,
            conversationId: conversation._id,
            sender: 'user',
            text: firstMessage.text,
            attachments: firstMessage.attachments || [],
            createdAt: firstMessage.createdAt
        }

        // Emit real-time event to admin room
        const io = getSocketIO()
        if (io) {
            io.to('admin').emit('support:user_message', {
                conversationId: conversation._id.toString(),
                userId: String(conversation.user._id || conversation.user),
                message: messagePayload,
                isNewConversation: true
            })
        }

        return res.status(201).json({
            message: "Conversation created successfully",
            conversation
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Send a message in a conversation
 */
const sendMessage = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const { text } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid conversation ID" })
        }

        const hasAttachments = req.files && req.files.length > 0
        if ((!text || text.trim() === '') && !hasAttachments) {
            return res.status(400).json({ error: "Message text or attachment is required" })
        }

        const conversation = await supportConversationModel.findOne({
            _id: id,
            user: userId
        })

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }

        if (conversation.status === 'closed') {
            return res.status(400).json({ error: "Cannot send message to closed conversation" })
        }

        // Handle file uploads
        const attachments = []
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    type: file.mimetype.startsWith('image/') ? 'image' : 'file',
                    url: `/uploads/support/${file.filename}`,
                    filename: file.originalname,
                    size: file.size
                })
            })
        }

        // Add message
        const messageText = (text && typeof text === 'string') ? text.trim() : ''
        conversation.messages.push({
            sender: 'user',
            text: messageText || undefined,
            attachments: attachments.length > 0 ? attachments : undefined,
            isRead: false
        })

        conversation.unreadCount = conversation.messages.filter(m => !m.isRead && m.sender === 'support').length
        conversation.status = 'open' // Reopen if closed

        await conversation.save()

        const savedMessage = conversation.messages[conversation.messages.length - 1]
        const messagePayload = {
            _id: savedMessage._id,
            conversationId: conversation._id,
            sender: 'user',
            text: savedMessage.text,
            attachments: savedMessage.attachments || [],
            createdAt: savedMessage.createdAt
        }

        // Emit real-time event to admin room
        const io = getSocketIO()
        if (io) {
            io.to('admin').emit('support:user_message', {
                conversationId: conversation._id.toString(),
                userId: conversation.user.toString(),
                message: messagePayload
            })
        }

        return res.status(200).json({
            message: "Message sent successfully",
            messageData: conversation.messages[conversation.messages.length - 1]
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Mark conversation as read
 */
const markConversationAsRead = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid conversation ID" })
        }

        const conversation = await supportConversationModel.findOne({
            _id: id,
            user: userId
        })

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }

        // Mark all support messages as read
        conversation.messages.forEach(msg => {
            if (msg.sender === 'support' && !msg.isRead) {
                msg.isRead = true
                msg.readAt = new Date()
            }
        })

        conversation.unreadCount = 0
        await conversation.save()

        return res.status(200).json({
            message: "Conversation marked as read"
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getConversations,
    getConversation,
    createConversation,
    sendMessage,
    markConversationAsRead,
    uploadMiddleware
}

