# Backend Environment Variables Setup

## ✅ Backend Deployed Successfully!

**Production URL**: `https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app`

---

## 🔧 Required Environment Variables

You need to add these environment variables to make the backend functional:

### Method 1: Using Vercel CLI (Current Directory: backend)

Run these commands one by one:

```bash
# 1. JWT Secret
vercel env add JWT_SECRET production
# When prompted, enter: sahal_jwt_secret_2026_secure_key

# 2. Port
vercel env add PORT production
# When prompted, enter: 4000

# 3. Node Environment
vercel env add NODE_ENV production
# When prompted, enter: production

# 4. MongoDB URI (You need to create MongoDB Atlas first - see below)
vercel env add MONGODB_URI production
# When prompted, enter your MongoDB connection string

# 5. Admin URL (will be set after admin panel deployment)
vercel env add ADMIN_URL production
# When prompted, enter: https://sahal-admin.vercel.app

# 6. Frontend URL
vercel env add FRONTEND_URL production
# When prompted, enter: http://localhost:8081
```

### Method 2: Using Vercel Dashboard (Easier)

1. Go to: https://vercel.com/dashboard
2. Click on your project: **backend**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | See MongoDB Atlas setup below |
| `JWT_SECRET` | `sahal_jwt_secret_2026_secure_key` |
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `ADMIN_URL` | `https://sahal-admin.vercel.app` |
| `FRONTEND_URL` | `http://localhost:8081` |

5. After adding all variables, click **Redeploy** button

---

## 📦 STEP 1: Setup MongoDB Atlas (Required!)

**You MUST do this before the backend will work:**

1. **Create Account**:
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for FREE account

2. **Create Cluster**:
   - Click "Build a Database"
   - Choose "M0" (Free Forever)
   - Select region closest to you
   - Cluster name: `Cluster0` (default is fine)
   - Click "Create"

3. **Create Database User**:
   - Security → Database Access
   - Click "Add New Database User"
   - Username: `sahal_admin`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist All IPs**:
   - Security → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Enter: `0.0.0.0/0`
   - Click "Confirm"

5. **Get Connection String**:
   - Click "Connect" button on your cluster
   - Choose "Connect your application"
   - Driver: Node.js
   - Copy the connection string, it looks like:
   ```
   mongodb+srv://sahal_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - **IMPORTANT**: Replace `<password>` with your actual password
   - **IMPORTANT**: Add `/sahal` before the `?` to specify database name:
   ```
   mongodb+srv://sahal_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority
   ```

6. **Add to Vercel**:
   - Copy your final connection string
   - Go to Vercel Dashboard → backend → Settings → Environment Variables
   - Add new variable:
     - Name: `MONGODB_URI`
     - Value: Your connection string
   - Click "Save"

---

## 🔄 After Adding Environment Variables

**Redeploy the backend:**

```bash
cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/backend
vercel --prod
```

Or click "Redeploy" in Vercel Dashboard.

---

## ✅ Test Your Backend

After setting up MongoDB and redeploying:

1. **Health Check**:
   ```
   https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/
   ```
   Should show: `{ "status": "OK", "message": "Sahal Backend API is running" }`

2. **API Test**:
   ```
   https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api/products/
   ```
   Should return products array (might be empty initially)

---

## 🎯 Quick Setup Commands (All at Once)

If you prefer to set all environment variables via CLI:

```bash
cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/backend

# Run these one by one (you'll be prompted for values)
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add PORT production
vercel env add NODE_ENV production
vercel env add ADMIN_URL production
vercel env add FRONTEND_URL production

# Then redeploy
vercel --prod
```

**Values to use when prompted:**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: `sahal_jwt_secret_2026_secure_key`
- `PORT`: `4000`
- `NODE_ENV`: `production`
- `ADMIN_URL`: `https://sahal-admin.vercel.app`
- `FRONTEND_URL`: `http://localhost:8081`

---

## 📝 Summary

✅ Backend is deployed  
⏳ Need to setup MongoDB Atlas  
⏳ Need to add environment variables  
⏳ Need to redeploy after adding variables  

**Next**: Follow Step 1 above to create MongoDB Atlas database, then add all environment variables!

