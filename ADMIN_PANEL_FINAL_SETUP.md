# Admin Panel Final Setup

## ✅ Admin Panel Deployed!

**Your URLs:**
- Production: `https://admin-panel-2f4cd2w2e-daniyals-projects-a2864b3d.vercel.app`
- Alias: `https://admin-panel-mocha-five-27.vercel.app`

---

## 🔧 STEP 1: Add Environment Variable

### Via Vercel Dashboard (Easiest):

1. Go to: https://vercel.com/dashboard
2. Click on **admin-panel** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New**

Add this variable:
- **Key**: `VITE_API_URL`
- **Value**: `https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api`
- **Environment**: ✅ Production
- Click **Save**

---

## 🔄 STEP 2: Redeploy Admin Panel

After adding the environment variable:

### Method A: Via Dashboard
1. Go to **admin-panel** project in Vercel
2. Click **Deployments** tab
3. Click **⋯** (three dots) on latest deployment
4. Click **Redeploy**

### Method B: Via CLI
```bash
cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/admin-panel
vercel --prod
```

---

## 🔄 STEP 3: Update Backend CORS

Update backend to allow admin panel domain:

1. Go to: https://vercel.com/dashboard
2. Click on **backend** project
3. Click **Settings** → **Environment Variables**
4. Find **ADMIN_URL** variable
5. Click **Edit**
6. Update value to: `https://admin-panel-2f4cd2w2e-daniyals-projects-a2864b3d.vercel.app`
7. Click **Save**
8. Redeploy backend:
   ```bash
   cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/backend
   vercel --prod
   ```

---

## ✅ STEP 4: Test Admin Panel

1. Open: `https://admin-panel-2f4cd2w2e-daniyals-projects-a2864b3d.vercel.app`
2. You should see the login page
3. Create admin user (see below)

---

## 👤 STEP 5: Create Admin User

### Option A: Via MongoDB Compass (Recommended)

1. Download: https://www.mongodb.com/products/compass
2. Connect with your MongoDB Atlas connection string
3. Go to `sahal` database → `usermodels` collection
4. Click "Add Data" → "Insert Document"
5. Paste this (use bcrypt hash for password):

```json
{
  "fullName": "Admin User",
  "email": "admin@sahal.com",
  "password": "$2b$10$rZ5Z5fLMkH.oOvL2F9b3Mu0U8KpD6YQD9C0LvK3rGH8WXJrI7J8Qy",
  "role": "admin",
  "isActive": true,
  "credits": 0,
  "createdAt": { "$date": "2026-01-19T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-19T00:00:00.000Z" }
}
```

**Login Credentials:**
- Email: `admin@sahal.com`
- Password: `Admin123!`

### Option B: Via MongoDB Atlas Web

1. Go to: https://cloud.mongodb.com/
2. Click on your cluster → Browse Collections
3. Find `sahal` database → `usermodels` collection
4. Click "INSERT DOCUMENT"
5. Use the same JSON as above

### Option C: Generate Your Own Password Hash

```bash
# Install bcrypt tool
npm install -g bcrypt-cli

# Generate hash
bcrypt-cli "YourPassword123!" 10
```

---

## 🎯 STEP 6: Login to Admin Panel

1. Open: `https://admin-panel-2f4cd2w2e-daniyals-projects-a2864b3d.vercel.app`
2. Email: `admin@sahal.com`
3. Password: `Admin123!`
4. Click **Login**

You should see the dashboard! 🎉

---

## 📱 STEP 7: Update Mobile App (Final Step!)

Update the mobile app to use your deployed backend:

### File: `frontend/src/services/axios.ts`

Change line 5-11 to:
```typescript
const getBaseURL = (): string => {
  // For production APK, use deployed backend
  return 'https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api';
};
```

### File: `frontend/src/services/api.ts`

Change line 6-8 to:
```typescript
const BASE_URL = 'https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api';
```

### Rebuild APK:
```bash
cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/frontend/android
./gradlew clean
./gradlew assembleRelease
```

New APK will be at:
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎉 DEPLOYMENT COMPLETE!

| Component | Status | URL |
|-----------|--------|-----|
| **Backend API** | ✅ Live | https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app |
| **Admin Panel** | ✅ Live | https://admin-panel-2f4cd2w2e-daniyals-projects-a2864b3d.vercel.app |
| **Mobile APK** | 🔄 Update & Rebuild | `frontend/android/app/build/outputs/apk/release/app-release.apk` |

---

## 📧 Share with Client

Once everything is working, send this to your client:

```
Subject: Sahal E-Commerce - Live Demo Ready

Hi [Client Name],

The Sahal E-Commerce platform is now fully deployed and ready for testing!

🖥️ ADMIN PANEL (Web Dashboard)
URL: https://admin-panel-2f4cd2w2e-daniyals-projects-a2864b3d.vercel.app
Email: admin@sahal.com
Password: Admin123!

Features Available:
✅ Product Management (Create, Edit, Delete)
✅ Order Management
✅ User & Vendor Management
✅ Deals, Coupons & Gift Cards
✅ Credit Wallet Management
✅ Review Moderation

📱 MOBILE APP (Android)
Download APK: [Your APK Link - Upload to Google Drive/Diawi]

Installation:
1. Download APK
2. Settings → Security → Enable "Install from Unknown Sources"
3. Install APK
4. Open Sahal app

🔧 TECHNICAL INFO
Backend API: https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api
Database: MongoDB Atlas (secure cloud hosting)
Hosting: Vercel (enterprise-grade infrastructure)

Please test all features and let me know if anything needs adjustment!

Best regards,
[Your Name]
```

---

## 🐛 Troubleshooting

### Admin Panel Shows "Network Error"
1. Verify `VITE_API_URL` is set in Vercel
2. Verify backend `ADMIN_URL` includes admin panel URL
3. Redeploy both projects

### Can't Login
1. Verify admin user exists in MongoDB
2. Check password hash is correct
3. Check browser console for errors

### Mobile App Can't Connect
1. Verify API URLs are updated to production
2. Rebuild APK after changing URLs
3. Test backend URL in browser first

---

**You're all set!** 🚀
```

Let me save this guide for you:

