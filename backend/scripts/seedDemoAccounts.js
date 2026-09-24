/**
 * Seed demo accounts for client demo:
 * - buyer@sahal.com / buyer123  (user, 500 credits)
 * - vendor@sahal.com / vendor123 (approved vendor)
 * - admin@sahal.com / admin123   (admin, if missing)
 */
require('dotenv').config()
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const walletModel = require('../models/walletModel')
const { syncUserWallet } = require('../utils/walletSync')

const MONGODB_URI = process.env.MONGODB_URI

const accounts = [
  {
    name: 'Demo Buyer',
    email: 'buyer@sahal.com',
    password: 'buyer123',
    role: 'user',
    credits: 500,
  },
  {
    name: 'Demo Vendor',
    email: 'vendor@sahal.com',
    password: 'vendor123',
    role: 'vendor',
    vendorStatus: 'approved',
    businessName: 'Sahal Demo Shop',
    businessAddress: 'Riyadh, SA',
    credits: 0,
  },
  {
    name: 'Admin User',
    email: 'admin@sahal.com',
    password: 'admin123',
    role: 'admin',
    credits: 0,
  },
]

async function upsertAccount(spec) {
  const email = spec.email.toLowerCase()
  let user = await userModel.findOne({ email })

  if (user) {
    user.name = spec.name
    user.password = spec.password // pre-save hook hashes
    user.role = spec.role
    user.isActive = true
    if (spec.role === 'vendor') {
      user.vendorStatus = spec.vendorStatus || 'approved'
      user.businessName = spec.businessName || user.businessName
      user.businessAddress = spec.businessAddress || user.businessAddress
    }
    await user.save()
    console.log(`  ✓ Updated ${email} (${spec.role})`)
  } else {
    const data = {
      name: spec.name,
      email,
      password: spec.password,
      role: spec.role,
      isActive: true,
    }
    if (spec.role === 'vendor') {
      data.vendorStatus = spec.vendorStatus || 'approved'
      data.businessName = spec.businessName
      data.businessAddress = spec.businessAddress
    }
    user = await userModel.create(data)
    console.log(`  ✓ Created ${email} (${spec.role})`)
  }

  if (spec.credits && spec.credits > 0) {
    await syncUserWallet(user._id)
    const wallet = await walletModel.findOne({ userId: user._id })
    if (wallet) {
      wallet.balance = spec.credits
      await wallet.save()
      user.credits = spec.credits
      await user.save()
      console.log(`    → wallet balance set to ${spec.credits}`)
    }
  }

  return user
}

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB\nSeeding demo accounts...')
  for (const account of accounts) {
    await upsertAccount(account)
  }
  console.log('\nDone.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Buyer:  buyer@sahal.com  / buyer123  (500 credits)')
  console.log('Vendor: vendor@sahal.com / vendor123 (approved)')
  console.log('Admin:  admin@sahal.com  / admin123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
