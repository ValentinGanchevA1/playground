# 📱 G88 Immediate Action Checklist

**Date**: January 4, 2026
**Goal**: Deploy backend to Render + Finalize Play Store submission

---

## ⏰ TODAY'S PRIORITY TASKS

### 🔴 TASK 1: Deploy Backend to Render (30-60 min)

1. **Login to Render**: https://dashboard.render.com
2. **Create Blueprint**:
   - Click "Blueprints" → "New Blueprint Instance"
   - Connect GitHub repo → select `backend` folder
   - Select `render.yaml`
   - Click "Apply"

3. **Configure Environment Variables** (in Render Dashboard):
   ```
   JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_REFRESH_SECRET=<run again for different value>
   ```

4. **Wait for deployment** (~5-10 min)

5. **Verify**: 
   ```bash
   curl https://g88-backend.onrender.com/api/v1/health
   ```

---

### 🟡 TASK 2: Restrict Google Maps API Key (10 min)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find key: `AIzaSyCwI8zobFemI8ZD1sXPPpb7vzx0obDPyH4`
3. Click "Edit"
4. Under "Application restrictions":
   - Select: **Android apps**
   - Add item:
     - Package name: `com.g88.app`
     - SHA-1 fingerprint: (get from keystore)

**Get SHA-1**:
```bash
cd mobile\android\app
keytool -list -v -keystore g88-release-key.keystore -alias g88-key-alias
# Password: G@nchev!2388
```

---

### 🟡 TASK 3: Update Mobile Production URL (5 min)

After Render deployment, update `mobile/.env.production`:

```bash
# Change this:
API_URL=https://api.g88app.com

# To Render URL (if no custom domain):
API_URL=https://g88-backend.onrender.com/api/v1

# WebSocket URL:
WS_URL=wss://g88-backend.onrender.com
```

---

### 🟡 TASK 4: Build Release APK for Testing (15 min)

```bash
cd mobile

# Clean build
cd android && ./gradlew clean && cd ..

# Build release APK
cd android && ./gradlew assembleRelease

# Output location:
# android/app/build/outputs/apk/release/app-release.apk
```

**Test on physical device**:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 📋 TESTING CHECKLIST

After building release APK, verify:

- [ ] App launches without crash
- [ ] Login/Register works
- [ ] Maps display with location
- [ ] Can see nearby users (if any)
- [ ] Chat/messaging works
- [ ] Profile editing works
- [ ] Image upload works
- [ ] Push notifications work

---

## 🎨 TASK 5: Create Play Store Assets (1-2 hours)

### Required Assets:

| Asset | Dimensions | Status |
|-------|------------|--------|
| App Icon | 512×512 PNG | ⚠️ Create high-res version |
| Feature Graphic | 1024×500 PNG | ❌ Create |
| Phone Screenshots | 1080×1920 (x4-8) | ❌ Create |

**Tools**:
- Figma (free): https://figma.com
- Canva (free): https://canva.com
- Android Emulator for screenshots

**Screenshot Ideas**:
1. Welcome/Splash screen
2. Map view with nearby users
3. User profile
4. Chat conversation
5. Trading/Marketplace
6. Settings/Privacy

---

## 🔐 TASK 6: Configure Production Services

### Stripe (if not done)
1. Go to: https://dashboard.stripe.com/apikeys
2. Get **LIVE** keys (not test)
3. Add to Render environment variables

### Twilio (if using SMS)
1. Go to: https://console.twilio.com
2. Get production credentials
3. Buy a phone number
4. Add to Render environment variables

---

## 📊 CURRENT STATUS SUMMARY

| Component | Status | Action |
|-----------|--------|--------|
| Package ID | ✅ `com.g88.app` | Done |
| Release Keystore | ✅ Exists | Done |
| Signing Config | ✅ Configured | Done |
| ProGuard | ✅ Enabled | Done |
| Firebase | ✅ Configured | Done |
| Backend | ❌ Not deployed | **Deploy today** |
| Maps API | ⚠️ Unrestricted | **Restrict today** |
| Store Assets | ❌ Missing | Create this week |
| Third-party keys | ⚠️ Partial | Configure in Render |

---

## 🎯 ESTIMATED TIMELINE

| Task | Time | When |
|------|------|------|
| Render deployment | 1 hour | Today |
| Maps API restriction | 10 min | Today |
| Build & test APK | 30 min | Today |
| Create store assets | 2 hours | This week |
| Play Console setup | 1 hour | After backend live |
| Google review | 3-7 days | After submission |

**🚀 Realistic launch: 7-10 days**

---

## 💡 QUICK COMMANDS

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Get SHA-1 from keystore
cd mobile/android/app
keytool -list -v -keystore g88-release-key.keystore -alias g88-key-alias

# Build release APK
cd mobile/android && ./gradlew assembleRelease

# Build release AAB (for Play Store)
cd mobile/android && ./gradlew bundleRelease

# Install APK on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ SECURITY REMINDERS

- **Never commit** `.env.production` with real secrets
- **Backup keystore** to 3+ secure locations
- **Restrict API keys** to Android package + SHA-1
- **Use Render Dashboard** for secret management (not files)
