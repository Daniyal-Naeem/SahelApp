const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Wishlist Model
 * Stores user's favorite/wishlist products
 */
const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        unique: true,
        index: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'productsModel'
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Update timestamp before saving
wishlistSchema.pre('save', function(next) {
    this.updatedAt = new Date()
    next()
})

wishlistSchema.index({ products: 1 })

module.exports = mongoose.model("wishlistModel", wishlistSchema)

