require('dotenv').config()
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

const MONGODB_URI = process.env.MONGODB_URI

// Get admin email and new password from command line
const args = process.argv.slice(2)
const email = args[0] || 'admin@sahal.com'
const newPassword = args[1] || 'admin123'

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find the user
    const user = await userModel.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.log('❌ User not found!')
      console.log(`   Email: ${email}`)
      console.log('\n💡 Create admin first: npm run create-admin')
      await mongoose.disconnect()
      process.exit(1)
    }

    // Update password - bypass pre-save hook by using findByIdAndUpdate
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    
    // Update user directly to bypass pre-save hook
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      role: 'admin',
      isActive: true
    })
    
    // Reload user to get updated data
    const updatedUser = await userModel.findById(user._id)

    console.log('✅ Admin password reset successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   Email:', updatedUser.email)
    console.log('   New Password:', newPassword)
    console.log('   Name:', updatedUser.name)
    console.log('   Role:', updatedUser.role)
    console.log('   Status:', updatedUser.isActive ? 'Active' : 'Inactive')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Save these credentials securely!')
    console.log('\nYou can now login to the admin panel at:')
    console.log('   http://localhost:3000/login')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting password:', error.message)
    process.exit(1)
  }
}

resetAdminPassword()

