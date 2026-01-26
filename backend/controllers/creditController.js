const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')
const creditTransactionModel = require('../models/creditTransactionModel')
const auditLogModel = require('../models/auditLogModel')
const { syncUserWallet } = require('../utils/walletSync')

/**
 * getUserCredits,
 * getCreditTransactions,
 * addCredits,
 * deductCredits,
 * transferCredits
 */

// Get user's current credit balance
const getUserCredits = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select('credits name email')
        
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Get or create wallet (sync with user.credits for backward compatibility)
        await syncUserWallet(userId)
        const wallet = await walletModel.findOne({ userId })

        return res.status(200).json({
            credits: wallet ? wallet.balance : (user.credits || 0),
            balance: wallet ? wallet.balance : (user.credits || 0), // New field
            currency: wallet ? wallet.currency : 'USD',
            user: {
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get credit transaction history
const getCreditTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { type, limit = 50 } = req.query;

        let query = {};
        
        // Users can only see their own transactions (unless admin)
        if (userRole === 'user') {
            query.user = userId;
        } else if (req.query.userId && userRole === 'admin') {
            // Admin can view any user's transactions
            query.user = req.query.userId;
        } else {
            query.user = userId;
        }

        if (type) {
            query.type = type;
        }

        const transactions = await creditTransactionModel.find(query)
            .populate('user', 'name email')
            .populate('adminUser', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        return res.status(200).json(transactions)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Add credits to user account
const addCredits = async (userId, amount, description, options = {}) => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        // Get or create wallet
        await syncUserWallet(userId)
        const wallet = await walletModel.findOne({ userId })
        if (!wallet) {
            throw new Error('Wallet not found')
        }

        const currentBalance = wallet.balance || 0;
        const newBalance = currentBalance + amount;

        // Use MongoDB transaction for atomicity
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // Update wallet balance
            wallet.balance = newBalance
            wallet.lastTransactionAt = new Date()
            if (options.type === 'earned' || options.type === 'bonus') {
                wallet.totalEarned = (wallet.totalEarned || 0) + amount
            }
            await wallet.save({ session })

            // Update user.credits for backward compatibility
            user.credits = newBalance
            await user.save({ session })

            // Create transaction record
            const transaction = await creditTransactionModel.create([{
                user: userId,
                type: options.type || 'earned',
                amount: amount,
                balanceAfter: newBalance,
                description: description,
                relatedEntity: options.relatedEntity || 'none',
                relatedEntityId: options.relatedEntityId || null,
                adminUser: options.adminUser || null,
                status: 'completed',
                completedAt: new Date()
            }], { session })

            await session.commitTransaction()

            // Log audit
            await auditLogModel.log({
                action: 'credit_adjust',
                userId: userId,
                adminId: options.adminUser || null,
                transactionId: transaction[0]._id,
                details: {
                    amount,
                    type: options.type || 'earned',
                    description,
                    balanceAfter: newBalance
                },
                status: 'success'
            })

            return transaction[0]
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    } catch (error) {
        console.error('Error adding credits:', error)
        throw error
    }
}

// Deduct credits from user account
const deductCredits = async (userId, amount, description, options = {}) => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        // Get or create wallet
        await syncUserWallet(userId)
        const wallet = await walletModel.findOne({ userId })
        if (!wallet) {
            throw new Error('Wallet not found')
        }

        const currentBalance = wallet.balance || 0;
        
        if (currentBalance < amount) {
            throw new Error('Insufficient credits')
        }

        const newBalance = currentBalance - amount;

        // Use MongoDB transaction for atomicity
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // Update wallet balance
            wallet.balance = newBalance
            wallet.lastTransactionAt = new Date()
            wallet.totalSpent = (wallet.totalSpent || 0) + amount
            await wallet.save({ session })

            // Update user.credits for backward compatibility
            user.credits = newBalance
            await user.save({ session })

            // Create transaction record
            const transaction = await creditTransactionModel.create([{
                user: userId,
                type: options.type || 'consume',
                amount: amount,
                balanceAfter: newBalance,
                description: description,
                relatedEntity: options.relatedEntity || 'none',
                relatedEntityId: options.relatedEntityId || null,
                status: 'completed',
                completedAt: new Date()
            }], { session })

            await session.commitTransaction()

            // Log audit
            await auditLogModel.log({
                action: 'credit_consume',
                userId: userId,
                transactionId: transaction[0]._id,
                details: {
                    amount,
                    description,
                    balanceAfter: newBalance,
                    relatedEntity: options.relatedEntity,
                    relatedEntityId: options.relatedEntityId
                },
                status: 'success'
            })

            return transaction[0]
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    } catch (error) {
        console.error('Error deducting credits:', error)
        throw error
    }
}

// Admin: Add credits to user (API endpoint)
const adminAddCredits = async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        const adminId = req.user.userId;

        if (!userId || !amount || !description) {
            return res.status(400).json({ error: "userId, amount, and description are required" })
        }

        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" })
        }

        const transaction = await addCredits(
            userId,
            amount,
            description,
            {
                type: 'admin_adjustment',
                adminUser: adminId
            }
        )

        return res.status(200).json({
            message: "Credits added successfully",
            transaction
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Admin: Deduct credits from user (API endpoint)
const adminDeductCredits = async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        const adminId = req.user.userId;

        if (!userId || !amount || !description) {
            return res.status(400).json({ error: "userId, amount, and description are required" })
        }

        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" })
        }

        const transaction = await deductCredits(
            userId,
            amount,
            description,
            {
                adminUser: adminId
            }
        )

        return res.status(200).json({
            message: "Credits deducted successfully",
            transaction
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getUserCredits,
    getCreditTransactions,
    addCredits,
    deductCredits,
    adminAddCredits,
    adminDeductCredits
}


