const express = require('express')
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} = require('../controllers/notificationController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get user notifications
router.get('/', getUserNotifications)

// Get unread count
router.get('/unread-count', getUnreadCount)

// Mark notification as read
router.put('/:id/read', markAsRead)

// Mark all as read
router.put('/read-all', markAllAsRead)

// Delete notification
router.delete('/:id', deleteNotification)

module.exports = router

