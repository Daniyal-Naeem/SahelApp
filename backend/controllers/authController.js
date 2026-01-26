const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const otpModel = require('../models/otpModel')

/**
 * registerUser,
 * loginUser,
 * getCurrentUser,
 * updateProfile,
 * forgotPassword,
 * verifyOTP,
 * resetPassword,
 * googleLogin,
 * facebookLogin
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

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Forgot password - Send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email, phone, type } = req.body;

        // Validate required fields
        if (!type || (type !== 'email' && type !== 'sms')) {
            return res.status(400).json({ error: "Type must be 'email' or 'sms'" })
        }

        if (type === 'email' && !email) {
            return res.status(400).json({ error: "Email is required for email type" })
        }

        if (type === 'sms' && !phone) {
            return res.status(400).json({ error: "Phone is required for SMS type" })
        }

        // Find user by email or phone
        let user;
        if (type === 'email') {
            user = await userModel.findOne({ email: email.toLowerCase() })
            if (!user) {
                // Don't reveal if user exists for security
                return res.status(200).json({ 
                    message: "If the email exists, an OTP has been sent" 
                })
            }
        } else {
            user = await userModel.findOne({ phone })
            if (!user) {
                // Don't reveal if user exists for security
                return res.status(200).json({ 
                    message: "If the phone number exists, an OTP has been sent" 
                })
            }
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ error: "Account is deactivated. Please contact admin." })
        }

        // Generate OTP
        const otp = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Delete any existing OTPs for this user
        await otpModel.deleteMany({ 
            $or: [
                { email: type === 'email' ? email.toLowerCase() : user.email },
                { phone: type === 'sms' ? phone : user.phone }
            ]
        })

        // Create new OTP record
        const otpRecord = await otpModel.create({
            email: type === 'email' ? email.toLowerCase() : user.email,
            phone: type === 'sms' ? phone : user.phone,
            otp,
            type,
            expiresAt
        })

        // TODO: Send OTP via email or SMS
        // For now, we'll return it in development mode only
        // In production, remove this and implement actual email/SMS sending
        if (process.env.NODE_ENV === 'development') {
            console.log(`OTP for ${type === 'email' ? email : phone}: ${otp}`)
        }

        // In production, implement email/SMS sending here
        // Example: await sendEmail(email, 'Password Reset OTP', `Your OTP is: ${otp}`)
        // Example: await sendSMS(phone, `Your OTP is: ${otp}`)

        return res.status(200).json({
            message: `OTP has been sent to your ${type === 'email' ? 'email' : 'phone'}`,
            // Remove this in production
            ...(process.env.NODE_ENV === 'development' && { otp })
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, phone, otp, type } = req.body;

        // Validate required fields
        if (!otp || !type || (type !== 'email' && type !== 'sms')) {
            return res.status(400).json({ error: "OTP and type are required" })
        }

        if (type === 'email' && !email) {
            return res.status(400).json({ error: "Email is required for email type" })
        }

        if (type === 'sms' && !phone) {
            return res.status(400).json({ error: "Phone is required for SMS type" })
        }

        // Find OTP record
        const otpRecord = await otpModel.findOne({
            ...(type === 'email' ? { email: email.toLowerCase() } : { phone }),
            type,
            isVerified: false
        }).sort({ createdAt: -1 }) // Get most recent

        if (!otpRecord) {
            return res.status(400).json({ error: "Invalid or expired OTP" })
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id })
            return res.status(400).json({ error: "OTP has expired. Please request a new one." })
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            await otpModel.deleteOne({ _id: otpRecord._id })
            return res.status(400).json({ error: "Maximum attempts exceeded. Please request a new OTP." })
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1
            await otpRecord.save()
            return res.status(400).json({ 
                error: "Invalid OTP",
                attemptsRemaining: 5 - otpRecord.attempts
            })
        }

        // Mark OTP as verified
        otpRecord.isVerified = true
        otpRecord.verifiedAt = new Date()
        await otpRecord.save()

        return res.status(200).json({
            message: "OTP verified successfully",
            verified: true
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { email, phone, otp, newPassword, type } = req.body;

        // Validate required fields
        if (!newPassword || !type || (type !== 'email' && type !== 'sms')) {
            return res.status(400).json({ error: "New password and type are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" })
        }

        if (type === 'email' && !email) {
            return res.status(400).json({ error: "Email is required for email type" })
        }

        if (type === 'sms' && !phone) {
            return res.status(400).json({ error: "Phone is required for SMS type" })
        }

        // Find verified OTP record
        const otpRecord = await otpModel.findOne({
            ...(type === 'email' ? { email: email.toLowerCase() } : { phone }),
            type,
            isVerified: true
        }).sort({ verifiedAt: -1 }) // Get most recently verified

        if (!otpRecord) {
            return res.status(400).json({ error: "OTP not verified. Please verify OTP first." })
        }

        // Check if OTP was verified within last 30 minutes
        const verificationAge = Date.now() - otpRecord.verifiedAt.getTime()
        if (verificationAge > 30 * 60 * 1000) { // 30 minutes
            await otpModel.deleteOne({ _id: otpRecord._id })
            return res.status(400).json({ error: "OTP verification expired. Please request a new OTP." })
        }

        // Optional: Verify OTP again for extra security
        if (otp && otpRecord.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" })
        }

        // Find user
        let user;
        if (type === 'email') {
            user = await userModel.findOne({ email: email.toLowerCase() })
        } else {
            user = await userModel.findOne({ phone })
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword
        await user.save()

        // Delete OTP record after successful password reset
        await otpModel.deleteOne({ _id: otpRecord._id })

        return res.status(200).json({
            message: "Password reset successfully"
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

// Google OAuth login
const googleLogin = async (req, res) => {
    try {
        const { idToken, accessToken, email, name, picture } = req.body;

        // Validate required fields
        if (!idToken && !accessToken) {
            return res.status(400).json({ error: "ID token or access token is required" })
        }

        if (!email) {
            return res.status(400).json({ error: "Email is required" })
        }

        // TODO: Verify Google token with Google API
        // For production, use: const { OAuth2Client } = require('google-auth-library')
        // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        // const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        // const payload = ticket.getPayload()

        // Find or create user
        let user = await userModel.findOne({ email: email.toLowerCase() })

        if (user) {
            // User exists, check if account is active
            if (!user.isActive) {
                return res.status(403).json({ error: "Account is deactivated. Please contact admin." })
            }

            // Update user info if provided
            if (name && !user.name) {
                user.name = name
            }
            if (picture && !user.avatar) {
                user.avatar = picture
            }
            await user.save()
        } else {
            // Create new user
            // Generate a random password (user won't need it for OAuth login)
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
            
            user = await userModel.create({
                name: name || 'Google User',
                email: email.toLowerCase(),
                password: randomPassword, // Will be hashed by pre-save hook
                avatar: picture || '',
                role: 'user'
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '7d' }
        )

        return res.status(200).json({
            message: "Google login successful",
            user,
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

// Facebook OAuth login
const facebookLogin = async (req, res) => {
    try {
        const { accessToken, userId: facebookUserId, email, name, picture } = req.body;

        // Validate required fields
        if (!accessToken) {
            return res.status(400).json({ error: "Access token is required" })
        }

        if (!email) {
            return res.status(400).json({ error: "Email is required" })
        }

        // TODO: Verify Facebook token with Facebook API
        // For production, use: const axios = require('axios')
        // const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`)
        // const fbUser = response.data

        // Find or create user
        let user = await userModel.findOne({ email: email.toLowerCase() })

        if (user) {
            // User exists, check if account is active
            if (!user.isActive) {
                return res.status(403).json({ error: "Account is deactivated. Please contact admin." })
            }

            // Update user info if provided
            if (name && !user.name) {
                user.name = name
            }
            if (picture && !user.avatar) {
                user.avatar = picture
            }
            await user.save()
        } else {
            // Create new user
            // Generate a random password (user won't need it for OAuth login)
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
            
            user = await userModel.create({
                name: name || 'Facebook User',
                email: email.toLowerCase(),
                password: randomPassword, // Will be hashed by pre-save hook
                avatar: picture || '',
                role: 'user'
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '7d' }
        )

        return res.status(200).json({
            message: "Facebook login successful",
            user,
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

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    forgotPassword,
    verifyOTP,
    resetPassword,
    googleLogin,
    facebookLogin
}

