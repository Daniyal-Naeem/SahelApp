const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')
const orderModel = require('../models/orderModel')
const creditTransactionModel = require('../models/creditTransactionModel')
const auditLogModel = require('../models/auditLogModel')
const { syncUserWallet } = require('../utils/walletSync')

/**
 * Checkout Credit Controller
 * Handles credit reservation and consumption during checkout
 * Phase 4: Checkout integration
 */

/**
 * POST /api/v1/checkout/apply-credit
 * Reserve credits for an order
 * Validates and reserves credit amount before payment
 */
const applyCredit = async (req, res) => {
    try {
        const userId = req.user.userId
        const { orderId, creditAmount, totalAmount } = req.body

        // Validation
        if (!creditAmount || creditAmount <= 0) {
            return res.status(400).json({ error: 'Credit amount must be greater than 0' })
        }

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ error: 'Total amount must be greater than 0' })
        }

        if (creditAmount > totalAmount) {
            return res.status(400).json({ error: 'Credit amount cannot exceed total amount' })
        }

        // Get or create wallet
        await syncUserWallet(userId)
        const wallet = await walletModel.findOne({ userId })

        if (!wallet) {
            return res.status(500).json({ error: 'Wallet not found' })
        }

        // Check balance
        if (wallet.balance < creditAmount) {
            return res.status(400).json({ 
                error: 'Insufficient credits',
                available: wallet.balance,
                requested: creditAmount
            })
        }

        // Find or create order
        let order = null
        if (orderId) {
            order = await orderModel.findOne({ _id: orderId, user: userId })
            if (!order) {
                return res.status(404).json({ error: 'Order not found' })
            }
        }

        // Calculate remaining amount after credit
        const remainingAmount = totalAmount - creditAmount

        // Create pending transaction (reservation)
        const reservationTx = await creditTransactionModel.create({
            user: userId,
            type: 'consume',
            amount: creditAmount,
            balanceAfter: wallet.balance - creditAmount, // Will be updated on confirmation
            description: `Credit reservation for order${orderId ? ` ${order.orderNumber}` : ''}`,
            status: 'pending',
            relatedEntity: 'order',
            relatedEntityId: orderId || null,
            meta: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                deviceId: req.headers['x-device-id']
            }
        })

        // Log audit
        await auditLogModel.log({
            action: 'credit_consume',
            userId: userId,
            transactionId: reservationTx._id,
            orderId: orderId || null,
            details: {
                amount: creditAmount,
                totalAmount: totalAmount,
                remainingAmount: remainingAmount,
                status: 'reserved'
            },
            status: 'pending',
            requestMeta: {
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                method: req.method,
                path: req.path
            }
        })

        return res.status(200).json({
            message: 'Credit reserved successfully',
            reservation: {
                txId: reservationTx.txId,
                creditAmount: creditAmount,
                totalAmount: totalAmount,
                remainingAmount: remainingAmount,
                status: 'reserved'
            },
            balance: {
                current: wallet.balance,
                afterReservation: wallet.balance - creditAmount
            }
        })
    } catch (error) {
        console.error('Error applying credit:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/v1/checkout/complete
 * Complete checkout and consume reserved credits
 * Called after successful payment confirmation
 */
const completeCheckout = async (req, res) => {
    try {
        const userId = req.user.userId
        const { orderId, reservationTxId, paymentMethod, paymentStatus } = req.body

        if (!orderId) {
            return res.status(400).json({ error: 'orderId is required' })
        }

        // Find order
        const order = await orderModel.findOne({ _id: orderId, user: userId })
        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // Find reservation transaction
        let reservationTx = null
        if (reservationTxId) {
            reservationTx = await creditTransactionModel.findOne({
                txId: reservationTxId,
                user: userId,
                type: 'consume',
                status: 'pending',
                relatedEntity: 'order',
                relatedEntityId: orderId
            })
        } else {
            // Find any pending credit transaction for this order
            reservationTx = await creditTransactionModel.findOne({
                user: userId,
                type: 'consume',
                status: 'pending',
                relatedEntity: 'order',
                relatedEntityId: orderId
            })
        }

        if (!reservationTx) {
            // No credit reservation, order can still proceed
            order.paymentStatus = paymentStatus === 'paid' || paymentStatus === 'success'
                ? 'paid'
                : order.paymentStatus
            await order.save()
            const currentWallet = await walletModel.findOne({ userId })
            return res.status(200).json({
                message: 'Checkout completed (no credit reservation)',
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    total: order.total,
                    paymentStatus: order.paymentStatus
                },
                balance: currentWallet ? currentWallet.balance : 0
            })
        }

        // Get wallet
        const wallet = await walletModel.findOne({ userId })
        if (!wallet) {
            return res.status(500).json({ error: 'Wallet not found' })
        }

        // Standalone MongoDB (local demo) does not support multi-doc transactions.
        // Keep the debit atomic enough for demo by sequential writes.
        try {
            if (paymentStatus === 'paid' || paymentStatus === 'success') {
                if (wallet.balance < reservationTx.amount) {
                    return res.status(400).json({
                        error: 'Insufficient credits',
                        available: wallet.balance,
                        requested: reservationTx.amount
                    })
                }

                wallet.balance -= reservationTx.amount
                wallet.lastTransactionAt = new Date()
                wallet.totalSpent = (wallet.totalSpent || 0) + reservationTx.amount
                await wallet.save()

                await userModel.findByIdAndUpdate(userId, {
                    $set: { credits: wallet.balance }
                })

                reservationTx.status = 'completed'
                reservationTx.balanceAfter = wallet.balance
                reservationTx.completedAt = new Date()
                await reservationTx.save()

                order.paymentMethod = paymentMethod || order.paymentMethod
                order.paymentStatus = 'paid'
                order.creditUsed = reservationTx.amount
                await order.save()

                await auditLogModel.log({
                    action: 'credit_consume',
                    userId: userId,
                    transactionId: reservationTx._id,
                    orderId: orderId,
                    details: {
                        amount: reservationTx.amount,
                        orderNumber: order.orderNumber,
                        paymentMethod: paymentMethod,
                        status: 'completed'
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
                    message: 'Checkout completed successfully',
                    order: {
                        _id: order._id,
                        orderNumber: order.orderNumber,
                        total: order.total,
                        creditUsed: reservationTx.amount,
                        paymentStatus: 'paid'
                    },
                    transaction: {
                        txId: reservationTx.txId,
                        amount: reservationTx.amount,
                        status: 'completed',
                        balanceAfter: wallet.balance
                    },
                    balance: wallet.balance
                })
            } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
                reservationTx.status = 'cancelled'
                reservationTx.cancelledAt = new Date()
                await reservationTx.save()

                await auditLogModel.log({
                    action: 'credit_consume',
                    userId: userId,
                    transactionId: reservationTx._id,
                    orderId: orderId,
                    details: {
                        amount: reservationTx.amount,
                        orderNumber: order.orderNumber,
                        paymentStatus: paymentStatus,
                        status: 'cancelled'
                    },
                    status: 'failed',
                    error: {
                        message: `Payment ${paymentStatus}`,
                        code: paymentStatus.toUpperCase()
                    },
                    requestMeta: {
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.headers['user-agent'],
                        method: req.method,
                        path: req.path
                    }
                })

                return res.status(200).json({
                    message: 'Credit reservation cancelled',
                    transaction: {
                        txId: reservationTx.txId,
                        status: 'cancelled'
                    },
                    balance: wallet.balance
                })
            }

            return res.status(400).json({ error: `Unknown payment status: ${paymentStatus}` })
        } catch (error) {
            throw error
        }
    } catch (error) {
        console.error('Error completing checkout:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/v1/checkout/refund-credit
 * Refund credits from cancelled order
 */
const refundCredit = async (req, res) => {
    try {
        const userId = req.user.userId
        const { orderId, amount, reason } = req.body

        if (!orderId) {
            return res.status(400).json({ error: 'orderId is required' })
        }

        // Find order
        const order = await orderModel.findOne({ _id: orderId, user: userId })
        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // Determine refund amount
        const refundAmount = amount || order.creditUsed || 0
        if (refundAmount <= 0) {
            return res.status(400).json({ error: 'No credit to refund' })
        }

        // Get wallet
        await syncUserWallet(userId)
        const wallet = await walletModel.findOne({ userId })

        // Use MongoDB transaction
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // Update wallet
            wallet.balance += refundAmount
            wallet.lastTransactionAt = new Date()
            wallet.totalEarned = (wallet.totalEarned || 0) + refundAmount
            await wallet.save({ session })

            // Update user.credits
            await userModel.findByIdAndUpdate(
                userId,
                { $set: { credits: wallet.balance } },
                { session }
            )

            // Create refund transaction
            const refundTx = await creditTransactionModel.create([{
                user: userId,
                type: 'refund',
                amount: refundAmount,
                balanceAfter: wallet.balance,
                description: `Refund for order ${order.orderNumber}${reason ? `: ${reason}` : ''}`,
                status: 'completed',
                relatedEntity: 'order',
                relatedEntityId: orderId,
                completedAt: new Date()
            }], { session })

            await session.commitTransaction()

            // Log audit
            await auditLogModel.log({
                action: 'credit_refund',
                userId: userId,
                transactionId: refundTx[0]._id,
                orderId: orderId,
                details: {
                    amount: refundAmount,
                    orderNumber: order.orderNumber,
                    reason: reason
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
                message: 'Credit refunded successfully',
                transaction: {
                    txId: refundTx[0].txId,
                    amount: refundAmount,
                    status: 'completed',
                    balanceAfter: wallet.balance
                }
            })
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    } catch (error) {
        console.error('Error refunding credit:', error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    applyCredit,
    completeCheckout,
    refundCredit
}















