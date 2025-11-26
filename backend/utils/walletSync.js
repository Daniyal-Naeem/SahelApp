const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')

/**
 * Wallet Sync Utility
 * Syncs user.credits to wallet collection for backward compatibility
 * This ensures wallets exist for all users
 */
const syncUserWallet = async (userId) => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        let wallet = await walletModel.findOne({ userId })
        
        if (!wallet) {
            // Create wallet with user's current credits
            wallet = await walletModel.create({
                userId,
                balance: user.credits || 0
            })
            console.log(`Created wallet for user ${userId} with balance ${wallet.balance}`)
        } else {
            // Sync balance if user.credits is different (for backward compatibility)
            if (user.credits !== wallet.balance) {
                const oldBalance = wallet.balance
                wallet.balance = user.credits || 0
                await wallet.save()
                console.log(`Synced wallet for user ${userId}: ${oldBalance} -> ${wallet.balance}`)
            }
        }

        return wallet
    } catch (error) {
        console.error(`Error syncing wallet for user ${userId}:`, error)
        throw error
    }
}

/**
 * Sync all user wallets
 * Migration script helper
 */
const syncAllWallets = async () => {
    try {
        const users = await userModel.find({})
        let created = 0
        let synced = 0

        for (const user of users) {
            const wallet = await walletModel.findOne({ userId: user._id })
            
            if (!wallet) {
                await walletModel.create({
                    userId: user._id,
                    balance: user.credits || 0
                })
                created++
            } else if (user.credits !== wallet.balance) {
                wallet.balance = user.credits || 0
                await wallet.save()
                synced++
            }
        }

        return {
            total: users.length,
            created,
            synced,
            unchanged: users.length - created - synced
        }
    } catch (error) {
        console.error('Error syncing all wallets:', error)
        throw error
    }
}

module.exports = {
    syncUserWallet,
    syncAllWallets
}

