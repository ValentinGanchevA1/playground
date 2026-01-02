# G88 Production Release Checklist for Google Play Store

## 🔐 Security & Credentials

### Critical Actions Required Before Release:

1. **AWS Credentials**
   - ⚠️ **URGENT**: Current AWS credentials in `backend/.env` are exposed
   - [ ] Rotate AWS access keys immediately
   - [ ] Update production credentials in `backend/.env.production`
   - [ ] Never commit production credentials to Git

2. **JWT Secrets**
   - [ ] Generate strong JWT secrets (use command below):
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - [ ] Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `backend/.env.production`

3. **Google Maps API Key**
   - [ ] Create Android-restricted API key in Google Cloud Console
   - [ ] Restrict to package name: `com.g88.app` (or your chosen package ID)
   - [ ] Add SHA-1 certificate fingerprint (get from release keystore)
   - [ ] Update in `mobile/.env.production`
   - [ ] Remove hardcoded key from `mobile/android/app/src/main/res/values/strings.xml`
   - [ ] Remove from `mobile/android/gradle.properties`

4. **Third-Party Services**
   - [ ] Stripe: Replace with production keys
   - [ ] Twilio: Add production credentials
   - [ ] SendGrid: Add production API key
   - [ ] Google OAuth: Add production client ID/secret
   - [ ] Firebase: Verify production `google-services.json` is configured

## 📱 App Configuration

5. **Package ID & Branding**
   - [ ] Change package ID from `com.mobile` to `com.g88.app` (recommended)
   - [ ] Update app name from "mobile" to "G88"
   - [ ] Verify app icon and splash screen are production-ready
   - [ ] Update build version (currently: versionCode=1, versionName="1.0")

6. **Release Keystore**
   - [ ] Generate release keystore (instructions below)
   - [ ] Store keystore file securely (never commit to Git)
   - [ ] Configure signing in `android/app/build.gradle`
   - [ ] Add keystore credentials to `android/gradle.properties` (gitignored)

7. **Build Configuration**
   - [ ] Enable ProGuard for code minification
   - [ ] Verify production API URL: `https://api.g88.app/api/v1`
   - [ ] Test with production backend

## 🏗️ Building

8. **Generate Release Build**
   - [ ] Clean build: `cd mobile/android && ./gradlew clean`
   - [ ] Build AAB: `./gradlew bundleRelease`
   - [ ] Build APK (optional): `./gradlew assembleRelease`
   - [ ] Verify APK size is optimized (ProGuard enabled)

9. **Testing**
   - [ ] Install release build on physical device
   - [ ] Test all core features (auth, location, trading, etc.)
   - [ ] Test with production API
   - [ ] Verify Google Maps works with production API key
   - [ ] Test push notifications
   - [ ] Test payment flow (Stripe)

## 📦 Google Play Store

10. **Store Listing**
    - [ ] App title: "G88"
    - [ ] Short description: "Connect with people nearby"
    - [ ] Full description (500-4000 characters)
    - [ ] Screenshots (minimum 2, recommended 8):
      - Phone: 16:9 or 9:16 ratio
      - Sizes: 320px - 3840px
    - [ ] Feature graphic: 1024px x 500px
    - [ ] App icon: 512px x 512px (PNG, 32-bit)
    - [ ] Privacy policy URL: https://g88app.com/privacy
    - [ ] Content rating questionnaire
    - [ ] Target audience and age restrictions

11. **App Details**
    - [ ] Category: Social / Maps & Navigation
    - [ ] Tags and keywords
    - [ ] Contact email
    - [ ] Website: https://g88app.com

12. **Release**
    - [ ] Upload AAB to Play Console
    - [ ] Fill in release notes
    - [ ] Choose release track (Internal Testing → Closed Testing → Production)
    - [ ] Review and publish

## 🔧 Commands Reference

### Generate Release Keystore:
```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore g88-release-key.keystore -alias g88-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Store these securely:**
- Keystore password
- Key alias
- Key password

### Get SHA-1 Fingerprint (for Google Maps API restriction):
```bash
keytool -list -v -keystore android/app/g88-release-key.keystore -alias g88-key-alias
```

### Build Commands:
```bash
# Clean
cd android && ./gradlew clean

# Build AAB (Android App Bundle - required for Play Store)
./gradlew bundleRelease

# Build APK (for testing)
./gradlew assembleRelease
```

### Output Locations:
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`

## 📋 Pre-Launch Checks

- [ ] All API keys are production-ready and restricted
- [ ] Backend is deployed and accessible at https://api.g88.app
- [ ] Database migrations are run on production database
- [ ] Redis is configured and accessible
- [ ] CDN/S3 bucket for uploads is configured
- [ ] Email service (SendGrid) is configured
- [ ] SMS service (Twilio) is configured
- [ ] Push notifications (Firebase) are configured
- [ ] Payment processing (Stripe) is in live mode
- [ ] Terms of Service URL is live: https://g88app.com/terms
- [ ] Privacy Policy URL is live: https://g88app.com/privacy

## 🚨 Post-Release Monitoring

- [ ] Monitor crash reports in Play Console
- [ ] Monitor API errors and logs
- [ ] Monitor user reviews
- [ ] Set up alerts for critical errors
- [ ] Monitor backend performance and scaling

---

**Important Notes:**
1. Never commit keystores, passwords, or production credentials to version control
2. Add to `.gitignore`:
   - `*.keystore`
   - `.env.production`
   - `gradle.properties` (if it contains secrets)
3. Keep backups of your keystore in a secure location (losing it means you can't update your app)
4. Use Play Console's internal testing track before going to production
