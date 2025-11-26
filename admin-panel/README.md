# Sahal Admin Panel

A modern web-based admin panel for managing the Sahal e-commerce platform.

## Features

- ✅ **Admin Dashboard** - Overview statistics and metrics
- ✅ **User Management** - List, activate/deactivate, and delete users
- ✅ **Vendor Management** - List, approve, and reject vendor applications
- ✅ **Secure Authentication** - Admin-only access with JWT tokens
- ✅ **Responsive Design** - Works on desktop and tablet devices

## Setup Instructions

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `admin-panel` directory:

```env
VITE_API_URL=http://localhost:4000/api
```

**Note:** The admin panel connects to your backend API. Make sure your backend is running on port 4000.

### 3. Start Development Server

```bash
npm run dev
```

The admin panel will be available at: `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### First Time Login

1. Make sure you have an admin user in your database:
   - Register a user via `/api/auth/register`
   - Update the user's role to `admin` in MongoDB:
     ```javascript
     db.usermodels.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```

2. Login with admin credentials at `http://localhost:3000/login`

### Features Overview

#### Dashboard
- View total users, vendors, orders, products, and revenue
- Real-time statistics from your backend

#### User Management
- Search users by name or email
- Filter by role (user, vendor, admin)
- Filter by status (active/inactive)
- Activate/deactivate users
- Delete users

#### Vendor Management
- Search vendors by name, email, or business name
- Filter by approval status (pending, approved, rejected)
- Approve vendor applications
- Reject vendors with reason

## Security

- All routes are protected and require admin authentication
- JWT tokens are stored in localStorage
- Automatic token validation and logout on expiration
- Only users with `role: 'admin'` can access the panel

## Tech Stack

- **React 18** - UI framework
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

## API Endpoints Used

- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/vendors` - Get all vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `PUT /api/admin/vendors/:id/reject` - Reject vendor

## Troubleshooting

### Cannot connect to backend
- Make sure your backend server is running on port 4000
- Check `VITE_API_URL` in `.env` file
- Verify CORS is enabled in your backend

### Login fails
- Verify the user exists and has `role: 'admin'`
- Check backend logs for errors
- Ensure JWT_SECRET is set in backend `.env`

### Token expired
- Simply log in again
- Tokens expire after 7 days (configurable in backend)

## Support

For issues or questions, refer to the main backend API documentation.


