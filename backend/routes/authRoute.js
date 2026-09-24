const express = require('express')
const {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    forgotPassword,
    verifyOTP,
    resetPassword,
    googleLogin,
    facebookLogin
} = require('../controllers/authController')
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// Register a new user
router.post('/register', optionalAuthenticate, registerUser)

// Login user
router.post('/login', loginUser)

// Social login (mobile app only)
router.post('/google', googleLogin)
router.post('/facebook', facebookLogin)

// Forgot password - Send OTP (mobile app only)
router.post('/forgot-password', forgotPassword)

// Verify OTP (mobile app only)
router.post('/verify-otp', verifyOTP)

// Reset password (mobile app only)
router.post('/reset-password', resetPassword)

// Get current user profile (protected)
router.get('/me', authenticate, getCurrentUser)

// Update user profile (protected)
router.put('/profile/:id', authenticate, updateProfile)

module.exports = router


