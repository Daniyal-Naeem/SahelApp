# 🚀 SAHAL E-COMMERCE - VERCEL-ONLY DEPLOYMENT

Deploy the entire Sahal E-Commerce platform on **Vercel** (100% free for personal projects).

---

## 🎯 WHAT WE'RE DEPLOYING

1. **Backend API** → Vercel Serverless Functions
2. **Admin Panel** → Vercel Static Site
3. **Mobile App** → APK for download

**Total Cost: $0/month** ✅

---

## ⚡ QUICK START (3 STEPS)

### **STEP 1: Setup MongoDB Atlas** (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up** for free account
3. **Create a FREE Cluster** (M0 Sandbox - 512MB)
4. **Create Database User**:
   - Database Access → Add New User
   - Username: `sahal_admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"

5. **Whitelist All IPs**:
   - Network Access → Add IP Address
   - Access List Entry: `0.0.0.0/0`
   - Comment: "Allow from anywhere (Vercel)"
   - Click "Confirm"

6. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Driver: Node.js
   - Copy connection string:
   ```
   mongodb+srv://sahal_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://sahal_admin:<password>@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority`

---

### **STEP 2: Deploy Backend to Vercel** (10 minutes)

#### Option A: Using Vercel CLI (Recommended - Fastest)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy Backend
cd backend
vercel

# Follow prompts:
# - Set up and deploy: YES
# - Which scope: YOUR ACCOUNT
# - Link to existing project: NO
# - Project name: sahal-backend
# - Directory: ./ (press enter)
# - Override settings: NO

# 4. Add Environment Variables
vercel env add MONGODB_URI production
# Paste your MongoDB connection string

vercel env add JWT_SECRET production
# Enter: sahal_jwt_secret_2026_secure_key

vercel env add PORT production
# Enter: 4000

vercel env add NODE_ENV production
# Enter: production

vercel env add ADMIN_URL production
# Enter: https://sahal-admin.vercel.app

vercel env add FRONTEND_URL production
# Enter: http://localhost:8081

# 5. Deploy to Production
vercel --prod

# 6. Copy your backend URL (will be shown)
# Example: https://sahal-backend.vercel.app
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel.com](https://vercel.com) and **Login**
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**: `sahal main`
4. Configure Backend:
   - **Project Name**: `sahal-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   ```
   MONGODB_URI = mongodb+srv://sahal_admin:<password>@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority
   JWT_SECRET = sahal_jwt_secret_2026_secure_key
   PORT = 4000
   NODE_ENV = production
   ADMIN_URL = https://sahal-admin.vercel.app
   FRONTEND_URL = http://localhost:8081
   ```

6. Click **"Deploy"**

7. **Your Backend URL**: Copy the URL (e.g., `https://sahal-backend.vercel.app`)

#### Test Backend
1. Open browser: `https://sahal-backend.vercel.app/`
2. Should see: `{ "status": "OK", "message": "Sahal Backend API is running" }`
3. Test products: `https://sahal-backend.vercel.app/api/products/`

---

### **STEP 3: Deploy Admin Panel to Vercel** (5 minutes)

#### Option A: Using Vercel CLI

```bash
# 1. Navigate to admin panel
cd ../admin-panel

# 2. Deploy
vercel

# Follow prompts:
# - Project name: sahal-admin-panel
# - Directory: ./

# 3. Add Environment Variable
vercel env add VITE_API_URL production
# Enter: https://sahal-backend.vercel.app/api
# (Use YOUR backend URL from Step 2)

# 4. Deploy to Production
vercel --prod

# Your Admin Panel URL will be shown
# Example: https://sahal-admin-panel.vercel.app
```

#### Option B: Using Vercel Dashboard

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. **Import**: Same repository `sahal main`
3. Configure Admin Panel:
   - **Project Name**: `sahal-admin-panel`
   - **Framework Preset**: Vite
   - **Root Directory**: `admin-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_API_URL = https://sahal-backend.vercel.app/api
   ```
   (Use YOUR backend URL from Step 2)

5. Click **"Deploy"**

6. **Your Admin Panel URL**: Copy the URL (e.g., `https://sahal-admin-panel.vercel.app`)

#### Update Backend CORS

1. Go to Vercel → `sahal-backend` project → Settings → Environment Variables
2. Update `ADMIN_URL` to your actual admin panel URL
3. Click "Save"
4. Redeploy backend:
   ```bash
   cd backend
   vercel --prod
   ```

---

### **STEP 4: Create Admin User** (2 minutes)

Since we can't run scripts directly on Vercel, create an admin user via MongoDB Compass or Atlas:

#### Option A: Using MongoDB Compass (Recommended)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Go to `sahal` database → `usermodels` collection
4. Click "Add Data" → "Insert Document"
5. Paste this (replace with your details):

```json
{
  "fullName": "Admin User",
  "email": "admin@sahal.com",
  "password": "$2b$10$YourHashedPasswordHere",
  "role": "admin",
  "isActive": true,
  "credits": 0,
  "createdAt": { "$date": "2026-01-19T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-19T00:00:00.000Z" }
}
```

**To generate hashed password:**
```bash
# Create a quick Node.js script locally
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10, (err, hash) => console.log(hash));"
```

#### Option B: Using MongoDB Atlas Web Interface

1. Go to MongoDB Atlas → Clusters → Browse Collections
2. Find `sahal` database → `usermodels` collection
3. Click "INSERT DOCUMENT"
4. Use the same JSON as above

#### Option C: Create via API (After backend is deployed)

```bash
curl -X POST https://sahal-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@sahal.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

Then manually update the role to "admin" in MongoDB.

---

### **STEP 5: Share Mobile App APK** (5 minutes)

The APK is already built! Located at:
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

**Size**: 83 MB

#### Share Methods:

**Method 1: Google Drive** (Easiest)
1. Upload APK to Google Drive
2. Right-click → Get link → Set to "Anyone with the link can view"
3. Share link with client

**Method 2: Diawi** (Professional)
1. Go to [Diawi.com](https://www.diawi.com/)
2. Upload `app-release.apk`
3. Get shareable link
4. Send to client

**Method 3: WeTransfer**
1. Go to [WeTransfer.com](https://wetransfer.com/)
2. Upload APK
3. Enter client email
4. Send

---

## ✅ DEPLOYMENT CHECKLIST

### Backend on Vercel ✅
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Vercel
- [ ] Environment variables configured
- [ ] Health check working: `https://your-backend.vercel.app/`
- [ ] API working: `https://your-backend.vercel.app/api/products/`

### Admin Panel on Vercel ✅
- [ ] Admin panel deployed to Vercel
- [ ] `VITE_API_URL` environment variable set
- [ ] Can access: `https://your-admin-panel.vercel.app`
- [ ] Can login with admin credentials
- [ ] Dashboard loads successfully

### Mobile App ✅
- [ ] APK uploaded to sharing service
- [ ] Download link generated
- [ ] Installation instructions prepared

---

## 📧 EMAIL TEMPLATE FOR CLIENT

```
Subject: Sahal E-Commerce App - Ready for Testing

Hi [Client Name],

Great news! The Sahal E-Commerce platform is now live and ready for your review.

🖥️ ADMIN PANEL (Web Dashboard)
URL: https://sahal-admin-panel.vercel.app
Email: admin@sahal.com
Password: Admin123!

What you can do:
✅ Manage Products (Create, Edit, Delete)
✅ View & Process Orders
✅ Manage Users & Vendors
✅ Create Deals, Coupons & Gift Cards
✅ Review Moderation
✅ Credit Wallet Management

📱 MOBILE APP (Android)
Download APK: [Your APK Link]

Installation Steps:
1. Click the link above to download
2. On your Android phone: Settings → Security
3. Enable "Install from Unknown Sources" or "Install Unknown Apps"
4. Open the downloaded file
5. Tap "Install"
6. Launch "Sahal" app

Test the app by:
✅ Browsing products
✅ Searching items
✅ Viewing categories
✅ Adding items to cart/wishlist
✅ Checking product details

🔧 TECHNICAL DETAILS
Backend API: https://sahal-backend.vercel.app/api
Health Check: https://sahal-backend.vercel.app/health
Hosting: 100% on Vercel (reliable, fast, secure)

📝 FEEDBACK NEEDED
Please test both the admin panel and mobile app and let me know:
1. Any bugs or issues
2. Missing features
3. UI/UX improvements
4. Overall experience

⚠️ NOTES
- Mobile app shows UI screens, some features need backend integration
- Admin panel is fully functional
- All data is stored securely in MongoDB Atlas

Questions? Just reply to this email!

Best regards,
[Your Name]
```

---

## 🎯 YOUR DEPLOYED URLS

Fill these in after deployment:

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | `https://sahal-backend-xxxx.vercel.app` | [ ] |
| **Admin Panel** | `https://sahal-admin-xxxx.vercel.app` | [ ] |
| **Mobile APK** | `[Your sharing link]` | [ ] |

---

## 🐛 TROUBLESHOOTING

### Issue: Backend deployment failed
**Fix**: 
- Check if `vercel.json` exists in `backend/` folder
- Verify MongoDB connection string is correct
- Check Vercel deployment logs

### Issue: "Database connection failed"
**Fix**:
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure password doesn't contain special characters (or URL encode them)

### Issue: Admin panel shows "Network Error"
**Fix**:
- Verify `VITE_API_URL` is set correctly in Vercel admin panel project
- Check backend is deployed and working
- Verify backend CORS includes admin panel URL

### Issue: Admin panel can't login
**Fix**:
- Verify admin user exists in MongoDB
- Check password is correct
- Look at browser console for error messages

### Issue: Mobile app can't connect
**Fix**:
- Check API URL in `frontend/src/services/axios.ts`
- Verify it points to Vercel backend (not localhost)
- Rebuild APK if you changed the URL

### Issue: APK won't install
**Fix**:
- Enable "Install from Unknown Sources" in Android settings
- Check if phone has enough storage space
- Try downloading again (file might be corrupted)

### Issue: Vercel serverless function timeout
**Fix**:
- Vercel free tier has 10-second timeout for serverless functions
- Optimize slow database queries
- Add indexes to MongoDB collections
- Consider upgrading to Vercel Pro if needed

---

## 💰 COST BREAKDOWN

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Vercel** (Backend) | Hobby | **FREE** |
| **Vercel** (Admin Panel) | Hobby | **FREE** |
| **MongoDB Atlas** | M0 Free Tier | **FREE** |
| **Domain** (Optional) | Custom | ~$12/year |
| **TOTAL** | | **$0/month** 🎉 |

### Free Tier Limits:
- **Vercel**:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless function execution: 100 hours/month
  - 10-second timeout per function
  
- **MongoDB Atlas**:
  - 512MB storage
  - Shared RAM
  - No backup
  - Perfect for testing & small projects

### Upgrade Options (If Needed):
- **Vercel Pro**: $20/month
  - 1TB bandwidth
  - 1000 hours function execution
  - 60-second timeout
  - Priority support
  
- **MongoDB M10**: $10/month
  - 10GB storage
  - Automated backups
  - Better performance

---

## 🚀 CUSTOM DOMAINS (Optional)

### Add Custom Domain to Backend
1. Buy domain (e.g., api.sahal.com)
2. In Vercel → sahal-backend → Settings → Domains
3. Add `api.sahal.com`
4. Update DNS records as instructed
5. Update mobile app and admin panel to use new URL

### Add Custom Domain to Admin Panel
1. Buy domain (e.g., admin.sahal.com)
2. In Vercel → sahal-admin-panel → Settings → Domains
3. Add `admin.sahal.com`
4. Update DNS records
5. Update backend CORS to include new domain

---

## 📊 MONITORING & ANALYTICS

### Vercel Analytics (Built-in)
- Go to Project → Analytics
- View page views, performance, errors
- Free tier includes basic analytics

### MongoDB Atlas Monitoring
- Go to Cluster → Metrics
- View connections, operations, storage
- Set up alerts for issues

### Error Tracking (Optional)
Consider adding:
- **Sentry** (free tier): Error tracking
- **LogRocket** (free tier): Session replay
- **Google Analytics**: User behavior

---

## 🔄 CONTINUOUS DEPLOYMENT

Both projects are now set up for automatic deployment:

- **Push to GitHub** → Vercel auto-deploys
- **No manual steps needed**
- **Instant rollback** if needed (Vercel dashboard)

To trigger new deployment:
```bash
git add .
git commit -m "Update feature"
git push origin dev_daniyal
```

Vercel will automatically deploy within 1-2 minutes.

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Vercel Discord**: https://vercel.com/discord
- **MongoDB Community**: https://community.mongodb.com/

---

## ✨ BONUS: USEFUL VERCEL CLI COMMANDS

```bash
# View deployment logs
vercel logs sahal-backend

# List all deployments
vercel ls

# Rollback to previous deployment
vercel rollback

# Pull environment variables locally
vercel env pull

# Remove a deployment
vercel rm deployment-url
```

---

**🎉 CONGRATULATIONS!**

Your Sahal E-Commerce platform is now live on Vercel!

- **Backend**: Serverless, scalable, fast
- **Admin Panel**: Global CDN, instant loading
- **Mobile App**: Ready for client testing
- **Cost**: $0/month
- **Deployment**: Fully automated

**Enjoy! 🚀**

