const mongoose = require('mongoose')
const celebrationEventModel = require('../models/celebrationEventModel')
const celebrationCampaignModel = require('../models/celebrationCampaignModel')
const userModel = require('../models/userModel')

/**
 * Celebration Controller
 * Handles user celebration event registration and campaign retrieval
 */

/**
 * POST /api/celebrations/register
 * Register a celebration event (birthday, wedding, newborn)
 */
const registerCelebration = async (req, res) => {
    try {
        const userId = req.user.userId
        const { type, eventDate, name, description, isRecurring = true, notifyBeforeDays = 7 } = req.body

        // Validation
        if (!type) {
            return res.status(400).json({ error: 'Celebration type is required' })
        }

        const validTypes = ['birthday', 'wedding', 'newborn', 'anniversary', 'other']
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: `Invalid celebration type. Must be one of: ${validTypes.join(', ')}` })
        }

        if (!eventDate) {
            return res.status(400).json({ error: 'Event date is required' })
        }

        const eventDateObj = new Date(eventDate)
        if (isNaN(eventDateObj.getTime())) {
            return res.status(400).json({ error: 'Invalid event date' })
        }

        // Check if user exists
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Create celebration event
        const celebrationEvent = await celebrationEventModel.create({
            user: userId,
            type,
            eventDate: eventDateObj,
            name: name || '',
            description: description || '',
            isRecurring: isRecurring !== false, // Default to true
            notifyBeforeDays: notifyBeforeDays || 7,
            isActive: true
        })

        return res.status(201).json({
            message: 'Celebration event registered successfully',
            celebration: celebrationEvent
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/celebrations
 * Get user's registered celebration events
 */
const getUserCelebrations = async (req, res) => {
    try {
        const userId = req.user.userId

        const celebrations = await celebrationEventModel.find({
            user: userId,
            isActive: true
        }).sort({ eventDate: 1 })

        return res.status(200).json(celebrations)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/celebrations/campaigns
 * Get active celebration campaigns for user's registered events
 */
const getCelebrationCampaigns = async (req, res) => {
    try {
        const userId = req.user.userId
        const now = new Date()

        // Get user's active celebrations
        const userCelebrations = await celebrationEventModel.find({
            user: userId,
            isActive: true
        })

        if (userCelebrations.length === 0) {
            return res.status(200).json([])
        }

        // Get celebration types from user's events
        const celebrationTypes = [...new Set(userCelebrations.map(c => c.type))]

        // Find active campaigns matching user's celebration types
        const campaigns = await celebrationCampaignModel.find({
            type: { $in: celebrationTypes },
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
            .populate('applicableCategories', 'name')
            .sort({ createdAt: -1 })

        return res.status(200).json(campaigns)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/celebrations/campaigns/:type
 * Get active celebration campaigns by type (public)
 */
const getCampaignsByType = async (req, res) => {
    try {
        const { type } = req.params
        const now = new Date()

        const validTypes = ['birthday', 'wedding', 'newborn', 'anniversary', 'other']
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: `Invalid celebration type. Must be one of: ${validTypes.join(', ')}` })
        }

        const campaigns = await celebrationCampaignModel.find({
            type,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
            .populate('applicableCategories', 'name')
            .sort({ createdAt: -1 })

        return res.status(200).json(campaigns)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/celebrations/:id
 * Update a celebration event
 */
const updateCelebration = async (req, res) => {
    try {
        const userId = req.user.userId
        const { id } = req.params
        const { eventDate, name, description, isRecurring, notifyBeforeDays } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid celebration ID' })
        }

        const celebration = await celebrationEventModel.findOne({
            _id: id,
            user: userId
        })

        if (!celebration) {
            return res.status(404).json({ error: 'Celebration event not found' })
        }

        // Update fields
        if (eventDate) {
            const eventDateObj = new Date(eventDate)
            if (isNaN(eventDateObj.getTime())) {
                return res.status(400).json({ error: 'Invalid event date' })
            }
            celebration.eventDate = eventDateObj
        }
        if (name !== undefined) celebration.name = name
        if (description !== undefined) celebration.description = description
        if (isRecurring !== undefined) celebration.isRecurring = isRecurring
        if (notifyBeforeDays !== undefined) celebration.notifyBeforeDays = notifyBeforeDays

        await celebration.save()

        return res.status(200).json({
            message: 'Celebration event updated successfully',
            celebration
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/celebrations/:id
 * Delete a celebration event
 */
const deleteCelebration = async (req, res) => {
    try {
        const userId = req.user.userId
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid celebration ID' })
        }

        const celebration = await celebrationEventModel.findOne({
            _id: id,
            user: userId
        })

        if (!celebration) {
            return res.status(404).json({ error: 'Celebration event not found' })
        }

        // Soft delete
        celebration.isActive = false
        await celebration.save()

        return res.status(200).json({
            message: 'Celebration event deleted successfully'
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    registerCelebration,
    getUserCelebrations,
    getCelebrationCampaigns,
    getCampaignsByType,
    updateCelebration,
    deleteCelebration
}
