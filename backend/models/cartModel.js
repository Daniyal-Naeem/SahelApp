const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Cart Model
 * Stores user shopping cart items
 */
const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'productsModel',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    selectedVariation: {
        type: String
    },
    selectedColor: {
        type: String
    },
    selectedDelivery: {
        type: String
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: true })

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
        unique: true,
        index: true
    },
    items: [cartItemSchema],
    subtotal: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    this.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
    }, 0)
    
    // Default shipping cost (can be customized)
    this.shippingCost = this.subtotal > 0 ? 15 : 0
    
    this.total = this.subtotal + this.shippingCost
    this.updatedAt = new Date()
    next()
})

// Index for faster lookups
cartSchema.index({ user: 1 })

module.exports = mongoose.model("cartModel", cartSchema)

