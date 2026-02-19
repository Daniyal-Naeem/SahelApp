# Mobile App API Integration List

**Last Updated:** Current Date  
**Status:** Complete list of all APIs integrated in the mobile app

---

## 📊 Summary

**Total API Endpoints Integrated:** 60+  
**Service Files:** 14  
**Categories:** 10

---

## 🔐 Authentication APIs (`authService.ts`)

### User Authentication
- ✅ `POST /api/auth/login` - User login (email/username + password)
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/apple` - Apple Sign-In
- ✅ `POST /api/auth/google` - Google Sign-In
- ✅ `POST /api/auth/facebook` - Facebook Sign-In
- ✅ `POST /api/auth/forgot-password` - Send OTP for password reset
- ✅ `POST /api/auth/verify-otp` - Verify OTP code
- ✅ `POST /api/auth/reset-password` - Reset password with OTP
- ✅ `GET /api/auth/me` - Get current user profile
- ✅ `PUT /api/auth/profile/:userId` - Update user profile
- ✅ `logout()` - Local logout (clear token and user data)

**Status:** ✅ Fully Integrated

---

## 🛍️ Product APIs (`productService.ts`)

### Product Management
- ✅ `GET /api/products` - Get all products (with filters: page, limit, category, vendor, minPrice, maxPrice, sortBy, sortOrder, search)
- ✅ `GET /api/products/search?q=...` - Search products
- ✅ `GET /api/products/:productId` - Get single product by ID
- ✅ `getProductsByCategory(categoryId)` - Get products by category
- ✅ `getProductsByVendor(vendorId)` - Get products by vendor

**Status:** ✅ Fully Integrated  
**Access:** Public (Guest mode supported)

---

## 🛒 Cart APIs (`cartService.ts`)

### Cart Management
- ✅ `POST /api/cart/add` - Add item to cart (authenticated)
- ✅ `GET /api/cart` - Get user's cart (authenticated)
- ✅ `GET /api/cart/count` - Get cart item count (authenticated)
- ✅ `PUT /api/cart/update/:itemId` - Update cart item quantity (authenticated)
- ✅ `DELETE /api/cart/remove/:itemId` - Remove item from cart (authenticated)
- ✅ `DELETE /api/cart/clear` - Clear cart (authenticated)
- ✅ `syncCartToBackend()` - Sync local cart to backend after login
- ✅ `addToCartGuest()` - Add to local cart (guest mode)
- ✅ `getCartGuest()` - Get local cart (guest mode)
- ✅ `updateCartItemGuest()` - Update local cart item (guest mode)
- ✅ `removeFromCartGuest()` - Remove from local cart (guest mode)

**Status:** ✅ Fully Integrated  
**Access:** Guest mode + Authenticated  
**Features:** Local storage for guests, backend sync on login

---

## ❤️ Wishlist APIs (`wishlistService.ts`)

### Wishlist Management
- ✅ `GET /api/wishlist` - Get user's wishlist
- ✅ `POST /api/wishlist/add` - Add product to wishlist
- ✅ `DELETE /api/wishlist/remove/:productId` - Remove product from wishlist
- ✅ `POST /api/wishlist/toggle` - Toggle wishlist (add/remove)
- ✅ `GET /api/wishlist/check/:productId` - Check if product is in wishlist

**Status:** ✅ Fully Integrated  
**Access:** Authenticated only

---

## 📦 Order APIs (`orderService.ts`)

### Order Management
- ✅ `POST /api/orders` - Create new order
- ✅ `GET /api/orders/my-orders` - Get user's orders
- ✅ `GET /api/orders/:orderId` - Get single order by ID
- ✅ `PUT /api/orders/:orderId/status` - Update order status (admin/vendor)
- ✅ `PUT /api/orders/:orderId/cancel` - Cancel order
- ✅ `getOrdersByStatus(status)` - Get orders filtered by status

**Status:** ✅ Fully Integrated  
**Access:** Authenticated  
**Features:** Order tracking, status updates, cancellation

---

## 🎨 Banner APIs (`bannerService.ts`)

### Banner Management
- ✅ `GET /api/banners` - Get all active banners
- ✅ `GET /api/banners/:bannerId` - Get banner by ID
- ✅ `POST /api/banners/:bannerId/click` - Track banner click

**Status:** ✅ Fully Integrated  
**Access:** Public  
**Features:** Click tracking, dynamic homepage content

---

## 🎯 Deal APIs (`dealService.ts`)

### Deal Management
- ✅ `GET /api/deals` - Get all active deals
- ✅ `GET /api/deals/:dealId` - Get deal by ID
- ✅ `getTimeRemaining(endDate)` - Calculate deal countdown timer

**Status:** ✅ Fully Integrated  
**Access:** Public  
**Features:** Weekly/monthly/daily/flash/under-price deals, countdown timers

---

## 📌 Pinned Product APIs (`pinnedProductService.ts`)

### Pinned Product Management
- ✅ `GET /api/pinned-products` - Get all pinned products
- ✅ `GET /api/pinned-products?section=...` - Get pinned products by section
- ✅ `getPinnedProductsBySection(section)` - Get products for specific section

**Status:** ✅ Fully Integrated  
**Access:** Public  
**Features:** Featured/trending/homepage sections

---

## 🎁 Gift Card APIs (`giftCardService.ts`)

### Gift Card Management
- ✅ `GET /api/gift-cards` - Get user's gift cards
- ✅ `GET /api/gift-cards/:code` - Get gift card by code
- ✅ `POST /api/gift-cards/:code/redeem` - Redeem gift card
- ✅ `formatGiftCardStatus(status)` - Format status for display
- ✅ `formatExpiryDate(expiresAt)` - Format expiry date

**Status:** ✅ Fully Integrated  
**Access:** Authenticated (view), Public (redeem by code)

---

## 🎫 Coupon APIs (`couponService.ts`)

### Coupon Management
- ✅ `GET /api/coupons` - Get all active coupons
- ✅ `GET /api/coupons/:code` - Get coupon by code
- ✅ `POST /api/coupons/validate` - Validate coupon for order
- ✅ `POST /api/coupons/:code/apply` - Apply coupon to order

**Status:** ✅ Fully Integrated  
**Access:** Public (view), Authenticated (validate/apply)  
**Features:** Coupon validation, discount calculation, restrictions handling

---

## ⭐ Review APIs (`reviewService.ts`)

### Review Management
- ✅ `GET /api/reviews` - Get reviews (with filters: productId, userId, status, page, limit)
- ✅ `GET /api/reviews/:reviewId` - Get single review by ID
- ✅ `POST /api/reviews` - Create review
- ✅ `PUT /api/reviews/:reviewId` - Update review
- ✅ `DELETE /api/reviews/:reviewId` - Delete review
- ✅ `POST /api/reviews/:reviewId/report` - Report review
- ✅ `getMyReviews()` - Get user's own reviews

**Status:** ✅ Fully Integrated  
**Access:** Public (view approved), Authenticated (create/update/delete own)

---

## 🔔 Notification APIs (`notificationService.ts`)

### Notification Management
- ✅ `GET /api/notifications` - Get user notifications (with filters: isRead, type, limit)
- ✅ `GET /api/notifications/unread-count` - Get unread notification count
- ✅ `PUT /api/notifications/:notificationId/read` - Mark notification as read
- ✅ `PUT /api/notifications/read-all` - Mark all notifications as read
- ✅ `DELETE /api/notifications/:notificationId` - Delete notification
- ✅ `formatNotificationTime(createdAt)` - Format time for display

**Status:** ✅ Fully Integrated  
**Access:** Authenticated  
**Features:** Filtering, read/unread status, time formatting

---

## 👑 VIP Club APIs (`vipService.ts`)

### VIP Membership Management
- ✅ `GET /api/vip/status` - Get user's VIP status
- ✅ `POST /api/vip/join` - Join VIP Club
- ✅ `POST /api/vip/points` - Add VIP points (system)
- ✅ `getTierInfo(tier)` - Get tier information (bronze/silver/gold/platinum)
- ✅ `formatMembershipExpiry(expiresAt)` - Format expiry date
- ✅ `getDaysUntilExpiry(expiresAt)` - Calculate days until expiry

**Status:** ✅ Fully Integrated  
**Access:** Authenticated  
**Features:** Membership tiers, points tracking, benefits display

---

## 💬 Support/Chat APIs (`supportService.ts`)

### Support Conversation Management
- ✅ `GET /api/support/conversations` - Get all user conversations
- ✅ `GET /api/support/conversations/:conversationId` - Get single conversation with messages
- ✅ `POST /api/support/conversations` - Create new conversation (with attachments)
- ✅ `POST /api/support/conversations/:conversationId/messages` - Send message (with attachments)
- ✅ `POST /api/support/conversations/:conversationId/attachments` - Upload attachment
- ✅ `PUT /api/support/conversations/:conversationId/read` - Mark conversation as read

**Status:** ✅ Fully Integrated  
**Access:** Authenticated  
**Features:** File/image attachments, FormData upload, conversation management

---

## ❌ Not Yet Integrated APIs

### Credit Wallet System (HIGH PRIORITY)
- ❌ `GET /api/credits/balance` - Get credit balance
- ❌ `GET /api/credits/transactions` - Get transaction history
- ❌ `POST /api/v1/credits/topup` - Initiate credit top-up
- ❌ `GET /api/v1/credits/topup/:paymentIntentId` - Get top-up status
- ❌ `POST /api/v1/credits/transfer` - Transfer credits
- ❌ `GET /api/v1/credits/transfer/limits` - Get transfer limits
- ❌ `POST /api/v1/checkout/apply-credit` - Reserve credits for order
- ❌ `POST /api/v1/checkout/complete` - Complete checkout with credits
- ❌ `POST /api/v1/checkout/refund-credit` - Refund credits

**Status:** ❌ Not Integrated  
**Priority:** HIGH (Critical for MVP)

---

## 📊 Integration Statistics

### By Category

| Category | Endpoints | Status |
|----------|-----------|--------|
| Authentication | 11 | ✅ Complete |
| Products | 5 | ✅ Complete |
| Cart | 10 | ✅ Complete |
| Wishlist | 5 | ✅ Complete |
| Orders | 6 | ✅ Complete |
| Banners | 3 | ✅ Complete |
| Deals | 2 | ✅ Complete |
| Pinned Products | 2 | ✅ Complete |
| Gift Cards | 3 | ✅ Complete |
| Coupons | 4 | ✅ Complete |
| Reviews | 7 | ✅ Complete |
| Notifications | 5 | ✅ Complete |
| VIP Club | 3 | ✅ Complete |
| Support/Chat | 6 | ✅ Complete |
| **Credit Wallet** | **9** | ❌ **Not Integrated** |
| **TOTAL** | **75** | **66 Integrated** |

### By Access Level

| Access Level | Endpoints | Percentage |
|--------------|-----------|------------|
| Public (Guest Mode) | 15 | 20% |
| Authenticated | 51 | 68% |
| Not Integrated | 9 | 12% |

### By Feature Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Fully Integrated | 66 | 88% |
| ❌ Not Integrated | 9 | 12% |

---

## 🔄 API Integration Flow

### Guest Mode Flow
```
Guest User
  ↓
Browse Products (Public APIs)
  ↓
Add to Cart (Local Storage)
  ↓
View Cart (Local Storage)
  ↓
Login/Register Required
  ↓
Sync Cart to Backend
  ↓
Authenticated User Flow
```

### Authenticated Flow
```
Authenticated User
  ↓
All Public APIs +
  ↓
Cart (Backend)
  ↓
Wishlist
  ↓
Orders
  ↓
Notifications
  ↓
VIP Club
  ↓
Support/Chat
  ↓
Reviews (Create/Update)
  ↓
Gift Cards
  ↓
Coupons (Apply)
```

---

## 📝 Notes

1. **Guest Mode Support:** Cart and product browsing work without authentication using local storage.

2. **Authentication Required:** Most advanced features (wishlist, orders, notifications, VIP, support) require authentication.

3. **Error Handling:** All services include try-catch blocks and error handling.

4. **Loading States:** Services return promises for async operations, allowing UI to show loading states.

5. **TypeScript Types:** All services include TypeScript interfaces for type safety.

6. **API Base URL:** Configured in `frontend/src/services/axios.ts` - currently pointing to production backend.

7. **Token Management:** Authentication tokens are stored in AsyncStorage and automatically included in authenticated requests.

8. **Pending Actions:** Cart and wishlist actions are stored locally for guests and executed after login.

---

## 🎯 Next Steps

### Priority 1: Credit Wallet System Integration
- Create `creditService.ts`
- Integrate credit balance display
- Integrate top-up flow
- Integrate transfer feature
- Integrate credit usage in checkout
- Create transaction history screen

### Priority 2: Payment Gateway Integration
- Replace mock payment with real gateway
- Integrate payment processing
- Add webhook handling

---

**Last Updated:** Current Date  
**Total APIs:** 75  
**Integrated:** 66 (88%)  
**Remaining:** 9 (12%) - Credit Wallet System

