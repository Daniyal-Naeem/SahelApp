const express = require('express')
const {
    getAllCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount
} = require('../controllers/cartController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// All cart routes require authentication
router.use(authenticate)

// Get user's cart
router.get('/', getAllCartItems)

// Get cart count
router.get('/count', getCartCount)

// Add item to cart
router.post('/add', addToCart)

// Update cart item quantity
router.put('/update/:itemId', updateCartItem)

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart)

// Clear entire cart
router.delete('/clear', clearCart)

module.exports = router

