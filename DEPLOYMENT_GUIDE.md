# 🚀 SAHAL E-COMMERCE - DEPLOYMENT GUIDE

Complete guide to deploy all three parts of the Sahal E-Commerce application.

---

## 📦 PROJECT STRUCTURE

- **Backend API**: Node.js/Express/MongoDB (Port 4000)
- **Admin Panel**: React/Vite web app (Port 3000)
- **Mobile App**: React Native Android/iOS

---

## 1️⃣ DEPLOY BACKEND API (Render.com - FREE)

### Why Render?
- ✅ Free tier available
- ✅ Supports Node.js
- ✅ Free MongoDB hosting or use MongoDB Atlas
- ✅ Auto-deploys from GitHub
- ✅ HTTPS included

### Steps:

#### A. Prepare Backend for Production

1. **Create Production Environment File**
   ```bash
   cd backend
   cp .env.example .env.production
   ```

2. **Update `.env.production` with production values**:
   ```env
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-strong-random-string>
   PORT=4000
   FRONTEND_URL=https://sahal-app.com
   ADMIN_URL=https://sahal-admin.vercel.app
   NODE_ENV=production
   ```

3. **Update `backend/index.js` CORS settings** (if not dynamic):
   ```javascript
   // Should already support PROCESS.env variables
   const corsOptions = {
     origin: [
       process.env.FRONTEND_URL,
       process.env.ADMIN_URL,
       'http://localhost:3000',
       'http://localhost:8081'
     ],
     credentials: true
   };
   ```

#### B. Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up
2. **Create New Web Service**:
   - Connect your GitHub repository: `sahal main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Add Environment Variables** in Render Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your strong secret key
   - `PORT`: 4000
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your mobile app URL (if applicable)
   - `ADMIN_URL`: Your admin panel URL (e.g., https://sahal-admin.vercel.app)

4. **Deploy** - Render will auto-build and deploy

5. **Your Backend URL**: `https://sahal-backend.onrender.com`

#### C. Setup MongoDB Atlas (If not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string and add to Render environment variables

#### D. Create Admin User

After deployment, run the admin creation script:
```bash
# SSH into Render or use their shell
npm run create-admin
```

Or manually create admin via MongoDB Compass/Atlas.

---

## 2️⃣ DEPLOY ADMIN PANEL (Vercel - FREE)

### Why Vercel?
- ✅ Free for personal projects
- ✅ Perfect for React/Vite apps
- ✅ Auto-deploys from GitHub
- ✅ Fast CDN
- ✅ HTTPS included

### Steps:

#### A. Update Backend API URL

1. **Update `admin-panel/.env.production`**:
   ```env
   VITE_API_URL=https://sahal-backend.onrender.com/api
   ```

2. **Test build locally**:
   ```bash
   cd admin-panel
   npm install
   npm run build
   npm run preview
   ```

#### B. Deploy to Vercel

**Option 1: Via Vercel CLI (Recommended)**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd admin-panel
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: `sahal-admin-panel`
   - Directory: `./` (current directory)
   - Override settings: No

5. **Set Environment Variable**:
   ```bash
   vercel env add VITE_API_URL production
   # Paste: https://sahal-backend.onrender.com/api
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

**Option 2: Via Vercel Dashboard**

1. Go to [Vercel.com](https://vercel.com) and sign up
2. **Import Git Repository**:
   - Click "New Project"
   - Import your GitHub repo: `sahal main`
   - Root Directory: `admin-panel`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: `https://sahal-backend.onrender.com/api`

4. **Deploy**

5. **Your Admin Panel URL**: `https://sahal-admin-panel.vercel.app`

#### C. Update Backend CORS

After deployment, update your backend's `ADMIN_URL` environment variable in Render:
```env
ADMIN_URL=https://sahal-admin-panel.vercel.app
```

---

## 3️⃣ DEPLOY MOBILE APP (APK Build)

### Option A: Build APK (For Testing with Client)

#### Step 1: Update API URL in Mobile App

1. **Update `frontend/src/services/axios.ts`**:
   ```typescript
   const getBaseURL = (): string => {
     return __DEV__ 
       ? 'http://10.0.2.2:4000/api' // For local dev
       : 'https://sahal-backend.onrender.com/api'; // For production
   };
   ```

2. **Update `frontend/src/services/api.ts`**:
   ```typescript
   const BASE_URL = __DEV__ 
     ? 'http://10.0.2.2:4000/api'
     : 'https://sahal-backend.onrender.com/api';
   ```

#### Step 2: Build Release APK

1. **Clean build**:
   ```bash
   cd frontend/android
   ./gradlew clean
   ```

2. **Build release APK**:
   ```bash
   ./gradlew assembleRelease
   ```

3. **APK Location**:
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
   ```

#### Step 3: Share APK with Client

**Option 1: Upload to File Sharing Service**
- Upload to Google Drive, Dropbox, or WeTransfer
- Share the link with your client

**Option 2: Use Diawi (Free APK Distribution)**
1. Go to [Diawi.com](https://www.diawi.com/)
2. Upload your APK
3. Get a shareable link
4. Client can download and install directly

**Option 3: Firebase App Distribution (Recommended for Teams)**
1. Setup Firebase project
2. Use Firebase CLI to distribute
3. Clients get notified via email

#### Step 4: Client Installation

Send these instructions to your client:

```
📱 SAHAL APP - INSTALLATION INSTRUCTIONS

1. Download the APK from the link provided
2. On your Android phone, go to Settings > Security
3. Enable "Install from Unknown Sources"
4. Open the downloaded APK file
5. Tap "Install"
6. Open the Sahal app and test!

Note: You may need to allow installation from your browser/download manager.
```

### Option B: Deploy to Google Play Store (Console) - BETA Testing

1. Create Google Play Developer Account ($25 one-time fee)
2. Create app listing
3. Upload APK/AAB
4. Create closed beta testing track
5. Add client's email to beta testers
6. Client receives email to join beta and install

---

## 🔧 POST-DEPLOYMENT CHECKLIST

### Backend ✅
- [ ] MongoDB connected successfully
- [ ] Admin user created
- [ ] API endpoints responding
- [ ] CORS configured for admin panel URL
- [ ] Environment variables set
- [ ] Test API: `https://sahal-backend.onrender.com/api/products/`

### Admin Panel ✅
- [ ] Deployed to Vercel
- [ ] Environment variable (`VITE_API_URL`) set
- [ ] Login page accessible
- [ ] Can login with admin credentials
- [ ] Dashboard loads data
- [ ] All CRUD operations working

### Mobile App ✅
- [ ] API URL updated to production
- [ ] Release APK built successfully
- [ ] APK uploaded and shared with client
- [ ] Client can install and open app
- [ ] App connects to production backend
- [ ] Basic flows tested (login, browse products, etc.)

---

## 📝 CREDENTIALS TO SHARE WITH CLIENT

### Admin Panel Access
- **URL**: `https://sahal-admin-panel.vercel.app`
- **Username/Email**: `<admin-email>`
- **Password**: `<admin-password>`

### Mobile App
- **Download Link**: `<diawi-link-or-google-drive-link>`
- **Test User Credentials** (create via admin panel):
  - Email: `test@sahal.com`
  - Password: `Test123!`

### API Documentation
- **Base URL**: `https://sahal-backend.onrender.com/api`
- **Health Check**: `https://sahal-backend.onrender.com/`

---

## 🐛 TROUBLESHOOTING

### Issue: Admin Panel shows "Network Error"
**Fix**: Check if backend URL is correct in environment variables and backend is running

### Issue: Mobile app can't connect to API
**Fix**: Ensure API URL in mobile app points to production backend (not localhost)

### Issue: Backend shows "Database connection failed"
**Fix**: Check MongoDB Atlas connection string and ensure IP whitelist includes `0.0.0.0/0`

### Issue: APK won't install on client's phone
**Fix**: Ensure "Install from Unknown Sources" is enabled in phone settings

### Issue: Render backend sleeping (slow first response)
**Fix**: Free tier sleeps after inactivity. Consider upgrading or use a cron job to ping it every 10 minutes

---

## 💰 COST BREAKDOWN

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | Free Tier (512MB) | **FREE** |
| Render.com | Free Tier | **FREE** |
| Vercel | Hobby Plan | **FREE** |
| Diawi APK Hosting | Free | **FREE** |
| **TOTAL** | | **$0/month** 🎉 |

### Paid Upgrades (Optional):
- Render Pro: $7/month (no sleeping, better performance)
- MongoDB Atlas M10: $10/month (better performance, backups)
- Google Play Store: $25 one-time (for official app release)

---

## 🚀 NEXT STEPS AFTER DEPLOYMENT

1. **Monitor Performance**: Check Render and Vercel dashboards for errors
2. **Setup Analytics**: Add Google Analytics to admin panel
3. **Enable Logging**: Setup error logging (Sentry, LogRocket)
4. **Setup Backups**: Schedule MongoDB backups
5. **Custom Domains**: 
   - Vercel: Add custom domain (e.g., admin.sahal.com)
   - Render: Add custom domain (e.g., api.sahal.com)

---

## 📞 SUPPORT

For deployment issues, check:
- Render Logs: Dashboard > Your Service > Logs
- Vercel Logs: Dashboard > Your Project > Deployments > View Function Logs
- Browser Console: For admin panel frontend errors

---

**Created**: January 2026  
**Project**: Sahal E-Commerce Platform  
**Version**: 1.0.0
