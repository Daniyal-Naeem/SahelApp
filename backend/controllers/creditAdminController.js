const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')
const creditTransactionModel = require('../models/creditTransactionModel')
const auditLogModel = require('../models/auditLogModel')
const { syncUserWallet } = require('../utils/walletSync')

/**
 * Admin Credit Management Controller
 * Read-only monitoring APIs for Phase 1
 * Full management APIs will be added in later phases
 */

/**
 * GET /api/v1/admin/credits/balances
 * Get all user credit balances with filters
 * Admin only
 */
const getCreditBalances = async (req, res) => {
    try {
        const { 
            minBalance, 
            maxBalance, 
            userId, 
            email, 
            name,
            page = 1, 
            limit = 50,
            sortBy = 'balance',
            sortOrder = 'desc'
        } = req.query

        const query = {}
        const userQuery = {}

        // Build user query for filtering
        if (email) {
            userQuery.email = { $regex: email, $options: 'i' }
        }
        if (name) {
            userQuery.name = { $regex: name, $options: 'i' }
        }
        if (userId) {
            userQuery._id = new mongoose.Types.ObjectId(userId)
        }

        // Get matching users first
        let userIds = []
        if (Object.keys(userQuery).length > 0) {
            const users = await userModel.find(userQuery).select('_id')
            userIds = users.map(u => u._id)
            if (userIds.length === 0) {
                return res.status(200).json({
                    balances: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                })
            }
            query.userId = { $in: userIds }
        }

        // Build balance range query
        if (minBalance !== undefined || maxBalance !== undefined) {
            query.balance = {}
            if (minBalance !== undefined) {
                query.balance.$gte = parseFloat(minBalance)
            }
            if (maxBalance !== undefined) {
                query.balance.$lte = parseFloat(maxBalance)
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const sortOptions = {}
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

        // Get wallets with pagination
        const wallets = await walletModel.find(query)
            .populate('userId', 'name email phone role')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))

        // Get total count
        const total = await walletModel.countDocuments(query)

        // Format response
        const balances = wallets.map(wallet => ({
            userId: wallet.userId._id,
            user: {
                name: wallet.userId.name,
                email: wallet.userId.email,
                phone: wallet.userId.phone,
                role: wallet.userId.role
            },
            balance: wallet.balance,
            currency: wallet.currency,
            lastTransactionAt: wallet.lastTransactionAt,
            stats: {
                totalEarned: wallet.totalEarned,
                totalSpent: wallet.totalSpent,
                totalTransferred: wallet.totalTransferred,
                totalReceived: wallet.totalReceived
            },
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
        }))

        return res.status(200).json({
            balances,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        console.error('Error fetching credit balances:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/v1/admin/credits/transactions
 * Get all credit transactions with filters
 * Admin only
 */
const getCreditTransactions = async (req, res) => {
    try {
        const {
            userId,
            receiverId,
            senderId,
            type,
            status,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            paymentIntentId,
            txId,
            page = 1,
            limit = 50,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query

        const query = {}

        // Build query filters
        if (userId) {
            query.$or = [
                { user: new mongoose.Types.ObjectId(userId) },
                { senderId: new mongoose.Types.ObjectId(userId) },
                { receiverId: new mongoose.Types.ObjectId(userId) }
            ]
        }
        if (receiverId) {
            query.receiverId = new mongoose.Types.ObjectId(receiverId)
        }
        if (senderId) {
            query.senderId = new mongoose.Types.ObjectId(senderId)
        }
        if (type) {
            query.type = type
        }
        if (status) {
            query.status = status
        }
        if (paymentIntentId) {
            query.paymentIntentId = paymentIntentId
        }
        if (txId) {
            query.txId = txId
        }

        // Amount range
        if (minAmount !== undefined || maxAmount !== undefined) {
            query.amount = {}
            if (minAmount !== undefined) {
                query.amount.$gte = parseFloat(minAmount)
            }
            if (maxAmount !== undefined) {
                query.amount.$lte = parseFloat(maxAmount)
            }
        }

        // Date range
        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) {
                query.createdAt.$gte = new Date(startDate)
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate)
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit)
        const sortOptions = {}
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

        // Get transactions
        const transactions = await creditTransactionModel.find(query)
            .populate('user', 'name email phone')
            .populate('senderId', 'name email phone')
            .populate('receiverId', 'name email phone')
            .populate('adminUser', 'name email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))

        // Get total count
        const total = await creditTransactionModel.countDocuments(query)

        // Format response
        const formattedTransactions = transactions.map(tx => ({
            txId: tx.txId,
            type: tx.type,
            amount: tx.amount,
            balanceAfter: tx.balanceAfter,
            description: tx.description,
            status: tx.status,
            user: tx.user ? {
                id: tx.user._id,
                name: tx.user.name,
                email: tx.user.email,
                phone: tx.user.phone
            } : null,
            sender: tx.senderId ? {
                id: tx.senderId._id,
                name: tx.senderId.name,
                email: tx.senderId.email,
                phone: tx.senderId.phone
            } : null,
            receiver: tx.receiverId ? {
                id: tx.receiverId._id,
                name: tx.receiverId.name,
                email: tx.receiverId.email,
                phone: tx.receiverId.phone
            } : null,
            hideSender: tx.hideSender,
            note: tx.note,
            paymentIntentId: tx.paymentIntentId,
            paymentMethod: tx.paymentMethod,
            paymentGateway: tx.paymentGateway,
            relatedEntity: tx.relatedEntity,
            relatedEntityId: tx.relatedEntityId,
            adminUser: tx.adminUser ? {
                id: tx.adminUser._id,
                name: tx.adminUser.name,
                email: tx.adminUser.email
            } : null,
            adminReason: tx.adminReason,
            meta: tx.meta,
            createdAt: tx.createdAt,
            completedAt: tx.completedAt,
            cancelledAt: tx.cancelledAt
        }))

        return res.status(200).json({
            transactions: formattedTransactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        console.error('Error fetching credit transactions:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/v1/admin/credits/balance/:userId
 * Get specific user's credit balance
 * Admin only
 */
const getUserCreditBalance = async (req, res) => {
    try {
        const { userId } = req.params

        // Get user
        const user = await userModel.findById(userId).select('name email phone role credits')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Get or create wallet
        let wallet = await walletModel.findOne({ userId })
        if (!wallet) {
            // Create wallet if doesn't exist (sync with user.credits)
            wallet = await walletModel.create({
                userId,
                balance: user.credits || 0
            })
        }

        // Get recent transactions
        const recentTransactions = await creditTransactionModel.find({
            $or: [
                { user: userId },
                { senderId: userId },
                { receiverId: userId }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')

        return res.status(200).json({
            userId: user._id,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            balance: wallet.balance,
            legacyCredits: user.credits || 0, // For backward compatibility
            currency: wallet.currency,
            stats: {
                totalEarned: wallet.totalEarned,
                totalSpent: wallet.totalSpent,
                totalTransferred: wallet.totalTransferred,
                totalReceived: wallet.totalReceived
            },
            lastTransactionAt: wallet.lastTransactionAt,
            recentTransactions: recentTransactions.map(tx => ({
                txId: tx.txId,
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                status: tx.status,
                createdAt: tx.createdAt
            })),
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
        })
    } catch (error) {
        console.error('Error fetching user credit balance:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/v1/admin/credits/stats
 * Get credit system statistics
 * Admin only
 */
const getCreditStats = async (req, res) => {
    try {
        // Get total wallets
        const totalWallets = await walletModel.countDocuments()
        
        // Get total balance in circulation
        const totalBalanceResult = await walletModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: '$balance' },
                    totalEarned: { $sum: '$totalEarned' },
                    totalSpent: { $sum: '$totalSpent' },
                    totalTransferred: { $sum: '$totalTransferred' },
                    totalReceived: { $sum: '$totalReceived' }
                }
            }
        ])

        const stats = totalBalanceResult[0] || {
            totalBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            totalTransferred: 0,
            totalReceived: 0
        }

        // Get transaction counts by type
        const transactionCounts = await creditTransactionModel.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ])

        // Get transaction counts by status
        const statusCounts = await creditTransactionModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        // Get pending transactions count
        const pendingCount = await creditTransactionModel.countDocuments({ status: 'pending' })

        // Get recent activity (last 24 hours)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const recentActivity = await creditTransactionModel.countDocuments({
            createdAt: { $gte: yesterday }
        })

        return res.status(200).json({
            overview: {
                totalWallets,
                totalBalanceInCirculation: stats.totalBalance,
                pendingTransactions: pendingCount,
                recentActivity24h: recentActivity
            },
            totals: {
                totalEarned: stats.totalEarned,
                totalSpent: stats.totalSpent,
                totalTransferred: stats.totalTransferred,
                totalReceived: stats.totalReceived
            },
            transactionsByType: transactionCounts.reduce((acc, item) => {
                acc[item._id] = {
                    count: item.count,
                    totalAmount: item.totalAmount
                }
                return acc
            }, {}),
            transactionsByStatus: statusCounts.reduce((acc, item) => {
                acc[item._id] = item.count
                return acc
            }, {})
        })
    } catch (error) {
        console.error('Error fetching credit stats:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/v1/admin/credits/adjust
 * Manually adjust user credit balance
 * Admin only
 */
const adjustCredit = async (req, res) => {
    try {
        const { userId, amount, reason } = req.body
        const adminId = req.user.userId

        // Validation
        if (!userId || amount === undefined || !reason) {
            return res.status(400).json({ error: 'userId, amount, and reason are required' })
        }

        if (typeof amount !== 'number' || amount === 0) {
            return res.status(400).json({ error: 'Amount must be a non-zero number' })
        }

        if (!reason.trim()) {
            return res.status(400).json({ error: 'Reason is required for audit purposes' })
        }

        // Get user
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Get or create wallet
        await syncUserWallet(userId)
        const wallet = await walletModel.findOne({ userId })
        if (!wallet) {
            return res.status(500).json({ error: 'Wallet not found' })
        }

        // Check if deducting more than available
        if (amount < 0 && wallet.balance < Math.abs(amount)) {
            return res.status(400).json({ 
                error: 'Insufficient credits',
                currentBalance: wallet.balance,
                requestedDeduction: Math.abs(amount)
            })
        }

        // Use MongoDB transaction for atomicity
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // Update wallet
            const oldBalance = wallet.balance
            wallet.balance += amount
            wallet.lastTransactionAt = new Date()
            
            if (amount > 0) {
                wallet.totalEarned = (wallet.totalEarned || 0) + amount
            } else {
                wallet.totalSpent = (wallet.totalSpent || 0) + Math.abs(amount)
            }
            
            await wallet.save({ session })

            // Update user.credits for backward compatibility
            await userModel.findByIdAndUpdate(
                userId,
                { $set: { credits: wallet.balance } },
                { session }
            )

            // Create transaction record
            const transaction = await creditTransactionModel.create([{
                user: userId,
                type: 'adjust',
                amount: Math.abs(amount),
                balanceAfter: wallet.balance,
                description: `Manual adjustment: ${reason}`,
                status: 'completed',
                adminUser: adminId,
                adminReason: reason,
                completedAt: new Date(),
                meta: {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent']
                }
            }], { session })

            await session.commitTransaction()

            // Log audit
            await auditLogModel.log({
                action: 'credit_adjust',
                userId: userId,
                adminId: adminId,
                transactionId: transaction[0]._id,
                details: {
                    amount: amount,
                    oldBalance: oldBalance,
                    newBalance: wallet.balance,
                    reason: reason
                },
                status: 'success',
                reason: reason,
                requestMeta: {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    method: req.method,
                    path: req.path
                },
                changes: {
                    before: { balance: oldBalance },
                    after: { balance: wallet.balance }
                }
            })

            return res.status(200).json({
                message: 'Credit adjusted successfully',
                transaction: {
                    txId: transaction[0].txId,
                    amount: amount,
                    oldBalance: oldBalance,
                    newBalance: wallet.balance,
                    reason: reason
                }
            })
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    } catch (error) {
        console.error('Error adjusting credit:', error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getCreditBalances,
    getCreditTransactions,
    getUserCreditBalance,
    getCreditStats,
    adjustCredit
}

