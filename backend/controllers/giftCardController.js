const giftCardModel = require('../models/giftCardModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')

/**
 * Gift Card Controller
 * Phase 8: Gift card management
 */

/**
 * GET /api/gift-cards
 * Get gift cards (admin: all, user: assigned)
 */
const getGiftCards = async (req, res) => {
    try {
        const userRole = req.user?.role
        const userId = req.user?.userId

        let query = {}
        if (userRole !== 'admin') {
            query = {
                $or: [
                    { assignedTo: userId },
                    { purchasedBy: userId },
                    { redeemedBy: userId }
                ]
            }
        }

        const giftCards = await giftCardModel.find(query)
            .populate('assignedTo', 'name email')
            .populate('purchasedBy', 'name email')
            .populate('redeemedBy', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json(giftCards)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/gift-cards/:id
 * Get gift card by ID (admin only)
 */
const getGiftCardById = async (req, res) => {
    try {
        const { id } = req.params
        const giftCard = await giftCardModel.findById(id)
            .populate('assignedTo', 'name email')
            .populate('purchasedBy', 'name email')
            .populate('redeemedBy', 'name email')
            .populate('createdBy', 'name email')

        if (!giftCard) {
            return res.status(404).json({ error: 'Gift card not found' })
        }

        // Check if expired
        if (giftCard.expiresAt && new Date() > giftCard.expiresAt && giftCard.status === 'active') {
            giftCard.status = 'expired'
            await giftCard.save()
        }

        return res.status(200).json(giftCard)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/gift-cards/:code
 * Get gift card by code
 */
const getGiftCardByCode = async (req, res) => {
    try {
        const { code } = req.params
        const giftCard = await giftCardModel.findOne({ code: code.toUpperCase() })
            .populate('assignedTo', 'name email')
            .populate('purchasedBy', 'name email')

        if (!giftCard) {
            return res.status(404).json({ error: 'Gift card not found' })
        }

        // Check if expired
        if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
            giftCard.status = 'expired'
            await giftCard.save()
        }

        return res.status(200).json(giftCard)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/gift-cards
 * Create gift card (admin only)
 */
const createGiftCard = async (req, res) => {
    try {
        const { amount, currency, type, expiresAt, assignedTo, applicableCategories, applicableVendors, minPurchase } = req.body

        // Generate unique code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = 'GC-'
        for (let i = 0; i < 3; i++) {
            let segment = ''
            for (let j = 0; j < 4; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            code += segment + (i < 2 ? '-' : '')
        }

        // Check if code exists
        const existing = await giftCardModel.findOne({ code })
        if (existing) {
            // Regenerate if exists
            code = 'GC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        }

        const giftCard = await giftCardModel.create({
            code,
            amount,
            currency: currency || 'USD',
            type: type || 'digital',
            expiresAt,
            assignedTo,
            applicableCategories,
            applicableVendors,
            minPurchase: minPurchase || 0,
            createdBy: req.user.userId
        })

        return res.status(201).json(giftCard)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/gift-cards/bulk
 * Create multiple gift cards (admin only)
 */
const createBulkGiftCards = async (req, res) => {
    try {
        const { count, amount, currency, type, expiresAt } = req.body

        if (!count || count < 1 || count > 100) {
            return res.status(400).json({ error: 'Count must be between 1 and 100' })
        }

        const giftCards = []
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

        for (let i = 0; i < count; i++) {
            let code = 'GC-'
            for (let j = 0; j < 3; j++) {
                let segment = ''
                for (let k = 0; k < 4; k++) {
                    segment += chars.charAt(Math.floor(Math.random() * chars.length))
                }
                code += segment + (j < 2 ? '-' : '')
            }

            // Ensure uniqueness
            const existing = await giftCardModel.findOne({ code })
            if (!existing) {
                giftCards.push({
                    code,
                    amount,
                    currency: currency || 'USD',
                    type: type || 'digital',
                    expiresAt,
                    createdBy: req.user.userId
                })
            }
        }

        const created = await giftCardModel.insertMany(giftCards)
        return res.status(201).json({ count: created.length, giftCards: created })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/gift-cards/:code/redeem
 * Redeem gift card
 */
const redeemGiftCard = async (req, res) => {
    try {
        const { code } = req.params
        const userId = req.user.userId
        const { orderId } = req.body

        const giftCard = await giftCardModel.findOne({ code: code.toUpperCase() })
        if (!giftCard) {
            return res.status(404).json({ error: 'Gift card not found' })
        }

        if (giftCard.status !== 'active') {
            return res.status(400).json({ error: `Gift card is ${giftCard.status}` })
        }

        if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
            giftCard.status = 'expired'
            await giftCard.save()
            return res.status(400).json({ error: 'Gift card has expired' })
        }

        if (giftCard.currentUses >= giftCard.maxUses) {
            return res.status(400).json({ error: 'Gift card usage limit reached' })
        }

        // Update gift card
        giftCard.status = 'redeemed'
        giftCard.redeemedBy = userId
        giftCard.redeemedAt = new Date()
        giftCard.currentUses += 1
        await giftCard.save()

        // Add credits to user account (using existing credit system)
        const { addCredits } = require('./creditController')
        await addCredits(
            userId,
            giftCard.amount,
            `Gift card redemption: ${code}`,
            { type: 'bonus', relatedEntity: 'gift_card', relatedEntityId: giftCard._id }
        )

        return res.status(200).json({
            message: 'Gift card redeemed successfully',
            amount: giftCard.amount,
            giftCard
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/gift-cards/:id
 * Update gift card (admin only)
 */
const updateGiftCard = async (req, res) => {
    try {
        const giftCard = await giftCardModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!giftCard) {
            return res.status(404).json({ error: 'Gift card not found' })
        }
        return res.status(200).json(giftCard)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/gift-cards/:id
 * Delete/cancel gift card (admin only)
 */
const deleteGiftCard = async (req, res) => {
    try {
        const giftCard = await giftCardModel.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        )
        if (!giftCard) {
            return res.status(404).json({ error: 'Gift card not found' })
        }
        return res.status(200).json({ message: 'Gift card cancelled successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/gift-cards/send
 * Send digital gift credits to another user by email (deducts from sender wallet).
 */
const sendGiftCard = async (req, res) => {
    try {
        const senderId = req.user.userId
        const { email, amount, message } = req.body
        const giftAmount = parseFloat(amount)

        if (!email || !giftAmount || giftAmount <= 0) {
            return res.status(400).json({ error: 'email and a positive amount are required' })
        }

        const recipient = await userModel.findOne({ email: String(email).toLowerCase().trim() })
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found. They must have a Sahal account.' })
        }
        if (String(recipient._id) === String(senderId)) {
            return res.status(400).json({ error: 'You cannot send a gift to yourself' })
        }

        const { syncUserWallet } = require('../utils/walletSync')
        const walletModel = require('../models/walletModel')
        const creditTransactionModel = require('../models/creditTransactionModel')

        await syncUserWallet(senderId)
        const senderWallet = await walletModel.findOne({ userId: senderId })
        if (!senderWallet || Number(senderWallet.balance) < giftAmount) {
            return res.status(400).json({ error: 'Insufficient wallet credits' })
        }

        senderWallet.balance = Number(senderWallet.balance) - giftAmount
        await senderWallet.save()
        await userModel.findByIdAndUpdate(senderId, { credits: senderWallet.balance })

        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 6)

        const giftCard = await giftCardModel.create({
            amount: giftAmount,
            currency: 'SAR',
            type: 'digital',
            status: 'active',
            assignedTo: recipient._id,
            purchasedBy: senderId,
            expiresAt,
            createdBy: senderId,
            maxUses: 1
        })

        await creditTransactionModel.create({
            user: senderId,
            type: 'transfer',
            amount: giftAmount,
            balanceAfter: senderWallet.balance,
            description: message
                ? `Gift to ${recipient.email}: ${message}`
                : `Gift to ${recipient.email}`,
            status: 'completed',
            meta: { giftCardId: giftCard._id, recipientId: recipient._id }
        })

        return res.status(200).json({
            message: 'Gift sent successfully',
            giftCard: {
                code: giftCard.code,
                amount: giftCard.amount,
                assignedTo: { email: recipient.email, name: recipient.name },
                expiresAt: giftCard.expiresAt
            },
            balance: senderWallet.balance
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getGiftCards,
    getGiftCardById,
    getGiftCardByCode,
    createGiftCard,
    createBulkGiftCards,
    redeemGiftCard,
    updateGiftCard,
    deleteGiftCard,
    sendGiftCard
}















