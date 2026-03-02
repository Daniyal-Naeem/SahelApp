const express = require('express')
const {
    registerCelebration,
    getUserCelebrations,
    getCelebrationCampaigns,
    getCampaignsByType,
    updateCelebration,
    deleteCelebration
} = require('../controllers/celebrationController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// Register celebration event (authenticated)
router.post('/register', authenticate, registerCelebration)

// Get user's celebrations (authenticated)
router.get('/', authenticate, getUserCelebrations)

// Get celebration campaigns for user (authenticated)
router.get('/campaigns', authenticate, getCelebrationCampaigns)

// Get campaigns by type (public)
router.get('/campaigns/:type', getCampaignsByType)

// Update celebration (authenticated)
router.put('/:id', authenticate, updateCelebration)

// Delete celebration (authenticated)
router.delete('/:id', authenticate, deleteCelebration)

module.exports = router
