require('dotenv').config()
const mongoose = require('mongoose')
const { syncAllWallets } = require('../utils/walletSync')

const MONGODB_URI = process.env.MONGODB_URI

async function main() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        console.log('Syncing all user wallets...')
        const result = await syncAllWallets()
        
        console.log('\n=== Wallet Sync Results ===')
        console.log(`Total users: ${result.total}`)
        console.log(`Wallets created: ${result.created}`)
        console.log(`Wallets synced: ${result.synced}`)
        console.log(`Unchanged: ${result.unchanged}`)
        console.log('\nSync completed successfully!')

        process.exit(0)
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

main()

