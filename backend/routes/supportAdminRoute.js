const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/authMiddleware')
const {
    getAllConversations,
    getConversation,
    sendSupportMessage,
    updateConversationStatus
} = require('../controllers/supportAdminController')

// All admin support routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

router.get('/conversations', getAllConversations)
router.get('/conversations/:id', getConversation)
router.post('/conversations/:id/messages', sendSupportMessage)
router.put('/conversations/:id/status', updateConversationStatus)

module.exports = router
