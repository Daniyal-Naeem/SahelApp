const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const productsModel = require('../models/productsModel');
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');

// Sample products data
const sampleProducts = [
  {
    image: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500'
    ],
    title: 'Premium Running Shoes',
    description: 'High-performance running shoes with advanced cushioning technology. Perfect for long-distance running and daily workouts. Features breathable mesh upper and durable rubber outsole.',
    price: 89.99,
    priceBeforeDeal: 129.99,
    priceOff: 30,
    stars: 4.5,
    numberOfReview: 1247,
    ukSide: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    tags: ['running', 'sports', 'athletic', 'shoes'],
    status: {
      icon: '🔥',
      name: 'Hot Deal'
    }
  },
  {
    image: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
    ],
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with active noise cancellation. Enjoy crystal-clear sound quality with 30-hour battery life. Comfortable over-ear design with premium materials.',
    price: 149.99,
    priceBeforeDeal: 199.99,
    priceOff: 25,
    stars: 4.8,
    numberOfReview: 2156,
    ukSide: ['Black', 'White', 'Blue'],
    tags: ['electronics', 'audio', 'wireless', 'headphones'],
    status: {
      icon: '⭐',
      name: 'Best Seller'
    }
  },
  {
    image: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
    ],
    title: 'Smart Watch Pro Series',
    description: 'Feature-rich smartwatch with health tracking, GPS, and water resistance. Monitor your heart rate, track workouts, and stay connected with notifications. 5-day battery life.',
    price: 249.99,
    priceBeforeDeal: 329.99,
    priceOff: 24,
    stars: 4.7,
    numberOfReview: 3421,
    ukSide: ['42mm', '44mm', '46mm'],
    tags: ['wearables', 'smartwatch', 'fitness', 'technology'],
    status: {
      icon: '🆕',
      name: 'New Arrival'
    }
  },
  {
    image: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    ],
    title: 'Leather Crossbody Bag',
    description: 'Elegant genuine leather crossbody bag with adjustable strap. Perfect for everyday use with multiple compartments. Handcrafted with attention to detail and premium quality materials.',
    price: 79.99,
    priceBeforeDeal: 119.99,
    priceOff: 33,
    stars: 4.6,
    numberOfReview: 892,
    ukSide: ['Brown', 'Black', 'Tan'],
    tags: ['fashion', 'bags', 'leather', 'accessories'],
    status: {
      icon: '💎',
      name: 'Premium'
    }
  }
];

// Sample categories
const sampleCategories = [
  {
    name: 'Electronics',
    description: 'Latest electronics and gadgets',
    icon: '📱',
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Fashion',
    description: 'Trendy fashion items and accessories',
    icon: '👕',
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Sports & Fitness',
    description: 'Sports equipment and fitness gear',
    icon: '⚽',
    isActive: true,
    displayOrder: 3
  }
];

async function createSampleData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing sample products (optional - comment out if you want to keep existing)
    // await productsModel.deleteMany({ title: { $in: sampleProducts.map(p => p.title) } });
    // console.log('🧹 Cleared existing sample products');

    // Create or get categories
    console.log('\n📦 Creating categories...');
    const categories = [];
    for (const catData of sampleCategories) {
      let category = await categoryModel.findOne({ name: catData.name });
      if (!category) {
        category = await categoryModel.create(catData);
        console.log(`   ✓ Created category: ${catData.name}`);
      } else {
        console.log(`   ✓ Category already exists: ${catData.name}`);
      }
      categories.push(category);
    }

    // Get or create a vendor user
    console.log('\n👤 Checking for vendor user...');
    let vendor = await userModel.findOne({ role: 'vendor' });
    if (!vendor) {
      // Create a sample vendor
      vendor = await userModel.create({
        name: 'Sample Vendor',
        email: 'vendor@sahal.com',
        password: 'vendor123',
        phone: '+1234567890',
        role: 'vendor',
        businessName: 'Sahal Store',
        businessAddress: '123 Main Street, City',
        vendorStatus: 'approved',
        isActive: true
      });
      console.log('   ✓ Created sample vendor user');
    } else {
      console.log('   ✓ Using existing vendor user');
    }

    // Create products
    console.log('\n🛍️  Creating sample products...');
    const createdProducts = [];
    
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      
      // Assign category (cycling through available categories)
      const category = categories[i % categories.length];
      
      // Check if product already exists
      const existingProduct = await productsModel.findOne({ title: productData.title });
      if (existingProduct) {
        console.log(`   ⚠️  Product already exists: ${productData.title}`);
        createdProducts.push(existingProduct);
        continue;
      }

      const product = await productsModel.create({
        ...productData,
        category: category._id,
        vendor: vendor._id
      });

      createdProducts.push(product);
      console.log(`   ✓ Created: ${productData.title} (Category: ${category.name})`);
    }

    console.log('\n✅ Sample data created successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Vendor: ${vendor.name} (${vendor.email})`);
    
    console.log('\n🎉 You can now view these products in the mobile app!');
    console.log('   API Endpoint: http://localhost:4000/api/products/');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

// Run the script
createSampleData();


