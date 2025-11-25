const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

/**
 * registerUser,
 * loginUser,
 * getCurrentUser,
 * updateProfile
 */

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" })
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" })
        }

        // Create new user
        const userData = {
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || "",
            role: role || 'user'
        }

        // Add vendor-specific fields if role is vendor
        if (role === 'vendor') {
            userData.vendorStatus = req.body.vendorStatus || 'pending'
            if (req.body.businessName) userData.businessName = req.body.businessName
            if (req.body.businessAddress) userData.businessAddress = req.body.businessAddress
        }

        const newUser = await userModel.create(userData)

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '7d' }
        )

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser,
            token
        })

    } catch (error) {
        let errorMessage = "";
        if (error.errors) {
            errorMessage = Object.values(error.errors).map(error => error.message).join(", ")
        } else {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage })
    }
}

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        // Find user by email
        const user = await userModel.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ error: "Account is deactivated. Please contact admin." })
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '7d' }
        )

        return res.status(200).json({
            message: "Login successful",
            user,
            token
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Users can only update their own profile (unless admin)
        if (id !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({ error: "You can only update your own profile" })
        }

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No such ID" })
        }

        // Don't allow password update through this route
        if (req.body.password) {
            delete req.body.password
        }

        // Don't allow role update unless admin
        if (req.body.role && userRole !== 'admin') {
            delete req.body.role
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        })

    } catch (error) {
        let errorMessage = "";
        if (error.errors) {
            errorMessage = Object.values(error.errors).map(error => error.message).join(", ")
        } else {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage })
    }
}

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile
}

