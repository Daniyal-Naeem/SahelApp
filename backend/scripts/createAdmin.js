require('dotenv').config()
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

const MONGODB_URI = process.env.MONGODB_URI

// Get admin credentials from command line arguments or use defaults
const args = process.argv.slice(2)
const email = args[0] || 'admin@sahal.com'
const password = args[1] || 'admin123'
const name = args[2] || 'Admin User'

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('❌ Admin user already exists with this email!')
        console.log(`   Email: ${email}`)
        console.log(`   Name: ${existingAdmin.name}`)
        process.exit(1)
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin'
        // Update password if provided
        if (password && password !== 'admin123') {
          const salt = await bcrypt.genSalt(10)
          existingAdmin.password = await bcrypt.hash(password, salt)
        }
        await existingAdmin.save()
        console.log('✅ Existing user updated to admin!')
        console.log(`   Email: ${email}`)
        console.log(`   Name: ${existingAdmin.name}`)
        console.log(`   Role: ${existingAdmin.role}`)
        await mongoose.disconnect()
        process.exit(0)
      }
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      isActive: true
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   Email:', admin.email)
    console.log('   Password:', password)
    console.log('   Name:', admin.name)
    console.log('   Role:', admin.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Save these credentials securely!')
    console.log('\nYou can now login to the admin panel at:')
    console.log('   http://localhost:3000/login')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()


