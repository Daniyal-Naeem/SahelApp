const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'productsModel',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
}, { _id: false })

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    // Payment information
    paymentMethod: {
        type: String,
        enum: ['credit', 'cash', 'card', 'other', 'mixed'],
        default: 'credit'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    // Credit usage (for partial payments)
    creditUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    // Payment gateway amount (if using card/gateway)
    gatewayAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Shipping information
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        phone: String
    },
    // Order status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Tracking
    trackingNumber: {
        type: String
    },
    // Delivery person information
    deliveryPerson: {
        name: {
            type: String
        },
        phone: {
            type: String
        },
        vehicleNumber: {
            type: String
        }
    },
    // Current location for tracking
    currentLocation: {
        address: {
            type: String
        },
        coordinates: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        },
        lastUpdated: {
            type: Date
        }
    },
    // Notes
    notes: {
        type: String
    },
    // Dates
    shippedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, { timestamps: true })

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString(36).toUpperCase()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        this.orderNumber = `ORD-${timestamp}-${random}`
    }
    next()
})

// Calculate totals before saving
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0)
        this.total = this.subtotal + (this.shippingCost || 0) - (this.discount || 0)
    }
    next()
})

module.exports = mongoose.model("orderModel", orderSchema)


