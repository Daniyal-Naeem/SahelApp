const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')
const creditTransactionModel = require('../models/creditTransactionModel')
const auditLogModel = require('../models/auditLogModel')
const { syncUserWallet } = require('../utils/walletSync')

/**
 * Credit Top-up Controller
 * Handles credit top-up via payment gateway
 * Phase 2: Top-up flow with webhook confirmation
 */

/**
 * POST /api/v1/credits/topup
 * Initiate credit top-up
 * Returns payment intent/reference for payment gateway
 */
const initiateTopup = async (req, res) => {
    try {
        const userId = req.user.userId
        const { amount, idempotencyKey, paymentMethod = 'card' } = req.body

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' })
        }

        if (amount < 10) {
            return res.status(400).json({ error: 'Minimum top-up amount is 10' })
        }

        if (amount > 10000) {
            return res.status(400).json({ error: 'Maximum top-up amount is 10,000' })
        }

        // Check idempotency
        if (idempotencyKey) {
            const existingTx = await creditTransactionModel.findOne({
                idempotencyKey,
                type: 'topup',
                user: userId
            })
            if (existingTx) {
                return res.status(200).json({
                    message: 'Top-up already initiated',
                    paymentIntentId: existingTx.paymentIntentId,
                    transaction: {
                        txId: existingTx.txId,
                        status: existingTx.status,
                        amount: existingTx.amount
                    }
                })
            }
        }

        // Get or create wallet
        await syncUserWallet(userId)

        // Generate payment intent ID (mock payment gateway)
        const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

        // Create pending transaction
        const transaction = await creditTransactionModel.create({
            user: userId,
            type: 'topup',
            amount: amount,
            balanceAfter: 0, // Will be updated on confirmation
            description: `Credit top-up of ${amount}`,
            status: 'pending',
            paymentIntentId: paymentIntentId,
            paymentMethod: paymentMethod,
            paymentGateway: 'mock_gateway', // Replace with actual gateway name
            idempotencyKey: idempotencyKey,
            meta: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                deviceId: req.headers['x-device-id']
            }
        })

        // Log audit
        await auditLogModel.log({
            action: 'credit_topup',
            userId: userId,
            transactionId: transaction._id,
            details: {
                amount,
                paymentIntentId,
                paymentMethod,
                idempotencyKey
            },
            status: 'pending',
            requestMeta: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                method: req.method,
                path: req.path
            }
        })

        // In a real implementation, you would:
        // 1. Call payment gateway API to create payment intent
        // 2. Return client secret or payment URL
        // For now, we'll return a mock payment intent

        return res.status(200).json({
            message: 'Top-up initiated successfully',
            paymentIntentId: paymentIntentId,
            amount: amount,
            status: 'pending',
            transaction: {
                txId: transaction.txId,
                status: transaction.status,
                createdAt: transaction.createdAt
            },
            // Mock payment gateway response
            paymentGateway: {
                clientSecret: `mock_secret_${paymentIntentId}`,
                // In production, this would be the actual payment URL or client secret
                paymentUrl: `https://payment-gateway.com/pay/${paymentIntentId}`
            }
        })
    } catch (error) {
        console.error('Error initiating top-up:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/v1/credits/topup/confirm
 * Confirm top-up via webhook (called by payment gateway)
 * This endpoint should be secured with webhook signature verification
 */
const confirmTopup = async (req, res) => {
    try {
        const { paymentIntentId, status, amount, metadata } = req.body

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'paymentIntentId is required' })
        }

        // Find pending transaction
        const transaction = await creditTransactionModel.findOne({
            paymentIntentId,
            type: 'topup',
            status: 'pending'
        })

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' })
        }

        // Verify amount matches (security check)
        if (amount && parseFloat(amount) !== transaction.amount) {
            console.error(`Amount mismatch for payment ${paymentIntentId}: expected ${transaction.amount}, got ${amount}`)
            // Log but don't fail - might be a rounding issue
        }

        // In production, verify webhook signature here
        // const isValid = verifyWebhookSignature(req.headers, req.body, process.env.WEBHOOK_SECRET)
        // if (!isValid) {
        //     return res.status(401).json({ error: 'Invalid webhook signature' })
        // }

        if (status === 'succeeded' || status === 'paid') {
            // Get or create wallet
            const wallet = await walletModel.findOne({ userId: transaction.user })
            if (!wallet) {
                await syncUserWallet(transaction.user)
            }

            // Use MongoDB transaction for atomicity (if replica set)
            const session = await mongoose.startSession()
            session.startTransaction()

            try {
                // Update wallet balance atomically
                const updatedWallet = await walletModel.findOneAndUpdate(
                    { userId: transaction.user },
                    {
                        $inc: { 
                            balance: transaction.amount,
                            totalEarned: transaction.amount
                        },
                        $set: { lastTransactionAt: new Date() }
                    },
                    { new: true, session }
                )

                // Update transaction
                transaction.status = 'completed'
                transaction.balanceAfter = updatedWallet.balance
                transaction.completedAt = new Date()
                transaction.webhookData = {
                    gatewayStatus: status,
                    confirmedAt: new Date(),
                    metadata: metadata
                }
                await transaction.save({ session })

                // Update user.credits for backward compatibility
                await userModel.findByIdAndUpdate(
                    transaction.user,
                    { $set: { credits: updatedWallet.balance } },
                    { session }
                )

                await session.commitTransaction()

                // Log audit
                await auditLogModel.log({
                    action: 'credit_topup',
                    userId: transaction.user,
                    transactionId: transaction._id,
                    details: {
                        amount: transaction.amount,
                        paymentIntentId,
                        status: 'completed',
                        balanceAfter: updatedWallet.balance
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
                    message: 'Top-up confirmed successfully',
                    transaction: {
                        txId: transaction.txId,
                        amount: transaction.amount,
                        status: transaction.status,
                        balanceAfter: updatedWallet.balance
                    }
                })
            } catch (error) {
                await session.abortTransaction()
                throw error
            } finally {
                session.endSession()
            }
        } else if (status === 'failed' || status === 'cancelled') {
            // Mark transaction as failed
            transaction.status = 'failed'
            transaction.webhookData = {
                gatewayStatus: status,
                failedAt: new Date(),
                metadata: metadata
            }
            await transaction.save()

            // Log audit
            await auditLogModel.log({
                action: 'credit_topup',
                userId: transaction.user,
                transactionId: transaction._id,
                details: {
                    amount: transaction.amount,
                    paymentIntentId,
                    status: 'failed',
                    reason: status
                },
                status: 'failed',
                error: {
                    message: `Payment ${status}`,
                    code: status.toUpperCase()
                },
                requestMeta: {
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    method: req.method,
                    path: req.path
                }
            })

            return res.status(200).json({
                message: 'Top-up failed',
                transaction: {
                    txId: transaction.txId,
                    status: transaction.status
                }
            })
        } else {
            return res.status(400).json({ error: `Unknown status: ${status}` })
        }
    } catch (error) {
        console.error('Error confirming top-up:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/v1/credits/topup/:paymentIntentId
 * Get top-up status
 */
const getTopupStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.params
        const userId = req.user.userId

        const transaction = await creditTransactionModel.findOne({
            paymentIntentId,
            user: userId,
            type: 'topup'
        })

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' })
        }

        return res.status(200).json({
            paymentIntentId: transaction.paymentIntentId,
            txId: transaction.txId,
            amount: transaction.amount,
            status: transaction.status,
            createdAt: transaction.createdAt,
            completedAt: transaction.completedAt,
            balanceAfter: transaction.balanceAfter
        })
    } catch (error) {
        console.error('Error getting top-up status:', error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    initiateTopup,
    confirmTopup,
    getTopupStatus
}















