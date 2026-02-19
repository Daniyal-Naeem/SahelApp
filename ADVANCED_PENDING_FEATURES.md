# Advanced Pending Features - Mobile App

## 🔴 HIGH PRIORITY (Critical for MVP)

### 1. Credit Wallet System Integration
**Status:** Backend ✅ | Mobile App ❌  
**Effort:** 3-4 days

**Features:**
- Credit balance display (Profile/VIP Club screen)
- Credit top-up flow (amount selection, payment gateway, status tracking)
- Credit transfer (to other users by email/phone/userId, transfer history, limits)
- Credit usage in checkout (apply credits, partial/full payment, mixed payment)
- Credit transaction history (list, filter by type/date, details)

**APIs Available:**
- `GET /api/v1/credits/balance`
- `GET /api/v1/credits/transactions`
- `POST /api/v1/credits/topup`
- `POST /api/v1/credits/transfer`
- `POST /api/v1/checkout/apply-credit`
- `POST /api/v1/checkout/complete`

---

### 2. Payment Gateway Integration
**Status:** Backend ⚠️ (Mock) | Mobile App ❌  
**Effort:** 3-5 days

**Features:**
- Real payment gateway (Stripe, PayPal, etc.)
- Payment method selection
- Payment processing & confirmation
- Payment failure handling
- Webhook handling (signature verification, status updates)

**Current:** Mock implementation exists, needs real gateway integration

---

## 🟡 MEDIUM PRIORITY (Important Features)

### 3. Banner & Homepage Content Integration
**Status:** Backend ✅ | Mobile App ❌  
**Effort:** 2-3 days

**Features:**
- Banner display (slider, promotional, click tracking)
- Pinned products (featured products on homepage)
- Deals integration (weekly/monthly/daily/flash/under-price, countdown timers)
- App ads display (in appropriate screens, click tracking)

**APIs Available:**
- `GET /api/banners`
- `GET /api/pinned-products`
- `GET /api/deals`
- `GET /api/app-ads`

---

### 4. Gift Card Integration
**Status:** Backend ✅ | Mobile App ⚠️ (UI only)  
**Effort:** 2 days

**Features:**
- Gift card redemption (code input, validate, redeem, add credits)
- Gift card display (assigned cards, details, status filter)
- Gift card purchase (20/30/50/100 denominations, send to user)

**APIs Available:**
- `GET /api/gift-cards`
- `GET /api/gift-cards/:code`
- `POST /api/gift-cards/:code/redeem`

**Current:** GiftScreen.tsx exists but uses dummy data

---

### 5. Coupon Integration
**Status:** Backend ✅ | Mobile App ❌  
**Effort:** 1-2 days

**Features:**
- Coupon code input in checkout
- Coupon validation & application
- Discount display
- Handle restrictions (category, product, vendor)
- Available coupons list (optional)

**APIs Available:**
- `GET /api/coupons`
- `GET /api/coupons/:code`
- `POST /api/coupons/validate`
- `POST /api/coupons/:code/apply`

**Current:** No coupon input in checkout flow

---

### 6. Review System Integration
**Status:** Backend ✅ | Mobile App ⚠️ (View only)  
**Effort:** 2-3 days

**Features:**
- Submit product review (rating, title, comment, images)
- Review display enhancement (fetch from API, show only approved)
- Review moderation (view own reviews, edit, delete)
- Review helpful votes
- Review reporting

**APIs Available:**
- `GET /api/reviews`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `POST /api/reviews/:id/report`

**Current:** ReviewsScreen.tsx exists but may not be fully integrated

---

### 7. Notification System Integration
**Status:** Backend ✅ | Mobile App ⚠️ (Partial)  
**Effort:** 2-3 days

**Features:**
- Push notifications (Firebase/OneSignal integration)
- Push notification registration & delivery
- In-app notifications (fetch from API, mark as read)
- Notification filtering (type, read/unread)
- Real-time notification updates

**APIs Available:**
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

**Current:** NotificationsScreen.tsx exists but may not be fully integrated

---

### 8. Order Tracking & Status Updates
**Status:** Backend ✅ | Mobile App ⚠️ (Partial)  
**Effort:** 1-2 days

**Features:**
- Real-time order status updates
- Order status timeline
- Tracking number display
- Delivery status updates
- Order cancellation
- Refund processing
- Credit refund on cancellation

**APIs Available:**
- `PUT /api/orders/:id/status`
- `PUT /api/orders/:id/cancel`
- `GET /api/orders/:id`

**Current:** OrdersScreen.tsx and OrderDetailsScreen.tsx exist but need enhancement

---

## 🟢 LOW PRIORITY (Nice to Have)

### 9. VIP Club Integration
**Status:** Backend ❓ (May need support) | Mobile App ⚠️ (UI only)  
**Effort:** 2-3 days

**Features:**
- VIP Club membership management
- Join VIP Club functionality
- VIP membership status display
- VIP benefits display
- VIP-only discounts/products
- Backend API (if needed)

**Current:** VIPClubScreen.tsx exists but is static content only

---

### 10. Support/Chat System Integration
**Status:** Backend ✅ | Mobile App ⚠️ (Partial)  
**Effort:** 2-3 days

**Features:**
- Chat/conversation display (fetch from API, display messages)
- Send messages
- File/image attachments
- Mark messages as read
- Support ticket management (create, view status, reply)

**APIs Available:**
- `GET /api/support/conversations`
- `POST /api/support/conversations`
- `POST /api/support/conversations/:id/messages`
- `POST /api/support/conversations/:id/upload`

**Current:** SupportScreen.tsx exists, supportService.ts exists but may not be fully integrated

---

## 📊 Summary

### By Priority
- **High Priority:** 2 features (7-9 days total)
- **Medium Priority:** 6 features (12-16 days total)
- **Low Priority:** 2 features (4-6 days total)

### By Status
- **Backend Ready:** 8 features
- **Backend Mock:** 1 feature (Payment Gateway)
- **Backend Unknown:** 1 feature (VIP Club)

### Total Estimated Effort
**23-31 days** of development work

---

## 🎯 Recommended Implementation Order

### Phase 1: MVP (Critical)
1. Payment Gateway Integration
2. Credit Wallet System (Balance, Top-up, Checkout Usage)
3. Coupon Integration

### Phase 2: Enhanced UX
4. Banner & Homepage Content
5. Review System (Submit & Display)
6. Order Tracking Enhancements

### Phase 3: Additional Features
7. Gift Card Integration
8. Notification System Enhancement
9. Support/Chat System
10. VIP Club Integration

---

## 📝 Notes

- All backend APIs are **production-ready** and tested
- Mobile app needs to integrate with existing backend APIs
- Most features have UI screens but lack API integration
- Guest mode is well implemented; most advanced features require authentication
- Estimated effort assumes full-time development work

---

**Last Updated:** Based on project scope review  
**Total Pending Features:** 10 advanced features

