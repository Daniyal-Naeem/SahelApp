# Quick Deployment Steps - Backend to Dev Server

## 🚀 Quick Start Guide

Follow these steps to deploy your backend to a dev server and connect your mobile app.

---

## Step 1: Deploy Backend to Dev Server

### Option A: Render (Recommended - Free)

1. **Sign up** at https://render.com
2. **Connect GitHub** repository
3. **Create New Web Service**:
   - Repository: Your repo
   - Branch: `dev_daniyal`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Set Environment Variables**:
   ```
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
5. **Deploy** and wait for URL (e.g., `https://sahal-backend-dev.onrender.com`)

### Option B: Railway (Alternative - Free)

1. **Sign up** at https://railway.app
2. **New Project** → Deploy from GitHub
3. **Configure**:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. **Set Environment Variables** (same as above)
5. **Get URL** from Railway dashboard

---

## Step 2: Update Mobile App API URLs

### File 1: `frontend/src/services/api.ts`

**Find this line (around line 6-8):**
```typescript
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:4000/api'
  : 'https://your-production-url.com/api';
```

**Replace with your dev server URL:**
```typescript
const BASE_URL = __DEV__ 
  ? 'https://your-backend-dev-url.onrender.com/api'  // ← Your dev server URL
  : 'https://your-production-url.com/api';
```

**Example:**
```typescript
const BASE_URL = __DEV__ 
  ? 'https://sahal-backend-dev.onrender.com/api'
  : 'https://sahal-backend-prod.onrender.com/api';
```

### File 2: `frontend/src/services/axios.ts`

**Find this line (around line 4-7):**
```typescript
const getBaseURL = (): string => {
  return 'http://localhost:4000/api';
};
```

**Replace with:**
```typescript
const getBaseURL = (): string => {
  return __DEV__
    ? 'https://your-backend-dev-url.onrender.com/api'  // ← Your dev server URL
    : 'https://your-production-url.com/api';
};
```

**Example:**
```typescript
const getBaseURL = (): string => {
  return __DEV__
    ? 'https://sahal-backend-dev.onrender.com/api'
    : 'https://sahal-backend-prod.onrender.com/api';
};
```

---

## Step 3: Test Your Backend

### Test from Browser/Command Line:

```bash
# Test products endpoint
curl https://your-backend-dev-url.onrender.com/api/products/

# Test categories endpoint
curl https://your-backend-dev-url.onrender.com/api/categories/
```

**Expected:** JSON response with products/categories data

---

## Step 4: Test Mobile App Integration

1. **Start Metro Bundler:**
   ```bash
   cd frontend
   npm start
   ```

2. **Run Android App:**
   ```bash
   npm run android
   ```

3. **Check Console:**
   - Look for API calls in Metro bundler
   - Verify data loads from server
   - Check for any errors

4. **Verify in App:**
   - Open Home screen
   - Categories and products should load from server
   - Open product details
   - All data should come from API

---

## ✅ Checklist

### Backend
- [ ] Backend deployed to dev server
- [ ] Environment variables set (MONGODB_URI, JWT_SECRET, etc.)
- [ ] Backend URL accessible (test with curl)
- [ ] CORS enabled (already configured)

### Mobile App
- [ ] Updated `frontend/src/services/api.ts` BASE_URL
- [ ] Updated `frontend/src/services/axios.ts` getBaseURL
- [ ] Tested on Android emulator
- [ ] Verified data loads from server
- [ ] No network errors in console

---

## 🔧 Troubleshooting

### Backend Not Accessible
- Check Render/Railway dashboard for errors
- Verify environment variables are set
- Check MongoDB connection string is correct
- Ensure backend is deployed (not just building)

### Mobile App Can't Connect
- Verify BASE_URL uses HTTPS (not HTTP)
- Check backend URL is correct (no typos)
- Ensure device/emulator has internet
- Check Metro bundler console for errors

### CORS Errors
- Backend already has `app.use(cors())` configured
- Should work automatically
- If issues persist, check backend logs

### No Data Loading
- Verify backend has data in database
- Test backend endpoints directly (curl/browser)
- Check API endpoints match (e.g., `/api/products/`)
- Look for errors in Metro bundler console

---

## 📝 Important Notes

1. **HTTPS Required**: Dev servers use HTTPS, so use `https://` not `http://`
2. **Same URL for All**: Once deployed, the URL works from anywhere (emulator, physical device, etc.)
3. **Environment Variables**: Never commit `.env` files to Git
4. **MongoDB**: Use MongoDB Atlas for cloud database (free tier available)

---

## 🎯 Next Steps

After successful deployment:
1. Test all features in mobile app
2. Monitor backend logs for errors
3. Add more API integrations as needed
4. Deploy to production when ready (same process)

---

## 📞 Need Help?

Refer to `DEPLOYMENT_GUIDE.md` for detailed instructions and more deployment options.






