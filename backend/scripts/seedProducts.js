const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});
const mongoose = require('mongoose');
const Product = require('../models/productsModel');

const sampleProducts = [
  {
    image: [
      'https://images.unsplash.com/photo-1528701800489-20be3c18f2cc?auto=format&w=800',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&w=800',
    ],
    title: 'Air Light Runner',
    description: 'Breathable knit upper with responsive foam cushioning.',
    price: 129,
    priceBeforeDeal: 169,
    priceOff: 24,
    stars: 4.8,
    numberOfReview: 182,
    ukSide: ['6', '7', '8', '9', '10'],
    tags: ['running', 'men', 'best-seller'],
    status: {
      icon: 'best-seller',
      name: 'Top Rated',
    },
  },
  {
    image: [
      'https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&w=800',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=800',
    ],
    title: 'Aurora Daily Sneaker',
    description: 'Minimal sneaker with premium leather finish for daily wear.',
    price: 99,
    priceBeforeDeal: 129,
    priceOff: 23,
    stars: 4.6,
    numberOfReview: 96,
    ukSide: ['4', '5', '6', '7', '8'],
    tags: ['lifestyle', 'women', 'leather'],
    status: {
      icon: 'new',
      name: 'New Arrival',
    },
  },
  {
    image: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&w=800',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=800',
    ],
    title: 'Summit Trek Pro',
    description: 'Water-resistant boot built for weekend trails and hikes.',
    price: 189,
    priceBeforeDeal: 229,
    priceOff: 17,
    stars: 4.9,
    numberOfReview: 54,
    ukSide: ['7', '8', '9', '10', '11', '12'],
    tags: ['outdoor', 'unisex', 'hiking'],
    status: {
      icon: 'limited',
      name: 'Limited Stock',
    },
  },
];

const seedProducts = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Missing MONGODB_URI in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    await Product.deleteMany({});
    const result = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${result.length} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed products:', error);
    process.exit(1);
  }
};

seedProducts();

