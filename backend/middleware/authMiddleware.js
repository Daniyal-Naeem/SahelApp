const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const { JWT_SECRET } = require('../config/env')

/**
 * authenticate - Verify JWT token and attach user to request
 * authorize - Check if user has required role(s)
 */

// Authenticate user (verify token)
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No token provided. Authorization denied." })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        )

        // Check if user still exists
        const user = await userModel.findById(decoded.userId)
        if (!user || !user.isActive) {
            return res.status(401).json({ error: "User not found or account deactivated" })
        }

        // Attach user info to request. Role is read from the database, not from the
        // token, so a demoted user cannot keep using a token minted while privileged.
        req.user = {
            userId: String(user._id),
            role: user.role,
            vendorStatus: user.vendorStatus
        }

        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" })
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" })
        }
        res.status(500).json({ error: error.message })
    }
}

// Authorize user (check role)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${roles.join(' or ')}`
            })
        }

        // A vendor only counts as authorized once an admin has approved them.
        if (req.user.role === 'vendor' && req.user.vendorStatus !== 'approved') {
            return res.status(403).json({
                error: "Vendor account is not approved yet."
            })
        }

        next()
    }
}

// Attach req.user when a valid token is present, but never reject the request.
// Used by endpoints that are public yet behave differently for privileged callers.
const optionalAuthenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next()
    }

    try {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        if (user && user.isActive) {
            req.user = {
                userId: String(user._id),
                role: user.role,
                vendorStatus: user.vendorStatus
            }
        }
    } catch (error) {
        // Ignore invalid tokens - the caller is simply treated as anonymous.
    }

    next()
}

module.exports = {
    authenticate,
    optionalAuthenticate,
    authorize
}


