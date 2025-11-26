# Dummy Data Creation Script

## Overview
This script creates sample/dummy data for testing the admin panel dashboard and all new features without affecting existing data.

## What It Creates

### Banners (3 items)
- Summer Sale 2024 banner
- New Arrivals banner
- Flash Sale promotional banner

### Deals (3 items)
- Weekly Special (20% off)
- Monthly Mega Sale (40% off)
- Flash Deal (50% off)

### Gift Cards (6 items)
- Various denominations: $20, $30, $50, $100
- Mix of active and redeemed status
- Digital and physical types

### Coupons (3 items)
- WELCOME10 (10% off)
- SAVE20 ($20 off)
- SUMMER25 (25% off)

### App Ads (2 items)
- Special Offer ad
- New Collection ad

### Pinned Products
- Pins up to 3 existing products to homepage/featured/trending sections

### Reviews
- Creates reviews for existing products (if available)
- Mix of approved, pending, and flagged reviews
- Various ratings (3-5 stars)

## Usage

```bash
cd backend
npm run create-dummy-data
```

## Requirements

- MongoDB connection configured in `.env`
- At least one admin user exists (for `createdBy` fields)
- Products and categories exist (for relationships in deals, coupons, reviews)

## Notes

- The script checks for existing data to avoid duplicates
- Gift card codes are generated uniquely
- Reviews are only created if products and users exist
- All dates are set relative to current date
- No existing data is modified or deleted

## Safe to Run Multiple Times

The script is designed to be safe to run multiple times:
- Checks for existing gift card codes
- Checks for existing reviews (one per user per product)
- Uses unique identifiers where needed

## Output

The script will display:
- Progress for each data type
- Summary of created items
- Any warnings or skipped items

