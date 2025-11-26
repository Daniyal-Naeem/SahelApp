const express = require('express')
const {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile
} = require('../controllers/authController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// Register a new user
router.post('/register', registerUser)

// Login user
router.post('/login', loginUser)

// Get current user profile (protected)
router.get('/me', authenticate, getCurrentUser)

// Update user profile (protected)
router.put('/profile/:id', authenticate, updateProfile)

module.exports = router


