const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/authMiddleware')
const {
    getConversations,
    getConversation,
    createConversation,
    sendMessage,
    markConversationAsRead,
    uploadMiddleware
} = require('../controllers/supportController')

// Get all conversations (authenticated)
router.get('/conversations', authenticate, getConversations)

// Get single conversation (authenticated)
router.get('/conversations/:id', authenticate, getConversation)

// Create conversation (authenticated)
router.post('/conversations', authenticate, uploadMiddleware, createConversation)

// Send message (authenticated)
router.post('/conversations/:id/messages', authenticate, uploadMiddleware, sendMessage)

// Mark conversation as read (authenticated)
router.put('/conversations/:id/read', authenticate, markConversationAsRead)

module.exports = router

