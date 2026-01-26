const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const productsModel = require('../models/productsModel')
const bannerModel = require('../models/bannerModel')
const dealModel = require('../models/dealModel')
const giftCardModel = require('../models/giftCardModel')
const couponModel = require('../models/couponModel')
const reviewModel = require('../models/reviewModel')
const appAdModel = require('../models/appAdModel')
const pinnedProductModel = require('../models/pinnedProductModel')

/**
 * Admin Panel APIs:
 * - getAllUsers
 * - getUserById
 * - updateUserStatus
 * - deleteUser
 * - getAllVendors
 * - approveVendor
 * - rejectVendor
 * - getDashboardStats
 */

// Get all users (with filters)
const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await userModel.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await userModel.countDocuments(query);

        return res.status(200).json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalUsers: total,
                limit: parseInt(limit)
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const user = await userModel.findById(id).select('-password')
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: "isActive must be a boolean" })
        }

        const user = await userModel.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Delete user (hard delete)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        // Prevent deleting admin users
        const userToDelete = await userModel.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ error: "User not found" })
        }

        if (userToDelete.role === 'admin') {
            return res.status(403).json({ error: "Cannot delete admin users" })
        }

        // Hard delete the user
        await userModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "User deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get all vendors
const getAllVendors = async (req, res) => {
    try {
        const { vendorStatus, search, page = 1, limit = 20 } = req.query;

        let query = { role: 'vendor' };

        if (vendorStatus) {
            query.vendorStatus = vendorStatus;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const vendors = await userModel.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await userModel.countDocuments(query);

        return res.status(200).json({
            vendors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalVendors: total,
                limit: parseInt(limit)
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Approve vendor
const approveVendor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const vendor = await userModel.findByIdAndUpdate(
            id,
            { vendorStatus: 'approved' },
            { new: true }
        ).select('-password')

        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" })
        }

        if (vendor.role !== 'vendor') {
            return res.status(400).json({ error: "User is not a vendor" })
        }

        return res.status(200).json({
            message: "Vendor approved successfully",
            vendor
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Reject vendor
const rejectVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const vendor = await userModel.findByIdAndUpdate(
            id,
            { vendorStatus: 'rejected' },
            { new: true }
        ).select('-password')

        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" })
        }

        if (vendor.role !== 'vendor') {
            return res.status(400).json({ error: "User is not a vendor" })
        }

        return res.status(200).json({
            message: "Vendor rejected successfully",
            vendor,
            reason: reason || "No reason provided"
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date()
        
        // Use Promise.allSettled to handle errors gracefully
        const results = await Promise.allSettled([
            userModel.countDocuments({ role: 'user' }),
            userModel.countDocuments({ role: 'vendor', vendorStatus: 'approved' }),
            userModel.countDocuments({ role: 'vendor', vendorStatus: 'pending' }),
            orderModel.countDocuments(),
            orderModel.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
            productsModel.countDocuments(),
            orderModel.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            bannerModel.countDocuments(),
            bannerModel.countDocuments({ 
                isActive: true,
                $and: [
                    {
                        $or: [
                            { startDate: { $exists: false } },
                            { startDate: { $lte: now } }
                        ]
                    },
                    {
                        $or: [
                            { endDate: { $exists: false } },
                            { endDate: { $gte: now } }
                        ]
                    }
                ]
            }),
            dealModel.countDocuments(),
            dealModel.countDocuments({ 
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            }),
            giftCardModel.countDocuments(),
            giftCardModel.countDocuments({ status: 'active' }),
            giftCardModel.countDocuments({ status: 'redeemed' }),
            couponModel.countDocuments(),
            couponModel.countDocuments({ 
                isActive: true,
                startsAt: { $lte: now },
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: { $gte: now } }
                ]
            }),
            reviewModel.countDocuments(),
            reviewModel.countDocuments({ status: 'pending' }),
            reviewModel.countDocuments({ flagged: true }),
            reviewModel.countDocuments({ status: 'approved' }),
            appAdModel.countDocuments(),
            appAdModel.countDocuments({ 
                isActive: true,
                $and: [
                    {
                        $or: [
                            { startDate: { $exists: false } },
                            { startDate: { $lte: now } }
                        ]
                    },
                    {
                        $or: [
                            { endDate: { $exists: false } },
                            { endDate: { $gte: now } }
                        ]
                    }
                ]
            }),
            pinnedProductModel.countDocuments({ isActive: true })
        ])

        // Extract values, defaulting to 0 on error
        const getValue = (result, index) => {
            if (result.status === 'fulfilled') {
                return Array.isArray(result.value) ? result.value : result.value
            } else {
                console.error(`Error fetching stat at index ${index}:`, result.reason?.message || result.reason)
                return Array.isArray(result.value) ? [] : 0
            }
        }

        const [
            totalUsers,
            totalVendors,
            pendingVendors,
            totalOrders,
            pendingOrders,
            totalProducts,
            totalRevenue,
            totalBanners,
            activeBanners,
            totalDeals,
            activeDeals,
            totalGiftCards,
            activeGiftCards,
            redeemedGiftCards,
            totalCoupons,
            activeCoupons,
            totalReviews,
            pendingReviews,
            flaggedReviews,
            approvedReviews,
            totalAppAds,
            activeAppAds,
            totalPinnedProducts
        ] = results.map(getValue)

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        return res.status(200).json({
            stats: {
                users: {
                    total: totalUsers
                },
                vendors: {
                    total: totalVendors,
                    pending: pendingVendors
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders
                },
                products: {
                    total: totalProducts
                },
                revenue: {
                    total: revenue
                },
                banners: {
                    total: totalBanners,
                    active: activeBanners
                },
                deals: {
                    total: totalDeals,
                    active: activeDeals
                },
                giftCards: {
                    total: totalGiftCards,
                    active: activeGiftCards,
                    redeemed: redeemedGiftCards
                },
                coupons: {
                    total: totalCoupons,
                    active: activeCoupons
                },
                reviews: {
                    total: totalReviews,
                    pending: pendingReviews,
                    flagged: flaggedReviews,
                    approved: approvedReviews
                },
                appAds: {
                    total: totalAppAds,
                    active: activeAppAds
                },
                pinnedProducts: {
                    total: totalPinnedProducts
                }
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    getAllVendors,
    approveVendor,
    rejectVendor,
    getDashboardStats
}



