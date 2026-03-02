const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');

/**
 * VIP Auto-Assignment Utility
 * Automatically assigns VIP membership based on user spending
 */

/**
 * Calculate total spending for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total spending amount
 */
const calculateTotalSpending = async (userId) => {
    try {
        const orders = await orderModel.find({
            user: userId,
            paymentStatus: 'paid' // Only count paid orders
        });

        const totalSpending = orders.reduce((sum, order) => {
            return sum + (order.total || 0);
        }, 0);

        return totalSpending;
    } catch (error) {
        console.error('Error calculating total spending:', error);
        return 0;
    }
};

/**
 * Determine VIP tier based on spending
 * @param {number} totalSpending - Total spending amount
 * @returns {string|null} VIP tier or null
 */
const getQualifiedTier = (totalSpending) => {
    if (totalSpending >= 10000) {
        return 'platinum';
    } else if (totalSpending >= 5000) {
        return 'gold';
    } else if (totalSpending >= 2000) {
        return 'silver';
    } else if (totalSpending >= 500) {
        return 'bronze';
    }
    return null;
};

/**
 * Auto-assign VIP membership based on spending threshold
 * @param {string} userId - User ID
 * @param {number} threshold - Minimum spending threshold (default: 500 SAR)
 * @returns {Promise<Object|null>} Updated membership or null
 */
const autoAssignVIP = async (userId, threshold = 500) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user already has active VIP membership
        if (user.vipMembership?.isMember && user.vipMembership?.expiresAt) {
            const expiryDate = new Date(user.vipMembership.expiresAt);
            if (expiryDate > new Date()) {
                // User already has active membership, just update tier if needed
                const totalSpending = await calculateTotalSpending(userId);
                const qualifiedTier = getQualifiedTier(totalSpending);
                
                if (qualifiedTier && user.vipMembership.tier !== qualifiedTier) {
                    user.vipMembership.tier = qualifiedTier;
                    await user.save();
                    return {
                        message: 'VIP tier upgraded',
                        membership: user.vipMembership
                    };
                }
                return null; // No changes needed
            }
        }

        // Calculate total spending
        const totalSpending = await calculateTotalSpending(userId);

        // Check if user qualifies for VIP
        if (totalSpending < threshold) {
            return null; // User doesn't qualify yet
        }

        // Determine tier
        const tier = getQualifiedTier(totalSpending) || 'bronze';

        // Assign VIP membership
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year membership

        user.vipMembership = {
            isMember: true,
            joinedAt: user.vipMembership?.joinedAt || new Date(),
            expiresAt: expiresAt,
            tier: tier,
            points: user.vipMembership?.points || 0
        };

        await user.save();

        return {
            message: 'VIP membership auto-assigned',
            membership: user.vipMembership,
            totalSpending: totalSpending
        };
    } catch (error) {
        console.error('Error auto-assigning VIP:', error);
        throw error;
    }
};

/**
 * Check and auto-assign VIP for user after order completion
 * This should be called after an order is marked as 'paid'
 * @param {string} userId - User ID
 */
const checkAndAutoAssignVIP = async (userId) => {
    try {
        await autoAssignVIP(userId, 500); // 500 SAR threshold
    } catch (error) {
        console.error('Error checking VIP auto-assignment:', error);
        // Don't throw - this is a background operation
    }
};

/**
 * Update VIP tier based on current spending
 * @param {string} userId - User ID
 */
const updateVIPTier = async (userId) => {
    try {
        const user = await userModel.findById(userId);
        if (!user || !user.vipMembership?.isMember) {
            return null;
        }

        const totalSpending = await calculateTotalSpending(userId);
        const qualifiedTier = getQualifiedTier(totalSpending);

        if (qualifiedTier && user.vipMembership.tier !== qualifiedTier) {
            user.vipMembership.tier = qualifiedTier;
            await user.save();
            return {
                message: 'VIP tier updated',
                oldTier: user.vipMembership.tier,
                newTier: qualifiedTier,
                totalSpending: totalSpending
            };
        }

        return null;
    } catch (error) {
        console.error('Error updating VIP tier:', error);
        throw error;
    }
};

module.exports = {
    calculateTotalSpending,
    getQualifiedTier,
    autoAssignVIP,
    checkAndAutoAssignVIP,
    updateVIPTier
};
