# Deployment Guide - Backend to Dev Server & Mobile App Integration

This guide will help you deploy your backend to a development server and integrate it with your mobile app.

## Table of Contents
1. [Backend Deployment Options](#backend-deployment-options)
2. [Deploying Backend to Dev Server](#deploying-backend-to-dev-server)
3. [Updating Mobile App API Configuration](#updating-mobile-app-api-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Environment Variables Setup](#environment-variables-setup)

---

## Backend Deployment Options

### Recommended Dev Deployment Platforms:

1. **Render** (Free tier available)
   - Easy setup, automatic HTTPS
   - URL: `https://your-app.onrender.com`

2. **Railway** (Free tier available)
   - Simple deployment, good for Node.js
   - URL: `https://your-app.railway.app`

3. **Heroku** (Paid, but has free alternatives)
   - Well-established platform
   - URL: `https://your-app.herokuapp.com`

4. **DigitalOcean App Platform** (Paid)
   - Good performance
   - URL: `https://your-app.ondigitalocean.app`

5. **AWS EC2 / Lightsail** (Paid)
   - Full control, scalable
   - Custom domain/IP

6. **Vercel / Netlify** (Free tier)
   - Good for serverless, but may need adjustments

**For this guide, we'll use Render as an example (it's free and easy).**

---

## Deploying Backend to Dev Server

### Step 1: Prepare Backend for Deployment

#### 1.1 Update package.json for production
The backend already has a start script, but we need to ensure it works in production:

```json
"scripts": {
  "start": "node index.js",  // Production (no nodemon)
  "dev": "nodemon index.js",  // Development
  ...
}
```

#### 1.2 Create/Update .env file for production
You'll need these environment variables on your dev server:
- `PORT` - Server port (usually provided by platform)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (if not already set)

#### 1.3 Ensure CORS allows your mobile app
The backend already has `app.use(cors())` which allows all origins. For production, you may want to restrict this.

---

### Step 2: Deploy to Render (Example)

#### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up for free account
3. Connect your GitHub repository

#### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your repository
3. Select the repository and branch (`dev_daniyal`)

#### 2.3 Configure Service
- **Name**: `sahal-backend-dev` (or your preferred name)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 2.4 Set Environment Variables
In Render dashboard, go to "Environment" tab and add:
```
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

#### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes first time)
3. Your backend will be available at: `https://sahal-backend-dev.onrender.com`

#### 2.6 Test Your Backend
Open in browser or use curl:
```bash
curl https://sahal-backend-dev.onrender.com/api/products/
```

---

### Step 3: Alternative - Deploy to Railway

#### 3.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

#### 3.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

#### 3.3 Configure
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 3.4 Set Environment Variables
Add in Railway dashboard:
- `PORT` (auto-set by Railway)
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=development`

#### 3.5 Get Your URL
Railway will provide a URL like: `https://your-app.up.railway.app`

---

## Updating Mobile App API Configuration

### Step 1: Update api.ts (Main API Service)

The mobile app uses two API service files. Update both:

#### File: `frontend/src/services/api.ts`

Update the BASE_URL:

```typescript
const BASE_URL = __DEV__ 
  ? 'https://your-backend-dev-url.onrender.com/api' // Your dev server URL
  : 'https://your-production-url.com/api'; // Production (for later)
```

**Example:**
```typescript
const BASE_URL = __DEV__ 
  ? 'https://sahal-backend-dev.onrender.com/api'
  : 'https://sahal-backend-prod.onrender.com/api';
```

#### File: `frontend/src/services/axios.ts`

Update the getBaseURL function:

```typescript
const getBaseURL = (): string => {
  return __DEV__
    ? 'https://your-backend-dev-url.onrender.com/api'
    : 'https://your-production-url.com/api';
};
```

---

### Step 2: Handle HTTPS/SSL

Since dev servers use HTTPS, ensure:
1. Your backend CORS allows HTTPS origins
2. Mobile app can make HTTPS requests (React Native supports this by default)

---

### Step 3: Update for Physical Device Testing

If testing on a physical device, the device must be able to reach the internet. The dev server URL will work from anywhere.

**For local testing (if needed):**
- Android Emulator: `http://10.0.2.2:4000/api` (for localhost)
- iOS Simulator: `http://localhost:4000/api` (for localhost)
- Physical Device: Use your computer's local IP or the dev server URL

---

## Testing the Integration

### Step 1: Verify Backend is Running

```bash
# Test products endpoint
curl https://your-backend-dev-url.onrender.com/api/products/

# Test categories endpoint
curl https://your-backend-dev-url.onrender.com/api/categories/
```

### Step 2: Test from Mobile App

1. **Start Metro Bundler:**
   ```bash
   cd frontend
   npm start
   ```

2. **Run Android App:**
   ```bash
   npm run android
   ```

3. **Check Console Logs:**
   - Look for API calls in Metro bundler console
   - Check for any network errors
   - Verify data is loading from server

### Step 3: Verify Data Flow

1. Open the app on emulator/device
2. Navigate to Home screen
3. Check if categories and products load from server
4. Open a product detail page
5. Verify all data comes from API

---

## Environment Variables Setup

### Backend (.env file)

Create a `.env` file in the `backend` folder (for local development):

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sahal
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sahal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

**For Dev Server (Render/Railway/etc):**
Set these in the platform's environment variables section (not in .env file).

### Mobile App

Currently, the mobile app uses hardcoded URLs. For better management, you could:

1. **Create a config file** (optional):
   ```typescript
   // frontend/src/config/api.ts
   export const API_CONFIG = {
     DEV: 'https://your-backend-dev-url.onrender.com/api',
     PROD: 'https://your-production-url.com/api',
   };
   ```

2. **Use environment variables** (requires react-native-config):
   ```bash
   npm install react-native-config
   ```

---

## Quick Deployment Checklist

### Backend Deployment
- [ ] Update package.json start script
- [ ] Set up MongoDB (local or Atlas)
- [ ] Deploy to dev server (Render/Railway/etc)
- [ ] Set environment variables on server
- [ ] Test backend endpoints
- [ ] Verify CORS is working

### Mobile App Integration
- [ ] Update `frontend/src/services/api.ts` BASE_URL
- [ ] Update `frontend/src/services/axios.ts` getBaseURL
- [ ] Test on Android emulator
- [ ] Test on physical device (if needed)
- [ ] Verify all API calls work
- [ ] Check error handling

---

## Troubleshooting

### Backend Issues

**"Cannot connect to MongoDB"**
- Check MONGODB_URI is correct
- Ensure MongoDB Atlas allows connections from Render/Railway IPs (0.0.0.0/0 for dev)

**"CORS error"**
- Backend has `app.use(cors())` which should allow all origins
- If issues persist, check CORS configuration

**"Port already in use"**
- Render/Railway sets PORT automatically, don't hardcode it

### Mobile App Issues

**"Network request failed"**
- Check BASE_URL is correct (HTTPS, not HTTP for deployed servers)
- Verify backend is running and accessible
- Check device/emulator has internet connection

**"CORS error"**
- Should not happen with deployed backend (CORS is configured)
- If it does, check backend CORS settings

**"SSL/TLS error"**
- Ensure you're using HTTPS for deployed servers
- React Native should handle SSL automatically

---

## Next Steps

1. **Deploy backend to dev server** (follow Step 2 above)
2. **Update mobile app API URLs** (follow Step 1 in "Updating Mobile App")
3. **Test integration** (follow Step 3 in "Testing")
4. **Monitor and debug** any issues
5. **Deploy to production** when ready (same process, different environment)

---

## Support

If you encounter issues:
1. Check backend logs in Render/Railway dashboard
2. Check Metro bundler console for errors
3. Use browser/Postman to test backend endpoints directly
4. Verify environment variables are set correctly






