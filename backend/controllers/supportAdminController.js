const mongoose = require('mongoose')
const supportConversationModel = require('../models/supportConversationModel')
const userModel = require('../models/userModel')
const { getSocketIO } = require('../services/socketService')

/**
 * Admin Support Controller - Handles admin-side support chat operations
 * All routes require authenticate + authorize('admin')
 */

/**
 * Get all support conversations (admin view)
 */
const getAllConversations = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query

        const query = {}
        if (status) {
            query.status = status
        }

        const skip = (page - 1) * limit
        const conversations = await supportConversationModel.find(query)
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email')
            .select('subject status messages unreadCount lastMessageAt createdAt updatedAt user')

        const total = await supportConversationModel.countDocuments(query)

        return res.status(200).json({
            success: true,
            conversations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Support admin getAllConversations error:', error)
        return res.status(500).json({ success: false, error: error.message })
    }
}

/**
 * Get single conversation with messages (admin view)
 */
const getConversation = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid conversation ID' })
        }

        const conversation = await supportConversationModel.findById(id)
            .populate('user', 'name email')

        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' })
        }

        return res.status(200).json({
            success: true,
            conversation
        })
    } catch (error) {
        console.error('Support admin getConversation error:', error)
        return res.status(500).json({ success: false, error: error.message })
    }
}

/**
 * Send message as support/admin
 */
const sendSupportMessage = async (req, res) => {
    try {
        const { id } = req.params
        const { text } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid conversation ID' })
        }

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ success: false, error: 'Message text is required' })
        }

        const conversation = await supportConversationModel.findById(id)
            .populate('user', 'name email')

        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' })
        }

        if (conversation.status === 'closed') {
            return res.status(400).json({ success: false, error: 'Cannot send message to closed conversation' })
        }

        const newMessage = {
            sender: 'support',
            text: text.trim(),
            isRead: false
        }

        conversation.messages.push(newMessage)
        conversation.unreadCount = conversation.messages.filter(m => !m.isRead && m.sender === 'support').length
        conversation.status = 'open'
        await conversation.save()

        const savedMessage = conversation.messages[conversation.messages.length - 1]
        const messagePayload = {
            _id: savedMessage._id,
            conversationId: conversation._id,
            sender: 'support',
            text: savedMessage.text,
            attachments: savedMessage.attachments || [],
            createdAt: savedMessage.createdAt
        }

        // Emit real-time event to user
        const io = getSocketIO()
        if (io) {
            io.to(`user:${conversation.user._id}`).emit('support:new_message', {
                conversationId: conversation._id.toString(),
                message: messagePayload
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            messageData: messagePayload
        })
    } catch (error) {
        console.error('Support admin sendSupportMessage error:', error)
        return res.status(500).json({ success: false, error: error.message })
    }
}

/**
 * Update conversation status (open, closed, pending)
 */
const updateConversationStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid conversation ID' })
        }

        const validStatuses = ['open', 'closed', 'pending']
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status. Must be: open, closed, or pending' })
        }

        const conversation = await supportConversationModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('user', 'name email')

        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' })
        }

        const io = getSocketIO()
        if (io) {
            io.to(`user:${conversation.user._id}`).emit('support:status_updated', {
                conversationId: conversation._id.toString(),
                status
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            conversation
        })
    } catch (error) {
        console.error('Support admin updateConversationStatus error:', error)
        return res.status(500).json({ success: false, error: error.message })
    }
}

/**
 * Mark conversation as read by admin (admin view - no-op for user unread count)
 */

module.exports = {
    getAllConversations,
    getConversation,
    sendSupportMessage,
    updateConversationStatus
}
