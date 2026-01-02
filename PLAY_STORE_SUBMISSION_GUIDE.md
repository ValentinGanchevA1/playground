# Google Play Store Submission Guide for G88

## 📋 Prerequisites

Before you begin, ensure you have:
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Production backend deployed and accessible
- [ ] Release keystore generated and backed up
- [ ] All third-party service credentials configured
- [ ] Privacy policy and terms of service published

## 🎯 Step-by-Step Submission Process

### Phase 1: Preparation (Before Building)

#### 1.1 Generate Release Keystore
```bash
# Windows
cd mobile
scripts\generate-keystore.bat

# Linux/Mac
cd mobile
./scripts/generate-keystore.sh
```

**Important**: Store keystore file and passwords securely!

#### 1.2 Configure Signing Credentials

Edit `mobile/android/gradle.properties`:
```properties
G88_RELEASE_STORE_FILE=g88-release-key.keystore
G88_RELEASE_KEY_ALIAS=g88-key-alias
G88_RELEASE_STORE_PASSWORD=your_keystore_password
G88_RELEASE_KEY_PASSWORD=your_key_password
```

#### 1.3 Get SHA-1 Fingerprint
```bash
cd mobile/android/app
keytool -list -v -keystore g88-release-key.keystore -alias g88-key-alias
```

Copy both SHA-1 and SHA-256 fingerprints.

#### 1.4 Configure Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Enable **Maps SDK for Android**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Click **Restrict Key**:
   - **Application restrictions**: Android apps
   - **Add an item**:
     - Package name: `com.g88.app`
     - SHA-1 certificate fingerprint: [paste from step 1.3]
6. Under **API restrictions**, select **Maps SDK for Android**
7. Save and copy the API key

Update `mobile/.env.production`:
```
GOOGLE_MAPS_API_KEY=your_restricted_api_key_here
```

Update `mobile/android/gradle.properties`:
```
MAPS_API_KEY=your_restricted_api_key_here
```

#### 1.5 Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create production project (or select existing)
3. Add Android app:
   - Package name: `com.g88.app`
   - App nickname: G88
   - SHA-1: [from step 1.3]
4. Download `google-services.json`
5. Replace `mobile/android/app/google-services.json`
6. Enable Cloud Messaging (FCM) for push notifications

#### 1.6 Update Backend for Production

1. Deploy backend to production server
2. Ensure it's accessible at `https://api.g88.app`
3. Update all credentials in `backend/.env.production`
4. Run database migrations
5. Test all API endpoints

### Phase 2: Building the App

#### 2.1 Build Release AAB
```bash
# Windows
cd mobile
scripts\build-release.bat

# Linux/Mac
cd mobile
./scripts/build-release.sh
```

Select option 1 (AAB) for Play Store submission.

**Output location**: `mobile/android/app/build/outputs/bundle/release/app-release.aab`

#### 2.2 Test Release Build

Install APK on physical device:
```bash
# First build APK (option 2 from build script)
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Test thoroughly**:
- [ ] App launches correctly
- [ ] Login/registration works
- [ ] Location services work
- [ ] Maps display correctly
- [ ] Push notifications work
- [ ] Trading features work
- [ ] Image uploads work
- [ ] All third-party integrations work
- [ ] No crashes or errors

### Phase 3: Play Console Setup

#### 3.1 Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in details:
   - **App name**: G88
   - **Default language**: English (US)
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
   - **Declarations**: Check all boxes
4. Click **Create app**

#### 3.2 Set Up App

Complete all required sections in the left sidebar:

##### Store Presence → Main Store Listing

**App details**:
- **App name**: G88
- **Short description** (80 chars max):
  ```
  Connect with people nearby. Chat, trade, and meet new friends in your area.
  ```
- **Full description** (4000 chars max):
  ```
  G88 is the ultimate location-based social app that helps you connect with people nearby.

  🌍 DISCOVER PEOPLE NEARBY
  See who's around you in real-time. Connect with neighbors, discover local communities, and make new friends in your area.

  💬 CHAT & CONNECT
  Start conversations with people nearby. Whether you're looking for friends, activity partners, or just someone to chat with, G88 makes it easy.

  🔄 TRADING MARKETPLACE
  Buy, sell, and trade items with people in your local area. Post listings, make offers, and arrange meetups safely through the app.

  📸 SHARE MOMENTS
  Upload photos and share what you're up to. Let others know about local events, interesting spots, or items you're trading.

  🗺️ MAP VIEW
  Visualize your connections on an interactive map. See where people are and explore your local community.

  🔒 PRIVACY & SAFETY
  Your privacy matters. Control who can see your location, manage your visibility, and connect safely with verified users.

  ✨ FEATURES
  • Real-time location-based discovery
  • Private messaging and group chats
  • Trading marketplace with photo uploads
  • Interactive map view
  • Push notifications
  • User profiles and preferences
  • Safe and secure authentication

  Whether you're new to an area, looking to expand your social circle, or want to trade items locally, G88 brings your community together.

  Download G88 today and start connecting with people nearby!
  ```

**Graphics**:
- **App icon**: 512 x 512 px (PNG, 32-bit with alpha)
- **Feature graphic**: 1024 x 500 px (JPG or PNG, 24-bit)
- **Phone screenshots**: Minimum 2, maximum 8
  - 16:9 or 9:16 aspect ratio
  - Minimum dimension: 320px
  - Maximum dimension: 3840px
  - **Recommended**: 1080 x 1920 px (portrait) or 1920 x 1080 px (landscape)

**Screenshots to capture**:
1. Map view with nearby users
2. Chat/messaging screen
3. Trading marketplace
4. User profile
5. Trade offer details
6. Settings screen
7. Login screen (optional)
8. Notifications (optional)

**Contact details**:
- **Email**: support@g88app.com
- **Phone**: (Optional)
- **Website**: https://g88app.com

**External marketing** (Optional):
- Promotional video (YouTube link)

##### Store Presence → Store Settings

**App category**:
- **Category**: Social
- **Tags**: social networking, location, nearby, chat, trading, local

##### Policy → App Content

**Privacy policy**:
- URL: https://g88app.com/privacy

**App access**:
- [ ] All users have access to full functionality
- OR
- [ ] Limited access (explain why - e.g., requires account)

**Ads**:
- [ ] No, my app does not contain ads
- OR
- [ ] Yes, my app contains ads

**Content ratings**:
1. Click **Start questionnaire**
2. Select **Apps**
3. Answer all questions honestly:
   - Violence
   - Sexual content
   - Profanity
   - Controlled substances
   - Tobacco/alcohol
   - Gambling
   - User-generated content
   - Location sharing
   - User communication

**Important**: G88 likely needs to declare:
- ✅ User-generated content
- ✅ Location sharing
- ✅ User communication (chat)

4. Submit questionnaire
5. Review and apply rating

**Target audience**:
- **Age groups**: 13+ (or 18+ depending on your policy)

**News app**: No

**COVID-19 contact tracing/status app**: No

**Data safety**:

This is CRITICAL. You must disclose:

**Data collected**:
- ✅ Location (precise, approximate)
  - Purpose: App functionality, analytics
  - Data sharing: Not shared
  - Optional/Required: Required
  - User control: Can request deletion

- ✅ Personal info (name, email, phone)
  - Purpose: App functionality, account management
  - Data sharing: Not shared
  - Optional/Required: Required
  - User control: Can request deletion

- ✅ Photos and videos
  - Purpose: App functionality (trading, profiles)
  - Data sharing: Shared with other users
  - Optional/Required: Optional
  - User control: Can delete

- ✅ Messages
  - Purpose: App functionality (chat)
  - Data sharing: Shared with other users
  - Optional/Required: Optional
  - User control: Can delete

- ✅ Device or other IDs
  - Purpose: Analytics, app functionality
  - Data sharing: Not shared
  - Optional/Required: Required

**Security practices**:
- ✅ Data is encrypted in transit (HTTPS)
- ✅ Data is encrypted at rest (database encryption)
- ✅ Users can request data deletion
- ✅ Committed to Google Play Families Policy (if applicable)

##### Production → Countries/Regions

Select countries where you want to distribute:
- **Recommended**: Start with a few countries, expand later
- **Minimum**: United States
- **Consider**: Sweden (since you're based in Stockholm), UK, Canada, Australia

##### Production → Release

1. Click **Create new release**
2. **Release type**: Choose release track:
   - **Internal testing**: Test with up to 100 users (recommended first)
   - **Closed testing**: Test with specific users
   - **Open testing**: Public beta
   - **Production**: Full release

3. **App bundles**: Upload `app-release.aab`

4. **Release name**: `1.0.0 (1)` or use auto-generated

5. **Release notes** (500 chars per language):
   ```
   Welcome to G88!

   🎉 Initial release featuring:
   • Discover and connect with people nearby
   • Real-time location-based social networking
   • Trading marketplace for local items
   • Private messaging and group chats
   • Interactive map view
   • Secure authentication

   We're excited to help you connect with your local community!

   Questions or feedback? Contact us at support@g88app.com
   ```

6. Click **Save** → **Review release**

7. Review warnings (if any):
   - Address any critical issues
   - Warnings can usually be accepted

8. **Start rollout to [track]**

### Phase 4: Review Process

#### 4.1 Submit for Review

Once you've completed all required sections:
1. Go to **Publishing overview**
2. Review all sections (must all be green checkmarks)
3. Click **Send for review**

#### 4.2 Review Timeline

- **Internal/Closed testing**: Usually within hours
- **Production**: Can take 3-7 days (sometimes longer)

Google will review:
- App functionality
- Privacy policy compliance
- Content rating accuracy
- Data safety disclosures
- Compliance with Play policies

#### 4.3 If Rejected

If your app is rejected:
1. Read the rejection reason carefully
2. Fix the issues mentioned
3. Update the app if needed
4. Resubmit for review

Common rejection reasons:
- Missing or incomplete privacy policy
- Inaccurate content rating
- Permissions not justified
- Broken functionality
- Data safety disclosures incomplete

### Phase 5: Post-Launch

#### 5.1 Monitor

- **Crashes**: Play Console → Quality → Crashes
- **ANRs**: Play Console → Quality → ANRs
- **User feedback**: Play Console → Reviews
- **Metrics**: Play Console → Statistics

#### 5.2 Respond to Reviews

- Respond to user reviews promptly
- Address issues and bugs
- Thank users for positive feedback

#### 5.3 Updates

When releasing updates:
1. Increment version:
   - `versionCode`: Increment by 1 (e.g., 1 → 2)
   - `versionName`: Follow semantic versioning (e.g., 1.0.0 → 1.0.1)
2. Build new AAB
3. Upload to Play Console
4. Write release notes
5. Submit for review

## 📱 App Store Optimization (ASO)

### Keywords to Target

Include in your description:
- nearby
- local
- social
- chat
- messaging
- location
- community
- trading
- marketplace
- neighbors
- meet
- connect
- discover

### Tips

1. **Icon**: Make it distinctive and recognizable
2. **Screenshots**: Show key features, use captions
3. **Feature graphic**: Eye-catching, shows app purpose
4. **Description**: Front-load important keywords
5. **Reviews**: Encourage happy users to leave reviews
6. **Rating**: Respond to negative reviews, fix issues

## ⚠️ Common Issues & Solutions

### Issue: "Upload failed: You need to use a different package name"
**Solution**: Package name `com.g88.app` is already taken. Change to:
- `com.g88.social`
- `com.g88app.android`
- Or another variation

Update in:
- `mobile/android/app/build.gradle` (namespace and applicationId)
- Firebase project
- Google Maps API restrictions

### Issue: "Your app contains permissions that require a privacy policy"
**Solution**: Add privacy policy URL in Play Console → Policy → Privacy Policy

### Issue: "Unoptimized APK"
**Solution**: Submit AAB instead of APK. AAB is required for new apps.

### Issue: "Missing content rating"
**Solution**: Complete content rating questionnaire in Play Console

### Issue: "Data safety form incomplete"
**Solution**: Complete all sections of data safety form

## 📞 Support

**Google Play Support**:
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Developer Policy Center](https://play.google.com/console/about/guides/developerpolicycenter/)
- Contact Play Console support (in Play Console)

**G88 Team**:
- Internal team contact: [Your team's contact]
- Developer email: dev@g88app.com

## ✅ Final Checklist

Before submitting:

**Technical**:
- [ ] Release AAB built successfully
- [ ] Release build tested on physical device
- [ ] All features working in release mode
- [ ] No crashes or critical bugs
- [ ] ProGuard rules working correctly
- [ ] Maps API key restricted and working
- [ ] Push notifications configured and working
- [ ] Backend API accessible and stable

**Play Console**:
- [ ] App created in Play Console
- [ ] Main store listing completed
- [ ] All graphics uploaded (icon, feature graphic, screenshots)
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Target audience set
- [ ] Countries/regions selected
- [ ] AAB uploaded
- [ ] Release notes written

**Legal & Compliance**:
- [ ] Privacy policy published and accessible
- [ ] Terms of service published
- [ ] All data collection disclosed
- [ ] GDPR compliance (if targeting EU)
- [ ] COPPA compliance (if allowing users under 13)

**Business**:
- [ ] Google Play Developer account active
- [ ] Support email configured
- [ ] Monitoring and analytics set up
- [ ] Crash reporting configured

## 🎉 You're Ready!

Once everything is checked off, submit your app for review. Good luck with your launch!

---

**Need help?** Review the [PRODUCTION_RELEASE_CHECKLIST.md](./PRODUCTION_RELEASE_CHECKLIST.md) and [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for additional guidance.
