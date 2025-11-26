const express = require('express')
const {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getAllVendors,
    approveVendor,
    rejectVendor,
    getDashboardStats
} = require('../controllers/adminController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats)

// User management
router.get('/users', getAllUsers)
router.get('/users/:id', getUserById)
router.put('/users/:id/status', updateUserStatus)
router.delete('/users/:id', deleteUser)

// Vendor management
router.get('/vendors', getAllVendors)
router.put('/vendors/:id/approve', approveVendor)
router.put('/vendors/:id/reject', rejectVendor)

module.exports = router


