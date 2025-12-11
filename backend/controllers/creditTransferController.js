const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')
const creditTransactionModel = require('../models/creditTransactionModel')
const notificationModel = require('../models/notificationModel')
const auditLogModel = require('../models/auditLogModel')
const { syncUserWallet } = require('../utils/walletSync')

/**
 * Credit Transfer Controller
 * Handles credit transfers between users
 * Phase 3: Transfer flow with notifications and transaction logs
 */

// Transfer limits configuration
const TRANSFER_LIMITS = {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 5000,
    DAILY_LIMIT: 10000,
    HOURLY_LIMIT: 2000
}

/**
 * Check transfer limits and fraud patterns
 */
const checkTransferLimits = async (userId, amount) => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Check hourly limit
    const hourlyTransfers = await creditTransactionModel.aggregate([
        {
            $match: {
                senderId: new mongoose.Types.ObjectId(userId),
                type: 'transfer',
                status: 'completed',
                createdAt: { $gte: oneHourAgo }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ])

    const hourlyTotal = hourlyTransfers[0]?.total || 0
    if (hourlyTotal + amount > TRANSFER_LIMITS.HOURLY_LIMIT) {
        throw new Error(`Hourly transfer limit exceeded. Limit: ${TRANSFER_LIMITS.HOURLY_LIMIT}, Used: ${hourlyTotal}, Requested: ${amount}`)
    }

    // Check daily limit
    const dailyTransfers = await creditTransactionModel.aggregate([
        {
            $match: {
                senderId: new mongoose.Types.ObjectId(userId),
                type: 'transfer',
                status: 'completed',
                createdAt: { $gte: oneDayAgo }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ])

    const dailyTotal = dailyTransfers[0]?.total || 0
    if (dailyTotal + amount > TRANSFER_LIMITS.DAILY_LIMIT) {
        throw new Error(`Daily transfer limit exceeded. Limit: ${TRANSFER_LIMITS.DAILY_LIMIT}, Used: ${dailyTotal}, Requested: ${amount}`)
    }

    return true
}

/**
 * POST /api/v1/credits/transfer
 * Transfer credits to another user
 */
const transferCredits = async (req, res) => {
    try {
        const senderId = req.user.userId
        const { receiverId, receiverEmail, receiverPhone, amount, hideSender = false, note, idempotencyKey } = req.body

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' })
        }

        if (amount < TRANSFER_LIMITS.MIN_AMOUNT) {
            return res.status(400).json({ error: `Minimum transfer amount is ${TRANSFER_LIMITS.MIN_AMOUNT}` })
        }

        if (amount > TRANSFER_LIMITS.MAX_AMOUNT) {
            return res.status(400).json({ error: `Maximum transfer amount is ${TRANSFER_LIMITS.MAX_AMOUNT}` })
        }

        if (!receiverId && !receiverEmail && !receiverPhone) {
            return res.status(400).json({ error: 'receiverId, receiverEmail, or receiverPhone is required' })
        }

        // Check idempotency
        if (idempotencyKey) {
            const existingTx = await creditTransactionModel.findOne({
                idempotencyKey,
                type: 'transfer',
                senderId: senderId
            })
            if (existingTx) {
                return res.status(200).json({
                    message: 'Transfer already processed',
                    transaction: {
                        txId: existingTx.txId,
                        status: existingTx.status,
                        amount: existingTx.amount
                    }
                })
            }
        }

        // Find receiver
        let receiver = null
        if (receiverId) {
            receiver = await userModel.findById(receiverId)
        } else if (receiverEmail) {
            receiver = await userModel.findOne({ email: receiverEmail.toLowerCase() })
        } else if (receiverPhone) {
            receiver = await userModel.findOne({ phone: receiverPhone })
        }

        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' })
        }

        if (receiver._id.toString() === senderId) {
            return res.status(400).json({ error: 'Cannot transfer credits to yourself' })
        }

        // Get sender
        const sender = await userModel.findById(senderId)
        if (!sender) {
            return res.status(404).json({ error: 'Sender not found' })
        }

        // Get or create wallets
        await syncUserWallet(senderId)
        await syncUserWallet(receiver._id)

        const senderWallet = await walletModel.findOne({ userId: senderId })
        const receiverWallet = await walletModel.findOne({ userId: receiver._id })

        if (!senderWallet || !receiverWallet) {
            return res.status(500).json({ error: 'Wallet error' })
        }

        // Check balance
        if (senderWallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient credits' })
        }

        // Check transfer limits
        try {
            await checkTransferLimits(senderId, amount)
        } catch (limitError) {
            return res.status(400).json({ error: limitError.message })
        }

        // Perform atomic transfer using MongoDB transaction
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // Update sender wallet
            senderWallet.balance -= amount
            senderWallet.lastTransactionAt = new Date()
            senderWallet.totalTransferred = (senderWallet.totalTransferred || 0) + amount
            await senderWallet.save({ session })

            // Update receiver wallet
            receiverWallet.balance += amount
            receiverWallet.lastTransactionAt = new Date()
            receiverWallet.totalReceived = (receiverWallet.totalReceived || 0) + amount
            await receiverWallet.save({ session })

            // Update user.credits for backward compatibility
            await userModel.findByIdAndUpdate(senderId, { $set: { credits: senderWallet.balance } }, { session })
            await userModel.findByIdAndUpdate(receiver._id, { $set: { credits: receiverWallet.balance } }, { session })

            // Create sender transaction record
            const senderTransaction = await creditTransactionModel.create([{
                user: senderId,
                senderId: senderId,
                receiverId: receiver._id,
                receiverEmail: receiver.email,
                receiverPhone: receiver.phone,
                type: 'transfer',
                amount: amount,
                balanceAfter: senderWallet.balance,
                description: `Transfer to ${hideSender ? 'user' : receiver.name}`,
                status: 'completed',
                hideSender: hideSender,
                note: note,
                idempotencyKey: idempotencyKey,
                completedAt: new Date(),
                meta: {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    deviceId: req.headers['x-device-id']
                }
            }], { session })

            // Create receiver transaction record
            const receiverTransaction = await creditTransactionModel.create([{
                user: receiver._id,
                senderId: senderId,
                receiverId: receiver._id,
                receiverEmail: receiver.email,
                receiverPhone: receiver.phone,
                type: 'transfer',
                amount: amount,
                balanceAfter: receiverWallet.balance,
                description: `Transfer from ${hideSender ? 'anonymous' : sender.name}`,
                status: 'completed',
                hideSender: hideSender,
                note: note,
                completedAt: new Date(),
                meta: {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent']
                }
            }], { session })

            // Create notifications
            await notificationModel.create([{
                user: senderId,
                type: 'credit_transfer_sent',
                title: 'Credit Transfer Sent',
                message: `You sent ${amount} credits to ${hideSender ? 'user' : receiver.name}`,
                data: {
                    transactionId: senderTransaction[0]._id,
                    amount: amount,
                    receiverName: hideSender ? 'user' : receiver.name
                }
            }, {
                user: receiver._id,
                type: 'credit_transfer_received',
                title: 'Credit Transfer Received',
                message: `You received ${amount} credits from ${hideSender ? 'anonymous' : sender.name}${note ? `: ${note}` : ''}`,
                data: {
                    transactionId: receiverTransaction[0]._id,
                    amount: amount,
                    senderName: hideSender ? 'anonymous' : sender.name,
                    note: note
                }
            }], { session })

            await session.commitTransaction()

            // Log audit
            await auditLogModel.log({
                action: 'credit_transfer',
                userId: senderId,
                transactionId: senderTransaction[0]._id,
                details: {
                    amount,
                    senderId,
                    receiverId: receiver._id,
                    hideSender,
                    note
                },
                status: 'success',
                requestMeta: {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    method: req.method,
                    path: req.path
                }
            })

            return res.status(200).json({
                message: 'Transfer completed successfully',
                transaction: {
                    txId: senderTransaction[0].txId,
                    amount: amount,
                    status: 'completed',
                    receiver: {
                        id: receiver._id,
                        name: hideSender ? 'user' : receiver.name,
                        email: receiver.email
                    },
                    balanceAfter: senderWallet.balance
                }
            })
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    } catch (error) {
        console.error('Error transferring credits:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/v1/credits/transfer/limits
 * Get transfer limits for current user
 */
const getTransferLimits = async (req, res) => {
    try {
        const userId = req.user.userId
        const now = new Date()
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // Get current usage
        const hourlyTransfers = await creditTransactionModel.aggregate([
            {
                $match: {
                    senderId: new mongoose.Types.ObjectId(userId),
                    type: 'transfer',
                    status: 'completed',
                    createdAt: { $gte: oneHourAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ])

        const dailyTransfers = await creditTransactionModel.aggregate([
            {
                $match: {
                    senderId: new mongoose.Types.ObjectId(userId),
                    type: 'transfer',
                    status: 'completed',
                    createdAt: { $gte: oneDayAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ])

        const hourlyUsage = hourlyTransfers[0] || { total: 0, count: 0 }
        const dailyUsage = dailyTransfers[0] || { total: 0, count: 0 }

        return res.status(200).json({
            limits: {
                minAmount: TRANSFER_LIMITS.MIN_AMOUNT,
                maxAmount: TRANSFER_LIMITS.MAX_AMOUNT,
                hourlyLimit: TRANSFER_LIMITS.HOURLY_LIMIT,
                dailyLimit: TRANSFER_LIMITS.DAILY_LIMIT
            },
            usage: {
                hourly: {
                    used: hourlyUsage.total,
                    remaining: TRANSFER_LIMITS.HOURLY_LIMIT - hourlyUsage.total,
                    count: hourlyUsage.count
                },
                daily: {
                    used: dailyUsage.total,
                    remaining: TRANSFER_LIMITS.DAILY_LIMIT - dailyUsage.total,
                    count: dailyUsage.count
                }
            }
        })
    } catch (error) {
        console.error('Error getting transfer limits:', error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    transferCredits,
    getTransferLimits
}















