# Credit Wallet System Integration Plan - Mobile App

**Status:** Ready for Implementation  
**Estimated Total Time:** 3-4 days  
**Priority:** HIGH (Critical for MVP)

---

## 📋 Overview

This plan outlines the step-by-step integration of the Credit Wallet System APIs into the mobile app. The backend APIs are fully implemented and ready. This integration will enable users to:
- View credit balance
- Top up credits
- Transfer credits to other users
- Use credits during checkout
- View transaction history

---

## 🎯 Integration Phases

### **Phase 1: Credit Service & Balance Display** (Day 1 - Morning)
**Estimated Time:** 4-6 hours

#### Step 1.1: Create Credit Service
**File:** `frontend/src/services/creditService.ts`

**APIs to Integrate:**
- `GET /api/credits/balance` - Get user credit balance
- `GET /api/credits/transactions` - Get transaction history

**Implementation:**
```typescript
// Interfaces
export interface CreditBalance {
  credits: number;
  balance: number;
  currency: string;
  user: {
    name: string;
    email: string;
  };
}

export interface CreditTransaction {
  _id: string;
  txId: string;
  type: 'topup' | 'transfer' | 'consume' | 'refund' | 'adjust';
  amount: number;
  balanceAfter: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  // ... other fields
}

// Functions
export const getCreditBalance = async (): Promise<CreditBalance>
export const getCreditTransactions = async (filters?: {
  type?: string;
  status?: string;
  limit?: number;
  page?: number;
}): Promise<CreditTransaction[]>
```

**Files to Create:**
- ✅ `frontend/src/services/creditService.ts`

---

#### Step 1.2: Display Credit Balance in VIP Club Screen
**File:** `frontend/src/screens/VIPClubScreen.tsx`

**Changes:**
- Import `getCreditBalance` from `creditService`
- Add state for `creditBalance`
- Fetch balance on screen load
- Display balance prominently in the VIP Club screen
- Show balance in header or dedicated section

**UI Updates:**
- Add credit balance card/section
- Display currency and amount
- Add "Top Up Credits" button linking to top-up screen

**Files to Modify:**
- ✅ `frontend/src/screens/VIPClubScreen.tsx`

---

#### Step 1.3: Display Credit Balance in Profile Screen
**File:** `frontend/src/screens/ProfileScreen.tsx` (if exists)

**Changes:**
- Add credit balance display in profile
- Show balance with currency
- Add quick action buttons (Top Up, Transfer, History)

**Files to Modify:**
- ✅ `frontend/src/screens/ProfileScreen.tsx` (if exists)

---

### **Phase 2: Credit Top-up Flow** (Day 1 - Afternoon)
**Estimated Time:** 4-6 hours

#### Step 2.1: Create Credit Top-up Service Functions
**File:** `frontend/src/services/creditService.ts`

**APIs to Integrate:**
- `POST /api/v1/credits/topup` - Initiate top-up
- `GET /api/v1/credits/topup/:paymentIntentId` - Get top-up status

**Implementation:**
```typescript
export interface TopupRequest {
  amount: number;
  paymentMethod?: string;
  idempotencyKey?: string;
}

export interface TopupResponse {
  paymentIntentId: string;
  transaction: {
    txId: string;
    status: string;
    amount: number;
  };
}

export const initiateTopup = async (request: TopupRequest): Promise<TopupResponse>
export const getTopupStatus = async (paymentIntentId: string): Promise<TopupResponse>
```

**Files to Modify:**
- ✅ `frontend/src/services/creditService.ts`

---

#### Step 2.2: Create Credit Top-up Screen
**File:** `frontend/src/screens/CreditTopupScreen.tsx`

**Features:**
- Amount selection (preset amounts: 50, 100, 200, 500, 1000, custom)
- Minimum: 10, Maximum: 10,000
- Payment method selection (integrate with PaymentScreen)
- Top-up button
- Status tracking (pending, processing, completed, failed)
- Success/error handling
- Navigation back to VIP Club or Profile after success

**UI Components:**
- Amount selector (preset buttons + custom input)
- Payment method selector
- "Top Up" button
- Loading state
- Success modal
- Error handling

**Files to Create:**
- ✅ `frontend/src/screens/CreditTopupScreen.tsx`

---

#### Step 2.3: Add Route for Top-up Screen
**File:** `frontend/App.tsx`

**Changes:**
- Add `CreditTopup` route to `RouteStackParamList`
- Add Stack.Screen for CreditTopupScreen
- Update navigation from VIP Club and Profile screens

**Files to Modify:**
- ✅ `frontend/App.tsx`
- ✅ `frontend/src/screens/VIPClubScreen.tsx` (add navigation)
- ✅ `frontend/src/screens/ProfileScreen.tsx` (add navigation if exists)

---

### **Phase 3: Credit Transfer Feature** (Day 2 - Morning)
**Estimated Time:** 4-6 hours

#### Step 3.1: Create Credit Transfer Service Functions
**File:** `frontend/src/services/creditService.ts`

**APIs to Integrate:**
- `POST /api/v1/credits/transfer` - Transfer credits
- `GET /api/v1/credits/transfer/limits` - Get transfer limits

**Implementation:**
```typescript
export interface TransferRequest {
  recipientIdentifier: string; // email, phone, or userId
  amount: number;
  message?: string;
}

export interface TransferLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  hourlyLimit: number;
  dailyUsed: number;
  hourlyUsed: number;
}

export const transferCredits = async (request: TransferRequest): Promise<CreditTransaction>
export const getTransferLimits = async (): Promise<TransferLimits>
```

**Files to Modify:**
- ✅ `frontend/src/services/creditService.ts`

---

#### Step 3.2: Create Credit Transfer Screen
**File:** `frontend/src/screens/CreditTransferScreen.tsx`

**Features:**
- Recipient input (email, phone, or userId)
- Amount input with validation
- Optional message field
- Transfer limits display
- Transfer button
- Confirmation dialog before transfer
- Success/error handling
- Show remaining limits after transfer

**UI Components:**
- Recipient input field
- Amount input with validation
- Message input (optional)
- Transfer limits card (min, max, daily, hourly)
- "Transfer Credits" button
- Confirmation modal
- Success/error messages

**Files to Create:**
- ✅ `frontend/src/screens/CreditTransferScreen.tsx`

---

#### Step 3.3: Add Route for Transfer Screen
**File:** `frontend/App.tsx`

**Changes:**
- Add `CreditTransfer` route to `RouteStackParamList`
- Add Stack.Screen for CreditTransferScreen
- Update navigation from VIP Club and Profile screens

**Files to Modify:**
- ✅ `frontend/App.tsx`
- ✅ `frontend/src/screens/VIPClubScreen.tsx` (add navigation)
- ✅ `frontend/src/screens/ProfileScreen.tsx` (add navigation if exists)

---

### **Phase 4: Credit Usage in Checkout** (Day 2 - Afternoon)
**Estimated Time:** 4-6 hours

#### Step 4.1: Create Checkout Credit Service Functions
**File:** `frontend/src/services/creditService.ts`

**APIs to Integrate:**
- `POST /api/v1/checkout/apply-credit` - Reserve credits for order
- `POST /api/v1/checkout/complete` - Complete checkout and consume credits
- `POST /api/v1/checkout/refund-credit` - Refund credits (for order cancellation)

**Implementation:**
```typescript
export interface ApplyCreditRequest {
  orderId?: string;
  creditAmount: number;
  totalAmount: number;
}

export interface ApplyCreditResponse {
  reservation: {
    txId: string;
    creditAmount: number;
    totalAmount: number;
    remainingAmount: number;
    status: string;
  };
  balance: {
    current: number;
    afterReservation: number;
  };
}

export const applyCreditToOrder = async (request: ApplyCreditRequest): Promise<ApplyCreditResponse>
export const completeCheckoutWithCredit = async (orderId: string, reservationTxId: string, paymentMethod: string, paymentStatus: string): Promise<void>
export const refundCreditFromOrder = async (orderId: string): Promise<void>
```

**Files to Modify:**
- ✅ `frontend/src/services/creditService.ts`

---

#### Step 4.2: Integrate Credit Usage in Payment Screen
**File:** `frontend/src/screens/PaymentScreen.tsx`

**Features:**
- Display current credit balance
- Toggle to use credits (checkbox or switch)
- Input field for credit amount (with max = min(balance, orderTotal))
- Display remaining amount after credit
- Apply credit button (calls `applyCreditToOrder`)
- Update order total calculation
- Pass credit info to order completion

**UI Updates:**
- Add credit balance display
- Add "Use Credits" toggle/checkbox
- Add credit amount input (with validation)
- Show breakdown:
  - Order Total: X
  - Credits Applied: -Y
  - Remaining: Z
- Update "Pay" button to show remaining amount

**Flow:**
1. User toggles "Use Credits"
2. User enters credit amount (or selects "Use All")
3. User clicks "Apply Credits"
4. Call `applyCreditToOrder` API
5. Update UI with reservation info
6. On payment completion, call `completeCheckoutWithCredit`

**Files to Modify:**
- ✅ `frontend/src/screens/PaymentScreen.tsx`

---

#### Step 4.3: Integrate Credit Completion in Order Flow
**File:** `frontend/src/screens/PaymentScreen.tsx` or Order creation logic

**Changes:**
- After successful payment, call `completeCheckoutWithCredit`
- Pass `orderId`, `reservationTxId`, `paymentMethod`, `paymentStatus`
- Handle success/error
- Update credit balance display

**Files to Modify:**
- ✅ `frontend/src/screens/PaymentScreen.tsx`
- ✅ Order creation service (if separate)

---

### **Phase 5: Credit Transaction History** (Day 3)
**Estimated Time:** 4-6 hours

#### Step 5.1: Enhance Transaction History Service
**File:** `frontend/src/services/creditService.ts`

**Enhancement:**
- Add filtering options
- Add pagination support
- Add transaction type icons/colors
- Add date formatting helpers

**Implementation:**
```typescript
export interface TransactionFilters {
  type?: 'topup' | 'transfer' | 'consume' | 'refund' | 'adjust';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export const getCreditTransactions = async (filters?: TransactionFilters): Promise<{
  transactions: CreditTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>

export const formatTransactionType = (type: string): string
export const getTransactionIcon = (type: string): string
export const getTransactionColor = (type: string): string
```

**Files to Modify:**
- ✅ `frontend/src/services/creditService.ts`

---

#### Step 5.2: Create Credit History Screen
**File:** `frontend/src/screens/CreditHistoryScreen.tsx`

**Features:**
- List all credit transactions
- Filter by type (topup, transfer, consume, refund, adjust)
- Filter by status (pending, completed, failed)
- Date range filter
- Pagination (load more)
- Transaction details:
  - Type icon and label
  - Amount (+ or -)
  - Description
  - Date/time
  - Status badge
  - Balance after transaction
- Pull-to-refresh
- Empty state

**UI Components:**
- Filter tabs/chips (All, Top-up, Transfer, Consume, Refund)
- Transaction list (FlatList)
- Transaction card component
- Loading state
- Empty state
- Pull-to-refresh

**Files to Create:**
- ✅ `frontend/src/screens/CreditHistoryScreen.tsx`

---

#### Step 5.3: Add Route for History Screen
**File:** `frontend/App.tsx`

**Changes:**
- Add `CreditHistory` route to `RouteStackParamList`
- Add Stack.Screen for CreditHistoryScreen
- Update navigation from VIP Club and Profile screens

**Files to Modify:**
- ✅ `frontend/App.tsx`
- ✅ `frontend/src/screens/VIPClubScreen.tsx` (add navigation)
- ✅ `frontend/src/screens/ProfileScreen.tsx` (add navigation if exists)

---

## 📁 Files Summary

### Files to Create (5):
1. ✅ `frontend/src/services/creditService.ts` - Main credit service
2. ✅ `frontend/src/screens/CreditTopupScreen.tsx` - Top-up screen
3. ✅ `frontend/src/screens/CreditTransferScreen.tsx` - Transfer screen
4. ✅ `frontend/src/screens/CreditHistoryScreen.tsx` - History screen
5. ✅ `CREDIT_WALLET_INTEGRATION_PLAN.md` - This plan document

### Files to Modify (5+):
1. ✅ `frontend/App.tsx` - Add routes
2. ✅ `frontend/src/screens/VIPClubScreen.tsx` - Add balance display & navigation
3. ✅ `frontend/src/screens/PaymentScreen.tsx` - Add credit usage
4. ✅ `frontend/src/screens/ProfileScreen.tsx` - Add balance display & navigation (if exists)
5. ✅ `frontend/src/services/index.ts` - Export credit service (if needed)

---

## 🔄 Integration Flow

### Credit Balance Display Flow:
```
VIP Club Screen / Profile Screen
  ↓
Load Credit Balance (on screen focus)
  ↓
Display Balance
  ↓
Show Top Up / Transfer / History buttons
```

### Top-up Flow:
```
VIP Club / Profile Screen
  ↓
Click "Top Up Credits"
  ↓
Credit Top-up Screen
  ↓
Select Amount → Select Payment Method
  ↓
Click "Top Up"
  ↓
Call initiateTopup API
  ↓
Process Payment (via PaymentScreen or gateway)
  ↓
Poll getTopupStatus (or wait for webhook)
  ↓
Show Success → Update Balance → Navigate Back
```

### Transfer Flow:
```
VIP Club / Profile Screen
  ↓
Click "Transfer Credits"
  ↓
Credit Transfer Screen
  ↓
Enter Recipient → Enter Amount → (Optional) Message
  ↓
Click "Transfer"
  ↓
Confirmation Dialog
  ↓
Call transferCredits API
  ↓
Show Success → Update Balance → Navigate Back
```

### Checkout Credit Flow:
```
Payment Screen
  ↓
Display Credit Balance
  ↓
Toggle "Use Credits"
  ↓
Enter Credit Amount
  ↓
Click "Apply Credits"
  ↓
Call applyCreditToOrder API (reserve credits)
  ↓
Update Order Total (Order Total - Credits = Remaining)
  ↓
Complete Payment (via payment gateway)
  ↓
Call completeCheckoutWithCredit API (consume credits)
  ↓
Order Created → Navigate to Success Screen
```

### Transaction History Flow:
```
VIP Club / Profile Screen
  ↓
Click "Transaction History"
  ↓
Credit History Screen
  ↓
Load Transactions (with filters)
  ↓
Display List
  ↓
Filter by Type/Status/Date
  ↓
Pull to Refresh
```

---

## ✅ Testing Checklist

### Phase 1: Balance Display
- [ ] Credit balance loads correctly
- [ ] Balance displays in VIP Club screen
- [ ] Balance displays in Profile screen (if exists)
- [ ] Balance updates after top-up/transfer/checkout
- [ ] Error handling for API failures

### Phase 2: Top-up
- [ ] Amount validation (min 10, max 10,000)
- [ ] Preset amounts work
- [ ] Custom amount input works
- [ ] Top-up API call succeeds
- [ ] Payment processing works
- [ ] Status polling works
- [ ] Success flow works
- [ ] Error handling works
- [ ] Balance updates after top-up

### Phase 3: Transfer
- [ ] Recipient validation (email/phone/userId)
- [ ] Amount validation (min, max, limits)
- [ ] Transfer limits display correctly
- [ ] Transfer API call succeeds
- [ ] Confirmation dialog works
- [ ] Success flow works
- [ ] Error handling works
- [ ] Balance updates after transfer
- [ ] Recipient receives credits (verify via API)

### Phase 4: Checkout Credit
- [ ] Credit balance displays in Payment screen
- [ ] Toggle "Use Credits" works
- [ ] Credit amount input validation works
- [ ] "Use All" option works
- [ ] Apply credit API call succeeds
- [ ] Order total updates correctly
- [ ] Remaining amount displays correctly
- [ ] Complete checkout with credit works
- [ ] Credits consumed after order completion
- [ ] Balance updates after checkout
- [ ] Mixed payment (credit + gateway) works

### Phase 5: Transaction History
- [ ] Transactions load correctly
- [ ] Filter by type works
- [ ] Filter by status works
- [ ] Date range filter works
- [ ] Pagination works
- [ ] Pull-to-refresh works
- [ ] Transaction details display correctly
- [ ] Empty state displays when no transactions
- [ ] Loading states work

---

## 🐛 Error Handling

### Common Errors to Handle:
1. **Insufficient Credits**
   - Show error message
   - Suggest top-up option

2. **Transfer Limits Exceeded**
   - Show limit details
   - Suggest waiting or reducing amount

3. **API Failures**
   - Show user-friendly error messages
   - Retry mechanism for network errors
   - Log errors for debugging

4. **Invalid Amounts**
   - Validate before API call
   - Show clear error messages

5. **Payment Failures**
   - Handle payment gateway errors
   - Show retry option

---

## 📝 Notes

1. **Idempotency Keys**: Generate unique idempotency keys for top-up requests to prevent duplicate charges.

2. **Status Polling**: For top-up status, implement polling mechanism (every 2-3 seconds) until status is "completed" or "failed".

3. **Balance Caching**: Consider caching credit balance locally and updating on relevant actions to reduce API calls.

4. **Offline Support**: Consider storing pending transactions locally and syncing when online.

5. **Currency**: Ensure currency is displayed correctly (SAR/USD/etc.) based on user settings.

6. **Loading States**: Show loading indicators for all API calls.

7. **Success Feedback**: Use toast notifications for successful operations.

---

## 🚀 Implementation Order

**Recommended Order:**
1. Phase 1: Service & Balance Display (Foundation)
2. Phase 2: Top-up Flow (Most requested feature)
3. Phase 4: Checkout Credit (Critical for MVP)
4. Phase 3: Transfer Feature (Nice to have)
5. Phase 5: Transaction History (Complete the feature set)

**Alternative Order (if checkout is priority):**
1. Phase 1: Service & Balance Display
2. Phase 4: Checkout Credit (Critical)
3. Phase 2: Top-up Flow
4. Phase 3: Transfer Feature
5. Phase 5: Transaction History

---

## 📊 Progress Tracking

- [ ] Phase 1: Credit Service & Balance Display
- [ ] Phase 2: Credit Top-up Flow
- [ ] Phase 3: Credit Transfer Feature
- [ ] Phase 4: Credit Usage in Checkout
- [ ] Phase 5: Credit Transaction History

---

**Status:** Ready for Approval  
**Next Step:** Wait for user approval, then start Phase 1

