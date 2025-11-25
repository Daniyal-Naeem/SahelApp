const mongoose = require('mongoose')
const notificationModel = require('../models/notificationModel')

/**
 * createNotification,
 * getUserNotifications,
 * markAsRead,
 * markAllAsRead,
 * deleteNotification,
 * getUnreadCount
 */

// Create notification (usually called by other services)
const createNotification = async (userId, title, message, options = {}) => {
    try {
        const notification = await notificationModel.create({
            user: userId,
            title,
            message,
            type: options.type || 'system',
            relatedEntity: options.relatedEntity || 'none',
            relatedEntityId: options.relatedEntityId || null,
            actionUrl: options.actionUrl || null,
            priority: options.priority || 'medium'
        })
        return notification
    } catch (error) {
        console.error('Error creating notification:', error)
        return null
    }
}

// Get user notifications
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { isRead, type, limit = 50 } = req.query;

        let query = { user: userId };
        
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        if (type) {
            query.type = type;
        }

        const notifications = await notificationModel.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        return res.status(200).json(notifications)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const notification = await notificationModel.findOne({
            _id: id,
            user: userId
        })

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" })
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save()

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await notificationModel.updateMany(
            { user: userId, isRead: false },
            { 
                $set: { 
                    isRead: true,
                    readAt: new Date()
                }
            }
        )

        return res.status(200).json({
            message: `${result.modifiedCount} notifications marked as read`
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const notification = await notificationModel.findOneAndDelete({
            _id: id,
            user: userId
        })

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" })
        }

        return res.status(200).json({
            message: "Notification deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const count = await notificationModel.countDocuments({
            user: userId,
            isRead: false
        })

        return res.status(200).json({ unreadCount: count })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
}

