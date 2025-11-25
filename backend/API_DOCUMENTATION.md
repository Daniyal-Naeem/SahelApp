# Backend API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## 1. Authentication APIs (`/api/auth/`)

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "user" // optional: "user" | "vendor" | "admin"
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Get Current User
- **GET** `/api/auth/me`
- **Auth:** Required

### Update Profile
- **PUT** `/api/auth/profile/:id`
- **Auth:** Required

---

## 2. Product APIs (`/api/products/`)

### Get All Products
- **GET** `/api/products/`
- **Public:** Yes

### Get Single Product
- **GET** `/api/products/:id`
- **Public:** Yes

### Create Product
- **POST** `/api/products/`
- **Auth:** Required

### Update Product
- **PUT** `/api/products/:id`
- **Auth:** Required

### Delete Product
- **DELETE** `/api/products/:id`
- **Auth:** Required

---

## 3. Category APIs (`/api/categories/`)

### Get All Categories
- **GET** `/api/categories/`
- **Public:** Yes

### Get Single Category
- **GET** `/api/categories/:id`
- **Public:** Yes

### Create Category
- **POST** `/api/categories/`
- **Auth:** Required (Admin/Vendor)

### Update Category
- **PUT** `/api/categories/:id`
- **Auth:** Required (Admin/Vendor)

### Delete Category
- **DELETE** `/api/categories/:id`
- **Auth:** Required (Admin only)

---

## 4. Order APIs (`/api/orders/`)

### Create Order
- **POST** `/api/orders/`
- **Auth:** Required
- **Body:**
  ```json
  {
    "items": [
      {
        "productId": "product_id_here",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "zipCode": "12345",
      "country": "Country",
      "phone": "1234567890"
    },
    "paymentMethod": "credit",
    "notes": "Optional notes"
  }
  ```

### Get User's Orders
- **GET** `/api/orders/my-orders`
- **Auth:** Required
- **Query:** `?status=pending`

### Get All Orders (Admin/Vendor)
- **GET** `/api/orders/all`
- **Auth:** Required (Admin/Vendor)
- **Query:** `?status=pending&paymentStatus=paid`

### Get Single Order
- **GET** `/api/orders/:id`
- **Auth:** Required

### Update Order Status
- **PUT** `/api/orders/:id/status`
- **Auth:** Required (Admin/Vendor)
- **Body:**
  ```json
  {
    "status": "shipped",
    "trackingNumber": "TRACK123",
    "notes": "Shipped via DHL"
  }
  ```

### Cancel Order
- **PUT** `/api/orders/:id/cancel`
- **Auth:** Required

---

## 5. Notification APIs (`/api/notifications/`)

### Get User Notifications
- **GET** `/api/notifications/`
- **Auth:** Required
- **Query:** `?isRead=false&type=order&limit=50`

### Get Unread Count
- **GET** `/api/notifications/unread-count`
- **Auth:** Required

### Mark as Read
- **PUT** `/api/notifications/:id/read`
- **Auth:** Required

### Mark All as Read
- **PUT** `/api/notifications/read-all`
- **Auth:** Required

### Delete Notification
- **DELETE** `/api/notifications/:id`
- **Auth:** Required

---

## 6. Credit APIs (`/api/credits/`)

### Get Credit Balance
- **GET** `/api/credits/balance`
- **Auth:** Required

### Get Credit Transactions
- **GET** `/api/credits/transactions`
- **Auth:** Required
- **Query:** `?type=earned&limit=50`

### Admin: Add Credits
- **POST** `/api/credits/admin/add`
- **Auth:** Required (Admin only)
- **Body:**
  ```json
  {
    "userId": "user_id_here",
    "amount": 100,
    "description": "Bonus credits"
  }
  ```

### Admin: Deduct Credits
- **POST** `/api/credits/admin/deduct`
- **Auth:** Required (Admin only)
- **Body:**
  ```json
  {
    "userId": "user_id_here",
    "amount": 50,
    "description": "Order payment"
  }
  ```

---

## 7. Admin Panel APIs (`/api/admin/`)

### Dashboard Stats
- **GET** `/api/admin/dashboard/stats`
- **Auth:** Required (Admin only)

### Get All Users
- **GET** `/api/admin/users`
- **Auth:** Required (Admin only)
- **Query:** `?role=user&isActive=true&search=john&page=1&limit=20`

### Get User by ID
- **GET** `/api/admin/users/:id`
- **Auth:** Required (Admin only)

### Update User Status
- **PUT** `/api/admin/users/:id/status`
- **Auth:** Required (Admin only)
- **Body:**
  ```json
  {
    "isActive": false
  }
  ```

### Delete User
- **DELETE** `/api/admin/users/:id`
- **Auth:** Required (Admin only)

### Get All Vendors
- **GET** `/api/admin/vendors`
- **Auth:** Required (Admin only)
- **Query:** `?vendorStatus=pending&search=business&page=1&limit=20`

### Approve Vendor
- **PUT** `/api/admin/vendors/:id/approve`
- **Auth:** Required (Admin only)

### Reject Vendor
- **PUT** `/api/admin/vendors/:id/reject`
- **Auth:** Required (Admin only)
- **Body:**
  ```json
  {
    "reason": "Business information incomplete"
  }
  ```

---

## User Roles

1. **user** - Regular customer
2. **vendor** - Product seller (requires approval)
3. **admin** - System administrator

## Vendor Status

1. **pending** - Awaiting admin approval
2. **approved** - Vendor approved and active
3. **rejected** - Vendor application rejected

## Order Status

- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed
- `processing` - Order being processed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

## Payment Status

- `pending` - Payment pending
- `paid` - Payment completed
- `failed` - Payment failed
- `refunded` - Payment refunded

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_change_in_production
```

---

## Notes

- All timestamps are automatically added (createdAt, updatedAt)
- Passwords are automatically hashed using bcrypt
- JWT tokens expire after 7 days
- All IDs are MongoDB ObjectIds
- Pagination is available for list endpoints (page, limit)
- Search functionality available for user/vendor management

