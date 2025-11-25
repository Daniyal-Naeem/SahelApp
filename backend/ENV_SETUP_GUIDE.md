# Environment Variables Setup Guide

This guide will help you set up all required environment variables for the backend.

---

## Required Environment Variables

1. **PORT** - Server port number
2. **MONGODB_URI** - MongoDB database connection string
3. **JWT_SECRET** - Secret key for JWT token signing

---

## 1. PORT (Easiest One!)

**What it is:** The port number where your backend server will run.

**How to get it:**
- Just choose any available port (commonly 4000, 3000, 5000, 8000)
- Make sure no other application is using that port

**Example:**
```env
PORT=4000
```

**To check if port is available:**
```bash
# On Mac/Linux
lsof -i :4000

# If nothing shows up, the port is free!
```

---

## 2. MONGODB_URI (Database Connection)

You have **two options**: Local MongoDB or MongoDB Atlas (Cloud)

### Option A: Local MongoDB (For Development)

**Step 1: Install MongoDB**
- **Mac (using Homebrew):**
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```

- **Windows:**
  - Download from: https://www.mongodb.com/try/download/community
  - Install and start MongoDB service

- **Linux:**
  ```bash
  sudo apt-get install mongodb
  sudo systemctl start mongodb
  ```

**Step 2: Get Connection String**
- Default local connection: `mongodb://localhost:27017/sahal`
- Replace `sahal` with your preferred database name

**Example:**
```env
MONGODB_URI=mongodb://localhost:27017/sahal
```

**To verify MongoDB is running:**
```bash
mongosh
# or
mongo
```

---

### Option B: MongoDB Atlas (Cloud - Recommended for Production)

**Step 1: Create Free Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free (no credit card needed for free tier)

**Step 2: Create a Cluster**
1. Click "Build a Database"
2. Choose "FREE" (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Click "Create"

**Step 3: Create Database User**
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

**Step 4: Whitelist Your IP**
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **Warning:** Only for development! For production, add specific IPs.
4. Click "Confirm"

**Step 5: Get Connection String**
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Add database name at the end: `...mongodb.net/sahal?retryWrites=true&w=majority`

**Example:**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/sahal?retryWrites=true&w=majority
```

**Important:** 
- Replace `myuser` with your actual username
- Replace `mypassword` with your actual password (URL-encode special characters)
- Replace `cluster0.abc123` with your actual cluster name
- Replace `sahal` with your preferred database name

---

## 3. JWT_SECRET (Security Key)

**What it is:** A secret key used to sign and verify JWT tokens. Must be kept secret!

**How to generate:**

### Method 1: Using OpenSSL (Recommended)
```bash
openssl rand -base64 32
```

**Example output:**
```
Xk8pL2mN9qR5tV7wY3zA6bC4dE1fG8hI0jK2lM5nO7pQ9rS3tU6vW1xY4zA=
```

### Method 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method 3: Online Generator
- Go to: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" - copy a 32+ character string

### Method 4: Manual (Not Recommended)
- Create a long random string (at least 32 characters)
- Mix letters, numbers, and symbols

**Example:**
```env
JWT_SECRET=Xk8pL2mN9qR5tV7wY3zA6bC4dE1fG8hI0jK2lM5nO7pQ9rS3tU6vW1xY4zA=
```

**Important:**
- ⚠️ **Never share this secret publicly**
- ⚠️ **Use different secrets for development and production**
- ⚠️ **Keep it long and random (minimum 32 characters)**

---

## Complete .env File Example

Create a file named `.env` in your `backend/` directory:

```env
# Server Configuration
PORT=4000

# MongoDB Connection (Local)
MONGODB_URI=mongodb://localhost:27017/sahal

# OR MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority

# JWT Secret Key (Generate using: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters-long
```

---

## Quick Setup Steps

1. **Generate JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Choose MongoDB:**
   - **Local:** Install MongoDB → Use `mongodb://localhost:27017/sahal`
   - **Atlas:** Create free account → Get connection string

3. **Create .env file:**
   ```bash
   cd backend
   cp .env.example .env
   # Then edit .env with your values
   ```

4. **Test connection:**
   ```bash
   npm start
   ```

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: Authentication failed"**
- Check username and password in connection string
- Make sure database user exists in MongoDB Atlas

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**
- Check if MongoDB is running (local)
- Check IP whitelist (Atlas)
- Verify connection string format

**Error: "MongoNetworkError: getaddrinfo ENOTFOUND"**
- Check internet connection (Atlas)
- Verify cluster name in connection string

### JWT Issues

**Error: "Invalid token"**
- Make sure JWT_SECRET is set
- Use the same secret for signing and verifying
- Check token expiration (default: 7 days)

### Port Issues

**Error: "Port 4000 is already in use"**
- Change PORT in .env to another number (e.g., 4001, 5000)
- Or stop the application using that port

---

## Security Best Practices

1. ✅ **Never commit .env to Git** (already in .gitignore)
2. ✅ **Use different secrets for dev/production**
3. ✅ **Use strong, random JWT_SECRET**
4. ✅ **Restrict MongoDB Atlas IP access in production**
5. ✅ **Use environment-specific .env files** (.env.development, .env.production)

---

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- MongoDB Local Setup: https://docs.mongodb.com/manual/installation/
- JWT Info: https://jwt.io/

