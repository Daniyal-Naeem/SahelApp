const mongoose = require('mongoose')
const wishlistModel = require('../models/wishlistModel')
const productsModel = require('../models/productsModel')

/**
 * Wishlist Controller
 * getWishlist,
 * addToWishlist,
 * removeFromWishlist,
 * toggleWishlist,
 * checkWishlist
 */

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        let wishlist = await wishlistModel.findOne({ user: userId })
            .populate('products', 'title image price priceBeforeDeal priceOff stars numberOfReview description tags status category vendor')

        if (!wishlist) {
            // Create empty wishlist if doesn't exist
            wishlist = await wishlistModel.create({
                user: userId,
                products: []
            })
        }

        return res.status(200).json({
            wishlist: wishlist.products,
            count: wishlist.products.length
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

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

        // Get or create wishlist
        let wishlist = await wishlistModel.findOne({ user: userId })
        if (!wishlist) {
            wishlist = await wishlistModel.create({
                user: userId,
                products: []
            })
        }

        // Check if product already in wishlist
        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ error: "Product already in wishlist" })
        }

        // Add product to wishlist
        wishlist.products.push(productId)
        await wishlist.save()
        await wishlist.populate('products', 'title image price priceBeforeDeal priceOff stars numberOfReview description tags status category vendor')

        return res.status(200).json({
            message: "Product added to wishlist successfully",
            wishlist: wishlist.products,
            count: wishlist.products.length
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        // Validate required fields
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" })
        }

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" })
        }

        // Get wishlist
        const wishlist = await wishlistModel.findOne({ user: userId })
        if (!wishlist) {
            return res.status(404).json({ error: "Wishlist not found" })
        }

        // Check if product is in wishlist
        if (!wishlist.products.includes(productId)) {
            return res.status(400).json({ error: "Product not in wishlist" })
        }

        // Remove product from wishlist
        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        )
        await wishlist.save()
        await wishlist.populate('products', 'title image price priceBeforeDeal priceOff stars numberOfReview description tags status category vendor')

        return res.status(200).json({
            message: "Product removed from wishlist successfully",
            wishlist: wishlist.products,
            count: wishlist.products.length
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Toggle wishlist (add if not exists, remove if exists)
const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

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

        // Get or create wishlist
        let wishlist = await wishlistModel.findOne({ user: userId })
        if (!wishlist) {
            wishlist = await wishlistModel.create({
                user: userId,
                products: []
            })
        }

        // Check if product is in wishlist
        const productIndex = wishlist.products.findIndex(
            id => id.toString() === productId
        )

        let action;
        if (productIndex !== -1) {
            // Remove from wishlist
            wishlist.products.splice(productIndex, 1)
            action = 'removed'
        } else {
            // Add to wishlist
            wishlist.products.push(productId)
            action = 'added'
        }

        await wishlist.save()
        await wishlist.populate('products', 'title image price priceBeforeDeal priceOff stars numberOfReview description tags status category vendor')

        return res.status(200).json({
            message: `Product ${action} from wishlist successfully`,
            action: action,
            isInWishlist: action === 'added',
            wishlist: wishlist.products,
            count: wishlist.products.length
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        // Validate required fields
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" })
        }

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" })
        }

        // Get wishlist
        const wishlist = await wishlistModel.findOne({ user: userId })
        
        if (!wishlist) {
            return res.status(200).json({
                isInWishlist: false
            })
        }

        const isInWishlist = wishlist.products.some(
            id => id.toString() === productId
        )

        return res.status(200).json({
            isInWishlist: isInWishlist
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    checkWishlist
}

