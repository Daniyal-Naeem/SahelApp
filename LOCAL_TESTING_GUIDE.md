# Local Testing Guide

This guide will help you test the admin panel and backend locally.

---

## ✅ Current Status

**Backend:** ✅ Running on http://localhost:4000  
**Admin Panel:** ✅ Running on http://localhost:3000  
**MongoDB:** ✅ Connected

---

## 🚀 Quick Start Commands

### Start Backend

```bash
cd backend
npm start
```

Backend will run on: **http://localhost:4000**

### Start Admin Panel

Open a **new terminal** and run:

```bash
cd admin-panel
npm run dev
```

Admin panel will run on: **http://localhost:3000**

---

## 🔐 Login Credentials

- **Email:** `admin@sahal.com`
- **Password:** `admin123`

---

## 🧪 Testing Steps

### 1. Test Backend Health

```bash
curl http://localhost:4000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": <number>
}
```

### 2. Test Login API

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sahal.com", "password": "admin123"}'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Test Dashboard Stats

First, get a token from login, then:

```bash
TOKEN="your-token-here"
curl -X GET http://localhost:4000/api/admin/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "stats": {
    "users": { "total": 0 },
    "vendors": { "total": 0, "pending": 0 },
    "orders": { "total": 0, "pending": 0 },
    "products": { "total": 5 },
    "revenue": { "total": 0 },
    ...
  }
}
```

### 4. Test Admin Panel

1. Open browser: **http://localhost:3000**
2. Login with: `admin@sahal.com` / `admin123`
3. Check dashboard loads without errors

---

## 🔧 Troubleshooting

### Backend Not Starting

**Check MongoDB Connection:**
```bash
cd backend
cat .env | grep MONGODB_URI
```

**Check Port Availability:**
```bash
lsof -i :4000
```

If port is in use, kill the process or change PORT in `.env`

### Admin Panel Not Starting

**Check Port Availability:**
```bash
lsof -i :3000
```

**Check Environment Variable:**
```bash
cd admin-panel
cat .env | grep VITE_API_URL
```

Should be: `VITE_API_URL=http://localhost:4000/api`

### Dashboard Stats Failing

**Check Browser Console:**
- Press F12 in browser
- Go to Console tab
- Look for error messages

**Check Network Tab:**
- Press F12 → Network tab
- Look for `/api/admin/dashboard/stats` request
- Check response status and error message

---

## 📝 Environment Variables

### Backend (.env)

```env
PORT=4000
MONGODB_URI=mongodb+srv://dani123:Pakistan001@cluster0.ciqe9yo.mongodb.net/?appName=Cluster0
JWT_SECRET=dP880qaktS1RGm0vvoIDhCVBg8cO0V94AJBl714DQuA=
```

### Admin Panel (.env)

```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🛑 Stopping Servers

### Stop Backend

Press `Ctrl+C` in the backend terminal, or:

```bash
pkill -f "node index.js"
```

### Stop Admin Panel

Press `Ctrl+C` in the admin panel terminal, or:

```bash
pkill -f "vite"
```

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Backend health check returns `"database": "connected"`
- [ ] Login API returns token
- [ ] Dashboard stats API returns data
- [ ] Admin panel loads at http://localhost:3000
- [ ] Can login to admin panel
- [ ] Dashboard displays stats without errors

---

**Happy Testing!** 🎉


