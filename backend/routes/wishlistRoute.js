const express = require('express')
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    checkWishlist
} = require('../controllers/wishlistController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// All wishlist routes require authentication
router.use(authenticate)

// Get user's wishlist
router.get('/', getWishlist)

// Check if product is in wishlist
router.get('/check/:productId', checkWishlist)

// Add product to wishlist
router.post('/add', addToWishlist)

// Toggle wishlist (add if not exists, remove if exists)
router.post('/toggle', toggleWishlist)

// Remove product from wishlist
router.delete('/remove/:productId', removeFromWishlist)

module.exports = router

