const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')

/**
 * Wallet Sync Utility
 *
 * walletModel is the single source of truth for a balance. `user.credits` is a
 * read-only mirror kept only for backward compatibility with the legacy API.
 *
 * The mirror is therefore only ever written FROM the wallet. The one exception
 * is the very first sync for a user who has no wallet document yet: there the
 * legacy `user.credits` value is all we have, so it seeds the new wallet.
 */
const syncUserWallet = async (userId) => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        let wallet = await walletModel.findOne({ userId })

        if (!wallet) {
            // First migration for this user: seed the wallet from the legacy field.
            wallet = await walletModel.create({
                userId,
                balance: user.credits || 0
            })
            console.log(`Created wallet for user ${userId} with balance ${wallet.balance}`)
        } else if (user.credits !== wallet.balance) {
            // Wallet wins - refresh the legacy mirror, never the other way around.
            await userModel.findByIdAndUpdate(userId, { $set: { credits: wallet.balance } })
            console.log(`Refreshed user.credits for ${userId}: ${user.credits} -> ${wallet.balance}`)
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
                // Wallet is authoritative; bring the legacy mirror back in line.
                await userModel.findByIdAndUpdate(user._id, { $set: { credits: wallet.balance } })
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















