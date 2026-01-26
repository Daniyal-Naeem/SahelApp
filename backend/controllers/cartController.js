const mongoose = require('mongoose')
const cartModel = require('../models/cartModel')
const productsModel = require('../models/productsModel')

/**
 * Cart Controller
 * getAllCartItems,
 * addToCart,
 * updateCartItem,
 * removeFromCart,
 * clearCart,
 * getCartCount
 */

// Get user's cart
const getAllCartItems = async (req, res) => {
    try {
        const userId = req.user.userId;

        let cart = await cartModel.findOne({ user: userId })
            .populate('items.product', 'title image price priceBeforeDeal priceOff')

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await cartModel.create({
                user: userId,
                items: [],
                subtotal: 0,
                shippingCost: 0,
                total: 0
            })
        }

        return res.status(200).json({
            cart: cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity, selectedVariation, selectedColor, selectedDelivery } = req.body;

        // Validate required fields
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" })
        }

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" })
        }

        // Check if product exists
        const product = await productsModel.findById(productId)
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        // Get or create cart
        let cart = await cartModel.findOne({ user: userId })
        if (!cart) {
            cart = await cartModel.create({
                user: userId,
                items: []
            })
        }

        // Check if item already exists in cart (with same variations)
        const existingItemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId &&
            item.selectedVariation === (selectedVariation || '') &&
            item.selectedColor === (selectedColor || '') &&
            item.selectedDelivery === (selectedDelivery || '')
        )

        const itemQuantity = quantity || 1
        const itemPrice = product.price

        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += itemQuantity
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity: itemQuantity,
                selectedVariation: selectedVariation || '',
                selectedColor: selectedColor || '',
                selectedDelivery: selectedDelivery || '',
                price: itemPrice
            })
        }

        await cart.save()
        await cart.populate('items.product', 'title image price priceBeforeDeal priceOff')

        return res.status(200).json({
            message: "Item added to cart successfully",
            cart: cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;

        // Validate required fields
        if (!itemId) {
            return res.status(400).json({ error: "Item ID is required" })
        }

        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1" })
        }

        // Get cart
        const cart = await cartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        // Find item
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId)
        if (itemIndex === -1) {
            return res.status(404).json({ error: "Item not found in cart" })
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity
        await cart.save()
        await cart.populate('items.product', 'title image price priceBeforeDeal priceOff')

        return res.status(200).json({
            message: "Cart item updated successfully",
            cart: cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;

        // Validate required fields
        if (!itemId) {
            return res.status(400).json({ error: "Item ID is required" })
        }

        // Get cart
        const cart = await cartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        // Remove item
        cart.items = cart.items.filter(item => item._id.toString() !== itemId)
        await cart.save()
        await cart.populate('items.product', 'title image price priceBeforeDeal priceOff')

        return res.status(200).json({
            message: "Item removed from cart successfully",
            cart: cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get cart
        const cart = await cartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        // Clear items
        cart.items = []
        await cart.save()

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart: cart
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get cart count
const getCartCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await cartModel.findOne({ user: userId })
        if (!cart) {
            return res.status(200).json({
                count: 0,
                itemCount: 0
            })
        }

        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

        return res.status(200).json({
            count: cart.items.length,
            itemCount: itemCount
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAllCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount
}

