# Fix Admin Panel Login Issue

## 🔍 **Issues Found:**

1. ❌ **CORS Issue**: Backend's `ADMIN_URL` is set to wrong domain
   - Current: `https://sahal-admin.vercel.app`
   - Should be: `https://admin-panel-mocha-five-27.vercel.app`

2. ❌ **MongoDB URI Issue**: Missing database name
   - Current: `mongodb+srv://...mongodb.net/?appName=Cluster0`
   - Should be: `mongodb+srv://...mongodb.net/sahal?appName=Cluster0`

---

## ✅ **SOLUTION: Update Backend Environment Variables**

### Step 1: Update ADMIN_URL

1. Go to: https://vercel.com/dashboard
2. Click on **backend** project
3. Click **Settings** → **Environment Variables**
4. Find **ADMIN_URL**
5. Click **Edit** (pencil icon)
6. Change value to: `https://admin-panel-mocha-five-27.vercel.app`
7. Click **Save**

### Step 2: Update MONGODB_URI

1. In the same Environment Variables page
2. Find **MONGODB_URI**
3. Click **Edit** (pencil icon)
4. Change value to: `mongodb+srv://dani123:Pakistan001@cluster0.ciqe9yo.mongodb.net/sahal?appName=Cluster0`
   - **Note**: Added `/sahal` before the `?`
5. Click **Save**

### Step 3: Redeploy Backend

After updating both variables:

**Option A: Via Dashboard**
1. Go to **backend** project
2. Click **Deployments** tab
3. Click **⋯** (three dots) on latest deployment
4. Click **Redeploy**

**Option B: Via CLI**
```bash
cd /Users/daniyalnaeem/Documents/GitHub/sahal\ main/backend
vercel --prod
```

---

## 🔄 **ALTERNATIVE: Add CORS Domain Manually**

If you don't want to change ADMIN_URL, you can add multiple allowed origins.

Update backend's `ADMIN_URL` to include both:
```
https://admin-panel-mocha-five-27.vercel.app,https://sahal-admin.vercel.app
```

Or better: Add a separate environment variable for allowed origins.

---

## ✅ **After Fixing, Try Login Again:**

1. **URL**: `https://admin-panel-mocha-five-27.vercel.app`
2. **Email**: `admin@sahal.com`
3. **Password**: `Admin123!`

---

## 🧪 **Test Backend CORS**

After redeploying, you can test if CORS is working:

```bash
curl -H "Origin: https://admin-panel-mocha-five-27.vercel.app" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"email":"admin@sahal.com","password":"Admin123!"}' \
  https://backend-qbdmvr2wv-daniyals-projects-a2864b3d.vercel.app/api/auth/login
```

Should return a JWT token if successful.

---

## 📝 **Summary of Changes**

| Variable | Old Value | New Value |
|----------|-----------|-----------|
| `ADMIN_URL` | `https://sahal-admin.vercel.app` | `https://admin-panel-mocha-five-27.vercel.app` |
| `MONGODB_URI` | `...mongodb.net/?appName=...` | `...mongodb.net/sahal?appName=...` |

---

## ✅ **Admin Credentials (Already Reset)**

- **Email**: `admin@sahal.com`
- **Password**: `Admin123!`
- **Role**: admin
- **Status**: Active ✅

---

**After making these changes and redeploying, login should work!** 🎉

