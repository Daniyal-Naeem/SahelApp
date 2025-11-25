const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

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
            process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        )

        // Check if user still exists
        const user = await userModel.findById(decoded.userId)
        if (!user || !user.isActive) {
            return res.status(401).json({ error: "User not found or account deactivated" })
        }

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
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

        next()
    }
}

module.exports = {
    authenticate,
    authorize
}

