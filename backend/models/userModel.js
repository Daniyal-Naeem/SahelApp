const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    // Vendor specific fields
    vendorStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    businessName: {
        type: String,
        trim: true
    },
    businessAddress: {
        type: String,
        trim: true
    },
    // User specific fields
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    // Credit system
    credits: {
        type: Number,
        default: 0
    },
    // Profile
    avatar: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next()
    }
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject()
    delete userObject.password
    return userObject
}

module.exports = mongoose.model("userModel", userSchema)

