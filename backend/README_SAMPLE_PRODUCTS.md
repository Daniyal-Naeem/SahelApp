# Sample Products Setup

## Overview

Sample products have been created to help developers test and develop the UI faster. The database now contains:

- **4 Sample Products** with complete data
- **3 Categories** (Electronics, Fashion, Sports & Fitness)
- **1 Sample Vendor** user

## Products Created

1. **Premium Running Shoes** - $89.99 (was $129.99)
   - Category: Electronics
   - Status: 🔥 Hot Deal
   - 4.5 stars, 1,247 reviews

2. **Wireless Bluetooth Headphones** - $149.99 (was $199.99)
   - Category: Fashion
   - Status: ⭐ Best Seller
   - 4.8 stars, 2,156 reviews

3. **Smart Watch Pro Series** - $249.99 (was $329.99)
   - Category: Sports & Fitness
   - Status: 🆕 New Arrival
   - 4.7 stars, 3,421 reviews

4. **Leather Crossbody Bag** - $79.99 (was $119.99)
   - Category: Electronics
   - Status: 💎 Premium
   - 4.6 stars, 892 reviews

## Commands

### Create Sample Products

```bash
cd backend
npm run create-sample-products
```

This will:
- Create 3 categories (if they don't exist)
- Create a sample vendor user (if needed)
- Create 4 sample products with images, descriptions, prices, etc.

### View Products via API

```bash
# Get all products
curl http://localhost:4000/api/products/

# Get single product (replace ID)
curl http://localhost:4000/api/products/{productId}
```

## Mobile App Integration

The mobile app fetches products from:
```
http://10.0.2.2:4000/api/products/
```

Products are automatically displayed in:
- HomeTab (horizontal scroll)
- Product details screen
- Category filters

## Product Data Structure

Each product includes:
- **Images**: Array of 3 image URLs
- **Title**: Product name
- **Description**: Detailed product description
- **Price**: Current price
- **Price Before Deal**: Original price
- **Price Off**: Discount percentage
- **Stars**: Rating (0-5)
- **Number of Reviews**: Review count
- **UK Side**: Available sizes/variants
- **Tags**: Product tags for filtering
- **Status**: Icon and name (Hot Deal, Best Seller, etc.)
- **Category**: Linked category with name, description, icon
- **Vendor**: Linked vendor information

## Notes

- Products use Unsplash images (placeholder URLs)
- All products have realistic pricing and descriptions
- Categories are properly linked and populated
- Vendor information is included
- Products are sorted by newest first

## Re-running the Script

The script is safe to run multiple times:
- It checks if categories already exist
- It checks if products already exist (by title)
- It won't create duplicates

To recreate all products, you can manually delete them from the database first, or modify the script to clear existing products.

## Next Steps

1. Start the backend: `cd backend && npm start`
2. Start the mobile app: `cd frontend && npm run android`
3. View products in the app's home screen
4. Test product details, categories, and filters

---

**Happy Developing! 🚀**

