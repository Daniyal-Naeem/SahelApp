# Quick Environment Variables Setup

## 🚀 **Easiest Way: Add via Vercel Dashboard**

### Step 1: Go to Your Backend Project
1. Open: https://vercel.com/dashboard
2. Click on **backend** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add These 6 Variables

Click **Add New** for each variable:

#### Variable 1: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `sahal_jwt_secret_2026_secure_key`
- **Environment**: Production ✅
- Click **Save**

#### Variable 2: PORT
- **Key**: `PORT`
- **Value**: `4000`
- **Environment**: Production ✅
- Click **Save**

#### Variable 3: NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production ✅
- Click **Save**

#### Variable 4: ADMIN_URL
- **Key**: `ADMIN_URL`
- **Value**: `https://sahal-admin.vercel.app`
- **Environment**: Production ✅
- Click **Save**

#### Variable 5: FRONTEND_URL
- **Key**: `FRONTEND_URL`
- **Value**: `http://localhost:8081`
- **Environment**: Production ✅
- Click **Save**

#### Variable 6: MONGODB_URI (Need MongoDB Atlas First!)
- **Key**: `MONGODB_URI`
- **Value**: See below ⬇️
- **Environment**: Production ✅
- Click **Save**

---

## 📦 **Setup MongoDB Atlas (Required for Variable 6)**

### Quick Setup (5 minutes):

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with Google/Email (FREE)
3. **Create Free Cluster**:
   - Click "Create"
   - Choose "M0 FREE"
   - Select closest region
   - Click "Create Cluster"

4. **Create Database User**:
   - Left menu: "Database Access"
   - Click "Add New Database User"
   - **Username**: `sahal_admin`
   - **Password**: Click "Autogenerate" (SAVE THIS PASSWORD!)
   - Click "Add User"

5. **Allow All IPs**:
   - Left menu: "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Confirm

6. **Get Connection String**:
   - Go to "Database" (left menu)
   - Click "Connect" button
   - Choose "Drivers"
   - Copy connection string (looks like):
   ```
   mongodb+srv://sahal_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Modify Connection String**:
   - Replace `<password>` with your actual password
   - Add `/sahal` before the `?`:
   ```
   mongodb+srv://sahal_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority
   ```

8. **Add to Vercel**:
   - Go back to Vercel → backend → Settings → Environment Variables
   - Add new variable:
     - **Key**: `MONGODB_URI`
     - **Value**: Your connection string (from step 7)
   - Click **Save**

---

## 🔄 **Step 3: Redeploy Backend**

After adding all variables:

### Method 1: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click **backend** project
3. Click **Deployments** tab
4. Find latest deployment
5. Click **⋯** (three dots)
6. Click **Redeploy**

### Method 2: Via CLI
```bash
cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/backend
vercel --prod
```

---

## ✅ **Verify Setup**

After redeployment, test these URLs:

### Health Check:
```
https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/
```
Should show:
```json
{
  "status": "OK",
  "message": "Sahal Backend API is running"
}
```

### API Test:
```
https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api/products/
```
Should return: `[]` or list of products

---

## 📸 **Screenshot Guide**

### Where to find Environment Variables:

```
Vercel Dashboard
└── Your Project (backend)
    └── Settings (top nav)
        └── Environment Variables (left sidebar)
            └── Add New button
```

---

## 🐛 **Troubleshooting**

### Can't find Settings?
- Make sure you clicked on the **backend** project name
- Look at the top navigation bar for "Settings"

### Can't find Environment Variables?
- After clicking Settings, look at the LEFT sidebar
- Scroll down if needed

### MongoDB connection fails?
- Check password doesn't have special characters
- Make sure IP whitelist is `0.0.0.0/0`
- Verify `/sahal` is added before the `?` in connection string

---

## 💡 **Pro Tip**

You can copy-paste all variables at once using the **bulk edit** feature:

1. In Environment Variables page
2. Look for "Bulk Edit" or similar option
3. Paste in this format:
```
JWT_SECRET=sahal_jwt_secret_2026_secure_key
PORT=4000
NODE_ENV=production
ADMIN_URL=https://sahal-admin.vercel.app
FRONTEND_URL=http://localhost:8081
MONGODB_URI=mongodb+srv://sahal_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahal?retryWrites=true&w=majority
```

---

**That's it!** 🎉 Once all variables are added and backend is redeployed, your API will be fully functional!

