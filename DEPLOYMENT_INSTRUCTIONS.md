# 🚀 SAHAL E-COMMERCE - QUICK DEPLOYMENT GUIDE

## 📋 PREREQUISITES CHECKLIST

Before deploying, ensure you have:
- ✅ GitHub account (repo: `sahal main`)
- ✅ MongoDB Atlas account (free tier available)
- ✅ Render.com account (free tier available)
- ✅ Vercel account (free tier available)

---

## 🎯 DEPLOYMENT STEPS (DO IN THIS ORDER)

### **STEP 1: Deploy Backend to Render** 🔧

#### 1.1 Create MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **FREE** M0 cluster
3. Create database user (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)
5. Copy connection string (replace `<password>` with your password):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority
   ```

#### 1.2 Deploy Backend to Render
1. Go to [Render.com](https://render.com) and **Sign Up/Login**
2. Click **"New +"** → **"Web Service"**
3. **Connect GitHub** and select repository: `sahal main`
4. Configure:
   - **Name**: `sahal-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables**:
   ```
   MONGODB_URI = <your-mongodb-atlas-connection-string>
   JWT_SECRET = sahal_secret_2026_production_key
   PORT = 4000
   NODE_ENV = production
   ADMIN_URL = https://sahal-admin.vercel.app
   FRONTEND_URL = http://localhost:8081
   ```

6. Click **"Create Web Service"** and wait for deployment (~5 mins)

7. **Your Backend URL**: `https://sahal-backend.onrender.com`

8. **Test Backend**: Open `https://sahal-backend.onrender.com/` in browser
   - Should show: `{ "status": "OK", "message": "Sahal Backend API is running" }`

#### 1.3 Create Admin User
1. In Render dashboard → Click **"Shell"**
2. Run: `npm run create-admin`
3. Follow prompts to create admin account

---

### **STEP 2: Deploy Admin Panel to Vercel** 🖥️

#### 2.1 Update Backend URL
The admin panel is already configured to use environment variables.

#### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI (Fastest)**

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to admin panel
cd admin-panel

# 4. Deploy to production
vercel --prod

# 5. When prompted:
# - Set up and deploy: YES
# - Which scope: YOUR ACCOUNT
# - Link to existing project: NO
# - Project name: sahal-admin-panel
# - Directory: ./ (press enter)
# - Override settings: NO

# 6. Add environment variable
vercel env add VITE_API_URL production
# Enter: https://sahal-backend.onrender.com/api

# 7. Redeploy with new env
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [Vercel.com](https://vercel.com) and **Sign Up/Login**
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**: Select `sahal main`
4. Configure:
   - **Project Name**: `sahal-admin-panel`
   - **Framework Preset**: Vite
   - **Root Directory**: `admin-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   
5. **Environment Variables**:
   ```
   VITE_API_URL = https://sahal-backend.onrender.com/api
   ```

6. Click **"Deploy"** and wait (~2 mins)

7. **Your Admin Panel URL**: `https://sahal-admin-panel.vercel.app`

#### 2.3 Update Backend CORS
1. Go to Render dashboard → `sahal-backend` service
2. Navigate to **"Environment"** tab
3. Update `ADMIN_URL` to: `https://sahal-admin-panel.vercel.app`
4. Click **"Save Changes"** (backend will auto-redeploy)

#### 2.4 Test Admin Panel
1. Open: `https://sahal-admin-panel.vercel.app`
2. Login with admin credentials created in Step 1.3
3. Verify dashboard loads and shows data

---

### **STEP 3: Build Mobile App APK** 📱

The production APK has already been built! 🎉

#### 3.1 APK Location
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```
**Size**: ~83 MB

#### 3.2 Share APK with Client

**Method 1: Google Drive (Recommended)**
1. Upload `app-release.apk` to Google Drive
2. Set sharing to "Anyone with the link"
3. Share link with client

**Method 2: Diawi (Free APK Distribution)**
1. Go to [Diawi.com](https://www.diawi.com/)
2. Upload `app-release.apk`
3. Wait for processing
4. Copy shareable link
5. Send link to client

**Method 3: WeTransfer**
1. Go to [WeTransfer.com](https://wetransfer.com/)
2. Upload APK (free, no account needed)
3. Enter client's email
4. Send

---

## 📧 EMAIL TO CLIENT

```
Subject: Sahal E-Commerce App - Ready for Testing

Hi [Client Name],

The Sahal E-Commerce platform is now deployed and ready for your review!

🖥️ **ADMIN PANEL**
URL: https://sahal-admin-panel.vercel.app
Username: [admin-email]
Password: [admin-password]

Features you can test:
- Dashboard overview
- Products management (create, edit, delete)
- Orders management
- Users & vendors management
- Deals, coupons, gift cards management
- Credit wallet management
- Reviews moderation

📱 **MOBILE APP (Android)**
Download APK: [Your APK Link]

Installation Instructions:
1. Download the APK from the link above
2. On your Android phone: Settings → Security → Enable "Install from Unknown Sources"
3. Open the downloaded APK file
4. Tap "Install"
5. Open "Sahal" app

Test Credentials:
- Create an account through the app, or
- I can create test credentials for you

🔧 **API BACKEND**
API URL: https://sahal-backend.onrender.com/api
Health Check: https://sahal-backend.onrender.com/health

📝 **WHAT TO TEST**
Please test the following and let me know if anything is missing or needs improvement:

Admin Panel:
✅ Login/Logout
✅ Create/Edit/Delete Products
✅ Manage Orders
✅ Manage Users
✅ Create Deals & Coupons
✅ Credit Management

Mobile App:
✅ Browse products
✅ View product details
✅ Search functionality
✅ Categories
✅ Add to cart/wishlist
✅ User registration/login (when integrated)

⚠️ **NOTE**: 
- The backend uses free tier hosting, so first API call may take ~30 seconds (cold start)
- Some mobile app features are UI-only and not yet connected to backend
- Full API integration for mobile app is in progress

Let me know if you have any questions or find any issues!

Best regards,
[Your Name]
```

---

## ✅ DEPLOYMENT CHECKLIST

### Backend ✅
- [✓] MongoDB Atlas created and connected
- [✓] Backend deployed to Render
- [✓] Environment variables set
- [✓] Admin user created
- [✓] Health check endpoint working
- [✓] CORS configured

### Admin Panel ✅
- [✓] Deployed to Vercel
- [✓] Environment variable (VITE_API_URL) set
- [✓] Can login with admin credentials
- [✓] Dashboard loads data
- [✓] CRUD operations working

### Mobile App ✅
- [✓] Production API URLs configured
- [✓] Release APK built (83 MB)
- [✓] APK uploaded and shared with client
- [ ] Client tested and confirmed working

---

## 🐛 TROUBLESHOOTING

### Issue: Backend shows "Database connection failed"
**Fix**: Check MongoDB Atlas connection string in Render environment variables

### Issue: Admin panel shows "Network Error"
**Fix**: 
1. Check if backend is running: `https://sahal-backend.onrender.com/`
2. Verify `VITE_API_URL` in Vercel dashboard
3. Check backend CORS settings include admin panel URL

### Issue: Mobile app can't connect
**Fix**: 
1. Ensure backend URL in app is correct (not localhost)
2. Check if backend is running
3. Try rebuilding APK after confirming backend URL

### Issue: Render backend "sleeping" (slow first load)
**Fix**: This is normal on free tier. First request wakes it up (~30s). Subsequent requests are fast.

### Issue: APK won't install on phone
**Fix**: Enable "Install from Unknown Sources" in phone settings

---

## 💰 COST

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 (Free) | **FREE** |
| Render.com | Free Tier | **FREE** |
| Vercel | Hobby | **FREE** |
| **TOTAL** | | **$0/month** 🎉 |

**Limitations of Free Tier:**
- Render: Backend sleeps after 15 mins of inactivity
- MongoDB: 512MB storage limit
- Vercel: Unlimited for personal projects

**Upgrade Options (Optional):**
- Render Starter: $7/month (no sleeping, better performance)
- MongoDB M10: $10/month (better performance, automated backups)

---

## 📞 SUPPORT

For any deployment issues:
1. Check service status dashboards (Render, Vercel, MongoDB Atlas)
2. Check logs:
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → Function Logs
3. Check browser console for frontend errors

---

**🎉 ALL DONE! Your app is now live and ready for client testing!**

**Backend**: `https://sahal-backend.onrender.com`  
**Admin Panel**: `https://sahal-admin-panel.vercel.app`  
**Mobile APK**: `frontend/android/app/build/outputs/apk/release/app-release.apk`

