require('dotenv').config()
const mongoose = require('mongoose')
const bannerModel = require('../models/bannerModel')
const dealModel = require('../models/dealModel')
const giftCardModel = require('../models/giftCardModel')
const couponModel = require('../models/couponModel')
const reviewModel = require('../models/reviewModel')
const appAdModel = require('../models/appAdModel')
const pinnedProductModel = require('../models/pinnedProductModel')
const productsModel = require('../models/productsModel')
const userModel = require('../models/userModel')
const categoryModel = require('../models/categoryModel')
const orderModel = require('../models/orderModel')
const notificationModel = require('../models/notificationModel')
const supportConversationModel = require('../models/supportConversationModel')

const MONGODB_URI = process.env.MONGODB_URI

// Sample data
const sampleBanners = [
  {
    title: 'Summer Sale 2024',
    description: 'Get up to 50% off on all summer collections',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    targetUrl: '/products?category=summer',
    type: 'slider',
    order: 1,
    isActive: true
  },
  {
    title: 'New Arrivals',
    description: 'Check out our latest products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    targetUrl: '/products?new=true',
    type: 'slider',
    order: 2,
    isActive: true
  },
  {
    title: 'Flash Sale',
    description: 'Limited time offer - 24 hours only',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    targetUrl: '/deals/flash',
    type: 'promotional',
    order: 3,
    isActive: true
  }
]

const sampleDeals = [
  {
    title: 'Weekly Special',
    description: '20% off on all electronics',
    type: 'weekly',
    discount: 20,
    minPurchase: 50,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    title: 'Monthly Mega Sale',
    description: 'Up to 40% off on selected items',
    type: 'monthly',
    discount: 40,
    maxDiscount: 200,
    minPurchase: 100,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: 'Flash Deal',
    description: 'Limited time - 50% off',
    type: 'flash',
    discount: 50,
    minPurchase: 75,
    maxUses: 100,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  {
    title: 'Under SAR 20',
    description: 'Great deals under SAR 20',
    type: 'under_price',
    discount: 0, // Not applicable for under_price
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
]

const sampleGiftCards = [
  { amount: 20, currency: 'USD', type: 'digital', status: 'active' },
  { amount: 30, currency: 'USD', type: 'digital', status: 'active' },
  { amount: 50, currency: 'USD', type: 'digital', status: 'active' },
  { amount: 100, currency: 'USD', type: 'digital', status: 'active' },
  { amount: 50, currency: 'USD', type: 'digital', status: 'redeemed' },
  { amount: 20, currency: 'USD', type: 'physical', status: 'active' }
]

const sampleCoupons = [
  {
    code: 'WELCOME10',
    name: 'Welcome Discount',
    description: '10% off for new customers',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 25,
    maxUses: 1000,
    maxUsesPerUser: 1,
    isActive: true,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  },
  {
    code: 'SAVE20',
    name: 'Save $20',
    description: 'Get $20 off on orders over $100',
    discountType: 'fixed',
    discountValue: 20,
    minPurchase: 100,
    maxUses: 500,
    isActive: true,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
  },
  {
    code: 'SUMMER25',
    name: 'Summer Sale',
    description: '25% off on summer collection',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscount: 50,
    minPurchase: 50,
    isActive: true,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
]

const sampleAppAds = [
  {
    title: 'Special Offer',
    description: 'Check out our special offers',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    targetUrl: '/offers',
    position: 'homepage',
    order: 1,
    isActive: true
  },
  {
    title: 'New Collection',
    description: 'Explore our new collection',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    targetUrl: '/products/new',
    position: 'product_detail',
    order: 1,
    isActive: true
  }
]

async function createDummyData() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get admin user for createdBy fields
    const admin = await userModel.findOne({ role: 'admin' })
    const adminId = admin ? admin._id : null

    // Get some products and categories for relationships
    const products = await productsModel.find().limit(5)
    const categories = await categoryModel.find().limit(3)

    console.log('\n=== Creating Dummy Data ===\n')

    // Create Banners
    console.log('Creating banners...')
    const banners = await bannerModel.insertMany(
      sampleBanners.map(banner => ({
        ...banner,
        createdBy: adminId
      }))
    )
    console.log(`✓ Created ${banners.length} banners`)

    // Create Deals
    console.log('Creating deals...')
    const deals = await dealModel.insertMany(
      sampleDeals.map(deal => ({
        ...deal,
        createdBy: adminId,
        categories: categories.length > 0 ? [categories[0]._id] : []
      }))
    )
    console.log(`✓ Created ${deals.length} deals`)

    // Create Gift Cards
    console.log('Creating gift cards...')
    const giftCards = []
    for (const card of sampleGiftCards) {
      let code
      let attempts = 0
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      
      // Generate unique code
      do {
        code = 'GC-'
        for (let i = 0; i < 3; i++) {
          let segment = ''
          for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          code += segment + (i < 2 ? '-' : '')
        }
        attempts++
        if (attempts > 10) {
          // Fallback to timestamp-based code
          code = 'GC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
          break
        }
      } while (await giftCardModel.findOne({ code }))
      
      giftCards.push({
        ...card,
        code,
        createdBy: adminId
      })
    }
    const createdGiftCards = await giftCardModel.insertMany(giftCards)
    console.log(`✓ Created ${createdGiftCards.length} gift cards`)

    // Create Coupons
    console.log('Creating coupons...')
    const createdCoupons = await couponModel.insertMany(
      sampleCoupons.map(coupon => ({
        ...coupon,
        createdBy: adminId,
        applicableCategories: categories.length > 0 ? [categories[0]._id] : []
      }))
    )
    console.log(`✓ Created ${createdCoupons.length} coupons`)

    // Create App Ads
    console.log('Creating app ads...')
    const appAds = await appAdModel.insertMany(
      sampleAppAds.map(ad => ({
        ...ad,
        createdBy: adminId
      }))
    )
    console.log(`✓ Created ${appAds.length} app ads`)

    // Create Pinned Products
    console.log('Creating pinned products...')
    if (products.length > 0) {
      const pinnedProducts = []
      for (let i = 0; i < Math.min(3, products.length); i++) {
        pinnedProducts.push({
          product: products[i]._id,
          section: i === 0 ? 'homepage' : i === 1 ? 'featured' : 'trending',
          order: i,
          isActive: true,
          pinnedBy: adminId
        })
      }
      await pinnedProductModel.insertMany(pinnedProducts)
      console.log(`✓ Created ${pinnedProducts.length} pinned products`)
    }

    // Create Reviews (if we have products and users)
    console.log('Creating reviews...')
    const users = await userModel.find({ role: 'user' }).limit(5)
    if (products.length > 0 && users.length > 0) {
      const reviews = []
      const ratings = [5, 4, 5, 3, 4, 5, 4, 5]
      const comments = [
        'Great product! Highly recommended.',
        'Good quality, fast shipping.',
        'Excellent value for money.',
        'Could be better, but acceptable.',
        'Amazing product, will buy again!',
        'Very satisfied with my purchase.',
        'Good product overall.',
        'Perfect! Exceeded my expectations.'
      ]

      for (let i = 0; i < Math.min(8, products.length * users.length); i++) {
        const product = products[i % products.length]
        const user = users[i % users.length]
        
        // Check if review already exists
        const existing = await reviewModel.findOne({ product: product._id, user: user._id })
        if (!existing) {
          reviews.push({
            product: product._id,
            user: user._id,
            rating: ratings[i % ratings.length],
            title: `Review ${i + 1}`,
            comment: comments[i % comments.length],
            status: i < 5 ? 'approved' : i < 7 ? 'pending' : 'flagged',
            flagged: i >= 7,
            flaggedReason: i >= 7 ? 'Inappropriate content' : undefined,
            verifiedPurchase: i % 2 === 0
          })
        }
      }
      if (reviews.length > 0) {
        await reviewModel.insertMany(reviews)
        console.log(`✓ Created ${reviews.length} reviews`)
      }
    }

    // Create Sample Orders
    console.log('Creating sample orders...')
    if (products.length > 0 && users.length > 0) {
      const orders = []
      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
      const paymentStatuses = ['pending', 'paid', 'failed']
      const paymentMethods = ['credit', 'card', 'cash']

      for (let i = 0; i < Math.min(10, users.length * 2); i++) {
        const user = users[i % users.length]
        const numItems = Math.floor(Math.random() * 3) + 1 // 1-3 items
        const orderItems = []
        let subtotal = 0

        // Select random products
        const selectedProducts = []
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)]
          if (!selectedProducts.find(p => p._id.toString() === product._id.toString())) {
            selectedProducts.push(product)
          }
        }

        // Create order items
        for (const product of selectedProducts) {
          const quantity = Math.floor(Math.random() * 3) + 1
          const price = product.price || 10
          const total = price * quantity
          subtotal += total

          orderItems.push({
            product: product._id,
            quantity,
            price,
            total
          })
        }

        const shippingCost = 10
        const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0 // 10% discount sometimes
        const creditUsed = Math.random() > 0.5 ? Math.min(20, subtotal * 0.2) : 0 // Sometimes use credits
        const total = subtotal + shippingCost - discount - creditUsed

        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const paymentStatus = status === 'delivered' ? 'paid' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]

        orders.push({
          user: user._id,
          items: orderItems,
          subtotal,
          shippingCost,
          discount,
          creditUsed,
          total,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          paymentStatus,
          status,
          shippingAddress: {
            street: `${Math.floor(Math.random() * 9999)} Main St`,
            city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
            state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
            country: 'USA',
            phone: user.phone || '555-0100'
          },
          notes: Math.random() > 0.7 ? 'Please handle with care' : '',
          shippedAt: status === 'shipped' || status === 'delivered' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
          deliveredAt: status === 'delivered' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : undefined,
          trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Date.now()}${Math.floor(Math.random() * 1000)}` : undefined
        })
      }

      if (orders.length > 0) {
        await orderModel.insertMany(orders)
        console.log(`✓ Created ${orders.length} sample orders`)
      }
    }

    // Create Notifications (if we have users)
    console.log('Creating notifications...')
    if (users.length > 0) {
      const notifications = []
      const notificationTemplates = [
        {
          title: 'New Product Available',
          message: 'Check out our latest collection of summer dresses',
          type: 'promotion',
          priority: 'medium'
        },
        {
          title: 'Order Shipped',
          message: 'Your order has been shipped and will arrive soon',
          type: 'order',
          priority: 'high'
        },
        {
          title: 'Special Offer',
          message: 'Get 30% off on all beauty products this weekend',
          type: 'promotion',
          priority: 'medium'
        },
        {
          title: 'Welcome Bonus',
          message: 'You have received a welcome bonus of 100 credits',
          type: 'system',
          priority: 'low'
        },
        {
          title: 'Order Delivered',
          message: 'Your order has been delivered successfully',
          type: 'order',
          priority: 'high'
        },
        {
          title: 'Payment Received',
          message: 'Your payment has been processed successfully',
          type: 'payment',
          priority: 'high'
        }
      ]

      // Create notifications for each user
      for (const user of users) {
        const numNotifications = Math.floor(Math.random() * 4) + 2 // 2-5 notifications per user
        for (let i = 0; i < numNotifications; i++) {
          const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]
          const isRead = Math.random() > 0.4 // 60% chance of being unread
          const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
          
          notifications.push({
            user: user._id,
            title: template.title,
            message: template.message,
            type: template.type,
            priority: template.priority,
            isRead: isRead,
            readAt: isRead ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
            createdAt: createdAt
          })
        }
      }

      if (notifications.length > 0) {
        await notificationModel.insertMany(notifications)
        console.log(`✓ Created ${notifications.length} notifications`)
      }
    }

    // Create VIP Memberships (if we have users)
    console.log('Creating VIP memberships...')
    if (users.length > 0) {
      const tiers = ['bronze', 'silver', 'gold', 'platinum']
      let vipCount = 0

      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        // 60% chance of being a VIP member
        if (Math.random() > 0.4) {
          const tier = tiers[Math.min(Math.floor(i / 2), tiers.length - 1)] // Distribute tiers
          const points = tier === 'bronze' ? Math.floor(Math.random() * 2000) :
                        tier === 'silver' ? Math.floor(Math.random() * 3000) + 2000 :
                        tier === 'gold' ? Math.floor(Math.random() * 5000) + 5000 :
                        Math.floor(Math.random() * 5000) + 10000

          const joinedAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random time in last year
          const expiresAt = new Date(joinedAt)
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)

          user.vipMembership = {
            isMember: true,
            joinedAt: joinedAt,
            expiresAt: expiresAt,
            tier: tier,
            points: points
          }

          await user.save()
          vipCount++
        }
      }

      console.log(`✓ Created ${vipCount} VIP memberships`)
    }

    // Create Support Conversations (if we have users)
    console.log('Creating support conversations...')
    if (users.length > 0) {
      const supportMessages = [
        'I have an issue with my recent order',
        'My package was not delivered',
        'I need help with a refund',
        'Product quality issue',
        'Payment problem',
        'Shipping delay',
      ]
      let conversationCount = 0

      // Create 1-2 conversations per user (30% chance)
      for (const user of users) {
        if (Math.random() > 0.7) {
          const numConversations = Math.floor(Math.random() * 2) + 1
          
          for (let i = 0; i < numConversations; i++) {
            const status = Math.random() > 0.7 ? 'closed' : 'open'
            const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
            
            const initialMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)]
            
            const conversation = await supportConversationModel.create({
              user: user._id,
              subject: `Support Request - ${initialMessage.substring(0, 30)}`,
              status: status,
              messages: [{
                sender: 'user',
                text: initialMessage,
                isRead: true,
                readAt: createdAt,
                createdAt: createdAt
              }],
              lastMessageAt: createdAt,
              unreadCount: 0,
              createdAt: createdAt
            })

            // Add a support response for some conversations
            if (Math.random() > 0.5) {
              const responseTime = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
              conversation.messages.push({
                sender: 'support',
                text: 'Thank you for contacting us. We are looking into your issue and will get back to you soon.',
                isRead: status === 'closed',
                readAt: status === 'closed' ? responseTime : undefined,
                createdAt: responseTime
              })
              conversation.lastMessageAt = responseTime
              conversation.unreadCount = status === 'open' ? 1 : 0
              await conversation.save()
            }

            conversationCount++
          }
        }
      }

      console.log(`✓ Created ${conversationCount} support conversations`)
    }

    console.log('\n=== Dummy Data Creation Complete ===\n')
    console.log('Summary:')
    console.log(`- Banners: ${banners.length}`)
    console.log(`- Deals: ${deals.length}`)
    console.log(`- Gift Cards: ${createdGiftCards.length}`)
    console.log(`- Coupons: ${createdCoupons.length}`)
    console.log(`- App Ads: ${appAds.length}`)
    console.log(`- Pinned Products: ${products.length > 0 ? Math.min(3, products.length) : 0}`)
    console.log(`- Reviews: ${products.length > 0 && users.length > 0 ? 'Created' : 'Skipped (need products and users)'}`)
    console.log(`- Orders: ${products.length > 0 && users.length > 0 ? 'Created' : 'Skipped (need products and users)'}`)
    console.log(`- Notifications: ${users.length > 0 ? 'Created' : 'Skipped (need users)'}`)
    console.log(`- VIP Memberships: ${users.length > 0 ? 'Created' : 'Skipped (need users)'}`)
    console.log(`- Support Conversations: ${users.length > 0 ? 'Created' : 'Skipped (need users)'}`)

    process.exit(0)
  } catch (error) {
    console.error('Error creating dummy data:', error)
    process.exit(1)
  }
}

createDummyData()

