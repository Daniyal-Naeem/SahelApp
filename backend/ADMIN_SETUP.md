# How to Create Admin Credentials

There are **3 methods** to create an admin user. Choose the one that works best for you.

---

## Method 1: Using Script (Easiest - Recommended) ⭐

### Step 1: Run the create admin script

```bash
cd backend
npm run create-admin
```

This will create an admin with default credentials:
- **Email:** `admin@sahal.com`
- **Password:** `admin123`
- **Name:** `Admin User`

### Step 2: Use custom credentials

```bash
npm run create-admin <email> <password> <name>
```

**Example:**
```bash
npm run create-admin admin@example.com MySecurePass123 "Admin Name"
```

### What it does:
- ✅ Checks if admin already exists
- ✅ Creates new admin user or updates existing user
- ✅ Hashes password securely
- ✅ Sets role to 'admin'
- ✅ Shows you the credentials

---

## Method 2: Using API (Register then Update)

### Step 1: Register a user via API

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "your-secure-password",
    "role": "user"
  }'
```

### Step 2: Update role to admin in MongoDB

**Option A: Using MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `usermodels` collection
4. Find the user by email
5. Edit the document and change `role` from `"user"` to `"admin"`
6. Save

**Option B: Using MongoDB Shell (mongosh)**
```bash
mongosh
use sahal  # or your database name
db.usermodels.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Option C: Using MongoDB Atlas (Cloud)**
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Find your database → `usermodels` collection
4. Find the user document
5. Click "Edit Document"
6. Change `role` to `"admin"`
7. Click "Update"

---

## Method 3: Direct MongoDB Insert (Advanced)

### Using MongoDB Shell

```bash
mongosh
use sahal  # or your database name
```

Then run this JavaScript in mongosh:

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = 'your-secure-password';
const hashedPassword = await bcrypt.hash(password, saltRounds);

db.usermodels.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: hashedPassword,
  role: "admin",
  isActive: true,
  credits: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** This method requires bcrypt to be available in MongoDB shell, which might not work. Use Method 1 or 2 instead.

---

## Verify Admin User

After creating admin credentials, verify it works:

### Test Login via API:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

You should receive a token and user object with `"role": "admin"`.

### Test in Admin Panel:
1. Start admin panel: `cd admin-panel && npm run dev`
2. Go to: `http://localhost:3000/login`
3. Login with your admin credentials
4. You should see the dashboard

---

## Quick Start (Recommended)

**Fastest way to get started:**

```bash
# 1. Go to backend directory
cd backend

# 2. Create admin (default credentials)
npm run create-admin

# 3. Or create with custom credentials
npm run create-admin admin@mysite.com SecurePass123 "My Admin"
```

**Default credentials created:**
- Email: `admin@sahal.com`
- Password: `admin123`

**⚠️ Important:** Change the default password after first login!

---

## Troubleshooting

### "Admin user already exists"
- The email is already registered
- Either use a different email or update the existing user's role to 'admin'

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env` file
- Verify connection string is correct

### "Password hashing error"
- Make sure `bcrypt` is installed: `npm install bcrypt`
- Check Node.js version compatibility

### "Role is not admin after creation"
- Verify the script completed successfully
- Check MongoDB document directly
- Re-run the script or manually update in MongoDB

---

## Security Best Practices

1. ✅ **Use strong passwords** (minimum 12 characters, mix of letters, numbers, symbols)
2. ✅ **Change default password** immediately after first login
3. ✅ **Use unique email** for admin account
4. ✅ **Don't share admin credentials** publicly
5. ✅ **Use environment variables** for production admin creation
6. ✅ **Enable 2FA** if possible (future enhancement)

---

## Need Help?

- Check backend logs for errors
- Verify MongoDB connection
- Ensure all dependencies are installed: `npm install`
- Check `.env` file has correct `MONGODB_URI`


