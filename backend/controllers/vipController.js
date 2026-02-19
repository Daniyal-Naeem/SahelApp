const mongoose = require('mongoose')
const userModel = require('../models/userModel')

/**
 * VIP Club Controller
 * Handles VIP membership management
 */

// Get user's VIP status
const getVIPStatus = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userModel.findById(userId).select('vipMembership name email');

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({
            isMember: user.vipMembership?.isMember || false,
            tier: user.vipMembership?.tier || null,
            joinedAt: user.vipMembership?.joinedAt || null,
            expiresAt: user.vipMembership?.expiresAt || null,
            points: user.vipMembership?.points || 0,
            isExpired: user.vipMembership?.expiresAt ? new Date() > new Date(user.vipMembership.expiresAt) : false
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Join VIP Club
const joinVIPClub = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Check if already a member
        if (user.vipMembership?.isMember && user.vipMembership?.expiresAt && new Date() < new Date(user.vipMembership.expiresAt)) {
            return res.status(400).json({ error: "You are already a VIP member" })
        }

        // Set membership (1 year from now)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        user.vipMembership = {
            isMember: true,
            joinedAt: new Date(),
            expiresAt: expiresAt,
            tier: 'bronze', // Start with bronze tier
            points: 0
        };

        await user.save();

        return res.status(200).json({
            message: "Successfully joined VIP Club",
            membership: {
                isMember: true,
                tier: user.vipMembership.tier,
                joinedAt: user.vipMembership.joinedAt,
                expiresAt: user.vipMembership.expiresAt,
                points: user.vipMembership.points
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Update VIP tier (admin only - can be used for promotions)
const updateVIPTier = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tier, points } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" })
        }

        const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
        if (tier && !validTiers.includes(tier)) {
            return res.status(400).json({ error: "Invalid tier. Must be one of: bronze, silver, gold, platinum" })
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (!user.vipMembership) {
            user.vipMembership = {
                isMember: true,
                joinedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                tier: tier || 'bronze',
                points: points || 0
            };
        } else {
            if (tier) user.vipMembership.tier = tier;
            if (points !== undefined) user.vipMembership.points = points;
        }

        await user.save();

        return res.status(200).json({
            message: "VIP membership updated successfully",
            membership: user.vipMembership
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Add VIP points (can be called after orders, reviews, etc.)
const addVIPPoints = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { points } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({ error: "Points must be a positive number" })
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (!user.vipMembership?.isMember) {
            return res.status(400).json({ error: "User is not a VIP member" })
        }

        user.vipMembership.points = (user.vipMembership.points || 0) + points;

        // Auto-upgrade tier based on points
        if (user.vipMembership.points >= 10000) {
            user.vipMembership.tier = 'platinum';
        } else if (user.vipMembership.points >= 5000) {
            user.vipMembership.tier = 'gold';
        } else if (user.vipMembership.points >= 2000) {
            user.vipMembership.tier = 'silver';
        }

        await user.save();

        return res.status(200).json({
            message: "VIP points added successfully",
            points: user.vipMembership.points,
            tier: user.vipMembership.tier
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getVIPStatus,
    joinVIPClub,
    updateVIPTier,
    addVIPPoints
}

