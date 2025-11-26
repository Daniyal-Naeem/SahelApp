# API Integration Guide

## Overview
The mobile app has been integrated with the backend API for products and categories. The app now fetches real data from the backend instead of using dummy data.

## API Service

### Location
`frontend/src/services/api.ts`

### Base URL Configuration
- **Android Emulator**: Uses `http://10.0.2.2:4000/api` (10.0.2.2 is the special IP to access host machine from Android emulator)
- **iOS Simulator**: Can use `http://localhost:4000/api`
- **Physical Device**: Use your computer's local IP address (e.g., `http://192.168.1.100:4000/api`)

### API Functions

#### Products
- `api.getProducts()` - Fetches all products
- `api.getProductById(id)` - Fetches a single product by ID

#### Categories
- `api.getCategories()` - Fetches all categories
- `api.getCategoryById(id)` - Fetches a single category by ID

## Integration Points

### 1. HomeTab (`frontend/src/tabs/HomeTab.tsx`)
- **Products**: Fetches products from API on component mount
- **Categories**: Fetches categories from API on component mount
- **Loading States**: Shows loading indicator while fetching
- **Error Handling**: Falls back to dummy data if API fails
- **Fallback**: Uses dummy data if API returns empty or fails

### 2. ProductsDetailsScreen (`frontend/src/screens/ProductsDetailsScreen.tsx`)
- **Product Details**: Fetches product details by ID if `productId` is provided
- **Similar Products**: Fetches similar products from the same category
- **Loading States**: Shows loading screen while fetching
- **Error Handling**: Shows error message if product not found
- **Navigation**: Can navigate with either `itemDetails` (existing) or `productId` (new)

### 3. ProductItem Component (`frontend/src/components/ProductItem.tsx`)
- **Navigation**: Now passes both `itemDetails` and `productId` when navigating to product details

## Data Mapping

The API service automatically maps backend product format to frontend `ProductTypes` format:

### Backend → Frontend Mapping
- `_id` → `_id`
- `title` → `title`
- `description` → `description`
- `image` (array) → `image` (array)
- `price` → `price`
- `priceBeforeDeal` → `priceBeforeDeal`
- `priceOff` → `priceOff` (converted to string if number)
- `stars` → `stars`
- `numberOfReview` → `numberOfReview`
- `category` (populated) → `category`
- `vendor` (populated) → `vendor`

## Backend API Endpoints

### Products
- `GET /api/products/` - Get all products
- `GET /api/products/:id` - Get single product

### Categories
- `GET /api/categories/` - Get all categories
- `GET /api/categories/:id` - Get single category

## Testing

### Prerequisites
1. Backend server must be running on port 4000
2. Backend must have products and categories in database
3. CORS must be enabled on backend (already configured)

### Steps
1. Start backend server: `cd backend && npm start`
2. Ensure backend is accessible from mobile app
3. Run mobile app: `npm run android` or `npm run ios`
4. Check console logs for API calls and errors

### Troubleshooting

#### "Network request failed"
- **Android Emulator**: Ensure using `10.0.2.2` instead of `localhost`
- **Physical Device**: Use computer's local IP address
- **Backend**: Ensure backend is running and accessible

#### "No products found"
- Check backend database has products
- Verify API endpoint is correct
- Check backend logs for errors

#### "CORS error"
- Backend already has CORS enabled
- If issues persist, check backend `index.js` for CORS configuration

## Configuration

### Update Base URL
Edit `frontend/src/services/api.ts`:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://YOUR_IP:4000/api' // Update with your IP
  : 'https://your-production-url.com/api';
```

### For Physical Device Testing
1. Find your computer's IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
2. Update BASE_URL with your IP
3. Ensure phone and computer are on same network

## Notes

- The app gracefully falls back to dummy data if API fails
- All API calls are wrapped in try-catch for error handling
- Loading states are shown during API calls
- Product images must be valid URLs (backend returns image URLs)
- Categories must have `name` and `image` or `icon` fields

## Future Enhancements

- Add authentication headers for protected endpoints
- Add pagination for products list
- Add search and filter functionality
- Add caching for better performance
- Add offline support with local storage

