# Backend API Server

A comprehensive backend API for the Sahal e-commerce application built with Node.js, Express, and MongoDB.

## Features

- ✅ User Authentication (Users, Vendors, Admins)
- ✅ Role-based Access Control
- ✅ Product & Category Management
- ✅ Order Management System
- ✅ Notification System
- ✅ Credit System
- ✅ Admin Panel APIs

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` and set your values:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sahal
JWT_SECRET=your-secret-key-change-in-production
```

**Important:**
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Generate a strong `JWT_SECRET` for production (use: `openssl rand -base64 32`)

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:4000`

### 4. Seed Products (Optional)

```bash
npm run seed
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API endpoint documentation.

## Project Structure

```
backend/
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Authentication & authorization
├── scripts/         # Utility scripts
├── index.js         # Entry point
└── .env            # Environment variables (create this)
```

## Default Admin User

To create an admin user:

1. Register a user via `/api/auth/register`
2. In MongoDB, update the user document:
   ```javascript
   db.usermodels.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Testing

Use Postman, Insomnia, or curl to test the APIs. See `API_DOCUMENTATION.md` for endpoint details.

## Notes

- All passwords are automatically hashed using bcrypt
- JWT tokens expire after 7 days
- All timestamps are automatically managed (createdAt, updatedAt)
- The server uses CORS for cross-origin requests


