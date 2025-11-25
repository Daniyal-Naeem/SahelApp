# Demo Commands - Run Separately

Run these commands in **separate terminal windows/tabs** for the client demo.

---

## Terminal 1: Backend Server

```bash
cd backend
npm start
```

**Wait for:** "Connected to DB, and running on http://localhost:4000/"

**Access:** http://localhost:4000

---

## Terminal 2: Admin Panel

```bash
cd admin-panel
npm run dev
```

**Wait for:** "Local: http://localhost:3000"

**Access:** http://localhost:3000

**Login:**
- Email: `admin@sahal.com`
- Password: `admin123`

---

## Terminal 3: Metro Bundler (React Native)

```bash
cd frontend
nvm use 20.19.4
npm start
```

**Wait for:** Metro bundler to start (shows "Metro waiting on...")

**Access:** http://localhost:8081

---

## Terminal 4: Android App

```bash
cd frontend
nvm use 20.19.4
adb reverse tcp:8081 tcp:8081
npm run android
```

**Wait for:** Android build to complete and app to launch on emulator/device

---

## Quick Reference

### Start Order:
1. **Backend** (Terminal 1) - Start first
2. **Admin Panel** (Terminal 2) - Start second
3. **Metro Bundler** (Terminal 3) - Start third
4. **Android App** (Terminal 4) - Start last

### Access Points:
- Backend: http://localhost:4000
- Admin Panel: http://localhost:3000
- Metro: http://localhost:8081
- Android: Emulator/Device

### Stop Services:
Press `Ctrl + C` in each terminal window

---

## Prerequisites Check

Before starting, ensure:

```bash
# Check Node version
node --version  # Should be 20.19.4

# Check MongoDB is running
mongosh  # or mongo

# Check Android emulator/device
adb devices
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Backend Not Starting
- Check MongoDB is running
- Check `.env` file exists with correct values
- Check `JWT_SECRET` is set

### Admin Panel Not Starting
- Check backend is running first
- Check `VITE_API_URL` in admin-panel/.env (optional)

### Android App Not Connecting
- Run: `adb reverse tcp:8081 tcp:8081`
- Check Metro bundler is running
- Reload app: Press `R` twice in Metro terminal

---

## Demo Flow

1. **Start Backend** → Wait for "Connected to DB"
2. **Start Admin Panel** → Open http://localhost:3000
3. **Start Metro** → Wait for bundler ready
4. **Start Android** → Wait for app to launch
5. **Show Admin Panel** → Login and demonstrate features
6. **Show Android App** → Demonstrate mobile features

---

**Ready for demo! 🚀**

