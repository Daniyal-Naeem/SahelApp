# Android Emulator Setup & Commands

## Quick Start Commands

### Option 1: Start Emulator Manually First (Recommended)

**Terminal 1: Start Emulator**
```bash
# Start the emulator
emulator -avd Pixel_8_Pro &

# OR if emulator command not found:
/Users/daniyalnaeem/Library/Android/sdk/emulator/emulator -avd Pixel_8_Pro &
```

**Wait for:** Emulator to fully boot (you'll see the Android home screen)

**Terminal 2: Setup Port Forwarding**
```bash
cd frontend
adb reverse tcp:8081 tcp:8081
```

**Terminal 3: Start Metro Bundler**
```bash
cd frontend
nvm use 20.19.4
npm start
```

**Terminal 4: Build and Install App**
```bash
cd frontend
nvm use 20.19.4
npm run android
```

---

### Option 2: Start Emulator and App Together

```bash
cd frontend
nvm use 20.19.4

# Start emulator in background
emulator -avd Pixel_8_Pro &

# Wait a bit for emulator to start
sleep 10

# Setup port forwarding
adb reverse tcp:8081 tcp:8081

# Start Metro (in background or separate terminal)
npm start &

# Build and run app
npm run android
```

---

## Check Emulator Status

```bash
# List all connected devices
adb devices

# List available AVDs
emulator -list-avds

# Check if emulator is running
adb devices | grep emulator
```

---

## Troubleshooting

### Emulator Not Starting

1. **Check if AVD exists:**
   ```bash
   emulator -list-avds
   ```

2. **Start emulator manually:**
   ```bash
   emulator -avd Pixel_8_Pro
   ```

3. **If emulator command not found, use full path:**
   ```bash
   /Users/daniyalnaeem/Library/Android/sdk/emulator/emulator -avd Pixel_8_Pro
   ```

### App Not Installing

1. **Check device connection:**
   ```bash
   adb devices
   ```
   Should show: `emulator-5554    device`

2. **Setup port forwarding:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

3. **Kill existing Metro bundler:**
   ```bash
   lsof -ti:8081 | xargs kill -9
   ```

4. **Clear cache and rebuild:**
   ```bash
   cd frontend
   npm run android -- --reset-cache
   ```

### Metro Bundler Not Connecting

1. **Check Metro is running:**
   ```bash
   lsof -i :8081
   ```

2. **Restart Metro with cache reset:**
   ```bash
   cd frontend
   nvm use 20.19.4
   npm start -- --reset-cache
   ```

3. **Reload app on emulator:**
   - Press `R` twice in Metro terminal
   - OR shake device → Reload
   - OR `adb shell input keyevent 82` (opens dev menu)

---

## Complete Setup Script

Create a file `start-android.sh`:

```bash
#!/bin/bash

cd frontend
nvm use 20.19.4

# Check if emulator is running
if ! adb devices | grep -q "emulator"; then
    echo "Starting emulator..."
    emulator -avd Pixel_8_Pro &
    echo "Waiting for emulator to boot..."
    sleep 15
fi

# Setup port forwarding
adb reverse tcp:8081 tcp:8081

# Start Metro in background
npm start &

# Wait a bit
sleep 5

# Build and run
npm run android
```

Make it executable:
```bash
chmod +x start-android.sh
```

Run it:
```bash
./start-android.sh
```

---

## Manual Steps (Step by Step)

1. **Start Emulator:**
   ```bash
   emulator -avd Pixel_8_Pro
   ```
   Wait until you see the Android home screen.

2. **Verify Connection:**
   ```bash
   adb devices
   ```
   Should show: `emulator-5554    device`

3. **Setup Port Forwarding:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

4. **Start Metro Bundler:**
   ```bash
   cd frontend
   nvm use 20.19.4
   npm start
   ```

5. **In a NEW terminal, build app:**
   ```bash
   cd frontend
   nvm use 20.19.4
   npm run android
   ```

---

## Common Issues

### Issue: "No devices found"
**Solution:** Start emulator first, then run `adb devices` to verify.

### Issue: "Metro bundler connection refused"
**Solution:** Run `adb reverse tcp:8081 tcp:8081` before starting Metro.

### Issue: "Build failed"
**Solution:** 
```bash
cd frontend/android
./gradlew clean
cd ..
npm run android
```

### Issue: "App crashes on launch"
**Solution:**
- Check Metro bundler is running
- Check port forwarding: `adb reverse tcp:8081 tcp:8081`
- Reload app: Press `R` twice in Metro terminal

---

## Quick Reference

```bash
# Start emulator
emulator -avd Pixel_8_Pro

# Check devices
adb devices

# Port forwarding
adb reverse tcp:8081 tcp:8081

# Start Metro
cd frontend && nvm use 20.19.4 && npm start

# Build app
cd frontend && nvm use 20.19.4 && npm run android
```

